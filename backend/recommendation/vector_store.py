"""
Vector Store Module

Handles FAISS index creation and similarity search for places.
Uses sentence-transformers for embeddings.
"""

import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from extensions import db
from sqlalchemy import text
import logging
from typing import List, Tuple, Dict, Optional
import pickle
import os

logger = logging.getLogger(__name__)

class VectorStore:
    """
    Vector store for place similarity search using FAISS.
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize vector store.
        
        Args:
            model_name (str): Sentence transformer model name
        """
        self.model_name = model_name
        self.model = None
        self.index = None
        self.place_id_mapping = {}
        self.reverse_mapping = {}
        self.embedding_dim = 384  # Dimension for all-MiniLM-L6-v2
        self.is_built = False
        
    def _load_model(self):
        """Load sentence transformer model."""
        try:
            if self.model is None:
                logger.info(f"Loading sentence transformer model: {self.model_name}")
                self.model = SentenceTransformer(self.model_name)
                logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def build_index(self):
        """
        Build FAISS index from all places in places_master.
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            print("Building FAISS index...")
            
            # Load model
            self._load_model()
            
            # Step 1: Load all places from places_master with tags
            places_query = text("""
            SELECT 
                pm.id,
                pm.name,
                pm.city,
                pm.category,
                COALESCE(pm.description, '') as description,
                pt.tag
            FROM places_master pm
            LEFT JOIN place_tags pt ON pm.id = pt.place_id
            ORDER BY pm.id
            """)
            
            result = db.session.execute(places_query)
            raw_rows = result.fetchall()
            
            if not raw_rows:
                logger.warning("No places found in places_master")
                return False
            
            # Step 2: Group results by place_id and collect tags
            places_data = {}
            for row in raw_rows:
                place_id = row[0]
                name = row[1] or ""
                city = row[2] or ""
                category = row[3] or ""
                description = row[4] or ""
                tag = row[5] or ""
                
                if place_id not in places_data:
                    places_data[place_id] = {
                        'id': place_id,
                        'name': name,
                        'city': city,
                        'category': category,
                        'description': description,
                        'tags': []
                    }
                
                if tag and tag not in places_data[place_id]['tags']:
                    places_data[place_id]['tags'].append(tag)
            
            places_list = list(places_data.values())
            print(f"Loaded {len(places_list)} places")
            
            # Step 3: Create text representations
            place_texts = []
            place_ids = []
            
            for place in places_list:
                place_id = place['id']
                name = place['name']
                city = place['city']
                category = place['category']
                tags = place['tags']
                
                # Create text representation: "place_name category tag1 tag2 tag3 city"
                text_parts = [name, category] + tags + [city]
                place_text = " ".join(filter(None, text_parts)).strip()
                
                if place_text:
                    place_texts.append(place_text)
                    place_ids.append(place_id)
            
            if not place_texts:
                logger.error("No valid place texts created")
                return False
            
            # Step 4: Generate embeddings
            print("Generating embeddings...")
            embeddings = self.model.encode(
                place_texts, 
                batch_size=32,
                show_progress_bar=True,
                convert_to_numpy=True
            )
            
            # Step 5: Create FAISS index using IndexFlatL2
            print("Creating FAISS index...")
            self.index = faiss.IndexFlatL2(self.embedding_dim)
            
            # Add embeddings to index
            self.index.add(embeddings.astype('float32'))
            
            # Step 6: Create mapping from index to place_id
            self.place_id_mapping = {i: place_id for i, place_id in enumerate(place_ids)}
            self.reverse_mapping = {place_id: i for i, place_id in enumerate(place_ids)}
            
            self.is_built = True
            print("FAISS index built successfully")
            logger.info(f"FAISS index built successfully with {len(place_ids)} places")
            
            return True
            
        except Exception as e:
            logger.error(f"Error building FAISS index: {str(e)}")
            return False
    
    def search(self, query_vector: np.ndarray, k: int = 20) -> List[Tuple[int, float]]:
        """
        Search for similar places using query vector.
        
        Args:
            query_vector (np.ndarray): Query embedding vector
            k (int): Number of results to return
            
        Returns:
            List[Tuple[int, float]]: List of (place_id, similarity_score) tuples
        """
        try:
            if not self.is_built or self.index is None:
                logger.error("Index not built. Call build_index() first.")
                return []
            
            # Normalize query vector for cosine similarity
            query_vector = query_vector.reshape(1, -1).astype('float32')
            faiss.normalize_L2(query_vector)
            
            # Search
            similarities, indices = self.index.search(query_vector, min(k, self.index.ntotal))
            
            # Convert to place_ids and format results
            results = []
            for idx, similarity in zip(indices[0], similarities[0]):
                if idx >= 0:  # FAISS returns -1 for invalid indices
                    place_id = self.place_id_mapping.get(int(idx))
                    if place_id:
                        results.append((place_id, float(similarity)))
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching vector store: {str(e)}")
            return []
    
    def search_by_text(self, query_text: str, k: int = 20) -> List[Tuple[int, float]]:
        """
        Search by text query.
        
        Args:
            query_text (str): Query text
            k (int): Number of results to return
            
        Returns:
            List[Tuple[int, float]]: List of (place_id, similarity_score) tuples
        """
        try:
            if self.model is None:
                self._load_model()
            
            # Generate embedding for query text
            query_embedding = self.model.encode([query_text], convert_to_numpy=True)
            
            # Search using the embedding
            return self.search(query_embedding[0], k)
            
        except Exception as e:
            logger.error(f"Error searching by text: {str(e)}")
            return []
    
    def get_place_text(self, place_id: int) -> Optional[str]:
        """
        Get text representation for a place.
        
        Args:
            place_id (int): Place ID
            
        Returns:
            Optional[str]: Text representation or None if not found
        """
        try:
            query = text("""
            SELECT 
                pm.name,
                pm.city,
                pm.category,
                COALESCE(pm.description, '') as description
            FROM places_master pm
            WHERE pm.id = :place_id
            """)
            
            result = db.session.execute(query, {'place_id': place_id})
            row = result.fetchone()
            
            if row:
                name = row[0] or ""
                city = row[1] or ""
                category = row[2] or ""
                description = row[3] or ""
                
                # Get tags separately
                tags_query = text("""
                SELECT tag
                FROM place_tags
                WHERE place_id = :place_id
                """)
                
                tags_result = db.session.execute(tags_query, {'place_id': place_id})
                tags = [tag_row[0] for tag_row in tags_result.fetchall() if tag_row[0]]
                
                text_parts = [name, category] + tags + [city]
                return " ".join(filter(None, text_parts)).strip()
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting place text for place_id {place_id}: {str(e)}")
            return None
    
    def save_index(self, filepath: str):
        """
        Save FAISS index and mappings to file.
        
        Args:
            filepath (str): Base filepath (without extension)
        """
        try:
            if not self.is_built:
                logger.error("Index not built. Cannot save.")
                return False
            
            # Save FAISS index
            faiss.write_index(self.index, f"{filepath}.index")
            
            # Save mappings
            mappings = {
                'place_id_mapping': self.place_id_mapping,
                'reverse_mapping': self.reverse_mapping
            }
            
            with open(f"{filepath}.pkl", 'wb') as f:
                pickle.dump(mappings, f)
            
            logger.info(f"Index and mappings saved to {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving index: {str(e)}")
            return False
    
    def load_index(self, filepath: str):
        """
        Load FAISS index and mappings from file.
        
        Args:
            filepath (str): Base filepath (without extension)
        """
        try:
            # Load FAISS index
            self.index = faiss.read_index(f"{filepath}.index")
            
            # Load mappings
            with open(f"{filepath}.pkl", 'rb') as f:
                mappings = pickle.load(f)
            
            self.place_id_mapping = mappings['place_id_mapping']
            self.reverse_mapping = mappings['reverse_mapping']
            self.is_built = True
            
            logger.info(f"Index and mappings loaded from {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading index: {str(e)}")
            return False

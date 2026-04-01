"""
Retriever Module

Retrieves candidate places based on user interest profile using vector similarity search.
"""

import logging
from typing import List, Dict, Any
from .interest_builder import get_user_interest_profile
from .vector_store import VectorStore

logger = logging.getLogger(__name__)

# Global vector store instance (singleton pattern)
_vector_store = None

def get_vector_store() -> VectorStore:
    """
    Get or create the global vector store instance.
    
    Returns:
        VectorStore: Global vector store instance
    """
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
        if not _vector_store.is_built:
            logger.info("Building vector store for the first time...")
            if not _vector_store.build_index():
                logger.error("Failed to build vector store")
    return _vector_store

def retrieve_candidates(user_id: int, k: int = 20) -> List[int]:
    """
    Retrieve candidate places for a user based on their interest profile.
    
    Args:
        user_id (int): User ID
        k (int): Number of candidates to retrieve
        
    Returns:
        List[int]: List of candidate place IDs
    """
    try:
        # Step 1: Read user interest profile
        user_profile = get_user_interest_profile(user_id)
        
        if not user_profile:
            logger.info(f"No interest profile found for user {user_id}, returning empty candidates")
            return []
        
        # Step 2: Convert top tags into text
        # Get top 10 tags by weight
        top_tags = sorted(user_profile.items(), key=lambda x: x[1], reverse=True)[:10]
        
        if not top_tags:
            logger.info(f"No tags found in user {user_id} profile")
            return []
        
        # Create query text from top tags
        # Example: "nature walking cafes calm"
        query_text = " ".join([tag for tag, weight in top_tags])
        
        logger.info(f"Generated query for user {user_id}: '{query_text}'")
        
        # Step 3: Get vector store and search
        vector_store = get_vector_store()
        
        if not vector_store.is_built:
            logger.error("Vector store not built")
            return []
        
        # Step 4: Search FAISS index
        search_results = vector_store.search_by_text(query_text, k=k)
        
        # Extract just the place IDs
        candidate_place_ids = [place_id for place_id, similarity in search_results]
        
        logger.info(f"Retrieved {len(candidate_place_ids)} candidates for user {user_id}")
        
        return candidate_place_ids
        
    except Exception as e:
        logger.error(f"Error retrieving candidates for user {user_id}: {str(e)}")
        return []

def retrieve_candidates_with_scores(user_id: int, k: int = 20) -> List[Dict[str, Any]]:
    """
    Retrieve candidate places with similarity scores.
    
    Args:
        user_id (int): User ID
        k (int): Number of candidates to retrieve
        
    Returns:
        List[Dict[str, Any]]: List of candidates with place_id and similarity_score
    """
    try:
        # Step 1: Read user interest profile
        user_profile = get_user_interest_profile(user_id)
        
        if not user_profile:
            logger.info(f"No interest profile found for user {user_id}")
            return []
        
        # Step 2: Convert top tags into text
        top_tags = sorted(user_profile.items(), key=lambda x: x[1], reverse=True)[:10]
        
        if not top_tags:
            logger.info(f"No tags found in user {user_id} profile")
            return []
        
        query_text = " ".join([tag for tag, weight in top_tags])
        
        # Step 3: Search vector store
        vector_store = get_vector_store()
        
        if not vector_store.is_built:
            logger.error("Vector store not built")
            return []
        
        search_results = vector_store.search_by_text(query_text, k=k)
        
        # Format results with additional metadata
        candidates = []
        for place_id, similarity_score in search_results:
            candidates.append({
                'place_id': place_id,
                'similarity_score': similarity_score,
                'query_text': query_text,
                'top_tags': top_tags
            })
        
        logger.info(f"Retrieved {len(candidates)} candidates with scores for user {user_id}")
        
        return candidates
        
    except Exception as e:
        logger.error(f"Error retrieving candidates with scores for user {user_id}: {str(e)}")
        return []

def get_fallback_candidates(user_id: int, k: int = 20) -> List[int]:
    """
    Get fallback candidates when user profile is empty.
    Returns popular places based on popularity_score.
    
    Args:
        user_id (int): User ID
        k (int): Number of candidates to retrieve
        
    Returns:
        List[int]: List of candidate place IDs
    """
    try:
        from extensions import db
        
        # Get popular places by popularity_score
        query = """
        SELECT id 
        FROM places_master 
        WHERE popularity_score > 0
        ORDER BY popularity_score DESC 
        LIMIT %s
        """
        
        result = db.session.execute(query, (k,))
        candidates = [row[0] for row in result.fetchall()]
        
        logger.info(f"Retrieved {len(candidates)} fallback candidates for user {user_id}")
        
        return candidates
        
    except Exception as e:
        logger.error(f"Error getting fallback candidates for user {user_id}: {str(e)}")
        return []

def retrieve_candidates_with_fallback(user_id: int, k: int = 20) -> List[int]:
    """
    Retrieve candidates with fallback to popular places if profile is empty.
    
    Args:
        user_id (int): User ID
        k (int): Number of candidates to retrieve
        
    Returns:
        List[int]: List of candidate place IDs
    """
    # Try regular retrieval first
    candidates = retrieve_candidates(user_id, k)
    
    # If no candidates, try fallback
    if not candidates:
        logger.info(f"No candidates from profile for user {user_id}, trying fallback")
        candidates = get_fallback_candidates(user_id, k)
    
    return candidates

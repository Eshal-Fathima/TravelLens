"""
Recommendation System Initialization

Initializes the recommendation system components on app startup.
"""

import logging
import time
from .vector_store import VectorStore
from .retriever import get_vector_store

logger = logging.getLogger(__name__)

def initialize_recommendation_system():
    """
    Initialize the recommendation system.
    Builds the FAISS index and prepares all components.
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        logger.info("Initializing recommendation system...")
        start_time = time.time()
        
        # Initialize vector store and build index
        vector_store = get_vector_store()
        
        if not vector_store.is_built:
            logger.info("Building FAISS index for places...")
            success = vector_store.build_index()
            
            if not success:
                logger.error("Failed to build FAISS index")
                return False
            
            # Try to save index for future use
            try:
                vector_store.save_index("recommendation_index")
                logger.info("FAISS index saved successfully")
            except Exception as e:
                logger.warning(f"Could not save index: {str(e)}")
        
        end_time = time.time()
        logger.info(f"Recommendation system initialized successfully in {end_time - start_time:.2f} seconds")
        
        return True
        
    except Exception as e:
        logger.error(f"Error initializing recommendation system: {str(e)}")
        return False

def warm_up_recommendation_system():
    """
    Warm up the recommendation system with a sample query.
    This helps identify issues early and improves first-request latency.
    
    Returns:
        bool: True if warm-up successful, False otherwise
    """
    try:
        logger.info("Warming up recommendation system...")
        
        vector_store = get_vector_store()
        
        if not vector_store.is_built:
            logger.warning("Vector store not built, skipping warm-up")
            return False
        
        # Perform a sample search
        sample_results = vector_store.search_by_text("nature beach", k=5)
        
        if sample_results:
            logger.info(f"Warm-up successful: {len(sample_results)} sample results")
            return True
        else:
            logger.warning("Warm-up returned no results")
            return False
            
    except Exception as e:
        logger.error(f"Error during recommendation system warm-up: {str(e)}")
        return False

def get_recommendation_system_status():
    """
    Get the current status of the recommendation system.
    
    Returns:
        dict: Status information
    """
    try:
        vector_store = get_vector_store()
        
        status = {
            'initialized': vector_store.is_built,
            'index_size': vector_store.index.ntotal if vector_store.is_built and vector_store.index else 0,
            'model_loaded': vector_store.model is not None,
            'embedding_dim': vector_store.embedding_dim,
            'model_name': vector_store.model_name
        }
        
        return status
        
    except Exception as e:
        logger.error(f"Error getting recommendation system status: {str(e)}")
        return {
            'initialized': False,
            'error': str(e)
        }

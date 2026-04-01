"""
TravelLens Recommendation System

A retrieval-based travel recommendation system using:
- User interest profiling from visit history
- FAISS vector similarity search
- Tag-based ranking
- LLM explanations via Ollama
"""

from .interest_builder import build_user_interest_profile
from .vector_store import VectorStore
from .retriever import retrieve_candidates
from .ranker import rank_places
from .llm_explainer import generate_explanation

__all__ = [
    'build_user_interest_profile',
    'VectorStore', 
    'retrieve_candidates',
    'rank_places',
    'generate_explanation'
]

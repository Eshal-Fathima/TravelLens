# TravelLens Recommendation System

A retrieval-based travel recommendation system that provides personalized place recommendations based on user travel history and preferences.

## Overview

The recommendation system uses a multi-stage approach:

1. **Interest Profiling**: Analyzes user's visited places to build interest profiles
2. **Vector Similarity**: Uses FAISS with sentence-transformers for semantic search
3. **Ranking Algorithm**: Combines multiple factors (similarity, tag overlap, novelty)
4. **LLM Explanations**: Generates personalized explanations using Ollama

## Architecture

```
backend/recommendation/
├── __init__.py              # Module exports
├── interest_builder.py       # User interest profiling
├── vector_store.py          # FAISS vector store
├── retriever.py            # Candidate retrieval
├── ranker.py               # Place ranking
├── llm_explainer.py        # LLM explanations
├── init_recommendations.py  # System initialization
└── README.md               # This file
```

## Dependencies

- **sentence-transformers**: Text embeddings (all-MiniLM-L6-v2)
- **faiss-cpu**: Vector similarity search
- **torch**: PyTorch for neural networks
- **transformers**: HuggingFace transformers
- **requests**: HTTP requests for Ollama API

## Database Schema

The system requires these additional tables (included in `database/recommendation_schema.sql`):

- `places_master`: Global place database
- `place_tags`: Semantic tags for places
- `user_interest_profile`: Derived user preferences
- `user_visited_places`: View of visited places
- `embedding_sync`: Track embedding generation

## API Endpoints

### GET /api/recommendations/{user_id}
Get personalized recommendations for a user.

**Parameters:**
- `new_system` (optional): Use new system (default: true)

**Response:**
```json
{
  "recommendations": [
    {
      "place": "Lodhi Garden",
      "place_id": 123,
      "city": "Delhi",
      "category": "Park",
      "score": 0.87,
      "reason": "Because you enjoy nature parks...",
      "tags": ["nature", "peaceful", "garden"],
      "vector_similarity": 0.92,
      "tag_overlap": 0.75,
      "novelty": 0.15
    }
  ],
  "system": "retrieval_based",
  "profile_updated": true
}
```

### GET /api/recommendations/status
Check recommendation system status.

**Response:**
```json
{
  "initialized": true,
  "index_size": 150,
  "model_loaded": true,
  "embedding_dim": 384,
  "model_name": "all-MiniLM-L6-v2"
}
```

### POST /api/recommendations/refresh
Refresh the recommendation system (admin only).

## How It Works

### 1. Interest Builder (`interest_builder.py`)

- Analyzes user's visited places from `user_visited_places` view
- Joins with `place_tags` to get all tags
- Counts tag frequency and normalizes weights (0-1 scale)
- Stores results in `user_interest_profile` table

**Key Functions:**
- `build_user_interest_profile(user_id)`: Main profiling function
- `get_user_interest_profile(user_id)`: Retrieve existing profile
- `get_top_interests(user_id, limit)`: Get top N interests

### 2. Vector Store (`vector_store.py`)

- Uses sentence-transformers model `all-MiniLM-L6-v2`
- Creates text representations: "place_name category tag1 tag2 tag3 city"
- Generates embeddings and stores in FAISS index
- Maintains mapping between index and place_id

**Key Functions:**
- `build_index()`: Build FAISS index from places_master
- `search(query_vector, k)`: Search by vector
- `search_by_text(query_text, k)`: Search by text

### 3. Retriever (`retriever.py`)

- Reads user interest profile
- Converts top tags into query text
- Generates embedding and searches FAISS index
- Returns top 20 candidate place_ids

**Key Functions:**
- `retrieve_candidates(user_id, k)`: Main retrieval function
- `retrieve_candidates_with_fallback()`: With fallback to popular places

### 4. Ranker (`ranker.py`)

- Removes already visited places
- Scores each place using weighted formula:
  ```
  score = 0.6 * vector_similarity + 0.3 * tag_overlap + 0.1 * novelty
  ```
- Returns top 5 ranked places

**Key Functions:**
- `rank_places(user_id, candidates, top_k)`: Main ranking function
- `_calculate_place_score()`: Individual place scoring

### 5. LLM Explainer (`llm_explainer.py`)

- Uses Ollama with Mistral model
- Generates 2-sentence explanations
- Falls back to template-based explanations if Ollama unavailable

**Key Functions:**
- `generate_explanation(user_interests, place_name)`: Generate explanation
- `generate_batch_explanations()`: Batch generation

## Installation & Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Setup Database

Run the recommendation schema:

```bash
mysql -u root -p < database/recommendation_schema.sql
```

### 3. Setup Ollama (Optional)

Install Ollama for LLM explanations:

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull Mistral model
ollama pull mistral

# Start Ollama server
ollama serve
```

### 4. Run the Application

```bash
python app.py
```

The system will automatically:
- Initialize the FAISS index on startup
- Warm up with sample queries
- Be ready to serve recommendations

## Configuration

### Environment Variables

Add to `.env` file:

```env
# Ollama Configuration (optional)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# Recommendation System
RECOMMENDATION_CACHE_TTL=3600
MAX_RECOMMENDATIONS=5
```

### Model Configuration

- **Embedding Model**: `all-MiniLM-L6-v2` (384 dimensions)
- **LLM Model**: `mistral` (via Ollama)
- **FAISS Index**: Inner Product (cosine similarity)

## Safety & Error Handling

### Empty User History
- Falls back to popular places based on `popularity_score`
- Returns meaningful messages when no data available

### Missing Tags
- Handles places without tags gracefully
- Uses category and city information as fallback

### Database Errors
- Comprehensive error handling with logging
- Graceful degradation when components fail

### LLM Unavailable
- Template-based fallback explanations
- System continues to work without Ollama

## Performance

### Index Building
- One-time initialization on app startup
- Saves index to disk for faster restarts
- Typical build time: 10-30 seconds for 1000+ places

### Query Performance
- Vector search: < 50ms for 20 candidates
- Full pipeline: < 200ms including ranking and explanations
- Memory usage: ~100MB for 1000 places

### Scaling
- FAISS handles millions of vectors efficiently
- Batch processing for multiple users
- Singleton pattern for resource efficiency

## Monitoring

### Logging

All components use Python logging:

```python
import logging
logger = logging.getLogger(__name__)
```

Log levels:
- INFO: Normal operations, performance metrics
- WARNING: Fallbacks, degraded functionality
- ERROR: Failures, exceptions

### Status Monitoring

Check system health:

```bash
curl http://localhost:5000/api/recommendations/status
```

## Testing

### Unit Tests

```bash
python -m pytest tests/recommendation/
```

### Manual Testing

```bash
# Test recommendations
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/recommendations/1

# Test status
curl http://localhost:5000/api/recommendations/status
```

## Troubleshooting

### Common Issues

1. **FAISS Index Not Building**
   - Check database connection
   - Verify places_master table has data
   - Check sentence-transformers installation

2. **Ollama Connection Failed**
   - Ensure Ollama is running: `ollama serve`
   - Check model installation: `ollama list`
   - Verify URL configuration

3. **Memory Issues**
   - Reduce batch size in vector store
   - Use smaller embedding model
   - Increase system RAM

4. **Slow Performance**
   - Warm up system with sample queries
   - Check FAISS index size
   - Monitor database query performance

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Future Enhancements

- **Real-time Updates**: Incremental index updates
- **Multi-modal**: Include images in embeddings
- **Collaborative Filtering**: User similarity features
- **Geospatial**: Location-based filtering
- **Temporal**: Time-aware recommendations
- **A/B Testing**: Compare recommendation strategies

## Contributing

1. Follow existing code style
2. Add comprehensive error handling
3. Include logging for debugging
4. Write tests for new features
5. Update documentation

## License

This recommendation system is part of TravelLens project.
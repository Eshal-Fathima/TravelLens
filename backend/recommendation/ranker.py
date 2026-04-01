"""
Ranker Module (IMPROVED VERSION)

Now includes:
- Category-aware ranking
- Stronger personalization
- Cleaner results
"""

import logging
from typing import List, Dict, Any
from extensions import db
from sqlalchemy import text
from .interest_builder import get_user_interest_profile

logger = logging.getLogger(__name__)


def rank_places(user_id: int, candidates: List[int], top_k: int = 5) -> List[Dict[str, Any]]:
    try:
        if not candidates:
            return []

        # 1. Remove visited
        candidates = _filter_visited_places(user_id, candidates)

        # 2. Get user profile
        user_profile = get_user_interest_profile(user_id)

        # 🔥 BUILD USER CATEGORY PROFILE
        user_categories = _infer_user_categories(user_profile)

        # 3. Get place data
        place_data = _get_place_data_batch(candidates)

        scored = []

        for place_id in candidates:
            data = place_data.get(place_id, {})

            score_data = _calculate_place_score(
                user_id,
                place_id,
                user_profile,
                data,
                user_categories
            )

            scored.append(score_data)

        # sort
        scored.sort(key=lambda x: x['final_score'], reverse=True)

        return scored[:top_k]

    except Exception as e:
        logger.error(f"Ranking error: {str(e)}")
        return []


# -------------------------------
# CATEGORY INFERENCE
# -------------------------------
def _infer_user_categories(user_profile: Dict[str, float]) -> set:
    categories = set()

    for tag in user_profile:
        tag = tag.lower()

        if tag in ["nature", "park", "outdoor", "garden"]:
            categories.add("Park")

        elif tag in ["historical", "monument", "heritage"]:
            categories.add("Historical")

        elif tag in ["shopping", "mall"]:
            categories.add("Shopping")

        elif tag in ["nightlife", "party", "club"]:
            categories.add("Nightlife")

    return categories


# -------------------------------
# MAIN SCORING
# -------------------------------
def _calculate_place_score(user_id, place_id, user_profile, place_data, user_categories):

    vector_similarity = _get_vector_similarity(user_id, place_id)
    tag_overlap = _calculate_tag_overlap(user_profile, place_data.get('tags', []))
    novelty = _calculate_novelty(place_data.get('popularity_score', 0.0))

    # 🔥 NEW WEIGHTS (more personalization)
    score = (
        0.5 * vector_similarity +
        0.4 * tag_overlap +
        0.1 * novelty
    )

    category = place_data.get("category", "")

    # 🔥 CATEGORY BOOST / PENALTY
    if user_categories:
        if category in user_categories:
            score *= 1.3   # boost relevant
        else:
            score *= 0.6   # penalize irrelevant

    return {
        'place_id': place_id,
        'place_name': place_data.get('name'),
        'city': place_data.get('city'),
        'category': category,
        'final_score': round(score, 4),
        'vector_similarity': round(vector_similarity, 4),
        'tag_overlap': round(tag_overlap, 4),
        'novelty': round(novelty, 4),
        'tags': place_data.get('tags', [])
    }


# -------------------------------
# FILTER VISITED
# -------------------------------
def _filter_visited_places(user_id, candidates):
    try:
        query = text("""
        SELECT master_place_id FROM user_visited_places WHERE user_id = :user_id
        """)

        result = db.session.execute(query, {"user_id": user_id})
        visited = {row[0] for row in result.fetchall()}

        return [c for c in candidates if c not in visited]

    except:
        return candidates


# -------------------------------
# PLACE DATA
# -------------------------------
def _get_place_data_batch(place_ids):
    try:
        query = text("""
        SELECT pm.id, pm.name, pm.city, pm.category, pm.popularity_score,
               COALESCE(GROUP_CONCAT(pt.tag SEPARATOR ','), '') as tags
        FROM places_master pm
        LEFT JOIN place_tags pt ON pm.id = pt.place_id
        WHERE pm.id IN :ids
        GROUP BY pm.id
        """)

        result = db.session.execute(query, {"ids": tuple(place_ids)})

        data = {}
        for row in result.fetchall():
            tags = row[5].split(',') if row[5] else []

            data[row[0]] = {
                "name": row[1],
                "city": row[2],
                "category": row[3],
                "popularity_score": float(row[4]) if row[4] else 0,
                "tags": tags
            }

        return data

    except Exception as e:
        logger.error(str(e))
        return {}


# -------------------------------
# VECTOR SIMILARITY
# -------------------------------
def _get_vector_similarity(user_id, place_id):
    try:
        from .retriever import get_vector_store

        profile = get_user_interest_profile(user_id)
        if not profile:
            return 0

        query = " ".join(sorted(profile, key=profile.get, reverse=True))

        store = get_vector_store()
        results = store.search_by_text(query, k=100)

        for pid, sim in results:
            if pid == place_id:
                return sim

        return 0

    except:
        return 0


# -------------------------------
# TAG OVERLAP
# -------------------------------
def _calculate_tag_overlap(user_profile, place_tags):
    if not user_profile or not place_tags:
        return 0

    total = sum(user_profile.values())
    match = sum(weight for tag, weight in user_profile.items() if tag in place_tags)

    return match / total if total else 0


# -------------------------------
# NOVELTY
# -------------------------------
def _calculate_novelty(popularity):
    return 1 - min(popularity / 5.0, 1)
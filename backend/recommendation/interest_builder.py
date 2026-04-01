"""
Interest Builder Module

Builds user interest profiles from visit history and place tags.
"""

from extensions import db
from sqlalchemy import text
from collections import Counter, defaultdict
import logging

logger = logging.getLogger(__name__)

def build_user_interest_profile(user_id):
    """
    Build user interest profile from visited places and their tags.
    
    Args:
        user_id (int): User ID to build profile for
        
    Returns:
        dict: Success status and message
    """
    try:
        # Step 1: Get visited places from user_visited_places view
        visited_query = text("""
        SELECT DISTINCT p.master_place_id
        FROM user_visited_places p
        WHERE p.user_id = :user_id AND p.master_place_id IS NOT NULL
        """)
        
        result = db.session.execute(visited_query, {'user_id': user_id})
        visited_places = [row[0] for row in result.fetchall()]
        
        if not visited_places:
            logger.info(f"User {user_id} has no visited places with master_place_id")
            return {"success": True, "message": "No visited places found"}
        
        # Step 2: Join with place_tags to get all tags
        tags_query = text("""
        SELECT pt.tag
        FROM place_tags pt
        WHERE pt.place_id IN :place_ids
        """)
        
        result = db.session.execute(tags_query, {'place_ids': tuple(visited_places)})
        all_tags = [row[0] for row in result.fetchall()]
        
        if not all_tags:
            logger.info(f"No tags found for user {user_id}'s visited places")
            return {"success": True, "message": "No tags found"}
        
        # Step 3: Count tag frequency
        tag_counts = Counter(all_tags)
        
        # Step 4: Normalize weights (0-1 scale)
        max_count = max(tag_counts.values())
        normalized_weights = {
            tag: count / max_count 
            for tag, count in tag_counts.items()
        }
        
        # Step 5: Store results in user_interest_profile table
        # First, clear existing profile for this user
        delete_query = text("DELETE FROM user_interest_profile WHERE user_id = :user_id")
        db.session.execute(delete_query, {'user_id': user_id})
        
        # Insert new profile entries
        insert_query = text("""
        INSERT INTO user_interest_profile (user_id, tag, weight)
        VALUES (:user_id, :tag, :weight)
        """)
        
        for tag, weight in normalized_weights.items():
            db.session.execute(insert_query, {
                'user_id': user_id,
                'tag': tag,
                'weight': weight
            })
        
        db.session.commit()
        
        logger.info(f"Built interest profile for user {user_id} with {len(normalized_weights)} tags")
        
        return {
            "success": True, 
            "message": f"Profile built with {len(normalized_weights)} tags",
            "tags": normalized_weights
        }
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error building interest profile for user {user_id}: {str(e)}")
        return {"success": False, "error": str(e)}

def get_user_interest_profile(user_id):
    """
    Retrieve existing user interest profile.
    
    Args:
        user_id (int): User ID
        
    Returns:
        dict: Tag weights dictionary
    """
    try:
        query = text("""
        SELECT tag, weight 
        FROM user_interest_profile 
        WHERE user_id = :user_id 
        ORDER BY weight DESC
        """)
        
        result = db.session.execute(query, {'user_id': user_id})
        profile = {row[0]: float(row[1]) for row in result.fetchall()}
        
        return profile
        
    except Exception as e:
        logger.error(f"Error retrieving interest profile for user {user_id}: {str(e)}")
        return {}

def get_top_interests(user_id, limit=10):
    """
    Get top interests for a user.
    
    Args:
        user_id (int): User ID
        limit (int): Maximum number of interests to return
        
    Returns:
        list: List of (tag, weight) tuples
    """
    try:
        query = text("""
        SELECT tag, weight 
        FROM user_interest_profile 
        WHERE user_id = :user_id 
        ORDER BY weight DESC 
        LIMIT :limit
        """)
        
        result = db.session.execute(query, {'user_id': user_id, 'limit': limit})
        return [(row[0], float(row[1])) for row in result.fetchall()]
        
    except Exception as e:
        logger.error(f"Error getting top interests for user {user_id}: {str(e)}")
        return []

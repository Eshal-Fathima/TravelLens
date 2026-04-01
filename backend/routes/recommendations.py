from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.trip import Trip
from models.place import Place
from models.expense import Expense
from extensions import db
import random
import logging

# Import recommendation system modules
from recommendation.interest_builder import build_user_interest_profile
from recommendation.retriever import retrieve_candidates_with_fallback
from recommendation.ranker import rank_places
from recommendation.llm_explainer import generate_explanation

logger = logging.getLogger(__name__)

recommendations_bp = Blueprint('recommendations', __name__)

# Sample popular destinations and places
POPULAR_DESTINATIONS = [
    {'name': 'Bali, Indonesia', 'category': 'Beach', 'description': 'Tropical paradise with beautiful beaches'},
    {'name': 'Paris, France', 'category': 'City', 'description': 'City of love and lights'},
    {'name': 'Swiss Alps', 'category': 'Mountain', 'description': 'Breathtaking mountain views'},
    {'name': 'Dubai, UAE', 'category': 'City', 'description': 'Modern city with luxury experiences'},
    {'name': 'Maldives', 'category': 'Beach', 'description': 'Luxury island destination'},
    {'name': 'Rome, Italy', 'category': 'Historical', 'description': 'Ancient history and culture'},
    {'name': 'Tokyo, Japan', 'category': 'City', 'description': 'Modern technology meets tradition'},
    {'name': 'New York, USA', 'category': 'City', 'description': 'The city that never sleeps'},
    {'name': 'Santorini, Greece', 'category': 'Beach', 'description': 'Stunning sunsets and white buildings'},
    {'name': 'Machu Picchu, Peru', 'category': 'Mountain', 'description': 'Ancient Incan citadel'}
]

POPULAR_PLACES = {
    'Beach': [
        {'name': 'Copacabana Beach', 'location': 'Rio de Janeiro', 'description': 'Famous beach with vibrant atmosphere'},
        {'name': 'Waikiki Beach', 'location': 'Honolulu', 'description': 'Beautiful Hawaiian beach'},
        {'name': 'Miami Beach', 'location': 'Florida', 'description': 'Art Deco beach destination'},
        {'name': 'Bondi Beach', 'location': 'Sydney', 'description': 'Iconic Australian beach'},
        {'name': 'Marina Beach', 'location': 'Chennai', 'description': 'Longest natural urban beach'}
    ],
    'Mountain': [
        {'name': 'Mount Everest Base Camp', 'location': 'Nepal', 'description': 'Ultimate mountain trekking'},
        {'name': 'Swiss Alps', 'location': 'Switzerland', 'description': 'Pristine mountain ranges'},
        {'name': 'Rocky Mountains', 'location': 'Colorado', 'description': 'Majestic American peaks'},
        {'name': 'Himalayas', 'location': 'India', 'description': 'World\'s highest mountain range'},
        {'name': 'Andes Mountains', 'location': 'South America', 'description': 'Longest continental mountain range'}
    ],
    'Historical': [
        {'name': 'Taj Mahal', 'location': 'Agra', 'description': 'Symbol of eternal love'},
        {'name': 'Colosseum', 'location': 'Rome', 'description': 'Ancient Roman amphitheater'},
        {'name': 'Great Wall of China', 'location': 'China', 'description': 'Ancient fortification'},
        {'name': 'Pyramids of Giza', 'location': 'Egypt', 'description': 'Ancient wonders'},
        {'name': 'Angkor Wat', 'location': 'Cambodia', 'description': 'Largest religious monument'}
    ],
    'City': [
        {'name': 'Times Square', 'location': 'New York', 'description': 'Iconic city intersection'},
        {'name': 'Eiffel Tower', 'location': 'Paris', 'description': 'Iron lattice tower'},
        {'name': 'Burj Khalifa', 'location': 'Dubai', 'description': 'World\'s tallest building'},
        {'name': 'Tokyo Tower', 'location': 'Tokyo', 'description': 'Communications and observation tower'},
        {'name': 'Sydney Opera House', 'location': 'Sydney', 'description': 'Performing arts centre'}
    ]
}

BUDGET_TIPS = [
    {'category': 'Transport', 'tip': 'Book flights 6-8 weeks in advance for better prices', 'savings': '15-20%'},
    {'category': 'Accommodation', 'tip': 'Consider vacation rentals for longer stays', 'savings': '30-40%'},
    {'category': 'Food', 'tip': 'Eat at local restaurants instead of tourist traps', 'savings': '25-35%'},
    {'category': 'Activities', 'tip': 'Look for city passes and combo tickets', 'savings': '20-30%'},
    {'category': 'Shopping', 'tip': 'Buy souvenirs from local markets, not airport shops', 'savings': '40-50%'},
    {'category': 'General', 'tip': 'Travel during off-season for better deals', 'savings': '25-35%'},
    {'category': 'General', 'tip': 'Use public transport instead of taxis', 'savings': '60-70%'},
    {'category': 'General', 'tip': 'Pack light to avoid baggage fees', 'savings': '15-25%'}
]

@recommendations_bp.route('/recommendations/<int:user_id>', methods=['GET'])
@jwt_required()
def get_recommendations(user_id):
    """Get personalized recommendations for a user"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Only allow users to see their own recommendations
        if current_user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Check if we want the new recommendation system or legacy
        use_new_system = request.args.get('new_system', 'true').lower() == 'true'
        
        if use_new_system:
            return get_new_recommendations(user_id)
        else:
            return get_legacy_recommendations(user_id)
            
    except Exception as e:
        logger.error(f"Error getting recommendations for user {user_id}: {str(e)}")
        return jsonify({'error': 'Recommendation service temporarily unavailable'}), 500

@recommendations_bp.route('/recommendations/status', methods=['GET'])
def get_recommendation_status():
    """Get the status of the recommendation system"""
    try:
        from recommendation.init_recommendations import get_recommendation_system_status
        status = get_recommendation_system_status()
        return jsonify(status), 200
    except Exception as e:
        logger.error(f"Error getting recommendation status: {str(e)}")
        return jsonify({'error': 'Status unavailable', 'initialized': False}), 500

@recommendations_bp.route('/recommendations/refresh', methods=['POST'])
@jwt_required()
def refresh_recommendation_system():
    """Refresh the recommendation system (rebuild index)"""
    try:
        current_user_id = get_jwt_identity()
        
        # For now, only allow admin users or specific users to refresh
        # In production, you'd check for admin role
        if current_user_id != 1:  # Assuming user ID 1 is admin
            return jsonify({'error': 'Access denied'}), 403
        
        from recommendation.init_recommendations import initialize_recommendation_system
        
        if initialize_recommendation_system():
            return jsonify({'message': 'Recommendation system refreshed successfully'}), 200
        else:
            return jsonify({'error': 'Failed to refresh recommendation system'}), 500
            
    except Exception as e:
        logger.error(f"Error refreshing recommendation system: {str(e)}")
        return jsonify({'error': 'Refresh failed'}), 500

def get_new_recommendations(user_id):
    """Get recommendations using the new retrieval-based system"""
    try:
        logger.info(f"Generating new recommendations for user {user_id}")
        
        # Step 1: Build user interest profile
        profile_result = build_user_interest_profile(user_id)
        
        if not profile_result.get('success', False):
            logger.warning(f"Failed to build profile for user {user_id}: {profile_result.get('error', 'Unknown error')}")
        
        # Step 2: Retrieve candidates
        candidates = retrieve_candidates_with_fallback(user_id, k=20)
        
        if not candidates:
            logger.info(f"No candidates found for user {user_id}")
            return jsonify({
                'recommendations': [],
                'message': 'No recommendations available at the moment'
            }), 200
        
        # Step 3: Rank places
        ranked_places = rank_places(user_id, candidates, top_k=5)
        
        if not ranked_places:
            logger.info(f"No ranked places for user {user_id}")
            return jsonify({
                'recommendations': [],
                'message': 'No recommendations available at the moment'
            }), 200
        
        # Step 4: Generate explanations
        recommendations = []
        for place_data in ranked_places:
            place_name = place_data.get('place_name', 'Unknown Place')
            score = place_data.get('final_score', 0.0)
            
            # Generate explanation
            explanation = generate_explanation(user_id, place_name)
            
            recommendations.append({
                'place': place_name,
                'place_id': place_data.get('place_id'),
                'city': place_data.get('city', 'Unknown'),
                'category': place_data.get('category', 'Unknown'),
                'score': round(score, 3),
                'reason': explanation,
                'tags': place_data.get('tags', []),
                'vector_similarity': place_data.get('vector_similarity', 0.0),
                'tag_overlap': place_data.get('tag_overlap', 0.0),
                'novelty': place_data.get('novelty', 0.0)
            })
        
        logger.info(f"Generated {len(recommendations)} recommendations for user {user_id}")
        
        return jsonify({
            'recommendations': recommendations,
            'system': 'retrieval_based',
            'profile_updated': profile_result.get('success', False)
        }), 200
        
    except Exception as e:
        logger.error(f"Error in new recommendation system for user {user_id}: {str(e)}")
        return jsonify({'error': 'Recommendation system temporarily unavailable'}), 500

def get_legacy_recommendations(user_id):
    """Get recommendations using the legacy system"""
    try:
        # Get user data
        trips = Trip.query.filter_by(user_id=user_id).all()
        trip_ids = [trip.id for trip in trips]
        
        places = Place.query.filter(Place.trip_id.in_(trip_ids)).all()
        expenses = Expense.query.filter(Expense.trip_id.in_(trip_ids)).all()
        
        # Generate recommendations
        recommendations = generate_recommendations(trips, places, expenses)
        
        return jsonify({
            'recommendations': recommendations,
            'system': 'legacy'
        }), 200
        
    except Exception as e:
        logger.error(f"Error in legacy recommendation system for user {user_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

def generate_recommendations(trips, places, expenses):
    """Generate personalized recommendations"""
    
    # Analyze user preferences
    visited_destinations = [trip.destination for trip in trips]
    visited_categories = [place.category for place in places]
    spending_pattern = analyze_spending(expenses)
    
    # Generate destination recommendations
    destination_recommendations = recommend_destinations(visited_destinations, visited_categories)
    
    # Generate place recommendations
    place_recommendations = recommend_places(visited_categories)
    
    # Generate budget optimization tips
    budget_tips = recommend_budget_optimization(spending_pattern)
    
    # Generate travel style recommendations
    travel_tips = recommend_travel_style(trips, places)
    
    return {
        'destinations': destination_recommendations,
        'places': place_recommendations,
        'budget_tips': budget_tips,
        'travel_tips': travel_tips,
        'next_trip_suggestions': suggest_next_trip(trips, visited_categories)
    }

def recommend_destinations(visited_destinations, visited_categories):
    """Recommend destinations based on user preferences"""
    
    # Filter out already visited destinations
    recommendations = []
    for dest in POPULAR_DESTINATIONS:
        if dest['name'] not in visited_destinations:
            recommendations.append(dest)
    
    # Prioritize based on preferred categories
    if visited_categories:
        category_counts = {}
        for cat in visited_categories:
            category_counts[cat] = category_counts.get(cat, 0) + 1
        
        preferred_category = max(category_counts, key=category_counts.get)
        
        # Move destinations matching preferred category to top
        matching_destinations = [d for d in recommendations if d['category'].lower() in preferred_category.lower()]
        other_destinations = [d for d in recommendations if d not in matching_destinations]
        
        recommendations = matching_destinations[:3] + other_destinations[:4]
    else:
        recommendations = recommendations[:7]
    
    return recommendations

def recommend_places(visited_categories):
    """Recommend places based on user preferences"""
    
    # Count visited categories
    category_counts = {}
    for cat in visited_categories:
        category_counts[cat] = category_counts.get(cat, 0) + 1
    
    # Get least visited categories to recommend
    all_categories = ['Beach', 'Mountain', 'Historical', 'City']
    recommendations = []
    
    for category in all_categories:
        if category in category_counts:
            # Recommend some places from this category
            places = POPULAR_PLACES.get(category, [])
            recommendations.extend(places[:2])
        else:
            # Highly recommend places from unvisited categories
            places = POPULAR_PLACES.get(category, [])
            recommendations.extend(places[:3])
    
    return recommendations[:8]

def recommend_budget_optimization(spending_pattern):
    """Recommend budget optimization tips"""
    
    # Get top spending categories
    if spending_pattern:
        top_category = max(spending_pattern, key=spending_pattern.get)
        
        # Get relevant tips
        relevant_tips = [tip for tip in BUDGET_TIPS if tip['category'] == top_category]
        general_tips = [tip for tip in BUDGET_TIPS if tip['category'] == 'General']
        
        return relevant_tips[:2] + general_tips[:2]
    
    # Return general tips if no spending pattern
    return [tip for tip in BUDGET_TIPS if tip['category'] == 'General'][:4]

def recommend_travel_style(trips, places):
    """Recommend travel style improvements"""
    
    tips = []
    
    if len(trips) == 0:
        tips.append({
            'title': 'Start Your Journey',
            'description': 'Plan your first trip to discover your travel style',
            'icon': '🧳'
        })
    elif len(trips) < 3:
        tips.append({
            'title': 'Explore More',
            'description': 'Try different destinations to find your preferences',
            'icon': '🗺️'
        })
    
    # Analyze place diversity
    categories = set(place.category for place in places)
    if len(categories) < 3 and len(places) > 5:
        tips.append({
            'title': 'Diversify Your Experiences',
            'description': 'Try visiting different types of places for richer experiences',
            'icon': '🎭'
        })
    
    # Add general travel tips
    tips.extend([
        {
            'title': 'Travel Sustainably',
            'description': 'Choose eco-friendly options and support local communities',
            'icon': '🌱'
        },
        {
            'title': 'Document Your Journey',
            'description': 'Keep detailed notes and photos for better memories',
            'icon': '📸'
        }
    ])
    
    return tips[:4]

def suggest_next_trip(trips, visited_categories):
    """Suggest ideas for the next trip"""
    
    suggestions = []
    
    if not trips:
        suggestions.append({
            'type': 'First Trip',
            'suggestion': 'Start with a nearby destination to get comfortable',
            'reason': 'Build confidence with shorter, familiar trips'
        })
    else:
        # Analyze trip patterns
        trip_types = [trip.travel_type for trip in trips]
        
        if 'Solo' not in trip_types:
            suggestions.append({
                'type': 'Solo Adventure',
                'suggestion': 'Try a solo trip to discover yourself',
                'reason': 'Solo travel offers freedom and self-discovery'
            })
        
        if 'Family' not in trip_types:
            suggestions.append({
                'type': 'Family Bonding',
                'suggestion': 'Plan a family trip to create lasting memories',
                'reason': 'Family trips strengthen relationships'
            })
        
        # Suggest based on unvisited categories
        all_categories = ['Beach', 'Mountain', 'Historical', 'City']
        unvisited = set(all_categories) - set(visited_categories)
        
        if unvisited:
            for category in list(unvisited)[:2]:
                suggestions.append({
                    'type': f'{category} Exploration',
                    'suggestion': f'Explore {category.lower()} destinations',
                    'reason': f'Discover the beauty of {category.lower()} experiences'
                })
    
    return suggestions[:3]

def analyze_spending(expenses):
    """Analyze spending patterns"""
    if not expenses:
        return {}
    
    spending_by_category = {}
    for expense in expenses:
        category = expense.category
        amount = float(expense.amount)
        spending_by_category[category] = spending_by_category.get(category, 0) + amount
    
    return spending_by_category

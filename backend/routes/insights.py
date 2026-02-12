from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.trip import Trip
from models.place import Place
from models.hotel import Hotel
from models.expense import Expense
from extensions import db
from sqlalchemy import func
import datetime

insights_bp = Blueprint('insights', __name__)

@insights_bp.route('/insights/<int:user_id>', methods=['GET'])
@jwt_required()
def get_insights(user_id):
    """Get travel insights for a user (Spotify Wrapped style)"""
    try:
        current_user_id = get_jwt_identity()
        
        # Only allow users to see their own insights
        if current_user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get user trips
        trips = Trip.query.filter_by(user_id=user_id).all()
        
        if not trips:
            return jsonify({
                'message': 'No trips found',
                'insights': {
                    'total_trips': 0,
                    'total_spent': 0,
                    'countries_visited': 0,
                    'cities_visited': 0,
                    'travel_personality': 'New Traveler',
                    'most_visited_destination': None,
                    'favorite_place_category': None,
                    'average_trip_cost': 0,
                    'travel_frequency': 0
                }
            }), 200
        
        # Calculate basic metrics
        total_trips = len(trips)
        trip_ids = [trip.id for trip in trips]
        
        # Get expenses
        expenses = Expense.query.filter(Expense.trip_id.in_(trip_ids)).all()
        total_spent = sum(float(exp.amount) for exp in expenses)
        
        # Get unique destinations
        destinations = list(set(trip.destination for trip in trips))
        
        # Get places
        places = Place.query.filter(Place.trip_id.in_(trip_ids)).all()
        
        # Get hotels
        hotels = Hotel.query.filter(Hotel.trip_id.in_(trip_ids)).all()
        
        # Calculate insights
        insights = calculate_insights(trips, expenses, places, hotels, destinations)
        
        return jsonify({
            'insights': insights,
            'year': datetime.datetime.now().year
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_insights(trips, expenses, places, hotels, destinations):
    """Calculate travel insights"""
    
    # Basic metrics
    total_trips = len(trips)
    total_spent = sum(float(exp.amount) for exp in expenses)
    average_trip_cost = total_spent / total_trips if total_trips > 0 else 0
    
    # Travel personality
    travel_personality = determine_travel_personality(total_spent, total_trips, average_trip_cost)
    
    # Most visited destination
    destination_counts = {}
    for trip in trips:
        dest = trip.destination
        destination_counts[dest] = destination_counts.get(dest, 0) + 1
    
    most_visited_destination = max(destination_counts, key=destination_counts.get) if destination_counts else None
    
    # Favorite place category
    category_counts = {}
    for place in places:
        cat = place.category
        category_counts[cat] = category_counts.get(cat, 0) + 1
    
    favorite_place_category = max(category_counts, key=category_counts.get) if category_counts else None
    
    # Travel preference
    travel_preference = determine_travel_preference(category_counts)
    
    # Travel frequency (trips per year)
    if trips:
        first_trip = min(trips, key=lambda t: t.start_date)
        years_since_first = (datetime.datetime.now().date() - first_trip.start_date).days / 365.25
        travel_frequency = total_trips / max(years_since_first, 1)
    else:
        travel_frequency = 0
    
    # Budget analysis
    budget_analysis = analyze_budget(trips, expenses)
    
    return {
        'total_trips': total_trips,
        'total_spent': round(total_spent, 2),
        'countries_visited': len(destinations),
        'cities_visited': len(destinations),
        'travel_personality': travel_personality,
        'most_visited_destination': most_visited_destination,
        'favorite_place_category': favorite_place_category,
        'average_trip_cost': round(average_trip_cost, 2),
        'travel_frequency': round(travel_frequency, 1),
        'travel_preference': travel_preference,
        'budget_analysis': budget_analysis,
        'destination_breakdown': destination_counts,
        'category_breakdown': category_counts
    }

def determine_travel_personality(total_spent, total_trips, avg_trip_cost):
    """Determine travel personality based on spending patterns"""
    if total_trips == 0:
        return 'New Traveler'
    
    if avg_trip_cost < 10000:
        return 'Budget Explorer'
    elif avg_trip_cost < 25000:
        return 'Smart Traveler'
    elif avg_trip_cost < 50000:
        return 'Comfort Seeker'
    else:
        return 'Luxury Traveler'

def determine_travel_preference(category_counts):
    """Determine travel preference based on place categories"""
    if not category_counts:
        return 'Explorer'
    
    beach_count = category_counts.get('Beach', 0)
    mountain_count = category_counts.get('Mountain', 0)
    historical_count = category_counts.get('Historical', 0) + category_counts.get('Fort', 0) + category_counts.get('Museum', 0) + category_counts.get('Temple', 0)
    city_count = category_counts.get('Restaurant', 0) + category_counts.get('Shopping', 0) + category_counts.get('Entertainment', 0)
    
    max_count = max(beach_count, mountain_count, historical_count, city_count)
    
    if max_count == beach_count and beach_count > 0:
        return 'Beach Lover 🌊'
    elif max_count == mountain_count and mountain_count > 0:
        return 'Mountain Explorer 🏔️'
    elif max_count == historical_count and historical_count > 0:
        return 'Cultural Explorer 🏛️'
    elif max_count == city_count and city_count > 0:
        return 'City Explorer 🏙️'
    else:
        return 'Explorer 🗺️'

def analyze_budget(trips, expenses):
    """Analyze budget vs actual spending"""
    total_budget = sum(float(trip.budget) for trip in trips)
    total_spent = sum(float(exp.amount) for exp in expenses)
    
    if total_budget == 0:
        return {
            'total_budget': 0,
            'total_spent': total_spent,
            'budget_utilization': 0,
            'overspend': 0
        }
    
    budget_utilization = (total_spent / total_budget) * 100
    overspend = max(0, total_spent - total_budget)
    
    return {
        'total_budget': total_budget,
        'total_spent': total_spent,
        'budget_utilization': round(budget_utilization, 1),
        'overspend': round(overspend, 2)
    }

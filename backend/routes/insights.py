from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.trip import Trip
from models.place import Place
from models.hotel import Hotel
from models.expense import Expense
from extensions import db
import datetime

insights_bp = Blueprint('insights', __name__)

@insights_bp.route('/insights/<int:user_id>', methods=['GET'])
@jwt_required()
def get_insights(user_id):
    try:
        current_user_id = int(get_jwt_identity())

        if current_user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403

        trips = Trip.query.filter_by(user_id=user_id).all()

        if not trips:
            return jsonify({'message': 'No trips found', 'insights': {
                'total_trips': 0, 'total_spent': 0, 'countries_visited': 0,
                'cities_visited': 0, 'travel_personality': 'New Traveler',
                'most_visited_destination': None, 'favorite_place_category': None,
                'average_trip_cost': 0, 'travel_frequency': 0
            }}), 200

        total_trips = len(trips)
        trip_ids = [trip.id for trip in trips]

        expenses = Expense.query.filter(Expense.trip_id.in_(trip_ids)).all()
        total_spent = sum(float(exp.amount) for exp in expenses)
        destinations = list(set(trip.destination for trip in trips))
        places = Place.query.filter(Place.trip_id.in_(trip_ids)).all()
        hotels = Hotel.query.filter(Hotel.trip_id.in_(trip_ids)).all()

        insights = calculate_insights(trips, expenses, places, hotels, destinations)
        return jsonify({'insights': insights, 'year': datetime.datetime.now().year}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_insights(trips, expenses, places, hotels, destinations):
    total_trips = len(trips)
    total_spent = sum(float(exp.amount) for exp in expenses)
    average_trip_cost = total_spent / total_trips if total_trips > 0 else 0
    travel_personality = determine_travel_personality(total_spent, total_trips, average_trip_cost)

    destination_counts = {}
    for trip in trips:
        destination_counts[trip.destination] = destination_counts.get(trip.destination, 0) + 1
    most_visited_destination = max(destination_counts, key=destination_counts.get) if destination_counts else None

    category_counts = {}
    for place in places:
        category_counts[place.category] = category_counts.get(place.category, 0) + 1
    favorite_place_category = max(category_counts, key=category_counts.get) if category_counts else None
    travel_preference = determine_travel_preference(category_counts)

    if trips:
        first_trip = min(trips, key=lambda t: t.start_date)
        years_since_first = (datetime.datetime.now().date() - first_trip.start_date).days / 365.25
        travel_frequency = total_trips / max(years_since_first, 1)
    else:
        travel_frequency = 0

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
    if total_trips == 0: return 'New Traveler'
    if avg_trip_cost < 10000: return 'Budget Explorer'
    elif avg_trip_cost < 25000: return 'Smart Traveler'
    elif avg_trip_cost < 50000: return 'Comfort Seeker'
    else: return 'Luxury Traveler'

def determine_travel_preference(category_counts):
    if not category_counts: return 'Explorer'
    beach = category_counts.get('Beach', 0)
    mountain = category_counts.get('Mountain', 0)
    historical = category_counts.get('Historical', 0) + category_counts.get('Fort', 0) + category_counts.get('Museum', 0) + category_counts.get('Temple', 0)
    city = category_counts.get('Restaurant', 0) + category_counts.get('Shopping', 0) + category_counts.get('Entertainment', 0)
    mx = max(beach, mountain, historical, city)
    if mx == beach and beach > 0: return 'Beach Lover '
    elif mx == mountain and mountain > 0: return 'Mountain Explorer '
    elif mx == historical and historical > 0: return 'Cultural Explorer '
    elif mx == city and city > 0: return 'City Explorer '
    return 'Explorer '

def analyze_budget(trips, expenses):
    total_budget = sum(float(trip.budget) for trip in trips)
    total_spent = sum(float(exp.amount) for exp in expenses)
    if total_budget == 0:
        return {'total_budget': 0, 'total_spent': total_spent, 'budget_utilization': 0, 'overspend': 0}
    return {
        'total_budget': total_budget,
        'total_spent': total_spent,
        'budget_utilization': round((total_spent / total_budget) * 100, 1),
        'overspend': round(max(0, total_spent - total_budget), 2)
    }
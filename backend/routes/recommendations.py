# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.trip import Trip
from models.place import Place
from models.expense import Expense
from extensions import db

recommendations_bp = Blueprint('recommendations', __name__)

POPULAR_DESTINATIONS = [
    {'name': 'Bali, Indonesia', 'category': 'Beach', 'description': 'Tropical paradise with beautiful beaches'},
    {'name': 'Paris, France', 'category': 'City', 'description': 'City of love and lights'},
    {'name': 'Swiss Alps', 'category': 'Mountain', 'description': 'Breathtaking mountain views'},
    {'name': 'Dubai, UAE', 'category': 'City', 'description': 'Modern city with luxury experiences'},
    {'name': 'Maldives', 'category': 'Beach', 'description': 'Luxury island destination'},
    {'name': 'Rome, Italy', 'category': 'Historical', 'description': 'Ancient history and culture'},
    {'name': 'Tokyo, Japan', 'category': 'City', 'description': 'Modern technology meets tradition'},
    {'name': 'Santorini, Greece', 'category': 'Beach', 'description': 'Stunning sunsets and white buildings'},
    {'name': 'Machu Picchu, Peru', 'category': 'Mountain', 'description': 'Ancient Incan citadel'},
    {'name': 'New York, USA', 'category': 'City', 'description': 'The city that never sleeps'},
]

POPULAR_PLACES = {
    'Beach': [
        {'name': 'Marina Beach', 'location': 'Chennai', 'description': 'Longest natural urban beach'},
        {'name': 'Bondi Beach', 'location': 'Sydney', 'description': 'Iconic Australian beach'},
        {'name': 'Waikiki Beach', 'location': 'Honolulu', 'description': 'Beautiful Hawaiian beach'},
    ],
    'Mountain': [
        {'name': 'Himalayas', 'location': 'India', 'description': 'World''s highest mountain range'},
        {'name': 'Swiss Alps', 'location': 'Switzerland', 'description': 'Pristine mountain ranges'},
        {'name': 'Rocky Mountains', 'location': 'Colorado', 'description': 'Majestic American peaks'},
    ],
    'Historical': [
        {'name': 'Taj Mahal', 'location': 'Agra', 'description': 'Symbol of eternal love'},
        {'name': 'Colosseum', 'location': 'Rome', 'description': 'Ancient Roman amphitheater'},
        {'name': 'Great Wall of China', 'location': 'China', 'description': 'Ancient fortification'},
    ],
    'City': [
        {'name': 'Eiffel Tower', 'location': 'Paris', 'description': 'Iron lattice tower'},
        {'name': 'Burj Khalifa', 'location': 'Dubai', 'description': 'World''s tallest building'},
        {'name': 'Tokyo Tower', 'location': 'Tokyo', 'description': 'Communications and observation tower'},
    ]
}

BUDGET_TIPS = [
    {'category': 'Transport', 'tip': 'Book flights 6-8 weeks in advance', 'savings': '15-20%'},
    {'category': 'Accommodation', 'tip': 'Consider vacation rentals for longer stays', 'savings': '30-40%'},
    {'category': 'Food', 'tip': 'Eat at local restaurants instead of tourist traps', 'savings': '25-35%'},
    {'category': 'General', 'tip': 'Travel during off-season for better deals', 'savings': '25-35%'},
    {'category': 'General', 'tip': 'Use public transport instead of taxis', 'savings': '60-70%'},
]

@recommendations_bp.route('/recommendations/<int:user_id>', methods=['GET'])
@jwt_required()
def get_recommendations(user_id):
    try:
        current_user_id = int(get_jwt_identity())

        if current_user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403

        trips = Trip.query.filter_by(user_id=user_id).all()
        trip_ids = [trip.id for trip in trips]
        places = Place.query.filter(Place.trip_id.in_(trip_ids)).all() if trip_ids else []
        expenses = Expense.query.filter(Expense.trip_id.in_(trip_ids)).all() if trip_ids else []

        visited_destinations = [trip.destination for trip in trips]
        visited_categories = [place.category for place in places]

        dest_recs = [d for d in POPULAR_DESTINATIONS if d['name'] not in visited_destinations][:6]

        place_recs = []
        for cat in ['Beach', 'Mountain', 'Historical', 'City']:
            place_recs.extend(POPULAR_PLACES.get(cat, [])[:2])

        spending = {}
        for e in expenses:
            spending[e.category] = spending.get(e.category, 0) + float(e.amount)
        top_cat = max(spending, key=spending.get) if spending else None
        tips = [t for t in BUDGET_TIPS if t['category'] == top_cat][:2] +                [t for t in BUDGET_TIPS if t['category'] == 'General'][:2]

        travel_tips = [
            {'title': 'Travel Sustainably', 'description': 'Choose eco-friendly options and support local communities', 'icon': 'leaf'},
            {'title': 'Document Your Journey', 'description': 'Keep notes and photos for better memories', 'icon': 'camera'},
            {'title': 'Try Local Food', 'description': 'Explore local cuisine for authentic experiences', 'icon': 'food'},
        ]

        trip_types = [t.travel_type for t in trips]
        suggestions = []
        if 'Solo' not in trip_types:
            suggestions.append({'type': 'Solo Adventure', 'suggestion': 'Try a solo trip to discover yourself', 'reason': 'Solo travel offers freedom and self-discovery'})
        if 'Family' not in trip_types:
            suggestions.append({'type': 'Family Bonding', 'suggestion': 'Plan a family trip to create lasting memories', 'reason': 'Family trips strengthen relationships'})
        if not suggestions:
            suggestions.append({'type': 'New Destination', 'suggestion': 'Explore somewhere completely new', 'reason': 'Broaden your travel horizons'})

        return jsonify({'recommendations': {
            'destinations': dest_recs,
            'places': place_recs[:8],
            'budget_tips': tips,
            'travel_tips': travel_tips,
            'next_trip_suggestions': suggestions[:3],
        }}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
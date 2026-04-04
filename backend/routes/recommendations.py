from flask import Blueprint, jsonify
# ❌ Removed jwt_required import for now
# from flask_jwt_extended import jwt_required, get_jwt_identity

from models.trip import Trip
from models.place import Place
from models.expense import Expense

# ✅ Blueprint
recommendations_bp = Blueprint('recommendations', __name__)

# ✅ TEST ROUTE
@recommendations_bp.route('/recommendations/status', methods=['GET'])
def status():
    return jsonify({"status": "ok"}), 200


# ---------------- DATA ---------------- #

POPULAR_DESTINATIONS = [
    {'name': 'Bali, Indonesia', 'category': 'Beach', 'description': 'Tropical paradise'},
    {'name': 'Paris, France', 'category': 'City', 'description': 'City of love'},
    {'name': 'Swiss Alps', 'category': 'Mountain', 'description': 'Mountain views'},
    {'name': 'Dubai, UAE', 'category': 'City', 'description': 'Luxury city'},
    {'name': 'Maldives', 'category': 'Beach', 'description': 'Island paradise'},
    {'name': 'Rome, Italy', 'category': 'Historical', 'description': 'Ancient culture'},
    {'name': 'Tokyo, Japan', 'category': 'City', 'description': 'Modern meets tradition'},
]

POPULAR_PLACES = {
    'Beach': [
        {'name': 'Marina Beach', 'location': 'Chennai'},
        {'name': 'Bondi Beach', 'location': 'Sydney'},
    ],
    'Mountain': [
        {'name': 'Himalayas', 'location': 'India'},
        {'name': 'Swiss Alps', 'location': 'Switzerland'},
    ],
    'Historical': [
        {'name': 'Taj Mahal', 'location': 'Agra'},
        {'name': 'Colosseum', 'location': 'Rome'},
    ],
    'City': [
        {'name': 'Eiffel Tower', 'location': 'Paris'},
        {'name': 'Burj Khalifa', 'location': 'Dubai'},
    ]
}

BUDGET_TIPS = [
    {'category': 'Transport', 'tip': 'Book flights early'},
    {'category': 'Food', 'tip': 'Eat local food'},
    {'category': 'General', 'tip': 'Travel off-season'},
]


# ---------------- MAIN API ---------------- #

@recommendations_bp.route('/recommendations/<int:user_id>', methods=['GET'])
def get_recommendations(user_id):
    try:
        # ❌ Removed JWT check
        # current_user_id = int(get_jwt_identity())

        trips = Trip.query.filter_by(user_id=user_id).all()
        trip_ids = [trip.id for trip in trips]

        places = Place.query.filter(Place.trip_id.in_(trip_ids)).all() if trip_ids else []
        expenses = Expense.query.filter(Expense.trip_id.in_(trip_ids)).all() if trip_ids else []

        visited_destinations = [trip.destination for trip in trips]

        # Destinations
        dest_recs = [
            d for d in POPULAR_DESTINATIONS
            if d['name'] not in visited_destinations
        ][:5]

        # Places
        place_recs = []
        for cat in POPULAR_PLACES:
            place_recs.extend(POPULAR_PLACES[cat])

        # Budget
        spending = {}
        for e in expenses:
            spending[e.category] = spending.get(e.category, 0) + float(e.amount)

        tips = BUDGET_TIPS

        return jsonify({
            'recommendations': {
                'destinations': dest_recs,
                'places': place_recs[:6],
                'budget_tips': tips,
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
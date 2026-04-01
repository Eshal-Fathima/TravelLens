from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.place import Place
from models.trip import Trip
from extensions import db
from recommendation.interest_builder import build_user_interest_profile

# ✅ DEFINE BLUEPRINT (THIS WAS MISSING)
places_bp = Blueprint('places', __name__)

# ===========================
# CREATE PLACE (MAIN LOGIC)
# ===========================
@places_bp.route('/places', methods=['POST'])
@jwt_required()
def create_place():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        # Validate required fields
        required_fields = ['trip_id', 'place_name', 'category']
        if not data or not all(k in data for k in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Validate category
        valid_categories = [
            'Beach', 'Fort', 'Museum', 'Temple', 'Mountain',
            'Park', 'Restaurant', 'Shopping', 'Entertainment',
            'Historical', 'Other'
        ]
        if data['category'] not in valid_categories:
            return jsonify({'error': 'Invalid category'}), 400

        # Validate rating
        if 'rating' in data and (data['rating'] < 1 or data['rating'] > 5):
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400

        # Check trip ownership
        trip = Trip.query.filter_by(
            id=data['trip_id'],
            user_id=current_user_id
        ).first()

        if not trip:
            return jsonify({'error': 'Trip not found or access denied'}), 404

        # ✅ CREATE PLACE
        place = Place(
            trip_id=data['trip_id'],
            place_name=data['place_name'],
            category=data['category'],
            rating=data.get('rating'),
            notes=data.get('notes')
        )

        db.session.add(place)
        db.session.commit()

        # 🔥 RAG PIPELINE STARTS HERE

        # 1. Link to master place
        place.link_to_master()

        # 2. Add to visited table
        place.add_to_visited(current_user_id)

        db.session.commit()

        # 3. Build interest profile
        build_user_interest_profile(current_user_id)

        return jsonify({
            'message': 'Place created successfully',
            'place': place.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ===========================
# GET PLACES
# ===========================
@places_bp.route('/places/<int:trip_id>', methods=['GET'])
@jwt_required()
def get_places(trip_id):
    try:
        current_user_id = get_jwt_identity()

        trip = Trip.query.filter_by(
            id=trip_id,
            user_id=current_user_id
        ).first()

        if not trip:
            return jsonify({'error': 'Trip not found or access denied'}), 404

        places = Place.query.filter_by(trip_id=trip_id)\
            .order_by(Place.created_at.desc()).all()

        return jsonify({
            'places': [place.to_dict() for place in places]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ===========================
# UPDATE PLACE
# ===========================
@places_bp.route('/places/<int:place_id>', methods=['PUT'])
@jwt_required()
def update_place(place_id):
    try:
        current_user_id = get_jwt_identity()
        place = Place.query.get(place_id)

        if not place:
            return jsonify({'error': 'Place not found'}), 404

        trip = Trip.query.filter_by(
            id=place.trip_id,
            user_id=current_user_id
        ).first()

        if not trip:
            return jsonify({'error': 'Access denied'}), 403

        data = request.get_json()

        valid_categories = [
            'Beach', 'Fort', 'Museum', 'Temple', 'Mountain',
            'Park', 'Restaurant', 'Shopping', 'Entertainment',
            'Historical', 'Other'
        ]

        if 'place_name' in data:
            place.place_name = data['place_name']

        if 'category' in data:
            if data['category'] not in valid_categories:
                return jsonify({'error': 'Invalid category'}), 400
            place.category = data['category']

        if 'rating' in data:
            if data['rating'] < 1 or data['rating'] > 5:
                return jsonify({'error': 'Rating must be between 1 and 5'}), 400
            place.rating = data['rating']

        if 'notes' in data:
            place.notes = data['notes']

        db.session.commit()

        return jsonify({
            'message': 'Place updated successfully',
            'place': place.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ===========================
# DELETE PLACE
# ===========================
@places_bp.route('/places/<int:place_id>', methods=['DELETE'])
@jwt_required()
def delete_place(place_id):
    try:
        current_user_id = get_jwt_identity()
        place = Place.query.get(place_id)

        if not place:
            return jsonify({'error': 'Place not found'}), 404

        trip = Trip.query.filter_by(
            id=place.trip_id,
            user_id=current_user_id
        ).first()

        if not trip:
            return jsonify({'error': 'Access denied'}), 403

        db.session.delete(place)
        db.session.commit()

        return jsonify({
            'message': 'Place deleted successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
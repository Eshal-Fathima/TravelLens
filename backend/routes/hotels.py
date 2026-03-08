from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.hotel import Hotel
from models.trip import Trip
from extensions import db

hotels_bp = Blueprint('hotels', __name__)

@hotels_bp.route('/hotels', methods=['POST'])
@jwt_required()
def create_hotel():
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()

        required_fields = ['trip_id', 'hotel_name', 'cost_per_night', 'nights']
        if not data or not all(k in data for k in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        trip_id        = int(data['trip_id'])
        cost_per_night = float(data['cost_per_night'])
        nights         = int(data['nights'])

        if cost_per_night <= 0:
            return jsonify({'error': 'Cost per night must be positive'}), 400
        if nights <= 0:
            return jsonify({'error': 'Nights must be positive'}), 400

        trip = Trip.query.filter_by(id=trip_id, user_id=current_user_id).first()
        if not trip:
            return jsonify({'error': 'Trip not found or access denied'}), 404

        hotel = Hotel(
            trip_id=trip_id,
            hotel_name=data['hotel_name'],
            cost_per_night=cost_per_night,
            nights=nights
        )
        db.session.add(hotel)
        db.session.commit()

        return jsonify({'message': 'Hotel created successfully', 'hotel': hotel.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@hotels_bp.route('/hotels/<int:trip_id>', methods=['GET'])
@jwt_required()
def get_hotels(trip_id):
    try:
        current_user_id = int(get_jwt_identity())
        trip = Trip.query.filter_by(id=trip_id, user_id=current_user_id).first()
        if not trip:
            return jsonify({'error': 'Trip not found or access denied'}), 404

        hotels = Hotel.query.filter_by(trip_id=trip_id).order_by(Hotel.created_at.desc()).all()
        return jsonify({'hotels': [hotel.to_dict() for hotel in hotels]}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@hotels_bp.route('/hotels/<int:hotel_id>', methods=['PUT'])
@jwt_required()
def update_hotel(hotel_id):
    try:
        current_user_id = int(get_jwt_identity())
        hotel = Hotel.query.get(hotel_id)
        if not hotel:
            return jsonify({'error': 'Hotel not found'}), 404

        trip = Trip.query.filter_by(id=hotel.trip_id, user_id=current_user_id).first()
        if not trip:
            return jsonify({'error': 'Access denied'}), 403

        data = request.get_json()
        if 'hotel_name' in data:
            hotel.hotel_name = data['hotel_name']
        if 'cost_per_night' in data:
            cost = float(data['cost_per_night'])
            if cost <= 0:
                return jsonify({'error': 'Cost per night must be positive'}), 400
            hotel.cost_per_night = cost
        if 'nights' in data:
            nights = int(data['nights'])
            if nights <= 0:
                return jsonify({'error': 'Nights must be positive'}), 400
            hotel.nights = nights

        hotel.total_cost = float(hotel.cost_per_night) * int(hotel.nights)
        db.session.commit()
        return jsonify({'message': 'Hotel updated successfully', 'hotel': hotel.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@hotels_bp.route('/hotels/<int:hotel_id>', methods=['DELETE'])
@jwt_required()
def delete_hotel(hotel_id):
    try:
        current_user_id = int(get_jwt_identity())
        hotel = Hotel.query.get(hotel_id)
        if not hotel:
            return jsonify({'error': 'Hotel not found'}), 404

        trip = Trip.query.filter_by(id=hotel.trip_id, user_id=current_user_id).first()
        if not trip:
            return jsonify({'error': 'Access denied'}), 403

        db.session.delete(hotel)
        db.session.commit()
        return jsonify({'message': 'Hotel deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.trip import Trip
from models.user import User
from extensions import db
from datetime import datetime

trips_bp = Blueprint('trips', __name__)

@trips_bp.route('/trips', methods=['POST'])
@jwt_required()
def create_trip():
    """Create a new trip"""
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['trip_name', 'destination', 'start_date', 'end_date', 'budget', 'travel_type']
        if not data or not all(k in data for k in required_fields):
            return jsonify({'error': 'Missing required fields', 'required': required_fields}), 400
        
        # Validate travel type
        if data['travel_type'] not in ['Solo', 'Family', 'Friends']:
            return jsonify({'error': 'Invalid travel type. Must be Solo, Family, or Friends'}), 400
        
        # Validate and convert budget
        try:
            budget = float(data['budget'])
            if budget <= 0:
                return jsonify({'error': 'Budget must be a positive number'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Budget must be a valid number'}), 400
        
        # Parse dates
        try:
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        if start_date > end_date:
            return jsonify({'error': 'Start date cannot be after end date'}), 400
        
        # Create trip
        trip = Trip(
            user_id=current_user_id,
            trip_name=data['trip_name'],
            destination=data['destination'],
            start_date=start_date,
            end_date=end_date,
            budget=budget,
            travel_type=data['travel_type']
        )
        
        db.session.add(trip)
        db.session.commit()
        
        return jsonify({
            'message': 'Trip created successfully',
            'trip': trip.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@trips_bp.route('/trips', methods=['GET'])
@jwt_required()
def get_trips():
    """Get all trips for current user"""
    try:
        current_user_id = int(get_jwt_identity())
        trips = Trip.query.filter_by(user_id=current_user_id).order_by(Trip.created_at.desc()).all()
        
        return jsonify({
            'trips': [trip.to_dict() for trip in trips]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@trips_bp.route('/trips/<int:trip_id>', methods=['GET'])
@jwt_required()
def get_trip(trip_id):
    """Get a specific trip"""
    try:
        current_user_id = int(get_jwt_identity())
        trip = Trip.query.filter_by(id=trip_id, user_id=current_user_id).first()
        
        if not trip:
            return jsonify({'error': 'Trip not found'}), 404
        
        return jsonify({
            'trip': trip.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@trips_bp.route('/trips/<int:trip_id>', methods=['PUT'])
@jwt_required()
def update_trip(trip_id):
    """Update a trip"""
    try:
        current_user_id = int(get_jwt_identity())
        trip = Trip.query.filter_by(id=trip_id, user_id=current_user_id).first()
        
        if not trip:
            return jsonify({'error': 'Trip not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'trip_name' in data:
            trip.trip_name = data['trip_name']
        if 'destination' in data:
            trip.destination = data['destination']
        if 'start_date' in data:
            try:
                trip.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid start date format. Use YYYY-MM-DD'}), 400
        if 'end_date' in data:
            try:
                trip.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid end date format. Use YYYY-MM-DD'}), 400
        if 'budget' in data:
            try:
                budget = float(data['budget'])
                if budget <= 0:
                    return jsonify({'error': 'Budget must be a positive number'}), 400
                trip.budget = budget
            except (ValueError, TypeError):
                return jsonify({'error': 'Budget must be a valid number'}), 400
        if 'travel_type' in data:
            if data['travel_type'] not in ['Solo', 'Family', 'Friends']:
                return jsonify({'error': 'Invalid travel type. Must be Solo, Family, or Friends'}), 400
            trip.travel_type = data['travel_type']
        
        # Validate dates
        if trip.start_date > trip.end_date:
            return jsonify({'error': 'Start date cannot be after end date'}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': 'Trip updated successfully',
            'trip': trip.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@trips_bp.route('/trips/<int:trip_id>', methods=['DELETE'])
@jwt_required()
def delete_trip(trip_id):
    """Delete a trip"""
    try:
        current_user_id = int(get_jwt_identity())
        trip = Trip.query.filter_by(id=trip_id, user_id=current_user_id).first()
        
        if not trip:
            return jsonify({'error': 'Trip not found'}), 404
        
        db.session.delete(trip)
        db.session.commit()
        
        return jsonify({
            'message': 'Trip deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

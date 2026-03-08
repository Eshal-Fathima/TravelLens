from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.expense import Expense
from models.trip import Trip
from extensions import db

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('/expenses', methods=['POST'])
@jwt_required()
def create_expense():
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()

        required_fields = ['trip_id', 'category', 'amount']
        if not data or not all(k in data for k in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        valid_categories = ['Transport', 'Food', 'Stay', 'Activities', 'Shopping', 'Other']
        if data['category'] not in valid_categories:
            return jsonify({'error': 'Invalid category'}), 400

        trip_id = int(data['trip_id'])
        amount  = float(data['amount'])

        if amount <= 0:
            return jsonify({'error': 'Amount must be positive'}), 400

        trip = Trip.query.filter_by(id=trip_id, user_id=current_user_id).first()
        if not trip:
            return jsonify({'error': 'Trip not found or access denied'}), 404

        expense = Expense(
            trip_id=trip_id,
            category=data['category'],
            amount=amount,
            description=data.get('description')
        )
        db.session.add(expense)
        db.session.commit()
        return jsonify({'message': 'Expense created successfully', 'expense': expense.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@expenses_bp.route('/expenses', methods=['GET'])
@jwt_required()
def get_all_expenses():
    try:
        current_user_id = int(get_jwt_identity())
        from models.trip import Trip
        trip_ids = [t.id for t in Trip.query.filter_by(user_id=current_user_id).all()]
        expenses = Expense.query.filter(Expense.trip_id.in_(trip_ids)).order_by(Expense.created_at.desc()).all()
        return jsonify({'expenses': [e.to_dict() for e in expenses]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@expenses_bp.route('/expenses/<int:trip_id>', methods=['GET'])
@jwt_required()
def get_expenses(trip_id):
    try:
        current_user_id = int(get_jwt_identity())
        trip = Trip.query.filter_by(id=trip_id, user_id=current_user_id).first()
        if not trip:
            return jsonify({'error': 'Trip not found or access denied'}), 404

        expenses = Expense.query.filter_by(trip_id=trip_id).order_by(Expense.created_at.desc()).all()
        return jsonify({'expenses': [expense.to_dict() for expense in expenses]}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@expenses_bp.route('/expenses/<int:trip_id>/summary', methods=['GET'])
@jwt_required()
def get_expense_summary(trip_id):
    try:
        current_user_id = int(get_jwt_identity())
        trip = Trip.query.filter_by(id=trip_id, user_id=current_user_id).first()
        if not trip:
            return jsonify({'error': 'Trip not found or access denied'}), 404

        expenses = Expense.query.filter_by(trip_id=trip_id).all()
        category_totals = {}
        total_amount = 0
        for expense in expenses:
            cat = expense.category
            amt = float(expense.amount)
            total_amount += amt
            category_totals[cat] = category_totals.get(cat, 0) + amt

        return jsonify({
            'total_expenses': total_amount,
            'category_breakdown': category_totals,
            'expense_count': len(expenses)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@expenses_bp.route('/expenses/<int:expense_id>', methods=['PUT'])
@jwt_required()
def update_expense(expense_id):
    try:
        current_user_id = int(get_jwt_identity())
        expense = Expense.query.get(expense_id)
        if not expense:
            return jsonify({'error': 'Expense not found'}), 404

        trip = Trip.query.filter_by(id=expense.trip_id, user_id=current_user_id).first()
        if not trip:
            return jsonify({'error': 'Access denied'}), 403

        data = request.get_json()
        if 'category' in data:
            valid_categories = ['Transport', 'Food', 'Stay', 'Activities', 'Shopping', 'Other']
            if data['category'] not in valid_categories:
                return jsonify({'error': 'Invalid category'}), 400
            expense.category = data['category']
        if 'amount' in data:
            amount = float(data['amount'])
            if amount <= 0:
                return jsonify({'error': 'Amount must be positive'}), 400
            expense.amount = amount
        if 'description' in data:
            expense.description = data['description']

        db.session.commit()
        return jsonify({'message': 'Expense updated successfully', 'expense': expense.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@expenses_bp.route('/expenses/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    try:
        current_user_id = int(get_jwt_identity())
        expense = Expense.query.get(expense_id)
        if not expense:
            return jsonify({'error': 'Expense not found'}), 404

        trip = Trip.query.filter_by(id=expense.trip_id, user_id=current_user_id).first()
        if not trip:
            return jsonify({'error': 'Access denied'}), 403

        db.session.delete(expense)
        db.session.commit()
        return jsonify({'message': 'Expense deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
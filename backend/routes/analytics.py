from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.trip import Trip
from models.expense import Expense
from models.place import Place
from models.hotel import Hotel
from collections import defaultdict
from datetime import datetime

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/analytics/overview/<int:user_id>', methods=['GET'])
@jwt_required()
def get_overview(user_id):
    try:
        current_user_id = int(get_jwt_identity())
        if current_user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403

        trips = Trip.query.filter_by(user_id=user_id).all()
        if not trips:
            return jsonify({'overview': {
                'total_trips': 0, 'total_spent': 0,
                'total_destinations': 0, 'avg_trip_duration': 0,
                'avg_trip_cost': 0, 'total_places': 0
            }}), 200

        trip_ids = [t.id for t in trips]
        expenses = Expense.query.filter(Expense.trip_id.in_(trip_ids)).all()
        places = Place.query.filter(Place.trip_id.in_(trip_ids)).all()

        total_spent = sum(float(e.amount) for e in expenses)
        durations = [(t.end_date - t.start_date).days for t in trips]
        avg_duration = sum(durations) / len(durations) if durations else 0
        unique_destinations = len(set(t.destination for t in trips))

        return jsonify({'overview': {
            'total_trips': len(trips),
            'total_spent': round(total_spent, 2),
            'total_destinations': unique_destinations,
            'avg_trip_duration': round(avg_duration, 1),
            'avg_trip_cost': round(total_spent / len(trips), 2) if trips else 0,
            'total_places': len(places)
        }}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/analytics/charts/<int:user_id>', methods=['GET'])
@jwt_required()
def get_chart_data(user_id):
    try:
        current_user_id = int(get_jwt_identity())
        if current_user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403

        trips = Trip.query.filter_by(user_id=user_id).all()
        if not trips:
            return jsonify({'charts': {}}), 200

        trip_ids = [t.id for t in trips]
        expenses = Expense.query.filter(Expense.trip_id.in_(trip_ids)).all()
        places = Place.query.filter(Place.trip_id.in_(trip_ids)).all()

        # 1. Expense breakdown by category (pie chart)
        expense_by_category = defaultdict(float)
        for e in expenses:
            expense_by_category[e.category] += float(e.amount)
        expense_pie = [{'name': k, 'value': round(v, 2)} for k, v in expense_by_category.items()]

        # 2. Trips per month (bar chart)
        trips_by_month = defaultdict(int)
        for t in trips:
            key = t.start_date.strftime('%b %Y')
            trips_by_month[key] += 1
        # Sort by date
        sorted_months = sorted(trips_by_month.items(),
                               key=lambda x: datetime.strptime(x[0], '%b %Y'))
        trips_per_month = [{'month': k, 'trips': v} for k, v in sorted_months]

        # 3. Spending per trip (bar chart)
        trip_expense_map = defaultdict(float)
        for e in expenses:
            trip_expense_map[e.trip_id] += float(e.amount)
        spending_per_trip = [
            {'trip': t.trip_name[:20], 'spent': round(trip_expense_map.get(t.id, 0), 2), 'budget': float(t.budget)}
            for t in trips
        ]

        # 4. Travel type distribution (pie chart)
        travel_type_counts = defaultdict(int)
        for t in trips:
            travel_type_counts[t.travel_type] += 1
        travel_type_pie = [{'name': k, 'value': v} for k, v in travel_type_counts.items()]

        # 5. Place categories (bar chart)
        place_category_counts = defaultdict(int)
        for p in places:
            place_category_counts[p.category] += 1
        place_categories = [{'category': k, 'count': v} for k, v in
                            sorted(place_category_counts.items(), key=lambda x: -x[1])]

        return jsonify({'charts': {
            'expense_by_category': expense_pie,
            'trips_per_month': trips_per_month,
            'spending_per_trip': spending_per_trip,
            'travel_type_distribution': travel_type_pie,
            'place_categories': place_categories
        }}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/analytics/behaviour/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_behaviour(user_id):
    try:
        current_user_id = int(get_jwt_identity())
        if current_user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403

        trips = Trip.query.filter_by(user_id=user_id).all()
        if not trips:
            return jsonify({'behaviour': {}}), 200

        trip_ids = [t.id for t in trips]
        expenses = Expense.query.filter(Expense.trip_id.in_(trip_ids)).all()
        places = Place.query.filter(Place.trip_id.in_(trip_ids)).all()

        # Average trip duration
        durations = [(t.end_date - t.start_date).days for t in trips]
        avg_duration = round(sum(durations) / len(durations), 1) if durations else 0

        # Most active travel month
        month_counts = defaultdict(int)
        for t in trips:
            month_counts[t.start_date.strftime('%B')] += 1
        most_active_month = max(month_counts, key=month_counts.get) if month_counts else 'N/A'

        # Favorite season
        def get_season(month):
            if month in [12, 1, 2]: return 'Winter'
            if month in [3, 4, 5]: return 'Spring'
            if month in [6, 7, 8]: return 'Summer'
            return 'Fall'

        season_counts = defaultdict(int)
        for t in trips:
            season_counts[get_season(t.start_date.month)] += 1
        favorite_season = max(season_counts, key=season_counts.get) if season_counts else 'N/A'

        # Budget vs actual per trip
        trip_expense_map = defaultdict(float)
        for e in expenses:
            trip_expense_map[e.trip_id] += float(e.amount)

        budget_vs_actual = [
            {
                'trip': t.trip_name[:20],
                'budget': float(t.budget),
                'actual': round(trip_expense_map.get(t.id, 0), 2)
            }
            for t in trips
        ]

        # Top rated places
        rated_places = sorted(
            [p for p in places if p.rating],
            key=lambda p: float(p.rating), reverse=True
        )[:5]
        top_places = [{'name': p.place_name, 'rating': float(p.rating), 'category': p.category}
                      for p in rated_places]

        # Spending trend — monthly totals
        monthly_spend = defaultdict(float)
        for e in expenses:
            key = e.created_at.strftime('%b %Y')
            monthly_spend[key] += float(e.amount)
        sorted_spend = sorted(monthly_spend.items(),
                              key=lambda x: datetime.strptime(x[0], '%b %Y'))
        spending_trend = [{'month': k, 'amount': round(v, 2)} for k, v in sorted_spend]

        return jsonify({'behaviour': {
            'avg_trip_duration': avg_duration,
            'most_active_month': most_active_month,
            'favorite_season': favorite_season,
            'season_distribution': dict(season_counts),
            'budget_vs_actual': budget_vs_actual,
            'top_rated_places': top_places,
            'spending_trend': spending_trend,
            'month_distribution': dict(month_counts)
        }}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
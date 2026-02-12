import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any

class TravelAnalytics:
    """Advanced travel analytics engine using Pandas and NumPy"""
    
    def __init__(self):
        self.expense_categories = ['Transport', 'Food', 'Stay', 'Activities', 'Shopping', 'Other']
        self.place_categories = ['Beach', 'Fort', 'Museum', 'Temple', 'Mountain', 'Park', 'Restaurant', 'Shopping', 'Entertainment', 'Historical', 'Other']
        self.travel_types = ['Solo', 'Family', 'Friends']
    
    def analyze_spending_patterns(self, expenses_data: List[Dict]) -> Dict[str, Any]:
        """Analyze spending patterns using pandas"""
        if not expenses_data:
            return {}
        
        df = pd.DataFrame(expenses_data)
        df['amount'] = pd.to_numeric(df['amount'])
        df['created_at'] = pd.to_datetime(df['created_at'])
        
        # Basic statistics
        total_spent = df['amount'].sum()
        avg_expense = df['amount'].mean()
        median_expense = df['amount'].median()
        
        # Category breakdown
        category_analysis = df.groupby('category').agg({
            'amount': ['sum', 'mean', 'count']
        }).round(2)
        
        # Time-based analysis
        df['month'] = df['created_at'].dt.month
        monthly_spending = df.groupby('month')['amount'].sum().to_dict()
        
        # Spending trends
        df_sorted = df.sort_values('created_at')
        spending_trend = self._calculate_spending_trend(df_sorted)
        
        # Expense frequency analysis
        expense_frequency = self._analyze_expense_frequency(df)
        
        return {
            'total_spent': float(total_spent),
            'average_expense': float(avg_expense),
            'median_expense': float(median_expense),
            'category_breakdown': category_analysis.to_dict(),
            'monthly_spending': monthly_spending,
            'spending_trend': spending_trend,
            'expense_frequency': expense_frequency,
            'insights': self._generate_spending_insights(df)
        }
    
    def analyze_travel_patterns(self, trips_data: List[Dict], places_data: List[Dict]) -> Dict[str, Any]:
        """Analyze travel patterns and preferences"""
        if not trips_data:
            return {}
        
        trips_df = pd.DataFrame(trips_data)
        places_df = pd.DataFrame(places_data) if places_data else pd.DataFrame()
        
        # Convert dates
        trips_df['start_date'] = pd.to_datetime(trips_df['start_date'])
        trips_df['end_date'] = pd.to_datetime(trips_df['end_date'])
        trips_df['budget'] = pd.to_numeric(trips_df['budget'])
        
        # Trip duration analysis
        trips_df['duration_days'] = (trips_df['end_date'] - trips_df['start_date']).dt.days
        avg_trip_duration = trips_df['duration_days'].mean()
        
        # Seasonal preferences
        trips_df['season'] = trips_df['start_date'].dt.month.apply(self._get_season)
        seasonal_preferences = trips_df['season'].value_counts().to_dict()
        
        # Travel type preferences
        travel_type_preferences = trips_df['travel_type'].value_counts().to_dict()
        
        # Budget analysis
        budget_stats = {
            'total_budget': float(trips_df['budget'].sum()),
            'average_budget': float(trips_df['budget'].mean()),
            'budget_range': {
                'min': float(trips_df['budget'].min()),
                'max': float(trips_df['budget'].max())
            }
        }
        
        # Destination patterns
        destination_patterns = self._analyze_destination_patterns(trips_df)
        
        # Place preferences (if places data available)
        place_preferences = {}
        if not places_df.empty:
            place_preferences = self._analyze_place_preferences(places_df)
        
        # Travel frequency analysis
        travel_frequency = self._analyze_travel_frequency(trips_df)
        
        return {
            'trip_statistics': {
                'total_trips': len(trips_df),
                'average_duration': float(avg_trip_duration),
                'seasonal_preferences': seasonal_preferences,
                'travel_type_preferences': travel_type_preferences
            },
            'budget_analysis': budget_stats,
            'destination_patterns': destination_patterns,
            'place_preferences': place_preferences,
            'travel_frequency': travel_frequency,
            'insights': self._generate_travel_insights(trips_df, places_df)
        }
    
    def predict_next_trip_preferences(self, user_data: Dict) -> Dict[str, Any]:
        """Predict preferences for next trip based on historical data"""
        trips_data = user_data.get('trips', [])
        places_data = user_data.get('places', [])
        expenses_data = user_data.get('expenses', [])
        
        if not trips_data:
            return self._get_default_recommendations()
        
        # Analyze patterns
        travel_patterns = self.analyze_travel_patterns(trips_data, places_data)
        spending_patterns = self.analyze_spending_patterns(expenses_data)
        
        # Predict next trip characteristics
        predictions = {
            'preferred_travel_type': self._predict_travel_type(travel_patterns),
            'estimated_budget': self._predict_budget(spending_patterns, travel_patterns),
            'preferred_season': self._predict_season(travel_patterns),
            'recommended_duration': self._predict_duration(travel_patterns),
            'destination_suggestions': self._suggest_destinations(travel_patterns),
            'place_type_suggestions': self._suggest_place_types(travel_patterns)
        }
        
        return predictions
    
    def _calculate_spending_trend(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate spending trend over time"""
        if len(df) < 2:
            return {'trend': 'insufficient_data'}
        
        # Calculate 7-day moving average
        df_sorted = df.sort_values('created_at')
        df_sorted['rolling_avg'] = df_sorted['amount'].rolling(window=7, min_periods=1).mean()
        
        # Simple trend calculation
        recent_avg = df_sorted.tail(7)['amount'].mean() if len(df_sorted) >= 7 else df_sorted['amount'].mean()
        earlier_avg = df_sorted.head(max(1, len(df_sorted) - 7))['amount'].mean()
        
        if recent_avg > earlier_avg * 1.1:
            trend = 'increasing'
        elif recent_avg < earlier_avg * 0.9:
            trend = 'decreasing'
        else:
            trend = 'stable'
        
        return {
            'trend': trend,
            'recent_average': float(recent_avg),
            'earlier_average': float(earlier_avg),
            'percentage_change': float(((recent_avg - earlier_avg) / earlier_avg) * 100) if earlier_avg > 0 else 0
        }
    
    def _analyze_expense_frequency(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze expense frequency patterns"""
        df['date'] = df['created_at'].dt.date
        daily_expenses = df.groupby('date').size()
        
        return {
            'average_daily_expenses': float(daily_expenses.mean()),
            'max_daily_expenses': int(daily_expenses.max()),
            'expense_days': int(len(daily_expenses)),
            'frequency_pattern': self._determine_frequency_pattern(daily_expenses)
        }
    
    def _determine_frequency_pattern(self, daily_expenses: pd.Series) -> str:
        """Determine expense frequency pattern"""
        if len(daily_expenses) < 3:
            return 'insufficient_data'
        
        avg_freq = daily_expenses.mean()
        std_freq = daily_expenses.std()
        
        if std_freq / avg_freq > 0.5:
            return 'irregular'
        elif avg_freq > 3:
            return 'high_frequency'
        elif avg_freq > 1:
            return 'moderate_frequency'
        else:
            return 'low_frequency'
    
    def _generate_spending_insights(self, df: pd.DataFrame) -> List[str]:
        """Generate insights from spending data"""
        insights = []
        
        # Category insights
        category_totals = df.groupby('category')['amount'].sum()
        top_category = category_totals.idxmax()
        top_percentage = (category_totals.max() / category_totals.sum()) * 100
        
        insights.append(f"You spend the most on {top_category} ({top_percentage:.1f}% of total expenses)")
        
        # Amount insights
        avg_expense = df['amount'].mean()
        if avg_expense > 5000:
            insights.append("Your average expense is quite high - consider budget optimization")
        elif avg_expense < 500:
            insights.append("You're quite frugal with your expenses")
        
        # Frequency insights
        if len(df) > 20:
            insights.append("You track expenses very diligently")
        
        return insights
    
    def _get_season(self, month: int) -> str:
        """Get season from month"""
        if month in [12, 1, 2]:
            return 'Winter'
        elif month in [3, 4, 5]:
            return 'Spring'
        elif month in [6, 7, 8]:
            return 'Summer'
        else:
            return 'Fall'
    
    def _analyze_destination_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze destination patterns"""
        destination_counts = df['destination'].value_counts()
        
        return {
            'most_visited': destination_counts.index[0] if len(destination_counts) > 0 else None,
            'unique_destinations': len(destination_counts),
            'repeat_visits': int((destination_counts > 1).sum()),
            'destination_diversity': float(len(destination_counts) / len(df)) if len(df) > 0 else 0
        }
    
    def _analyze_place_preferences(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze place type preferences"""
        category_counts = df['category'].value_counts()
        
        return {
            'favorite_category': category_counts.index[0] if len(category_counts) > 0 else None,
            'category_distribution': category_counts.to_dict(),
            'diversity_score': float(len(category_counts) / len(df)) if len(df) > 0 else 0
        }
    
    def _analyze_travel_frequency(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze travel frequency patterns"""
        if len(df) < 2:
            return {'trips_per_year': 0, 'frequency_trend': 'insufficient_data'}
        
        df_sorted = df.sort_values('start_date')
        date_diffs = df_sorted['start_date'].diff().dt.days.dropna()
        avg_days_between = date_diffs.mean()
        
        return {
            'trips_per_year': float(365 / avg_days_between) if avg_days_between > 0 else 0,
            'average_days_between_trips': float(avg_days_between),
            'frequency_trend': self._calculate_frequency_trend(date_diffs)
        }
    
    def _calculate_frequency_trend(self, date_diffs: pd.Series) -> str:
        """Calculate trend in travel frequency"""
        if len(date_diffs) < 3:
            return 'insufficient_data'
        
        recent_avg = date_diffs.tail(3).mean()
        earlier_avg = date_diffs.head(3).mean()
        
        if recent_avg < earlier_avg * 0.8:
            return 'increasing'
        elif recent_avg > earlier_avg * 1.2:
            return 'decreasing'
        else:
            return 'stable'
    
    def _generate_travel_insights(self, trips_df: pd.DataFrame, places_df: pd.DataFrame) -> List[str]:
        """Generate travel insights"""
        insights = []
        
        # Duration insights
        avg_duration = trips_df['duration_days'].mean()
        if avg_duration > 7:
            insights.append("You prefer longer trips (week+)")
        elif avg_duration < 4:
            insights.append("You prefer short weekend trips")
        
        # Budget insights
        avg_budget = trips_df['budget'].mean()
        if avg_budget > 50000:
            insights.append("You're a luxury traveler with high budgets")
        elif avg_budget < 15000:
            insights.append("You're a budget-conscious traveler")
        
        # Seasonal insights
        if 'season' in trips_df.columns:
            favorite_season = trips_df['season'].mode().iloc[0]
            insights.append(f"You prefer traveling in {favorite_season}")
        
        return insights
    
    def _predict_travel_type(self, travel_patterns: Dict) -> str:
        """Predict preferred travel type"""
        type_prefs = travel_patterns.get('travel_type_preferences', {})
        if not type_prefs:
            return 'Solo'
        
        return max(type_prefs, key=type_prefs.get)
    
    def _predict_budget(self, spending_patterns: Dict, travel_patterns: Dict) -> float:
        """Predict budget for next trip"""
        if 'budget_analysis' in travel_patterns:
            return travel_patterns['budget_analysis'].get('average_budget', 25000)
        
        if 'total_spent' in spending_patterns:
            return spending_patterns['total_spent'] / max(1, travel_patterns.get('trip_statistics', {}).get('total_trips', 1))
        
        return 25000  # Default budget
    
    def _predict_season(self, travel_patterns: Dict) -> str:
        """Predict preferred season"""
        seasonal_prefs = travel_patterns.get('seasonal_preferences', {})
        if not seasonal_prefs:
            return 'Summer'  # Default to summer
        
        return max(seasonal_prefs, key=seasonal_prefs.get)
    
    def _predict_duration(self, travel_patterns: Dict) -> int:
        """Predict trip duration"""
        avg_duration = travel_patterns.get('trip_statistics', {}).get('average_duration', 5)
        return int(avg_duration)
    
    def _suggest_destinations(self, travel_patterns: Dict) -> List[str]:
        """Suggest destinations based on patterns"""
        # This would typically integrate with external APIs
        suggestions = [
            "Bali, Indonesia - Beach paradise",
            "Swiss Alps - Mountain adventure",
            "Paris, France - Cultural experience",
            "Tokyo, Japan - Urban exploration"
        ]
        return suggestions[:3]
    
    def _suggest_place_types(self, travel_patterns: Dict) -> List[str]:
        """Suggest place types based on preferences"""
        place_prefs = travel_patterns.get('place_preferences', {})
        favorite = place_prefs.get('favorite_category', 'Beach')
        
        suggestions = {
            'Beach': ['Beach', 'Restaurant', 'Entertainment'],
            'Mountain': ['Mountain', 'Park', 'Historical'],
            'Museum': ['Museum', 'Historical', 'Temple'],
            'Fort': ['Fort', 'Historical', 'Museum']
        }
        
        return suggestions.get(favorite, ['Beach', 'Museum', 'Restaurant'])
    
    def _get_default_recommendations(self) -> Dict[str, Any]:
        """Get default recommendations for new users"""
        return {
            'preferred_travel_type': 'Solo',
            'estimated_budget': 25000,
            'preferred_season': 'Summer',
            'recommended_duration': 5,
            'destination_suggestions': ['Goa, India', 'Kerala, India', 'Rajasthan, India'],
            'place_type_suggestions': ['Beach', 'Historical', 'Museum']
        }

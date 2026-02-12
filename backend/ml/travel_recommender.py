import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import Dict, List, Any, Tuple
import pickle
import os

class TravelRecommender:
    """Machine Learning based travel recommendation system"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.kmeans = None
        self.label_encoders = {}
        self.travel_personas = {
            0: 'Budget Explorer',
            1: 'Cultural Traveler', 
            2: 'Adventure Seeker',
            3: 'Luxury Traveler',
            4: 'Family Vacationer'
        }
        
    def create_user_features(self, users_data: List[Dict]) -> np.ndarray:
        """Create feature matrix for user clustering"""
        features = []
        
        for user_data in users_data:
            trips = user_data.get('trips', [])
            expenses = user_data.get('expenses', [])
            places = user_data.get('places', [])
            
            # Trip features
            total_trips = len(trips)
            avg_budget = np.mean([trip.get('budget', 0) for trip in trips]) if trips else 0
            avg_duration = np.mean([
                (pd.to_datetime(trip['end_date']) - pd.to_datetime(trip['start_date'])).days 
                for trip in trips
            ]) if trips else 0
            
            # Expense features
            total_spent = sum([exp.get('amount', 0) for exp in expenses])
            avg_expense = np.mean([exp.get('amount', 0) for exp in expenses]) if expenses else 0
            expense_categories = len(set([exp.get('category') for exp in expenses]))
            
            # Place features
            total_places = len(places)
            place_categories = len(set([place.get('category') for place in places]))
            avg_rating = np.mean([place.get('rating', 0) for place in places if place.get('rating')]) if places else 0
            
            # Travel type preferences
            travel_types = [trip.get('travel_type') for trip in trips]
            solo_ratio = travel_types.count('Solo') / len(travel_types) if travel_types else 0
            family_ratio = travel_types.count('Family') / len(travel_types) if travel_types else 0
            friends_ratio = travel_types.count('Friends') / len(travel_types) if travel_types else 0
            
            # Seasonal preferences
            seasons = []
            for trip in trips:
                month = pd.to_datetime(trip['start_date']).month
                if month in [12, 1, 2]:
                    seasons.append('Winter')
                elif month in [3, 4, 5]:
                    seasons.append('Spring')
                elif month in [6, 7, 8]:
                    seasons.append('Summer')
                else:
                    seasons.append('Fall')
            
            season_diversity = len(set(seasons)) / len(seasons) if seasons else 0
            
            # Combine features
            user_features = [
                total_trips, avg_budget, avg_duration, total_spent, avg_expense,
                expense_categories, total_places, place_categories, avg_rating,
                solo_ratio, family_ratio, friends_ratio, season_diversity
            ]
            
            features.append(user_features)
        
        return np.array(features)
    
    def train_user_clustering(self, users_data: List[Dict], n_clusters: int = 5) -> Dict[str, Any]:
        """Train KMeans clustering for user segmentation"""
        # Create feature matrix
        features = self.create_user_features(users_data)
        
        # Handle NaN values
        features = np.nan_to_num(features, nan=0.0)
        
        # Scale features
        features_scaled = self.scaler.fit_transform(features)
        
        # Train KMeans
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        cluster_labels = self.kmeans.fit_predict(features_scaled)
        
        # Analyze clusters
        cluster_analysis = self._analyze_clusters(users_data, cluster_labels, features_scaled)
        
        return {
            'cluster_labels': cluster_labels.tolist(),
            'cluster_centers': self.kmeans.cluster_centers_.tolist(),
            'cluster_analysis': cluster_analysis,
            'model_trained': True
        }
    
    def predict_user_persona(self, user_data: Dict) -> Dict[str, Any]:
        """Predict user persona based on travel patterns"""
        if self.kmeans is None:
            return {'persona': 'New Traveler', 'confidence': 0.0}
        
        # Create features for this user
        features = self.create_user_features([user_data])
        features = np.nan_to_num(features, nan=0.0)
        features_scaled = self.scaler.transform(features)
        
        # Predict cluster
        cluster_label = self.kmeans.predict(features_scaled)[0]
        persona = self.travel_personas.get(cluster_label, 'Explorer')
        
        # Calculate confidence (distance to cluster center)
        distances = self.kmeans.transform(features_scaled)[0]
        min_distance = np.min(distances)
        confidence = max(0, 1 - (min_distance / np.mean(distances)))
        
        return {
            'persona': persona,
            'cluster_id': int(cluster_label),
            'confidence': float(confidence),
            'characteristics': self._get_persona_characteristics(cluster_label)
        }
    
    def recommend_destinations(self, user_data: Dict, all_destinations: List[Dict], top_k: int = 10) -> List[Dict]:
        """Recommend destinations based on user preferences"""
        # Extract user preferences
        places = user_data.get('places', [])
        trips = user_data.get('trips', [])
        
        # Create user profile
        user_profile = self._create_user_profile(places, trips)
        
        # Create destination features
        destination_features = []
        for dest in all_destinations:
            features = self._create_destination_features(dest, user_profile)
            destination_features.append(features)
        
        # Calculate similarity scores
        if len(destination_features) > 0:
            user_vector = np.array(list(user_profile.values())).reshape(1, -1)
            dest_matrix = np.array(destination_features)
            
            # Normalize features
            all_features = np.vstack([user_vector, dest_matrix])
            all_features_scaled = StandardScaler().fit_transform(all_features)
            
            user_scaled = all_features_scaled[0:1]
            dest_scaled = all_features_scaled[1:]
            
            # Calculate cosine similarity
            similarities = cosine_similarity(user_scaled, dest_scaled)[0]
            
            # Rank destinations
            ranked_destinations = []
            for i, dest in enumerate(all_destinations):
                ranked_destinations.append({
                    **dest,
                    'similarity_score': float(similarities[i])
                })
            
            # Sort by similarity
            ranked_destinations.sort(key=lambda x: x['similarity_score'], reverse=True)
            
            return ranked_destinations[:top_k]
        
        return all_destinations[:top_k]
    
    def optimize_budget(self, user_data: Dict, target_budget: float) -> Dict[str, Any]:
        """Provide budget optimization recommendations"""
        expenses = user_data.get('expenses', [])
        trips = user_data.get('trips', [])
        
        if not expenses:
            return {'recommendations': [], 'potential_savings': 0}
        
        # Analyze spending patterns
        df = pd.DataFrame(expenses)
        df['amount'] = pd.to_numeric(df['amount'])
        
        # Category-wise spending
        category_spending = df.groupby('category')['amount'].sum().to_dict()
        total_spent = df['amount'].sum()
        
        # Optimization recommendations
        recommendations = []
        potential_savings = 0
        
        for category, amount in category_spending.items():
            percentage = (amount / total_spent) * 100
            
            if percentage > 40:  # Over-spending category
                savings_potential = amount * 0.2  # 20% savings potential
                recommendations.append({
                    'category': category,
                    'current_spending': float(amount),
                    'percentage': float(percentage),
                    'recommended_reduction': float(savings_potential),
                    'suggestion': f"Consider reducing {category} expenses by 20%"
                })
                potential_savings += savings_potential
        
        # Budget allocation suggestions
        avg_trip_budget = np.mean([trip.get('budget', 0) for trip in trips]) if trips else target_budget
        
        return {
            'recommendations': recommendations,
            'potential_savings': float(potential_savings),
            'optimized_total': float(total_spent - potential_savings),
            'budget_allocation': self._suggest_budget_allocation(category_spending, target_budget),
            'average_trip_budget': float(avg_trip_budget)
        }
    
    def predict_trip_success(self, trip_data: Dict, user_data: Dict) -> Dict[str, Any]:
        """Predict trip success based on historical patterns"""
        # Extract features
        budget = trip_data.get('budget', 0)
        duration = (pd.to_datetime(trip_data['end_date']) - pd.to_datetime(trip_data['start_date'])).days
        travel_type = trip_data.get('travel_type', 'Solo')
        
        # User historical data
        user_trips = user_data.get('trips', [])
        user_expenses = user_data.get('expenses', [])
        
        if not user_trips:
            return {
                'success_probability': 0.7,
                'factors': ['New user - moderate confidence'],
                'recommendations': ['Start with a shorter trip', 'Set realistic budget']
            }
        
        # Calculate historical averages
        avg_budget = np.mean([trip.get('budget', 0) for trip in user_trips])
        avg_duration = np.mean([
            (pd.to_datetime(trip['end_date']) - pd.to_datetime(trip['start_date'])).days 
            for trip in user_trips
        ])
        
        # Success factors
        factors = []
        success_score = 0.5
        
        # Budget alignment
        if abs(budget - avg_budget) / avg_budget < 0.2:
            success_score += 0.2
            factors.append('Budget aligns with historical patterns')
        elif budget > avg_budget * 1.5:
            factors.append('Budget is significantly higher than usual')
        else:
            factors.append('Budget is lower than usual')
        
        # Duration alignment
        if abs(duration - avg_duration) / avg_duration < 0.3:
            success_score += 0.2
            factors.append('Duration matches your preference')
        
        # Travel type preference
        travel_types = [trip.get('travel_type') for trip in user_trips]
        if travel_type in travel_types:
            success_score += 0.1
            factors.append(f'You have experience with {travel_type} trips')
        
        return {
            'success_probability': min(0.95, success_score),
            'factors': factors,
            'recommendations': self._get_trip_recommendations(success_score, trip_data, user_data)
        }
    
    def _analyze_clusters(self, users_data: List[Dict], labels: np.ndarray, features: np.ndarray) -> Dict:
        """Analyze and describe clusters"""
        cluster_analysis = {}
        
        for cluster_id in np.unique(labels):
            cluster_mask = labels == cluster_id
            cluster_users = [users_data[i] for i in range(len(users_data)) if cluster_mask[i]]
            cluster_features = features[cluster_mask]
            
            # Calculate cluster statistics
            analysis = {
                'size': int(np.sum(cluster_mask)),
                'avg_features': np.mean(cluster_features, axis=0).tolist(),
                'characteristics': []
            }
            
            # Add meaningful characteristics based on feature values
            avg_budget_idx = 1  # Average budget feature index
            avg_duration_idx = 2  # Average duration feature index
            total_spent_idx = 3  # Total spent feature index
            
            avg_budget = np.mean(cluster_features[:, avg_budget_idx])
            avg_duration = np.mean(cluster_features[:, avg_duration_idx])
            avg_spent = np.mean(cluster_features[:, total_spent_idx])
            
            if avg_budget < 20000:
                analysis['characteristics'].append('Budget-conscious travelers')
            elif avg_budget > 50000:
                analysis['characteristics'].append('Luxury travelers')
            else:
                analysis['characteristics'].append('Moderate budget travelers')
            
            if avg_duration > 7:
                analysis['characteristics'].append('Prefer longer trips')
            elif avg_duration < 4:
                analysis['characteristics'].append('Prefer short trips')
            
            cluster_analysis[int(cluster_id)] = analysis
        
        return cluster_analysis
    
    def _create_user_profile(self, places: List[Dict], trips: List[Dict]) -> Dict:
        """Create user preference profile"""
        profile = {
            'beach_lover': 0,
            'mountain_lover': 0,
            'cultural_explorer': 0,
            'city_explorer': 0,
            'adventure_seeker': 0,
            'budget_conscious': 0,
            'luxury_seeker': 0
        }
        
        # Analyze place preferences
        for place in places:
            category = place.get('category', '').lower()
            if 'beach' in category:
                profile['beach_lover'] += 1
            elif 'mountain' in category:
                profile['mountain_lover'] += 1
            elif any(cat in category for cat in ['museum', 'historical', 'fort', 'temple']):
                profile['cultural_explorer'] += 1
            elif any(cat in category for cat in ['restaurant', 'shopping', 'entertainment']):
                profile['city_explorer'] += 1
        
        # Analyze budget preferences
        if trips:
            avg_budget = np.mean([trip.get('budget', 0) for trip in trips])
            if avg_budget < 20000:
                profile['budget_conscious'] = 1
            elif avg_budget > 50000:
                profile['luxury_seeker'] = 1
        
        return profile
    
    def _create_destination_features(self, destination: Dict, user_profile: Dict) -> List[float]:
        """Create feature vector for destination"""
        features = []
        
        # Category matching
        category = destination.get('category', '').lower()
        features.append(1.0 if 'beach' in category else 0.0)
        features.append(1.0 if 'mountain' in category else 0.0)
        features.append(1.0 if any(cat in category for cat in ['museum', 'historical']) else 0.0)
        features.append(1.0 if any(cat in category for cat in ['city', 'restaurant']) else 0.0)
        
        # Budget alignment (simplified)
        cost_level = destination.get('cost_level', 'medium')
        if cost_level == 'low':
            features.extend([1.0, 0.0, 0.0])  # Low, Medium, High
        elif cost_level == 'medium':
            features.extend([0.0, 1.0, 0.0])
        else:
            features.extend([0.0, 0.0, 1.0])
        
        return features
    
    def _get_persona_characteristics(self, cluster_id: int) -> List[str]:
        """Get characteristics for a persona"""
        characteristics_map = {
            0: ['Budget-conscious', 'Frequent short trips', 'Value for money'],
            1: ['Cultural sites lover', 'Museum enthusiast', 'Historical places'],
            2: ['Adventure activities', 'Outdoor experiences', 'Nature lover'],
            3: ['Luxury accommodations', 'Fine dining', 'Premium experiences'],
            4: ['Family-oriented', 'Kid-friendly activities', 'Group travel']
        }
        return characteristics_map.get(cluster_id, ['Explorer'])
    
    def _suggest_budget_allocation(self, current_spending: Dict, target_budget: float) -> Dict[str, float]:
        """Suggest optimal budget allocation"""
        # Standard allocation percentages
        standard_allocation = {
            'Transport': 0.30,
            'Food': 0.25,
            'Stay': 0.20,
            'Activities': 0.15,
            'Shopping': 0.07,
            'Other': 0.03
        }
        
        # Adjust based on current patterns
        allocation = {}
        for category, percentage in standard_allocation.items():
            allocation[category] = target_budget * percentage
        
        return allocation
    
    def _get_trip_recommendations(self, success_score: float, trip_data: Dict, user_data: Dict) -> List[str]:
        """Get recommendations based on success score"""
        recommendations = []
        
        if success_score < 0.6:
            recommendations.append('Consider adjusting your budget to match historical patterns')
            recommendations.append('Start with a shorter duration if this is your first long trip')
        elif success_score < 0.8:
            recommendations.append('Your plan looks good, but consider contingency budget')
        else:
            recommendations.append('Great plan! This aligns well with your travel style')
        
        return recommendations
    
    def save_model(self, filepath: str):
        """Save the trained model"""
        model_data = {
            'kmeans': self.kmeans,
            'scaler': self.scaler,
            'label_encoders': self.label_encoders
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
    
    def load_model(self, filepath: str):
        """Load a trained model"""
        if os.path.exists(filepath):
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
                self.kmeans = model_data['kmeans']
                self.scaler = model_data['scaler']
                self.label_encoders = model_data['label_encoders']
            return True
        return False

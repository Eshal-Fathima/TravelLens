import requests
import json
from typing import Dict, List, Any, Optional
import os
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class TravelAPIClient:
    """Client for integrating with external travel APIs"""
    
    def __init__(self):
        self.geodb_api_key = os.getenv('GEODB_API_KEY', '')
        self.geodb_base_url = "http://geodb-cities-api.wirefreethought.com/v1"
        self.opentripmap_api_key = os.getenv('OPENTRIPMAP_API_KEY', '')
        self.opentripmap_base_url = "https://api.opentripmap.com/0.1/en"
        
        # Cache for API responses
        self.cache = {}
        self.cache_expiry = {}
        self.cache_duration = timedelta(hours=24)
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached data is still valid"""
        if cache_key not in self.cache:
            return False
        
        if cache_key not in self.cache_expiry:
            return False
        
        return datetime.now() < self.cache_expiry[cache_key]
    
    def _get_cached_data(self, cache_key: str) -> Optional[Any]:
        """Get data from cache if valid"""
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]
        return None
    
    def _cache_data(self, cache_key: str, data: Any):
        """Cache data with expiry"""
        self.cache[cache_key] = data
        self.cache_expiry[cache_key] = datetime.now() + self.cache_duration
    
    def search_cities(self, query: str, limit: int = 10) -> List[Dict]:
        """Search for cities using GeoDB API"""
        cache_key = f"cities_{query}_{limit}"
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            return cached_data
        
        try:
            url = f"{self.geodb_base_url}/geo/cities"
            params = {
                'namePrefix': query,
                'limit': limit,
                'sort': '-population'
            }
            
            headers = {}
            if self.geodb_api_key:
                headers['X-RapidAPI-Key'] = self.geodb_api_key
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            cities = []
            
            for city in data.get('data', []):
                cities.append({
                    'id': city.get('id'),
                    'name': city.get('name'),
                    'country': city.get('country'),
                    'region': city.get('region'),
                    'population': city.get('population'),
                    'latitude': city.get('latitude'),
                    'longitude': city.get('longitude'),
                    'display_name': f"{city.get('name')}, {city.get('country')}"
                })
            
            self._cache_data(cache_key, cities)
            return cities
            
        except requests.RequestException as e:
            logger.error(f"Error searching cities: {e}")
            return []
    
    def get_city_details(self, city_id: str) -> Optional[Dict]:
        """Get detailed information about a city"""
        cache_key = f"city_details_{city_id}"
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            return cached_data
        
        try:
            url = f"{self.geodb_base_url}/geo/cities/{city_id}"
            headers = {}
            
            if self.geodb_api_key:
                headers['X-RapidAPI-Key'] = self.geodb_api_key
            
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            city_details = {
                'id': data.get('id'),
                'name': data.get('name'),
                'country': data.get('country'),
                'region': data.get('region'),
                'population': data.get('population'),
                'latitude': data.get('latitude'),
                'longitude': data.get('longitude'),
                'timezone': data.get('timezone'),
                'currency': data.get('currency')
            }
            
            self._cache_data(cache_key, city_details)
            return city_details
            
        except requests.RequestException as e:
            logger.error(f"Error getting city details: {e}")
            return None
    
    def search_attractions(self, lat: float, lon: float, radius: int = 10000, limit: int = 20) -> List[Dict]:
        """Search for attractions using OpenTripMap API"""
        cache_key = f"attractions_{lat}_{lon}_{radius}_{limit}"
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            return cached_data
        
        try:
            url = f"{self.opentripmap_base_url}/places/radius"
            params = {
                'radius': radius,
                'lon': lon,
                'lat': lat,
                'limit': limit,
                'apikey': self.opentripmap_api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            attractions = []
            
            for feature in data.get('features', []):
                properties = feature.get('properties', {})
                geometry = feature.get('geometry', {})
                
                attraction = {
                    'id': properties.get('xid'),
                    'name': properties.get('name'),
                    'category': self._categorize_place(properties.get('kinds', '')),
                    'description': properties.get('wikidata', {}).get('description', ''),
                    'latitude': geometry.get('coordinates', [])[1],
                    'longitude': geometry.get('coordinates', [])[0],
                    'rating': 0,  # Will be fetched separately
                    'image': properties.get('preview', {}).get('source', '')
                }
                
                attractions.append(attraction)
            
            self._cache_data(cache_key, attractions)
            return attractions
            
        except requests.RequestException as e:
            logger.error(f"Error searching attractions: {e}")
            return []
    
    def get_attraction_details(self, xid: str) -> Optional[Dict]:
        """Get detailed information about an attraction"""
        cache_key = f"attraction_details_{xid}"
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data:
            return cached_data
        
        try:
            url = f"{self.opentripmap_base_url}/places/xid/{xid}"
            params = {
                'apikey': self.opentripmap_api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            attraction_details = {
                'id': data.get('xid'),
                'name': data.get('name'),
                'category': self._categorize_place(data.get('kinds', '')),
                'description': data.get('wikipedia_extracts', {}).get('text', ''),
                'address': data.get('address', {}),
                'rating': data.get('rate', 0),
                'image': data.get('image', ''),
                'url': data.get('otm', ''),
                'wikipedia': data.get('wikipedia', '')
            }
            
            self._cache_data(cache_key, attraction_details)
            return attraction_details
            
        except requests.RequestException as e:
            logger.error(f"Error getting attraction details: {e}")
            return None
    
    def get_destination_suggestions(self, preferences: Dict[str, Any]) -> List[Dict]:
        """Get destination suggestions based on user preferences"""
        suggestions = []
        
        # Popular destinations with categories
        destinations = [
            {
                'name': 'Bali, Indonesia',
                'category': 'Beach',
                'description': 'Tropical paradise with beautiful beaches and cultural experiences',
                'average_cost': 25000,
                'best_time': 'Apr-Oct',
                'activities': ['Beach', 'Temple', 'Cultural', 'Nature']
            },
            {
                'name': 'Swiss Alps, Switzerland',
                'category': 'Mountain',
                'description': 'Breathtaking mountain ranges and alpine villages',
                'average_cost': 80000,
                'best_time': 'Dec-Mar',
                'activities': ['Mountain', 'Skiing', 'Nature', 'Adventure']
            },
            {
                'name': 'Paris, France',
                'category': 'City',
                'description': 'City of lights with art, culture, and cuisine',
                'average_cost': 60000,
                'best_time': 'Apr-Jun',
                'activities': ['Museum', 'Historical', 'Food', 'Shopping']
            },
            {
                'name': 'Dubai, UAE',
                'category': 'City',
                'description': 'Modern city with luxury experiences and attractions',
                'average_cost': 70000,
                'best_time': 'Nov-Mar',
                'activities': ['Shopping', 'Entertainment', 'Luxury', 'Modern']
            },
            {
                'name': 'Kerala, India',
                'category': 'Beach',
                'description': 'Backwaters, beaches, and cultural experiences',
                'average_cost': 20000,
                'best_time': 'Sep-Mar',
                'activities': ['Beach', 'Nature', 'Cultural', 'Wellness']
            }
        ]
        
        # Filter and rank based on preferences
        preferred_category = preferences.get('preferred_category', '')
        budget_range = preferences.get('budget_range', [0, 100000])
        
        for dest in destinations:
            # Check if destination matches preferences
            score = 0
            
            if preferred_category and dest['category'] == preferred_category:
                score += 3
            
            if budget_range[0] <= dest['average_cost'] <= budget_range[1]:
                score += 2
            
            # Add some randomness for variety
            score += hash(dest['name']) % 2
            
            dest['score'] = score
            suggestions.append(dest)
        
        # Sort by score and return top suggestions
        suggestions.sort(key=lambda x: x['score'], reverse=True)
        return suggestions[:5]
    
    def get_hotel_suggestions(self, destination: str, budget_range: tuple, check_in: str, check_out: str) -> List[Dict]:
        """Get hotel suggestions (mock implementation)"""
        # This would typically integrate with hotel booking APIs
        # For now, returning mock data
        
        hotels = [
            {
                'name': f'Grand Hotel {destination}',
                'category': 'Luxury',
                'price_per_night': 8000,
                'rating': 4.5,
                'amenities': ['WiFi', 'Pool', 'Spa', 'Restaurant'],
                'location': 'City Center'
            },
            {
                'name': f'Comfort Inn {destination}',
                'category': 'Mid-range',
                'price_per_night': 3000,
                'rating': 4.0,
                'amenities': ['WiFi', 'Breakfast', 'Gym'],
                'location': 'Near Airport'
            },
            {
                'name': f'Budget Stay {destination}',
                'category': 'Budget',
                'price_per_night': 1200,
                'rating': 3.5,
                'amenities': ['WiFi', 'Basic'],
                'location': 'Suburbs'
            }
        ]
        
        # Filter by budget
        min_budget, max_budget = budget_range
        filtered_hotels = []
        
        for hotel in hotels:
            total_cost = hotel['price_per_night'] * 7  # Assuming 7 nights
            if min_budget <= total_cost <= max_budget:
                hotel['total_cost'] = total_cost
                filtered_hotels.append(hotel)
        
        return filtered_hotels
    
    def _categorize_place(self, kinds: str) -> str:
        """Categorize a place based on its kinds"""
        if not kinds:
            return 'Other'
        
        kinds_lower = kinds.lower()
        
        if any(kind in kinds_lower for kind in ['beach', 'coast', 'sea']):
            return 'Beach'
        elif any(kind in kinds_lower for kind in ['mountain', 'peak', 'alpine']):
            return 'Mountain'
        elif any(kind in kinds_lower for kind in ['museum', 'gallery', 'art']):
            return 'Museum'
        elif any(kind in kinds_lower for kind in ['temple', 'church', 'mosque']):
            return 'Temple'
        elif any(kind in kinds_lower for kind in ['fort', 'castle', 'palace']):
            return 'Fort'
        elif any(kind in kinds_lower for kind in ['park', 'garden', 'forest']):
            return 'Park'
        elif any(kind in kinds_lower for kind in ['restaurant', 'food', 'cafe']):
            return 'Restaurant'
        elif any(kind in kinds_lower for kind in ['shop', 'mall', 'market']):
            return 'Shopping'
        elif any(kind in kinds_lower for kind in ['entertainment', 'cinema', 'theater']):
            return 'Entertainment'
        elif any(kind in kinds_lower for kind in ['historic', 'monument', 'heritage']):
            return 'Historical'
        else:
            return 'Other'
    
    def get_weather_forecast(self, lat: float, lon: float, days: int = 7) -> List[Dict]:
        """Get weather forecast (mock implementation)"""
        # This would typically integrate with weather APIs
        # For now, returning mock data
        
        forecast = []
        base_temp = 25  # Base temperature
        
        for i in range(days):
            date = (datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d')
            temp_variation = (i % 3) - 1  # Simple variation
            
            forecast.append({
                'date': date,
                'temperature': base_temp + temp_variation,
                'condition': ['Sunny', 'Cloudy', 'Rainy'][i % 3],
                'humidity': 60 + (i % 20),
                'wind_speed': 10 + (i % 15)
            })
        
        return forecast
    
    def clear_cache(self):
        """Clear the API cache"""
        self.cache.clear()
        self.cache_expiry.clear()
        logger.info("API cache cleared")

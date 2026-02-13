import requests
import json

# Test trip creation API
def test_trip_creation():
    """Test the trip creation endpoint"""
    
    # First, login to get JWT token
    login_data = {
        "email": "john@example.com",
        "password": "password123"
    }
    
    try:
        # Login
        login_response = requests.post('http://localhost:5000/api/auth/login', json=login_data)
        print("Login Response:", login_response.status_code)
        
        if login_response.status_code == 200:
            token = login_response.json()['access_token']
            print("✅ Login successful, got token")
            
            # Test trip creation
            headers = {'Authorization': f'Bearer {token}'}
            trip_data = {
                "trip_name": "Test Trip",
                "destination": "Paris, France",
                "start_date": "2026-03-01",
                "end_date": "2026-03-07",
                "budget": 5000.00,
                "travel_type": "Solo"
            }
            
            trip_response = requests.post('http://localhost:5000/api/trips', json=trip_data, headers=headers)
            print(f"Trip Creation Response: {trip_response.status_code}")
            print("Response:", trip_response.json())
            
            if trip_response.status_code == 201:
                print("✅ Trip creation successful!")
            else:
                print("❌ Trip creation failed")
        else:
            print("❌ Login failed")
            print("Response:", login_response.json())
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_trip_creation()

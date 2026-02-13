import requests
import json

# Test GET trips endpoint
def test_get_trips():
    """Test the GET trips endpoint"""
    
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
            print("Token:", token[:50] + "...")
            
            # Test GET trips
            headers = {'Authorization': f'Bearer {token}'}
            trips_response = requests.get('http://localhost:5000/api/trips', headers=headers)
            print(f"GET Trips Response: {trips_response.status_code}")
            print("Response:", trips_response.json())
            
            if trips_response.status_code == 200:
                print("✅ GET trips successful!")
            else:
                print("❌ GET trips failed")
        else:
            print("❌ Login failed")
            print("Response:", login_response.json())
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_get_trips()

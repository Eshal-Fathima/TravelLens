#!/usr/bin/env python3
"""
Test script to authenticate and test recommendations endpoint
"""

import requests
import json

def test_recommendations_with_auth():
    """Test recommendations with proper authentication"""
    
    base_url = "http://localhost:5000"
    
    print("🔐 Testing Recommendations with Authentication")
    print("=" * 50)
    
    # Step 1: Login to get access token
    print("\n1. Logging in...")
    login_data = {
        "email": "test@example.com",
        "password": "test123"
    }
    
    try:
        response = requests.post(f"{base_url}/api/auth/login", json=login_data)
        
        if response.status_code == 200:
            login_result = response.json()
            access_token = login_result.get('access_token')
            user = login_result.get('user')
            
            print(f"✅ Login successful!")
            print(f"   User: {user.get('name')} (ID: {user.get('id')})")
            print(f"   Token: {access_token[:50]}...")
            
            # Step 2: Test recommendations with authentication
            print(f"\n2. Testing recommendations for user {user.get('id')}...")
            
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            # Test the new recommendation system
            response = requests.get(
                f"{base_url}/api/recommendations/{user.get('id')}", 
                headers=headers
            )
            
            if response.status_code == 200:
                recommendations = response.json()
                print(f"✅ Recommendations received!")
                print(f"   System: {recommendations.get('system', 'unknown')}")
                print(f"   Profile Updated: {recommendations.get('profile_updated', False)}")
                
                recs = recommendations.get('recommendations', [])
                print(f"   Number of recommendations: {len(recs)}")
                
                for i, rec in enumerate(recs, 1):
                    print(f"\n   {i}. {rec.get('place', 'Unknown')}")
                    print(f"      City: {rec.get('city', 'Unknown')}")
                    print(f"      Category: {rec.get('category', 'Unknown')}")
                    print(f"      Score: {rec.get('score', 0):.3f}")
                    print(f"      Reason: {rec.get('reason', 'No reason')}")
                    print(f"      Tags: {', '.join(rec.get('tags', []))}")
                    print(f"      Similarity: {rec.get('vector_similarity', 0):.3f}")
                    print(f"      Tag Overlap: {rec.get('tag_overlap', 0):.3f}")
                    print(f"      Novelty: {rec.get('novelty', 0):.3f}")
                
            else:
                print(f"❌ Recommendations failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
        elif response.status_code == 401:
            print("❌ Login failed - Invalid credentials")
            print("   Trying alternative login...")
            
            # Try with different password
            login_data["password"] = "password"
            response = requests.post(f"{base_url}/api/auth/login", json=login_data)
            
            if response.status_code == 200:
                print("✅ Alternative login successful!")
                # Continue with recommendations test...
            else:
                print("❌ Both login attempts failed")
                print(f"   Response: {response.text}")
                
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error during test: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎉 Authentication test completed!")

if __name__ == "__main__":
    test_recommendations_with_auth()

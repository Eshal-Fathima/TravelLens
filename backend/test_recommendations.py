#!/usr/bin/env python3
"""
Test script for the recommendation system
"""

import requests
import json

def test_recommendation_system():
    """Test the recommendation system endpoints"""
    
    base_url = "http://localhost:5000"
    
    print("🧪 Testing TravelLens Recommendation System")
    print("=" * 50)
    
    # Test 1: Check system status
    print("\n1. Testing system status...")
    try:
        response = requests.get(f"{base_url}/api/recommendations/status")
        if response.status_code == 200:
            status = response.json()
            print(f"✅ System Status: {json.dumps(status, indent=2)}")
        else:
            print(f"❌ Status check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Status check error: {str(e)}")
    
    # Test 2: Test recommendations for user 1 (assuming user exists)
    print("\n2. Testing recommendations for user 1...")
    try:
        response = requests.get(f"{base_url}/api/recommendations/1")
        if response.status_code == 200:
            recommendations = response.json()
            print(f"✅ Recommendations received:")
            print(f"   System: {recommendations.get('system', 'unknown')}")
            print(f"   Profile Updated: {recommendations.get('profile_updated', False)}")
            
            recs = recommendations.get('recommendations', [])
            print(f"   Number of recommendations: {len(recs)}")
            
            for i, rec in enumerate(recs[:3], 1):
                print(f"   {i}. {rec.get('place', 'Unknown')} (Score: {rec.get('score', 0):.3f})")
                print(f"      Reason: {rec.get('reason', 'No reason')}")
        elif response.status_code == 401:
            print("⚠️  Authentication required (this is expected)")
        else:
            print(f"❌ Recommendation test failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Recommendation test error: {str(e)}")
    
    # Test 3: Test legacy system
    print("\n3. Testing legacy system...")
    try:
        response = requests.get(f"{base_url}/api/recommendations/1?new_system=false")
        if response.status_code == 200:
            legacy = response.json()
            system_type = legacy.get('system', 'unknown')
            print(f"✅ Legacy system working: {system_type}")
        elif response.status_code == 401:
            print("⚠️  Authentication required (this is expected)")
        else:
            print(f"❌ Legacy system test failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Legacy system test error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎉 Recommendation system test completed!")

if __name__ == "__main__":
    test_recommendation_system()

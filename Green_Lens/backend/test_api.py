"""
Simple test script for the Flask API
Tests the endpoints without requiring an actual image
"""

import requests
import sys

API_BASE_URL = "http://localhost:5000"

def test_health():
    """Test the health endpoint"""
    print("Testing /health endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_root():
    """Test the root endpoint"""
    print("\nTesting / endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_classes():
    """Test the classes endpoint"""
    print("\nTesting /classes endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/classes")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Total Classes: {data.get('total_classes', 'N/A')}")
        print(f"First few classes: {list(data.get('classes', {}).items())[:5]}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_predict_no_image():
    """Test the predict endpoint without image (should fail gracefully)"""
    print("\nTesting /predict endpoint without image...")
    try:
        response = requests.post(f"{API_BASE_URL}/predict")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        # Should return 400 error
        return response.status_code == 400
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("Flask API Test Suite")
    print("=" * 60)
    print(f"\nAPI Base URL: {API_BASE_URL}")
    print("\nMake sure the Flask server is running before running tests!")
    print("Run: python app.py\n")
    
    tests = [
        ("Root Endpoint", test_root),
        ("Health Check", test_health),
        ("Classes Endpoint", test_classes),
        ("Predict Endpoint (No Image)", test_predict_no_image),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\nUnexpected error in {test_name}: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    
    for test_name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())

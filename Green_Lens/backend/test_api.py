"""
Simple test script to verify the backend API is working correctly.
This can be run locally to test the API endpoints.
"""
import requests
import json
import os

# API base URL
BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test the health check endpoint"""
    print("\n=== Testing Health Check ===")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_get_classes():
    """Test the get classes endpoint"""
    print("\n=== Testing Get Classes ===")
    try:
        response = requests.get(f"{BASE_URL}/classes")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Total Classes: {data.get('total_classes', 0)}")
        print(f"Sample Classes: {list(data.get('classes', {}).items())[:5]}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_predict(image_path):
    """Test the prediction endpoint with an image"""
    print("\n=== Testing Prediction ===")
    
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        print("Please provide a valid image path to test prediction")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post(f"{BASE_URL}/predict", files=files)
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        
        if data.get('success'):
            print("\nTop Prediction:")
            top = data['top_prediction']
            print(f"  Flower: {top['flower_name']}")
            print(f"  Confidence: {top['confidence_percentage']}%")
            print(f"\nAll Top 5 Predictions:")
            for i, pred in enumerate(data['predictions'], 1):
                print(f"  {i}. {pred['flower_name']} ({pred['confidence_percentage']}%)")
        else:
            print(f"Error: {data.get('error', 'Unknown error')}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("Backend API Test Suite")
    print("=" * 50)
    
    # Test health check
    health_ok = test_health_check()
    
    # Test get classes
    classes_ok = test_get_classes()
    
    # Test prediction (if image provided)
    predict_ok = False
    if len(os.sys.argv) > 1:
        image_path = os.sys.argv[1]
        predict_ok = test_predict(image_path)
    else:
        print("\n=== Skipping Prediction Test ===")
        print("Usage: python test_api.py <image_path>")
        print("Example: python test_api.py /path/to/flower.jpg")
    
    # Summary
    print("\n" + "=" * 50)
    print("Test Summary")
    print("=" * 50)
    print(f"Health Check: {'✓ PASS' if health_ok else '✗ FAIL'}")
    print(f"Get Classes:  {'✓ PASS' if classes_ok else '✗ FAIL'}")
    if len(os.sys.argv) > 1:
        print(f"Prediction:   {'✓ PASS' if predict_ok else '✗ FAIL'}")
    
    print("=" * 50)

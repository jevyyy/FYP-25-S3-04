"""
Firebase Connection Test Script

This script tests the Firebase Admin SDK connection to verify that
the service account credentials are valid before attempting model retraining.

Run this before retraining to diagnose Firebase authentication issues.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_firebase_credentials():
    """Get Firebase credentials from environment variables or JSON file"""
    # First, try to load from environment variables
    if os.getenv('FIREBASE_PROJECT_ID') and os.getenv('FIREBASE_PRIVATE_KEY'):
        print("✓ Loading Firebase credentials from environment variables (.env)\n")
        return {
            "type": "service_account",
            "project_id": os.getenv('FIREBASE_PROJECT_ID'),
            "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
            "private_key": os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
            "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
            "client_id": os.getenv('FIREBASE_CLIENT_ID'),
            "auth_uri": os.getenv('FIREBASE_AUTH_URI', 'https://accounts.google.com/o/oauth2/auth'),
            "token_uri": os.getenv('FIREBASE_TOKEN_URI', 'https://oauth2.googleapis.com/token'),
            "auth_provider_x509_cert_url": os.getenv('FIREBASE_AUTH_PROVIDER_CERT_URL', 'https://www.googleapis.com/oauth2/v1/certs'),
            "client_x509_cert_url": os.getenv('FIREBASE_CLIENT_CERT_URL')
        }, "environment"
    else:
        # Fallback to service-account.json file
        service_account_path = 'service-account.json'
        if not os.path.exists(service_account_path):
            print("❌ FAILED: Firebase credentials not found")
            print("\nNeither environment variables nor service-account.json file found.")
            print("\nTO FIX - Option 1 (Recommended - keeps credentials out of git):")
            print("1. Copy .env.example to .env")
            print("2. Get your service account JSON from Firebase Console:")
            print("   - Go to: https://console.firebase.google.com/")
            print("   - Select your project → Project Settings → Service accounts")
            print("   - Click 'Generate new private key' and download the JSON")
            print("3. Copy values from the JSON into your .env file")
            print("4. Restart the backend server")
            print("\nTO FIX - Option 2 (File-based):")
            print("1. Go to Firebase Console: https://console.firebase.google.com/")
            print("2. Select your project")
            print("3. Go to Project Settings → Service accounts")
            print("4. Click 'Generate new private key'")
            print("5. Save as 'service-account.json' in Green_Lens/backend/")
            return None, None
        
        print(f"✓ Found service-account.json\n")
        return service_account_path, "file"

def test_firebase_connection():
    """Test Firebase connection with service account"""
    print("\n" + "="*80)
    print("Firebase Connection Test")
    print("="*80 + "\n")
    
    # Get credentials
    creds, cred_type = get_firebase_credentials()
    if creds is None:
        return False
    
    # Validate structure
    try:
        import json
        
        if cred_type == "file":
            # Load from JSON file
            with open(creds, 'r') as f:
                creds_dict = json.load(f)
            print("✓ Valid JSON format\n")
        else:
            # Already a dictionary from environment
            creds_dict = creds
            print("✓ Valid environment variable format\n")
        
        # Check required fields
        required_fields = ['type', 'project_id', 'private_key', 'client_email']
        missing_fields = [field for field in required_fields if field not in creds_dict]
        
        if missing_fields:
            print(f"❌ FAILED: Missing required fields: {', '.join(missing_fields)}")
            return False
        
        print("✓ All required fields present\n")
        
        # Display key info
        print("Service Account Info:")
        print(f"  Project ID: {creds_dict.get('project_id')}")
        print(f"  Client Email: {creds_dict.get('client_email')}")
        print(f"  Private Key ID: {creds_dict.get('private_key_id', 'N/A')[:20]}...")
        print()
        
        # Check project ID
        expected_project = 'green-lens-47e9b'
        if creds_dict.get('project_id') != expected_project:
            print(f"⚠️  WARNING: Project ID is '{creds_dict.get('project_id')}', expected '{expected_project}'")
            print("   This service account may be from a different Firebase project.")
            print()
        
    except json.JSONDecodeError as e:
        print(f"❌ FAILED: Invalid JSON format")
        print(f"   Error: {str(e)}")
        print("\nTO FIX:")
        print("1. Delete the corrupted service-account.json")
        print("2. Download a fresh copy from Firebase Console")
        return False
    except Exception as e:
        print(f"❌ FAILED: Error reading credentials: {str(e)}")
        return False
    
    # Test Firebase initialization
    try:
        print("Testing Firebase Admin SDK initialization...")
        import firebase_admin
        from firebase_admin import credentials as firebase_credentials, firestore, storage
        
        # Initialize Firebase
        if cred_type == "file":
            cred = firebase_credentials.Certificate(creds)
        else:
            cred = firebase_credentials.Certificate(creds_dict)
            
        app = firebase_admin.initialize_app(cred, {
            'storageBucket': 'green-lens-47e9b.firebasestorage.app'
        })
        
        print("✓ Firebase Admin SDK initialized\n")
        
        # Test Firestore connection
        print("Testing Firestore connection...")
        db = firestore.client()
        print(f"✓ Firestore client created for project: {db.project}\n")
        
        # Test Storage connection
        print("Testing Cloud Storage connection...")
        bucket = storage.bucket()
        print(f"✓ Storage bucket connected: {bucket.name}\n")
        
        # Test Firestore read access
        print("Testing Firestore read access...")
        try:
            # Try to read from modelPhotos collection
            test_ref = db.collection('modelPhotos').document('plants').collection('images')
            images = list(test_ref.limit(1).stream())
            print(f"✓ Firestore read access successful ({len(images)} documents tested)\n")
        except Exception as e:
            print(f"⚠️  WARNING: Firestore read access failed: {str(e)}")
            print("   This may be a permissions issue or the collection doesn't exist yet.\n")
        
        # Test Storage read access
        print("Testing Cloud Storage read access...")
        try:
            # List blobs with a small limit to test access
            blobs = list(bucket.list_blobs(max_results=1))
            print(f"✓ Storage read access successful ({len(blobs)} files tested)\n")
        except Exception as e:
            print(f"⚠️  WARNING: Storage read access failed: {str(e)}")
            print("   This may be a permissions issue or the bucket is empty.\n")
        
        print("="*80)
        print("✅ FIREBASE CONNECTION TEST PASSED")
        print("="*80)
        print("\nYour Firebase credentials are valid and working!")
        print("You should be able to use the model retraining feature.\n")
        
        return True
        
    except Exception as e:
        error_str = str(e)
        print(f"\n❌ FAILED: Firebase connection error")
        print(f"   Error: {error_str}\n")
        
        # Provide specific guidance based on error type
        if "invalid_grant" in error_str.lower() or "invalid jwt signature" in error_str.lower():
            print("DIAGNOSIS: Invalid JWT Signature")
            print("\nThis means your service account credentials are invalid or expired.")
            print("\nTO FIX:")
            print("1. Delete the current service-account.json file")
            print("2. Go to Firebase Console: https://console.firebase.google.com/")
            print("3. Select your project: green-lens-47e9b")
            print("4. Go to Project Settings → Service accounts")
            print("5. Click 'Generate new private key'")
            print("6. Download and save as 'service-account.json'")
            print("7. Run this test again")
            
        elif "Permission denied" in error_str or "403" in error_str:
            print("DIAGNOSIS: Permission Denied")
            print("\nThe service account doesn't have required permissions.")
            print("\nTO FIX:")
            print("1. Go to Firebase Console → Project Settings → Service accounts")
            print("2. Check the service account has these roles:")
            print("   - Firebase Admin SDK Administrator Service Agent")
            print("   - Cloud Datastore User")
            print("   - Storage Admin")
            print("3. If missing, generate a new service account key")
            
        else:
            print("DIAGNOSIS: Unknown error")
            print("\nTO FIX:")
            print("1. Check Firebase service status: https://status.firebase.google.com/")
            print("2. Verify your internet connection")
            print("3. Try regenerating the service account key")
            print("4. See FIREBASE_AUTH_TROUBLESHOOTING.md for more help")
        
        print("\nFor detailed troubleshooting, see:")
        print("  FIREBASE_AUTH_TROUBLESHOOTING.md")
        print()
        
        return False


if __name__ == '__main__':
    print("\n" + "="*80)
    print("Green Lens - Firebase Connection Test")
    print("="*80)
    print("\nThis script tests your Firebase Admin SDK configuration.")
    print("Run this before model retraining to catch configuration issues early.")
    print()
    
    # Check we're in the right directory
    if not os.path.exists('service-account.json'):
        print("⚠️  WARNING: Run this script from Green_Lens/backend/ directory")
        print("\nCurrent directory:", os.getcwd())
        print("\nUsage:")
        print("  cd Green_Lens/backend")
        print("  python test_firebase.py")
        print()
        sys.exit(1)
    
    success = test_firebase_connection()
    
    if success:
        sys.exit(0)
    else:
        print("\n" + "="*80)
        print("❌ TEST FAILED - Fix the issues above before retraining models")
        print("="*80 + "\n")
        sys.exit(1)

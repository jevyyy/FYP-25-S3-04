import os
import json
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import firebase_admin
from firebase_admin import credentials, storage

app = Flask(__name__)
CORS(app)

# Firebase configuration
BUCKET_NAME = 'green-lens-47e9b.firebasestorage.app'
SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'Green_Lens', 'backend', 'service-account.json')

# Local paths for downloaded files
LOCAL_MODEL_DIR = os.path.join(os.path.dirname(__file__), 'downloaded_model')
LOCAL_MODEL_PATH = os.path.join(LOCAL_MODEL_DIR, 'flower_img_classifier.keras')
LOCAL_CLASS_NAMES_PATH = os.path.join(LOCAL_MODEL_DIR, 'class_names.json')
LOCAL_CLASS_DICT_PATH = os.path.join(LOCAL_MODEL_DIR, 'classes_to_name_dictionary.json')

# Firebase Storage paths
FIREBASE_MODEL_PATH = 'flower_img_classifier.keras'
FIREBASE_CLASS_NAMES_PATH = 'class_names.json'
FIREBASE_CLASS_DICT_PATH = 'classes_to_name_dictionary.json'

# Global variables for model and class names
model = None
class_names = None
class_dict = None
firebase_initialized = False

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    global firebase_initialized
    
    if firebase_initialized:
        return
    
    try:
        print("Initializing Firebase Admin SDK...")
        cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
        firebase_admin.initialize_app(cred, {
            'storageBucket': BUCKET_NAME
        })
        firebase_initialized = True
        print("Firebase Admin SDK initialized successfully")
    except Exception as e:
        print(f"Error initializing Firebase: {str(e)}")
        raise e

def download_file_from_firebase(firebase_path, local_path):
    """Download a file from Firebase Storage to local path"""
    try:
        bucket = storage.bucket()
        blob = bucket.blob(firebase_path)
        
        print(f"Downloading {firebase_path} from Firebase Storage...")
        blob.download_to_filename(local_path)
        print(f"Successfully downloaded to {local_path}")
        
    except Exception as e:
        print(f"Error downloading {firebase_path}: {str(e)}")
        raise e

def load_model_and_classes():
    """Load the trained model and class mappings from Firebase Storage"""
    global model, class_names, class_dict
    
    try:
        # Initialize Firebase if not already done
        initialize_firebase()
        
        # Create local directory for downloaded files
        os.makedirs(LOCAL_MODEL_DIR, exist_ok=True)
        print(f"Created directory: {LOCAL_MODEL_DIR}")
        
        # Download model file from Firebase Storage
        print("Downloading model files from Firebase Storage...")
        download_file_from_firebase(FIREBASE_MODEL_PATH, LOCAL_MODEL_PATH)
        download_file_from_firebase(FIREBASE_CLASS_NAMES_PATH, LOCAL_CLASS_NAMES_PATH)
        download_file_from_firebase(FIREBASE_CLASS_DICT_PATH, LOCAL_CLASS_DICT_PATH)
        
        # Load the model from local file
        print(f"Loading model from: {LOCAL_MODEL_PATH}")
        model = load_model(LOCAL_MODEL_PATH)
        print("Model loaded successfully")
        
        # Load class names mapping (index to class ID)
        with open(LOCAL_CLASS_NAMES_PATH, 'r') as f:
            class_names = json.load(f)
        print(f"Loaded {len(class_names)} class names")
        
        # Load class dictionary (class ID to flower name)
        with open(LOCAL_CLASS_DICT_PATH, 'r') as f:
            class_dict = json.load(f)
        print(f"Loaded {len(class_dict)} class descriptions")
        
    except Exception as e:
        print(f"Error loading model or classes: {str(e)}")
        raise e

def preprocess_image(image_bytes):
    """Preprocess the image for model prediction"""
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to model input size (224x224)
        image = image.resize((224, 224))
        
        # Convert to numpy array
        image_array = np.array(image)
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        # Preprocess for MobileNetV2
        image_array = preprocess_input(image_array)
        
        return image_array
    
    except Exception as e:
        print(f"Error preprocessing image: {str(e)}")
        raise e

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'classes_loaded': class_names is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict the plant/flower from an uploaded image"""
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        # Get the image file
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Read image bytes
        image_bytes = image_file.read()
        
        # Preprocess the image
        processed_image = preprocess_image(image_bytes)
        
        # Make prediction
        predictions = model.predict(processed_image)
        
        # Get top 5 predictions
        top_5_indices = np.argsort(predictions[0])[-5:][::-1]
        
        results = []
        for idx in top_5_indices:
            class_id = class_names[str(idx)]
            flower_name = class_dict.get(class_id, f"Unknown (Class {class_id})")
            confidence = float(predictions[0][idx])
            
            results.append({
                'class_id': class_id,
                'flower_name': flower_name,
                'confidence': confidence,
                'confidence_percentage': round(confidence * 100, 2)
            })
        
        return jsonify({
            'success': True,
            'predictions': results,
            'top_prediction': results[0] if results else None
        })
    
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/classes', methods=['GET'])
def get_classes():
    """Get all available classes"""
    try:
        return jsonify({
            'success': True,
            'total_classes': len(class_dict),
            'classes': class_dict
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Load model and classes on startup
    load_model_and_classes()
    
    # Run the Flask app
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

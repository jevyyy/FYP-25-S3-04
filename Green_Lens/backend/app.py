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
# Use dynamic path resolution that works from any location
SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), 'service-account.json')

# Local paths for downloaded files
LOCAL_MODEL_DIR = os.path.join(os.path.dirname(__file__), 'downloaded_model')

# Configuration for each category
CATEGORIES = {
    'flower': {
        'model_file': 'flower_best_model.keras',
        'class_names_file': 'flower_class_names.json',
        'class_dict_file': 'classes_to_name_dictionary.json',  # Flower uses 2-step mapping
        'firebase_model': 'flower_best_model.keras',
        'firebase_class_names': 'flower_class_names.json',
        'firebase_class_dict': 'classes_to_name_dictionary.json',
        'use_class_dict': True  # Flower uses class_id -> name mapping
    },
    'plant': {
        'model_file': 'plant_best_model.keras',
        'class_names_file': 'plant_class_names.json',
        'class_dict_file': None,  # Plant uses direct mapping
        'firebase_model': 'plant_best_model.keras',
        'firebase_class_names': 'plant_class_names.json',
        'firebase_class_dict': None,
        'use_class_dict': False  # Plant has direct index -> name mapping
    },
    'architecture': {
        'model_file': 'architecture_best_model.keras',
        'class_names_file': 'architecture_class_names.json',
        'class_dict_file': None,  # Architecture uses direct mapping
        'firebase_model': 'architecture_best_model.keras',
        'firebase_class_names': 'architecture_class_names.json',
        'firebase_class_dict': None,
        'use_class_dict': False  # Architecture has direct index -> name mapping
    }
}

# Global variables for models and class names
models = {}  # Dictionary to store loaded models by category
class_names_dict = {}  # Dictionary to store class names by category
class_dict_dict = {}  # Dictionary to store class dictionaries by category (for flower)
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

def load_model_and_classes_for_category(category):
    """Load the trained model and class mappings for a specific category"""
    global models, class_names_dict, class_dict_dict
    
    if category not in CATEGORIES:
        raise ValueError(f"Invalid category: {category}. Must be one of {list(CATEGORIES.keys())}")
    
    try:
        config = CATEGORIES[category]
        
        # Define local paths
        local_model_path = os.path.join(LOCAL_MODEL_DIR, config['model_file'])
        local_class_names_path = os.path.join(LOCAL_MODEL_DIR, config['class_names_file'])
        
        # Check if files already exist locally (skip Firebase download if they do)
        files_exist = os.path.exists(local_model_path) and os.path.exists(local_class_names_path)
        
        if config['use_class_dict']:
            local_class_dict_path = os.path.join(LOCAL_MODEL_DIR, config['class_dict_file'])
            files_exist = files_exist and os.path.exists(local_class_dict_path)
        
        # Download from Firebase if files don't exist locally
        if not files_exist:
            print(f"Downloading {category} model files from Firebase Storage...")
            initialize_firebase()
            download_file_from_firebase(config['firebase_model'], local_model_path)
            download_file_from_firebase(config['firebase_class_names'], local_class_names_path)
            
            if config['use_class_dict']:
                download_file_from_firebase(config['firebase_class_dict'], local_class_dict_path)
        else:
            print(f"Using existing local files for {category} model")
        
        # Load the model
        print(f"Loading {category} model from: {local_model_path}")
        models[category] = load_model(local_model_path)
        print(f"{category.capitalize()} model loaded successfully")
        
        # Load class names mapping
        with open(local_class_names_path, 'r') as f:
            class_names_dict[category] = json.load(f)
        print(f"Loaded {len(class_names_dict[category])} {category} class names")
        
        # Load class dictionary if needed (only for flower)
        if config['use_class_dict']:
            with open(local_class_dict_path, 'r') as f:
                class_dict_dict[category] = json.load(f)
            print(f"Loaded {len(class_dict_dict[category])} {category} class descriptions")
        else:
            class_dict_dict[category] = None
        
    except Exception as e:
        print(f"Error loading {category} model or classes: {str(e)}")
        raise e

def load_all_models():
    """Load all category models on startup"""
    os.makedirs(LOCAL_MODEL_DIR, exist_ok=True)
    print(f"Created directory: {LOCAL_MODEL_DIR}")
    
    for category in CATEGORIES.keys():
        try:
            print(f"\n{'='*60}")
            print(f"Loading {category.upper()} model...")
            print(f"{'='*60}")
            load_model_and_classes_for_category(category)
        except Exception as e:
            print(f"Failed to load {category} model: {str(e)}")
            print(f"Continuing with other models...")
    
    print(f"\n{'='*60}")
    print(f"Loaded {len(models)} models successfully")
    print(f"Available categories: {list(models.keys())}")
    print(f"{'='*60}\n")

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
        'models_loaded': len(models),
        'available_categories': list(models.keys()),
        'flower_loaded': 'flower' in models,
        'plant_loaded': 'plant' in models,
        'architecture_loaded': 'architecture' in models
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict the plant/flower/architecture from an uploaded image"""
    try:
        # Get category from form data (default to 'flower' for backwards compatibility)
        category = request.form.get('category', 'flower').lower()
        
        # Validate category
        if category not in CATEGORIES:
            return jsonify({
                'error': f'Invalid category: {category}. Must be one of {list(CATEGORIES.keys())}'
            }), 400
        
        # Check if model for this category is loaded
        if category not in models:
            return jsonify({
                'error': f'Model for category {category} is not loaded'
            }), 503
        
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
        
        # Get the appropriate model and class mappings
        model = models[category]
        class_names = class_names_dict[category]
        class_dict = class_dict_dict.get(category)
        
        # Make prediction
        predictions = model.predict(processed_image)
        
        # Get top 5 predictions
        top_5_indices = np.argsort(predictions[0])[-5:][::-1]
        
        results = []
        for idx in top_5_indices:
            idx_str = str(idx)
            
            # For flower: use 2-step mapping (index -> class_id -> name)
            # For plant/architecture: use direct mapping (index -> name)
            if CATEGORIES[category]['use_class_dict']:
                class_id = class_names.get(idx_str, idx_str)
                object_name = class_dict.get(class_id, f"Unknown (Class {class_id})")
            else:
                class_id = idx_str
                object_name = class_names.get(idx_str, f"Unknown (Index {idx_str})")
            
            confidence = float(predictions[0][idx])
            
            result = {
                'class_id': class_id,
                'confidence': confidence,
                'confidence_percentage': round(confidence * 100, 2)
            }
            
            # Use appropriate field name based on category
            if category == 'flower':
                result['flower_name'] = object_name
            elif category == 'plant':
                result['plant_name'] = object_name
            elif category == 'architecture':
                result['architecture_name'] = object_name
            
            # Also add generic 'name' field for easier access
            result['name'] = object_name
            
            results.append(result)
        
        return jsonify({
            'success': True,
            'category': category,
            'predictions': results,
            'top_prediction': results[0] if results else None
        })
    
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/classes', methods=['GET'])
def get_classes():
    """Get all available classes for a specific category"""
    try:
        # Get category from query parameter (default to 'flower')
        category = request.args.get('category', 'flower').lower()
        
        # Validate category
        if category not in CATEGORIES:
            return jsonify({
                'error': f'Invalid category: {category}. Must be one of {list(CATEGORIES.keys())}'
            }), 400
        
        # Check if model for this category is loaded
        if category not in class_names_dict:
            return jsonify({
                'error': f'Classes for category {category} are not loaded'
            }), 503
        
        class_names = class_names_dict[category]
        class_dict = class_dict_dict.get(category)
        
        # Build classes response
        if CATEGORIES[category]['use_class_dict']:
            # For flower: return the class dictionary
            classes = class_dict
        else:
            # For plant/architecture: return the class names directly
            classes = class_names
        
        return jsonify({
            'success': True,
            'category': category,
            'total_classes': len(classes),
            'classes': classes
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/categories', methods=['GET'])
def get_categories():
    """Get list of available categories"""
    return jsonify({
        'success': True,
        'categories': list(CATEGORIES.keys()),
        'loaded_categories': list(models.keys())
    })

@app.route('/api/retrain', methods=['POST'])
def retrain_model():
    """
    Trigger model retraining for a specific category
    Expects JSON body: { "category": "flowers|plants|architecture", "deleteImagesAfter": true|false }
    """
    try:
        data = request.get_json()
        category = data.get('category')
        delete_images_after = data.get('deleteImagesAfter', True)
        
        if not category:
            return jsonify({
                'success': False,
                'error': 'Category is required'
            }), 400
        
        # Map frontend category names to backend category names
        category_map = {
            'flowers': 'flowers',
            'plants': 'plants',
            'architecture': 'architecture'
        }
        
        if category not in category_map:
            return jsonify({
                'success': False,
                'error': f'Invalid category. Must be one of: {list(category_map.keys())}'
            }), 400
        
        backend_category = category_map[category]
        
        # Import the retrainer
        import sys
        sys.path.append(os.path.join(os.path.dirname(__file__), 'src', 'utils'))
        from retrain_model_with_firebase import ModelRetrainer
        
        # Initialize retrainer
        retrainer = ModelRetrainer(
            category=backend_category,
            service_account_path=SERVICE_ACCOUNT_PATH,
            bucket_name=BUCKET_NAME
        )
        
        # Run retraining
        print(f"\n{'='*80}")
        print(f"Starting retraining for category: {backend_category}")
        print(f"Delete images after training: {delete_images_after}")
        print(f"{'='*80}\n")
        
        success = retrainer.retrain(delete_images_after=delete_images_after)
        
        if success:
            # Reload the model for this category
            try:
                # Map back to the category key used in CATEGORIES
                category_key = 'flower' if category == 'flowers' else category.rstrip('s')
                load_model_and_classes_for_category(category_key)
                print(f"Reloaded {category} model successfully")
            except Exception as e:
                print(f"Warning: Failed to reload model: {str(e)}")
            
            return jsonify({
                'success': True,
                'message': f'Model retraining completed successfully for {category}',
                'category': category,
                'images_deleted': delete_images_after
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Model retraining failed. Check server logs for details.'
            }), 500
            
    except Exception as e:
        print(f"Error in retrain_model endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Don't expose internal error details to clients for security
        error_message = "An error occurred during model retraining. Please check server logs for details."
        
        return jsonify({
            'success': False,
            'error': error_message
        }), 500

if __name__ == '__main__':
    # Load all models on startup
    load_all_models()
    
    # Run the Flask app
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

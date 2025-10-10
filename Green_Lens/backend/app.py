"""
Flask API for MobileNetV2 Flower Classification Model
Serves predictions from the trained model to React Native mobile app
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import json
import os
import logging
from PIL import Image
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native app

# Configuration
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../../output_model/flower_img_classifier.keras')
CLASS_NAMES_PATH = os.path.join(os.path.dirname(__file__), '../../output_model/class_names.json')
INPUT_SIZE = (224, 224)

# Global variables for model and class names
model = None
class_names = None

def load_model_and_classes():
    """Load the trained model and class names on startup"""
    global model, class_names
    
    try:
        logger.info(f"Loading model from: {MODEL_PATH}")
        model = load_model(MODEL_PATH)
        logger.info("Model loaded successfully")
        
        logger.info(f"Loading class names from: {CLASS_NAMES_PATH}")
        with open(CLASS_NAMES_PATH, 'r') as f:
            class_names = json.load(f)
        logger.info(f"Loaded {len(class_names)} class names")
        
    except Exception as e:
        logger.error(f"Error loading model or class names: {str(e)}")
        raise

def preprocess_image(img_bytes):
    """
    Preprocess image for MobileNetV2 prediction
    Args:
        img_bytes: Image bytes from request
    Returns:
        Preprocessed image array ready for prediction
    """
    try:
        # Load image from bytes
        img = Image.open(io.BytesIO(img_bytes))
        
        # Convert to RGB if necessary (handles RGBA, grayscale, etc.)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to model input size
        img = img.resize(INPUT_SIZE)
        
        # Convert to array
        img_array = image.img_to_array(img)
        
        # Expand dimensions to create batch
        img_array = np.expand_dims(img_array, axis=0)
        
        # Preprocess using MobileNetV2 preprocessing
        img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
        
        return img_array
        
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        raise

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
    """
    Prediction endpoint
    Expects: multipart/form-data with 'image' field containing image file
    Returns: JSON with predictions and class names
    """
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Read image bytes
        img_bytes = file.read()
        
        # Preprocess image
        img_array = preprocess_image(img_bytes)
        
        # Make prediction
        predictions = model.predict(img_array, verbose=0)
        
        # Get top 5 predictions
        top_k = 5
        top_indices = np.argsort(predictions[0])[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            class_idx = str(idx)
            class_name = class_names.get(class_idx, f"Unknown_{class_idx}")
            confidence = float(predictions[0][idx])
            
            results.append({
                'class_id': class_name,
                'confidence': confidence,
                'percentage': f"{confidence * 100:.2f}%"
            })
        
        # Get the top prediction
        top_prediction = results[0]
        
        logger.info(f"Prediction: {top_prediction['class_id']} with confidence {top_prediction['percentage']}")
        
        return jsonify({
            'success': True,
            'top_prediction': top_prediction,
            'top_5_predictions': results
        })
        
    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/classes', methods=['GET'])
def get_classes():
    """Get all available class names"""
    try:
        return jsonify({
            'success': True,
            'classes': class_names,
            'total_classes': len(class_names)
        })
    except Exception as e:
        logger.error(f"Error getting classes: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with API information"""
    return jsonify({
        'name': 'MobileNetV2 Flower Classification API',
        'version': '1.0.0',
        'endpoints': {
            '/health': 'Health check',
            '/predict': 'POST - Image prediction',
            '/classes': 'GET - List all classes'
        }
    })

if __name__ == '__main__':
    # Load model and class names on startup
    load_model_and_classes()
    
    # Run the Flask app
    # Use 0.0.0.0 to make it accessible from React Native app
    app.run(host='0.0.0.0', port=5000, debug=True)

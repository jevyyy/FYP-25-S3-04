# Backend API for Flower Classification

This backend provides a REST API for serving predictions from the trained MobileNetV2 flower classification model to the React Native mobile app.

## Prerequisites

- Python 3.10 (recommended for compatibility with the trained model)
- pip (Python package manager)

## Setup Instructions

### 1. Create a Virtual Environment (Recommended)

```bash
# Navigate to the backend directory
cd Green_Lens/backend

# Create virtual environment
python3.10 -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note:** The installation may take several minutes as it includes TensorFlow and other ML libraries.

### 3. Verify Model Files

Ensure the following files exist in the repository root:
- `output_model/flower_img_classifier.keras` - The trained model
- `output_model/class_names.json` - Class name mappings

### 4. Run the API Server

```bash
python app.py
```

The API server will start on `http://0.0.0.0:5000`

## API Endpoints

### 1. Health Check
```
GET /health
```
Returns the health status of the API and whether the model is loaded.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "classes_loaded": true
}
```

### 2. Predict
```
POST /predict
```
Upload an image for flower classification.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` field with image file

**Response:**
```json
{
  "success": true,
  "top_prediction": {
    "class_id": "1",
    "confidence": 0.95,
    "percentage": "95.00%"
  },
  "top_5_predictions": [
    {
      "class_id": "1",
      "confidence": 0.95,
      "percentage": "95.00%"
    },
    ...
  ]
}
```

### 3. Get Classes
```
GET /classes
```
Returns all available flower class names.

**Response:**
```json
{
  "success": true,
  "classes": {
    "0": "1",
    "1": "10",
    ...
  },
  "total_classes": 102
}
```

## Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:5000/health

# Predict with an image
curl -X POST -F "image=@/path/to/flower_image.jpg" http://localhost:5000/predict

# Get all classes
curl http://localhost:5000/classes
```

### Using Python

```python
import requests

# Test prediction
with open('flower_image.jpg', 'rb') as f:
    files = {'image': f}
    response = requests.post('http://localhost:5000/predict', files=files)
    print(response.json())
```

## Integration with React Native

In your React Native app, you can call the API using fetch or axios:

```javascript
// Example using FormData
const formData = new FormData();
formData.append('image', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'flower.jpg',
});

fetch('http://YOUR_SERVER_IP:5000/predict', {
  method: 'POST',
  body: formData,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})
  .then(response => response.json())
  .then(data => {
    console.log('Prediction:', data.top_prediction);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

**Important:** Replace `YOUR_SERVER_IP` with:
- `localhost` or `127.0.0.1` for web testing
- Your computer's local IP address (e.g., `192.168.1.100`) for testing on a physical device
- Your server's public IP or domain for production deployment

## Deployment Considerations

### For Local Development
- Use your computer's local IP address
- Ensure both the backend server and React Native app are on the same network

### For Production
- Deploy to a cloud service (AWS, Google Cloud, Azure, Heroku, etc.)
- Use HTTPS for secure communication
- Consider using environment variables for configuration
- Add authentication/authorization if needed
- Implement rate limiting to prevent abuse

## Troubleshooting

### Model Loading Issues
- Verify Python version matches the training environment (3.10)
- Ensure all dependencies are installed correctly
- Check file paths are correct

### CORS Issues
- CORS is enabled by default for all origins
- For production, configure CORS to only allow your app's domain

### Performance Issues
- Consider using TensorFlow Lite for smaller model size
- Implement caching for frequently requested predictions
- Use GPU acceleration if available

## Library Versions

This backend uses specific library versions that match the training environment:
- TensorFlow: 2.15.0
- Keras: 2.15.0
- Python: 3.10 (recommended)

See `requirements.txt` for the complete list of dependencies.

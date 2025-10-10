# Plant Recognition Backend API

This is a Python Flask backend API that serves a trained MobileNetV2 model for plant/flower recognition.

## Requirements

- Python 3.10 (recommended, compatible with Python 3.8+)
- All dependencies listed in `requirements.txt`

## Setup

### 1. Create a Virtual Environment

```bash
cd backend
python3 -m venv venv
```

### 2. Activate the Virtual Environment

**On Windows:**
```bash
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## Running the API

### Development Mode

```bash
cd src
python app.py
```

The API will start on `http://localhost:5000`

### Production Mode

For production, use a WSGI server like Gunicorn:

```bash
pip install gunicorn
cd src
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### 1. Health Check
**GET** `/health`

Returns the health status of the API and whether the model is loaded.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "classes_loaded": true
}
```

### 2. Predict Plant/Flower
**POST** `/predict`

Upload an image to get plant/flower predictions.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: image file with key "image"

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "class_id": "74",
      "flower_name": "rose",
      "confidence": 0.95,
      "confidence_percentage": 95.0
    },
    ...
  ],
  "top_prediction": {
    "class_id": "74",
    "flower_name": "rose",
    "confidence": 0.95,
    "confidence_percentage": 95.0
  }
}
```

### 3. Get All Classes
**GET** `/classes`

Returns all available plant/flower classes.

**Response:**
```json
{
  "success": true,
  "total_classes": 102,
  "classes": {
    "1": "pink primrose",
    "2": "hard-leaved pocket orchid",
    ...
  }
}
```

## Model Information

- **Model:** MobileNetV2 (Transfer Learning)
- **Input Size:** 224x224 pixels
- **Classes:** 102 flower species
- **Model File:** `../Green_Lens/backend/src/ouput_model/flower_img_classifier.keras`

## Testing the API

You can test the API using curl:

```bash
# Health check
curl http://localhost:5000/health

# Predict
curl -X POST -F "image=@/path/to/your/flower.jpg" http://localhost:5000/predict

# Get classes
curl http://localhost:5000/classes
```

## Environment Variables

- `PORT`: Port to run the server on (default: 5000)

## Troubleshooting

### ModuleNotFoundError
Make sure you've activated the virtual environment and installed all dependencies.

### Model Not Found Error
Verify that the model file exists at the correct path relative to the backend directory.

### TensorFlow Errors
This project requires TensorFlow 2.15.0. If you encounter issues, try:
```bash
pip install --upgrade tensorflow==2.15.0
```

## Notes

- The model was trained with Python 3.10 and TensorFlow 2.15.0
- For best results, use images of flowers with good lighting and clear views
- The API returns the top 5 predictions with confidence scores

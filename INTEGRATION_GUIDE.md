# React Native + Python Backend Integration Guide

This guide explains how to integrate the React Native mobile app with the Python backend API for plant recognition.

## Architecture Overview

```
┌─────────────────────┐
│  React Native App   │
│   (Green_Lens)      │
└──────────┬──────────┘
           │ HTTP/REST
           │
           ▼
┌─────────────────────┐
│  Python Flask API   │
│    (backend/)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  TensorFlow Model   │
│  (MobileNetV2)      │
└─────────────────────┘
```

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create Python virtual environment:**
   ```bash
   python3 -m venv venv
   ```

3. **Activate virtual environment:**
   
   On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```
   
   On Windows:
   ```bash
   venv\Scripts\activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the backend server:**
   ```bash
   cd src
   python app.py
   ```

   The server will start on `http://localhost:5000`

### React Native App Setup

1. **Navigate to app directory:**
   ```bash
   cd Green_Lens
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npm start
   ```

4. **Run on device:**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## Using the Plant Recognition API

### 1. Import the API Service

```javascript
import { predictPlant, checkHealth } from '../services/plantRecognitionApi';
```

### 2. Check Backend Connection

```javascript
const checkConnection = async () => {
  const result = await checkHealth();
  if (result.success) {
    console.log('Backend is connected');
  } else {
    console.log('Backend is not available');
  }
};
```

### 3. Recognize a Plant

```javascript
const recognizePlant = async (imageUri) => {
  const result = await predictPlant(imageUri);
  
  if (result.success) {
    const predictions = result.data.predictions;
    const topPrediction = result.data.top_prediction;
    
    console.log('Top prediction:', topPrediction.flower_name);
    console.log('Confidence:', topPrediction.confidence_percentage + '%');
  } else {
    console.error('Prediction failed:', result.error);
  }
};
```

## Example Usage

See `screens/PlantRecognitionScreen.js` for a complete example implementation that includes:
- Camera integration
- Image gallery selection
- Real-time prediction display
- Confidence visualization
- Error handling

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "classes_loaded": true
}
```

### Predict Plant
```
POST /predict
Content-Type: multipart/form-data
```

Request Body:
- `image`: Image file (JPEG/PNG)

Response:
```json
{
  "success": true,
  "predictions": [
    {
      "class_id": "74",
      "flower_name": "rose",
      "confidence": 0.95,
      "confidence_percentage": 95.0
    }
  ],
  "top_prediction": {
    "class_id": "74",
    "flower_name": "rose",
    "confidence": 0.95,
    "confidence_percentage": 95.0
  }
}
```

### Get Classes
```
GET /classes
```

Response:
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

## Network Configuration

### Development (Localhost)

When running the backend on your local machine:

**For iOS Simulator:**
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

**For Android Emulator:**
```javascript
const API_BASE_URL = 'http://10.0.2.2:5000';
```

**For Physical Device:**
```javascript
// Replace with your computer's local IP address
const API_BASE_URL = 'http://192.168.1.100:5000';
```

To find your local IP:
- macOS/Linux: `ifconfig | grep "inet "`
- Windows: `ipconfig`

### Production

Deploy your backend to a cloud service and update the URL:

```javascript
const API_BASE_URL = 'https://your-api-domain.com';
```

Popular deployment options:
- Heroku
- AWS EC2/Lambda
- Google Cloud Run
- DigitalOcean
- Railway

## Troubleshooting

### Backend Issues

**Problem:** Model not found
**Solution:** The backend downloads the model from Firebase Storage on startup. Ensure:
1. Firebase service account file exists at `Green_Lens/backend/service-account.json`
2. Model file `flower_img_classifier.keras` is uploaded to Firebase Storage
3. Class mapping files (`class_names.json`, `classes_to_name_dictionary.json`) are in Firebase Storage
4. You have proper Firebase Storage permissions

**Problem:** TensorFlow errors
**Solution:** 
```bash
pip uninstall tensorflow
pip install tensorflow==2.15.0
```

**Problem:** Port already in use
**Solution:** 
```bash
# Change port in app.py or:
PORT=5001 python app.py
```

### React Native Issues

**Problem:** Cannot connect to backend
**Solution:** 
1. Check if backend is running: `curl http://localhost:5000/health`
2. Use correct IP address for your device type (see Network Configuration)
3. Disable firewall temporarily for testing
4. Update `API_BASE_URL` in `services/plantRecognitionApi.js`

**Problem:** Image picker not working
**Solution:** 
1. Install expo-image-picker: `npm install expo-image-picker`
2. For physical devices, ensure permissions are granted in device settings

**Problem:** CORS errors
**Solution:** The backend already has CORS enabled via flask-cors. If issues persist, check browser console for details.

### Network Issues

**Problem:** Connection refused
**Solution:**
1. Ensure backend is running
2. Check firewall settings
3. Use correct IP address
4. For physical devices, ensure device and computer are on same network

## Testing

### Backend Testing

Run the test script:
```bash
cd backend
python test_api.py /path/to/test/image.jpg
```

Or use curl:
```bash
# Health check
curl http://localhost:5000/health

# Prediction
curl -X POST -F "image=@flower.jpg" http://localhost:5000/predict
```

### React Native Testing

1. Start the backend: `python backend/src/app.py`
2. Start the React Native app: `npm start`
3. Use the PlantRecognitionScreen to test the integration

## Performance Optimization

### Backend
- Use gunicorn for production: `gunicorn -w 4 app:app`
- Enable caching for repeated predictions
- Optimize image preprocessing
- Consider GPU acceleration for faster predictions

### React Native
- Compress images before sending
- Implement request timeout handling
- Cache API responses when appropriate
- Show loading states during prediction

## Security Considerations

1. **API Authentication:** Implement API keys or OAuth for production
2. **Rate Limiting:** Add rate limiting to prevent abuse
3. **Input Validation:** Validate image size and format
4. **HTTPS:** Use HTTPS in production
5. **Environment Variables:** Store API URLs in environment variables

## Next Steps

1. Add user authentication
2. Implement result history/favorites
3. Add offline mode with local caching
4. Integrate with plant care tips database
5. Add social sharing features
6. Implement plant identification history

## Support

For issues or questions:
1. Check this documentation
2. Review the example implementation in PlantRecognitionScreen.js
3. Check backend logs for errors
4. Verify network connectivity

## Model Information

- **Model:** MobileNetV2 (Transfer Learning)
- **Framework:** TensorFlow 2.15.0
- **Input Size:** 224x224 pixels
- **Output:** 102 flower/plant classes
- **Training:** Python 3.10 compatible

## License

This project uses the following key dependencies:
- TensorFlow (Apache License 2.0)
- Flask (BSD License)
- React Native (MIT License)
- Expo (MIT License)

# React Native + Backend API Integration Guide

This guide explains how to integrate the Python backend API with the React Native mobile app for flower classification using the trained MobileNetV2 model.

## Overview

The system consists of two main components:
1. **Python Flask Backend**: Serves the trained MobileNetV2 model via REST API
2. **React Native Mobile App**: Captures/selects images and displays classification results

## Architecture

```
React Native App (Expo)
        ↓ (HTTP Request with image)
Flask Backend API
        ↓ (Load model)
MobileNetV2 Model
        ↓ (Prediction)
Flask Backend API
        ↓ (JSON Response)
React Native App (Display results)
```

## Setup Instructions

### 1. Backend Setup

#### Install Python Dependencies

```bash
cd Green_Lens/backend

# Create virtual environment (recommended)
python3.10 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Start the Backend Server

```bash
python app.py
```

The server will start at `http://0.0.0.0:5000`

**Important Notes:**
- The server needs access to the trained model files in `output_model/` directory
- Default model path: `../../output_model/flower_img_classifier.keras`
- Class names path: `../../output_model/class_names.json`

For detailed backend documentation, see [backend/README.md](backend/README.md)

### 2. React Native App Setup

#### Install Dependencies

```bash
cd Green_Lens

# Install Node.js dependencies
npm install

# Install expo-image-picker if not already installed
npx expo install expo-image-picker
```

#### Configure API Base URL

Edit `services/apiService.js` and update the `API_BASE_URL`:

```javascript
// For local development
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000';
```

**URL Configuration:**
- **Web Browser/Expo Web**: `http://localhost:5000` or `http://127.0.0.1:5000`
- **Android Emulator**: `http://10.0.2.2:5000`
- **iOS Simulator**: `http://localhost:5000`
- **Physical Device**: `http://YOUR_COMPUTER_IP:5000` (e.g., `http://192.168.1.100:5000`)

To find your computer's IP address:
- **Windows**: Run `ipconfig` in Command Prompt, look for IPv4 Address
- **Mac/Linux**: Run `ifconfig` or `ip addr`, look for inet address

#### Start the React Native App

```bash
npm start
```

Then press:
- `a` for Android
- `i` for iOS
- `w` for web

## Using the Example Component

### Basic Implementation

The `FlowerClassificationScreen.jsx` component demonstrates a complete implementation:

```javascript
import FlowerClassificationScreen from './screens/FlowerClassificationScreen';

// Use in your navigation or App.tsx
export default function App() {
  return <FlowerClassificationScreen />;
}
```

### Features Included:
- ✅ Camera integration with expo-image-picker
- ✅ Gallery image selection
- ✅ API health check
- ✅ Image preprocessing and upload
- ✅ Top 5 predictions display
- ✅ Loading states
- ✅ Error handling

## API Integration Examples

### Example 1: Simple Prediction

```javascript
import { predictImage } from './services/apiService';

async function classifyFlower(imageUri) {
  try {
    const result = await predictImage(imageUri);
    console.log('Top prediction:', result.top_prediction);
    console.log('Confidence:', result.top_prediction.percentage);
  } catch (error) {
    console.error('Classification failed:', error);
  }
}
```

### Example 2: Check API Health

```javascript
import { checkHealth } from './services/apiService';

async function verifyAPI() {
  try {
    const health = await checkHealth();
    if (health.status === 'healthy' && health.model_loaded) {
      console.log('API is ready!');
    }
  } catch (error) {
    console.error('API not available:', error);
  }
}
```

### Example 3: Get All Classes

```javascript
import { getClasses } from './services/apiService';

async function loadClasses() {
  try {
    const data = await getClasses();
    console.log('Total classes:', data.total_classes);
    console.log('Class mapping:', data.classes);
  } catch (error) {
    console.error('Failed to load classes:', error);
  }
}
```

## Integrating with Existing Camera Component

If you have an existing camera component (like `KX_camera.jsx`), you can add classification:

```javascript
import { predictImage } from './services/apiService';

// Inside your camera component
async function takePhoto() {
  if (cameraRef.current) {
    try {
      const photo = await cameraRef.current.takePictureAsync();
      
      // Classify the captured image
      const result = await predictImage(photo.uri);
      
      Alert.alert(
        'Flower Identified!',
        `Class: ${result.top_prediction.class_id}\nConfidence: ${result.top_prediction.percentage}`
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }
}
```

## Testing the Integration

### 1. Test Backend API

```bash
cd Green_Lens/backend
python test_api.py
```

This will test all endpoints without requiring images.

### 2. Test with cURL

```bash
# Health check
curl http://localhost:5000/health

# Get classes
curl http://localhost:5000/classes

# Predict (with image)
curl -X POST -F "image=@path/to/flower.jpg" http://localhost:5000/predict
```

### 3. Test from React Native

1. Start backend server: `python app.py`
2. Start React Native app: `npm start`
3. Open app on device/emulator
4. Take/select a flower image
5. Check for prediction results

## Troubleshooting

### "Network request failed" Error

**Problem**: React Native app cannot connect to backend

**Solutions**:
1. Verify backend server is running
2. Check API_BASE_URL is correct for your device type
3. Ensure device and computer are on same network (for physical devices)
4. Disable firewall temporarily to test
5. For Android, check network security config allows cleartext traffic

### Model Loading Error

**Problem**: Backend fails to load model

**Solutions**:
1. Verify model files exist in `output_model/` directory
2. Check file paths in `app.py` are correct
3. Ensure Python version matches training environment (3.10)
4. Verify all dependencies are installed

### Image Upload Fails

**Problem**: Image fails to upload to backend

**Solutions**:
1. Check image format is supported (JPEG, PNG)
2. Verify FormData is correctly formatted
3. Check Content-Type header is set to `multipart/form-data`
4. Ensure image file is not corrupted

### CORS Issues (Web Only)

**Problem**: CORS errors in web browser

**Solution**: CORS is enabled in backend by default. If issues persist, check browser console for specific error.

## Production Deployment

### Backend Deployment Options:

1. **Heroku**: Easy deployment with buildpacks
2. **AWS EC2/Lambda**: Scalable cloud hosting
3. **Google Cloud Run**: Containerized deployment
4. **Azure App Service**: Managed hosting
5. **DigitalOcean**: VPS hosting

### Deployment Checklist:

- [ ] Set up HTTPS for secure communication
- [ ] Configure environment variables for sensitive data
- [ ] Update API_BASE_URL in React Native app to production URL
- [ ] Add authentication/authorization if needed
- [ ] Implement rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure CORS for production domain only
- [ ] Optimize model loading (consider TensorFlow Lite)
- [ ] Set up CI/CD pipeline

### Environment Variables

Create a `.env` file for configuration:

```bash
# Backend .env
MODEL_PATH=/path/to/model.keras
CLASS_NAMES_PATH=/path/to/class_names.json
PORT=5000
DEBUG=False
```

React Native environment variables:

```javascript
// config.js
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
```

## Performance Optimization

### Backend Optimizations:
- Use TensorFlow Lite for smaller model size
- Implement response caching
- Use gunicorn/uwsgi for production serving
- Enable GPU acceleration if available
- Compress API responses

### App Optimizations:
- Compress images before upload
- Implement request caching
- Show loading indicators
- Handle offline scenarios gracefully
- Optimize image quality vs size

## API Reference

### Endpoints

#### GET /health
Check API health status

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "classes_loaded": true
}
```

#### POST /predict
Classify a flower image

**Request:**
- Method: POST
- Content-Type: multipart/form-data
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
  "top_5_predictions": [...]
}
```

#### GET /classes
Get all flower classes

**Response:**
```json
{
  "success": true,
  "classes": {"0": "1", "1": "10", ...},
  "total_classes": 102
}
```

## Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [TensorFlow Documentation](https://www.tensorflow.org/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs for errors
3. Test API endpoints with cURL first
4. Verify network connectivity
5. Check React Native console for errors

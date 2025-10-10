# FYP-25-S3-04

Green Lens - Flower Classification App

## Overview

This project is a React Native mobile application that uses a trained MobileNetV2 model to classify flowers. The app captures or selects flower images and sends them to a Python Flask backend API for classification.

## Project Structure

```
FYP-25-S3-04/
├── Green_Lens/                 # React Native mobile app
│   ├── App.tsx                 # Main app component
│   ├── KX_camera.jsx          # Camera component
│   ├── services/               # API service layer
│   │   └── apiService.js      # Backend API client
│   ├── screens/                # App screens
│   │   └── FlowerClassificationScreen.jsx  # Example classification screen
│   ├── backend/                # Python Flask backend
│   │   ├── app.py             # Main Flask application
│   │   ├── requirements.txt   # Python dependencies
│   │   ├── test_api.py        # API testing script
│   │   ├── start.sh           # Quick start script
│   │   └── README.md          # Backend documentation
│   └── INTEGRATION_GUIDE.md   # Complete integration guide
├── output_model/               # Trained model files
│   ├── flower_img_classifier.keras  # MobileNetV2 model
│   └── class_names.json       # Class name mappings
└── README.md                   # This file
```

## Quick Start

### 1. Backend Setup

```bash
cd Green_Lens/backend

# Quick start (Linux/Mac)
./start.sh

# Or manual setup
python3.10 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The backend server will start at `http://localhost:5000`

### 2. Mobile App Setup

```bash
cd Green_Lens

# Install dependencies
npm install

# Start the app
npm start
```

Then press:
- `a` for Android
- `i` for iOS  
- `w` for web

### 3. Configure API Connection

Update the API URL in `Green_Lens/services/apiService.js`:

```javascript
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000';
```

- For **physical device**: Use your computer's local IP (e.g., `192.168.1.100:5000`)
- For **Android emulator**: Use `10.0.2.2:5000`
- For **iOS simulator**: Use `localhost:5000`

## Features

- 📸 Camera integration for capturing flower images
- 🖼️ Gallery selection for existing images
- 🤖 AI-powered flower classification using MobileNetV2
- 📊 Top 5 prediction results with confidence scores
- 🔄 Real-time API health monitoring
- 🎨 Clean and intuitive user interface

## Model Information

- **Architecture**: MobileNetV2 with transfer learning
- **Input Size**: 224x224 RGB images
- **Classes**: 102 flower categories
- **Framework**: TensorFlow 2.15.0 / Keras 2.15.0
- **Training Environment**: Python 3.10

## Documentation

- **[Complete Integration Guide](Green_Lens/INTEGRATION_GUIDE.md)** - Detailed setup and integration instructions
- **[Backend API Documentation](Green_Lens/backend/README.md)** - Backend API reference and setup
- **Example Component** - See `Green_Lens/screens/FlowerClassificationScreen.jsx`

## Technology Stack

### Mobile App
- React Native (0.79.5)
- Expo (~53.0.20)
- TypeScript
- expo-image-picker

### Backend
- Python 3.10
- Flask 3.1.0
- TensorFlow 2.15.0
- NumPy, Pillow, etc.

## API Endpoints

- `GET /health` - Check API health status
- `POST /predict` - Classify flower image
- `GET /classes` - Get all flower classes
- `GET /` - API information

## Development

### Running Tests

Backend API tests:
```bash
cd Green_Lens/backend
python test_api.py
```

### Testing with cURL

```bash
# Health check
curl http://localhost:5000/health

# Predict
curl -X POST -F "image=@flower.jpg" http://localhost:5000/predict
```

## Troubleshooting

### "Network request failed"
- Ensure backend server is running
- Check API_BASE_URL is correct
- Verify device and computer are on same network

### Model Loading Error
- Verify model files exist in `output_model/` directory
- Check Python version matches training environment (3.10)

For more troubleshooting help, see the [Integration Guide](Green_Lens/INTEGRATION_GUIDE.md#troubleshooting).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the 0BSD License.

## Support

For issues or questions, please open an issue in the repository or refer to the documentation in the `Green_Lens/` directory.
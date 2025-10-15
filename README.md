# Green Lens - Plant Recognition App

A React Native mobile application with Python backend for plant/flower recognition using a trained MobileNetV2 deep learning model.

## 🌟 Features

- 📸 Take photos or select from gallery
- 🌿 Recognize 102 different plant/flower species
- 🎯 Top 5 predictions with confidence scores
- 🔄 Real-time prediction processing
- 📱 Cross-platform (iOS & Android)
- 👤 User authentication and profiles
- 🎮 Quiz and rewards system
- 📊 User rankings
- 👨‍💼 Admin and Developer portals

## 🏗️ Architecture

```
Green_Lens/
├── backend/             # Python Flask API server
│   ├── app.py          # Main API application
│   ├── src/            # Source files
│   ├── requirements.txt # Python dependencies
│   └── start.sh/.bat   # Startup scripts
│
└── frontend/           # React Native Expo application
    ├── App.js          # Main app with navigation
    ├── screens/        # All app screens
    ├── services/       # API service layer
    ├── assets/         # Images and resources
    ├── functions/      # Firebase functions
    └── package.json    # Node dependencies
```

> **Note**: This branch has been merged from the KX and fastAPI branches. See [MERGE_NOTES.md](MERGE_NOTES.md) for details on what was consolidated.

## 🚀 Quick Start

### Prerequisites

- Python 3.8+ (3.10 recommended)
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)

### 1. Backend Setup

```bash
cd Green_Lens/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd src
python app.py
```

The backend API will start on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd Green_Lens/frontend
npm install
npm start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app on your device

## 📖 Documentation

- [**Integration Guide**](INTEGRATION_GUIDE.md) - Complete setup and usage guide
- [**Backend README**](Green_Lens/backend/README.md) - Backend API documentation
- [**Merge Notes**](MERGE_NOTES.md) - Details about branch consolidation
- [**API Service**](Green_Lens/frontend/services/plantRecognitionApi.js) - React Native API service layer

## 🔌 API Endpoints

### Health Check
```
GET http://localhost:5000/health
```

### Predict Plant
```
POST http://localhost:5000/predict
Content-Type: multipart/form-data
Body: image file
```

### Get Classes
```
GET http://localhost:5000/classes
```

## 🧪 Testing

### Test Backend API

```bash
cd backend
python test_api.py /path/to/flower/image.jpg
```

Or use curl:
```bash
curl http://localhost:5000/health
curl -X POST -F "image=@flower.jpg" http://localhost:5000/predict
```

### Test React Native App

1. Ensure backend is running on `http://localhost:5000`
2. Launch the app
3. Navigate to the Plant Recognition screen
4. Take or select a photo
5. Tap "Recognize Plant"

## 🌐 Network Configuration

### For Development

**iOS Simulator:**
```javascript
API_BASE_URL = 'http://localhost:5000'
```

**Android Emulator:**
```javascript
API_BASE_URL = 'http://10.0.2.2:5000'
```

**Physical Device:**
```javascript
API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000'
// Example: 'http://192.168.1.100:5000'
```

Update `API_BASE_URL` in `Green_Lens/services/plantRecognitionApi.js`

## 🤖 Model Information

- **Model:** MobileNetV2 (Transfer Learning)
- **Framework:** TensorFlow 2.15.0
- **Training:** Python 3.10
- **Input Size:** 224x224 pixels
- **Output:** 102 flower/plant classes
- **Source:** Firebase Storage (automatically downloaded on server startup)

## 📱 Usage Example

```javascript
import { predictPlant } from './services/plantRecognitionApi';

const recognizePlant = async (imageUri) => {
  const result = await predictPlant(imageUri);
  
  if (result.success) {
    const topPrediction = result.data.top_prediction;
    console.log('Plant:', topPrediction.flower_name);
    console.log('Confidence:', topPrediction.confidence_percentage + '%');
  }
};
```

## 🛠️ Troubleshooting

### Backend won't start
- Check Python version: `python3 --version`
- Verify model file exists at correct path
- Check if port 5000 is available

### Can't connect from React Native app
- Verify backend is running: `curl http://localhost:5000/health`
- Check correct IP address for your device type
- Ensure device and computer on same network (for physical devices)
- Update API_BASE_URL in plantRecognitionApi.js

### TensorFlow errors
```bash
pip uninstall tensorflow
pip install tensorflow==2.15.0
```

## 📚 Project Structure

```
FYP-25-S3-04/
├── backend/                          # Python Flask API
│   ├── src/
│   │   └── app.py                   # Main Flask application
│   ├── requirements.txt             # Python dependencies
│   ├── README.md                    # Backend documentation
│   ├── test_api.py                  # API test script
│   ├── start.sh                     # macOS/Linux startup
│   └── start.bat                    # Windows startup
│
├── Green_Lens/                      # React Native app
│   ├── backend/                     # Existing Firebase backend
│   │   ├── service-account.json    # Firebase credentials
│   │   └── src/
│   │       ├── ouput_model/        # Original model files (for reference)
│   │       ├── camera/             # Class mappings (uploaded to Firebase)
│   │       └── utils/              # Training scripts
│   ├── services/
│   │   └── plantRecognitionApi.js  # API service layer
│   ├── screens/
│   │   └── PlantRecognitionScreen.js # Example screen
│   ├── App.js
│   └── package.json
│
├── INTEGRATION_GUIDE.md             # Complete integration guide
└── README.md                        # This file
```

## 🔐 Security Notes

For production deployment:
- Implement API authentication (API keys/OAuth)
- Enable rate limiting
- Use HTTPS
- Validate image uploads
- Store sensitive config in environment variables

## 📄 License

This project is part of FYP-25-S3-04.

## 🤝 Contributing

This is a Final Year Project. For contribution guidelines, please contact the project maintainers.

## 📧 Support

For questions or issues:
1. Check the [Integration Guide](INTEGRATION_GUIDE.md)
2. Review the [Backend README](backend/README.md)
3. Check backend logs for errors
4. Verify network connectivity

---

Built with ❤️ using React Native, TensorFlow, and Flask

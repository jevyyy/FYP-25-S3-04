# Setup Checklist

Use this checklist to ensure you have everything configured correctly.

## Prerequisites

- [ ] Python 3.10 or higher installed
- [ ] Node.js 18+ and npm installed
- [ ] Expo CLI installed (`npm install -g expo-cli`) or use npx
- [ ] Git installed

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd Green_Lens/backend
```

### 2. Verify Model Files
- [ ] File exists: `../../output_model/flower_img_classifier.keras`
- [ ] File exists: `../../output_model/class_names.json`

### 3. Create Virtual Environment
```bash
python3 -m venv venv
```

### 4. Activate Virtual Environment
- [ ] Linux/Mac: `source venv/bin/activate`
- [ ] Windows: `venv\Scripts\activate`

### 5. Install Dependencies
```bash
pip install -r requirements.txt
```
⏱️ This may take 5-10 minutes

### 6. Test Backend
```bash
python app.py
```
- [ ] Server starts without errors
- [ ] Message shows: "Running on http://0.0.0.0:5000"
- [ ] No model loading errors

### 7. Test API Endpoints
Open a new terminal and run:
```bash
python test_api.py
```
- [ ] All tests pass (4/4)
- [ ] Health check returns healthy status

## Mobile App Setup

### 1. Navigate to App Directory
```bash
cd Green_Lens
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Dependencies Installed
- [ ] `expo` package installed
- [ ] `expo-image-picker` package installed
- [ ] `react-native` package installed

### 4. Configure API Connection

Edit `services/apiService.js` and update `API_BASE_URL`:

#### For Testing on Physical Device:
1. Find your computer's IP address
   - **Windows**: Run `ipconfig`, look for IPv4 Address
   - **Mac**: Run `ifconfig`, look for inet address
   - **Linux**: Run `ip addr`, look for inet address

2. Update the URL:
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP:5000';
   ```
   Example: `http://192.168.1.100:5000`

#### For Emulator/Simulator:
- [ ] **Android Emulator**: `http://10.0.2.2:5000`
- [ ] **iOS Simulator**: `http://localhost:5000`
- [ ] **Web**: `http://localhost:5000`

### 5. Start the App
```bash
npm start
```
- [ ] Expo DevTools opens in browser
- [ ] No build errors

### 6. Run on Device
Choose your platform:
- [ ] Press `a` for Android
- [ ] Press `i` for iOS
- [ ] Press `w` for web

## Testing the Integration

### End-to-End Test

1. Backend Running
   - [ ] Backend server is running (`python app.py`)
   - [ ] Terminal shows "Running on http://0.0.0.0:5000"

2. Mobile App Running
   - [ ] App is running on device/emulator
   - [ ] No connection errors

3. Test API Connection
   - [ ] API status shows "Connected ✓" in app

4. Test Classification
   - [ ] Take/select a flower image
   - [ ] Loading indicator appears
   - [ ] Prediction results display
   - [ ] Confidence percentages shown

### Troubleshooting

If you encounter issues, check:

#### Backend Issues
- [ ] Python version is 3.10+
- [ ] All dependencies installed successfully
- [ ] Model files are in correct location
- [ ] No port conflicts (port 5000 is free)

#### Connection Issues
- [ ] Backend server is running
- [ ] API_BASE_URL is correct
- [ ] Device and computer on same network (for physical devices)
- [ ] Firewall allows connections on port 5000

#### App Issues
- [ ] Node.js version is 18+
- [ ] All npm packages installed
- [ ] Expo SDK version compatible
- [ ] Camera/gallery permissions granted

## Network Configuration

### For Physical Device Testing

1. Find your computer's local IP:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows (PowerShell)
   ipconfig | findstr IPv4
   ```

2. Both devices must be on same WiFi network
   - [ ] Computer connected to WiFi
   - [ ] Phone connected to same WiFi

3. Update API_BASE_URL with your IP
   - [ ] Format: `http://YOUR_IP:5000`
   - [ ] Example: `http://192.168.1.100:5000`

4. Test connectivity
   ```bash
   # On your phone's browser, visit:
   http://YOUR_IP:5000/health
   ```
   - [ ] Returns JSON with health status

### For Emulator Testing

#### Android Emulator
- [ ] Use `http://10.0.2.2:5000` as API_BASE_URL
- [ ] Backend running on host machine

#### iOS Simulator
- [ ] Use `http://localhost:5000` as API_BASE_URL
- [ ] Backend running on host machine

## Production Deployment Checklist

When ready for production:

### Backend
- [ ] Deploy to cloud service (Heroku, AWS, etc.)
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure environment variables
- [ ] Set up monitoring/logging
- [ ] Add rate limiting
- [ ] Configure CORS for specific domain
- [ ] Set DEBUG=False

### Mobile App
- [ ] Update API_BASE_URL to production URL
- [ ] Use HTTPS for API calls
- [ ] Add error tracking (Sentry, etc.)
- [ ] Test on multiple devices
- [ ] Prepare for app store submission
- [ ] Add app icon and splash screen
- [ ] Configure app permissions

## Common Issues

### "Module not found" Error
**Solution**: Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Network request failed"
**Solution**: 
1. Check API_BASE_URL is correct
2. Verify backend is running
3. Test with `curl http://YOUR_API_URL/health`

### "Port 5000 already in use"
**Solution**: 
```bash
# Find process using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or use different port in app.py
```

### Model fails to load
**Solution**:
1. Verify model file path
2. Check Python version matches training (3.10)
3. Ensure all TensorFlow dependencies installed

## Getting Help

If you're stuck:

1. Check the [Integration Guide](INTEGRATION_GUIDE.md)
2. Review [Backend README](backend/README.md)
3. Check error logs in terminal
4. Verify all checklist items completed
5. Test API endpoints with cURL first
6. Review React Native console errors

## Success Criteria

You're ready when:
- ✅ Backend API returns healthy status
- ✅ Mobile app shows "Connected ✓" 
- ✅ Can take/select flower images
- ✅ Predictions display with confidence scores
- ✅ No console errors or warnings

---

**Next Steps After Setup:**
- Customize the UI in FlowerClassificationScreen.jsx
- Add more features (history, favorites, etc.)
- Integrate with navigation
- Add authentication if needed
- Prepare for deployment

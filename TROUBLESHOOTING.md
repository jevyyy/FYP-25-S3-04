# Troubleshooting Guide

Common issues and solutions for the Plant Recognition app integration.

## Backend Issues

### 1. "ModuleNotFoundError: No module named 'tensorflow'"

**Problem:** TensorFlow or other Python dependencies not installed.

**Solution:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. "FileNotFoundError: Model file not found"

**Problem:** The model file path is incorrect.

**Solution:**
- Verify the model file exists:
  ```bash
  ls -la Green_Lens/backend/src/ouput_model/flower_img_classifier.keras
  ```
- Check the path in `backend/src/app.py` (line 17-19)
- Make sure you're running the backend from the correct directory

### 3. "Port 5000 already in use"

**Problem:** Another application is using port 5000.

**Solution:**
```bash
# Option 1: Kill the process using port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000   # Windows (then kill the PID)

# Option 2: Use a different port
PORT=5001 python backend/src/app.py
```

### 4. "ImportError: cannot import name 'load_model'"

**Problem:** TensorFlow version mismatch.

**Solution:**
```bash
pip uninstall tensorflow tf-keras
pip install tensorflow==2.15.0 tf-keras==2.15.1
```

### 5. Backend starts but predictions fail

**Problem:** Model loading issue or corrupted model file.

**Solution:**
1. Check backend logs for error messages
2. Test the health endpoint: `curl http://localhost:5000/health`
3. Verify both class mapping files exist:
   - `Green_Lens/backend/src/camera/class_names.json`
   - `Green_Lens/backend/src/camera/classes_to_name_dictionary.json`

## React Native Issues

### 6. "Unable to resolve module './screens/PlantRecognitionScreen'"

**Problem:** File path issue or file doesn't exist.

**Solution:**
```bash
# Verify file exists
ls -la Green_Lens/screens/PlantRecognitionScreen.js

# Clear Metro bundler cache
cd Green_Lens
npm start -- --reset-cache
```

### 7. "expo-image-picker is not installed"

**Problem:** Missing dependency.

**Solution:**
```bash
cd Green_Lens
npm install expo-image-picker
# or
yarn add expo-image-picker
```

### 8. "Network request failed" when calling API

**Problem:** Cannot connect to backend API.

**Solutions:**

**For iOS Simulator:**
- Use `http://localhost:5000`
- Make sure backend is running

**For Android Emulator:**
- Use `http://10.0.2.2:5000` (not localhost)
- Update `API_BASE_URL` in `services/plantRecognitionApi.js`

**For Physical Device:**
- Find your computer's IP address:
  ```bash
  # macOS/Linux
  ifconfig | grep "inet "
  
  # Windows
  ipconfig
  ```
- Use `http://YOUR_IP:5000` (e.g., `http://192.168.1.100:5000`)
- Ensure device and computer are on same WiFi network
- Check firewall settings on your computer

### 9. "Camera permission denied"

**Problem:** App doesn't have camera permissions.

**Solution:**
- On iOS: Settings > [Your App] > Enable Camera
- On Android: Settings > Apps > [Your App] > Permissions > Enable Camera
- Uninstall and reinstall the app to trigger permission prompt

### 10. Images not uploading

**Problem:** Image format or size issue.

**Solution:**
- Ensure image is JPEG or PNG
- Check image size (should be < 16MB)
- Try with a different image
- Check network connectivity

## Network & Connectivity Issues

### 11. "CORS error" in browser console

**Problem:** Cross-Origin Resource Sharing blocked.

**Solution:**
- Backend already has CORS enabled via flask-cors
- If still having issues, check if the CORS package is installed:
  ```bash
  pip install flask-cors
  ```
- Verify CORS is enabled in `backend/src/app.py` (line 14: `CORS(app)`)

### 12. Requests timeout

**Problem:** Backend is slow or not responding.

**Solutions:**
1. Check if backend is running: `curl http://localhost:5000/health`
2. Increase timeout in the fetch request (in plantRecognitionApi.js)
3. Check server logs for errors
4. Verify model is loaded correctly

### 13. Cannot connect on same network

**Problem:** Firewall blocking connections.

**Solutions:**

**macOS:**
```bash
# Allow incoming connections on port 5000
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/python3
```

**Windows:**
1. Open Windows Defender Firewall
2. Advanced Settings > Inbound Rules > New Rule
3. Port > TCP > Specific local ports: 5000
4. Allow the connection

**Linux:**
```bash
# Allow port 5000
sudo ufw allow 5000/tcp
```

## Development Environment Issues

### 14. "Python command not found"

**Problem:** Python not in PATH.

**Solution:**
- macOS/Linux: Install Python 3 via package manager
  ```bash
  # macOS
  brew install python3
  
  # Ubuntu/Debian
  sudo apt-get install python3 python3-pip
  ```
- Windows: Download from python.org and check "Add to PATH" during installation

### 15. "npm command not found"

**Problem:** Node.js/npm not installed.

**Solution:**
1. Download and install Node.js from nodejs.org
2. Verify installation: `node --version && npm --version`

### 16. Expo app won't start

**Problem:** Metro bundler issues or dependency problems.

**Solution:**
```bash
cd Green_Lens
# Clear cache
npm start -- --reset-cache

# If that doesn't work, reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm start
```

## Docker Issues

### 17. Docker build fails

**Problem:** Dockerfile configuration or missing files.

**Solution:**
- Ensure you're in the project root directory
- Check all paths in docker-compose.yml are correct
- Verify model files exist
- Try building with verbose output:
  ```bash
  docker-compose build --no-cache --progress=plain
  ```

### 18. Container exits immediately

**Problem:** Model files not found or Python error.

**Solution:**
```bash
# Check container logs
docker-compose logs backend

# Run container interactively for debugging
docker-compose run backend /bin/bash
```

## Performance Issues

### 19. Predictions are very slow

**Problem:** CPU-only TensorFlow inference.

**Solutions:**
1. Use a more powerful computer
2. Consider deploying to a cloud service with GPU
3. Reduce image size before sending
4. Use model quantization (requires retraining)

### 20. App crashes when selecting large images

**Problem:** Memory issues.

**Solution:**
- Compress images in React Native before sending:
  ```javascript
  const result = await ImagePicker.launchImageLibraryAsync({
    quality: 0.7,  // Compress to 70%
    maxWidth: 1024,
    maxHeight: 1024,
  });
  ```

## Testing & Debugging

### Useful Commands

**Check if backend is accessible:**
```bash
curl http://localhost:5000/health
```

**Test prediction with an image:**
```bash
curl -X POST -F "image=@/path/to/flower.jpg" http://localhost:5000/predict
```

**View backend logs:**
```bash
# When running directly
python backend/src/app.py

# With Docker
docker-compose logs -f backend
```

**Check React Native logs:**
```bash
# In the Expo terminal, press:
# - 'r' to reload
# - 'j' to open debugger
# - 'd' to toggle developer menu in app
```

**Test API from Python:**
```bash
cd backend
python test_api.py /path/to/test/image.jpg
```

## Getting Help

If you're still experiencing issues:

1. **Check the logs:**
   - Backend: Look at the Flask console output
   - React Native: Check Expo logs and device console

2. **Verify setup:**
   - Backend running on correct port
   - Correct API URL in React Native app
   - All dependencies installed
   - Model files exist

3. **Minimal test:**
   - Test backend with curl
   - Test React Native with health check endpoint
   - Isolate the problem

4. **Review documentation:**
   - [Integration Guide](INTEGRATION_GUIDE.md)
   - [Backend README](backend/README.md)
   - [Main README](README.md)

## Quick Diagnostic Checklist

- [ ] Python 3.8+ installed
- [ ] Backend dependencies installed (`pip list | grep tensorflow`)
- [ ] Model file exists at correct path
- [ ] Backend server running (`curl http://localhost:5000/health`)
- [ ] Correct API URL in React Native app
- [ ] Node.js and npm installed
- [ ] React Native dependencies installed
- [ ] expo-image-picker installed
- [ ] Device/emulator on same network (for physical devices)
- [ ] Firewall not blocking port 5000
- [ ] Permissions granted for camera/gallery

---

Still having issues? Double-check that:
1. Backend is running: `curl http://localhost:5000/health`
2. Network is configured correctly for your device type
3. All file paths are correct
4. Dependencies are installed in both backend and frontend

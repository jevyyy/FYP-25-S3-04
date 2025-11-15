# Model Retraining Feature - Setup Guide

## Quick Setup

### 1. Backend Configuration

**Step 1: Install Python Dependencies**
```bash
cd Green_Lens/backend
pip install -r requirements.txt
```

**Step 2: Verify Firebase Configuration**
- Ensure `service-account.json` exists in `Green_Lens/backend/`
- Verify the file contains valid Firebase credentials
- Confirm storage bucket in `app.py` matches your Firebase project

**Step 3: Start Backend Server**
```bash
cd Green_Lens/backend
python app.py
```

Expected output:
```
* Running on http://0.0.0.0:5000
* Debug mode: on
Firebase Admin SDK initialized successfully
Loading models...
```

### 2. Frontend Configuration

**Step 1: Configure Environment Variables**

1. Copy the example environment file:
```bash
cd Green_Lens/frontend
cp .env.example .env
```

2. Edit `.env` and update the API URL:
```bash
# For local testing on emulator/simulator:
EXPO_PUBLIC_API_URL=http://localhost:5000

# For physical device (iPhone/Android with Expo Go):
# Replace with your computer's IP address
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000

# For production:
# EXPO_PUBLIC_API_URL=https://your-api-domain.com
```

**How to find your IP address:**

*Windows:*
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

*Mac/Linux:*
```bash
ifconfig | grep "inet "
# Look for your local network IP (usually 192.168.x.x or 10.x.x.x)
```

**Important:** 
- The `.env` file is git-ignored and won't be committed
- Restart Expo after changing the `.env` file
- Make sure your phone and computer are on the SAME WiFi network when testing on physical devices

**Step 2: Install Frontend Dependencies**
```bash
cd Green_Lens/frontend
npm install
```

**Step 3: Start Expo**
```bash
npm start
```

### 3. Firestore Database Setup

Ensure your Firestore has the following structure:

```
Collection: modelPhotos
├── Document: flowers
│   └── Subcollection: images
│       └── Documents: (auto-created when uploading images)
│
├── Document: plants
│   └── Subcollection: images
│       └── Documents: (auto-created when uploading images)
│
└── Document: architecture
    └── Subcollection: images
        └── Documents: (auto-created when uploading images)
```

**Note:** This structure is automatically created when you upload your first image through the app.

### 4. Firebase Storage Setup

Ensure your Firebase Storage has write permissions:

**Firebase Console → Storage → Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Testing the Setup

**Quick Test:**
1. Log in to the app as Developer
2. Navigate to Developer_FlowersPage
3. Upload a test image with label "test"
4. Go to Developer_Settings
5. Click "Retrain Model" → Select "Flowers"
6. You should see your test image in the preview

If you see the image, your setup is correct! ✅

## Troubleshooting

### Backend Issues

**Problem: `ModuleNotFoundError: No module named 'tensorflow'`**

Solution:
```bash
pip install tensorflow==2.15.0
```

**Problem: `firebase_admin.exceptions.InvalidArgumentError`**

Solution: Check that `service-account.json` is valid and in the correct location.

**Problem: `Port 5000 already in use`**

Solution: Change the port in `app.py`:
```python
port = int(os.environ.get('PORT', 5001))  # Changed from 5000 to 5001
```

### Frontend Issues

**Problem: `Network request failed`**

Solutions:
1. Verify backend is running (`http://localhost:5000` should show "Not Found" - this is expected)
2. Check firewall settings allow port 5000
3. For mobile devices: Ensure device and computer are on same WiFi network
4. Update API_URL in Developer_Settings.jsx with correct IP

**Problem: Images not appearing in preview**

Solutions:
1. Check Firebase Firestore for uploaded images
2. Verify collection structure is correct
3. Check browser console for errors

### Firebase Issues

**Problem: `Permission denied`**

Solution: Update Firebase Storage and Firestore rules to allow authenticated access.

**Problem: `Bucket not found`**

Solution: Verify bucket name in `app.py` matches your Firebase project:
```python
BUCKET_NAME = 'your-project-id.appspot.com'
```

## Environment Variables (Optional)

For production deployments, you can use environment variables:

Create `.env` file in `Green_Lens/backend/`:
```
FIREBASE_BUCKET=green-lens-47e9b.firebasestorage.app
FLASK_PORT=5000
FLASK_DEBUG=true
```

Update `app.py` to read from environment:
```python
import os
from dotenv import load_dotenv

load_dotenv()

BUCKET_NAME = os.environ.get('FIREBASE_BUCKET', 'green-lens-47e9b.firebasestorage.app')
```

## Performance Optimization

### For Faster Training:

1. **Reduce Epochs:**
   Edit `retrain_model_with_firebase.py`:
   ```python
   self.epoch_head = 5  # Reduced from 10
   self.epoch_finetune = 5  # Reduced from 10
   ```

2. **Increase Batch Size (if you have enough RAM):**
   ```python
   self.batch_size = 16  # Increased from 8
   ```

3. **Reduce Data Augmentation:**
   Comment out some augmentation parameters in `prepare_data_generators()`

### For Better Accuracy:

1. **Increase Epochs:**
   ```python
   self.epoch_head = 15
   self.epoch_finetune = 15
   ```

2. **Use More Training Data:**
   - Upload at least 20-30 images per class
   - Ensure good variety in images

## Network Configuration

### Allowing Remote Connections

If you want to access the backend from other devices:

**Step 1: Update Flask to listen on all interfaces**

In `app.py`, this is already configured:
```python
app.run(host='0.0.0.0', port=port, debug=True)
```

**Step 2: Configure Firewall**

*Windows Firewall:*
```powershell
netsh advfirewall firewall add rule name="Flask Backend" dir=in action=allow protocol=TCP localport=5000
```

*Mac:*
```bash
# System Preferences → Security & Privacy → Firewall → Firewall Options
# Allow incoming connections for Python
```

*Linux:*
```bash
sudo ufw allow 5000/tcp
```

## Production Deployment

For production use, consider:

1. **Use a production WSGI server** (not Flask's built-in server):
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

2. **Set up HTTPS** with a reverse proxy (nginx/Apache)

3. **Use environment variables** for sensitive configuration

4. **Implement request rate limiting**

5. **Add authentication** to the `/api/retrain` endpoint

6. **Set up logging** and monitoring

7. **Use a queue system** (Celery, RabbitMQ) for long-running training tasks

## Support

For additional help:
- See `MODEL_RETRAINING_GUIDE.md` for detailed feature documentation
- See `TESTING_RETRAINING_FEATURE.md` for testing procedures
- Check backend logs for detailed error messages
- Check Firebase Console for storage/database issues

## Next Steps

Once setup is complete:
1. Follow `TESTING_RETRAINING_FEATURE.md` to test the feature
2. Upload training images through the app
3. Trigger your first model retraining
4. Verify the new model works correctly

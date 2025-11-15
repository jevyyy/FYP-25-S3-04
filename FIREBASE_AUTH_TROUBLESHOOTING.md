# Firebase Authentication Troubleshooting Guide

## Error: "Invalid JWT Signature" or "503 Getting metadata from plugin failed"

This error occurs when the Firebase service account credentials are invalid, expired, or improperly configured.

---

## Quick Fix

### Step 1: Verify Service Account File

**Location:** `Green_Lens/backend/service-account.json`

Check if the file exists and is valid JSON:
```bash
cd Green_Lens/backend
cat service-account.json | python -m json.tool
```

If you get an error, the file is corrupted or invalid.

---

## Root Causes & Solutions

### 1. Invalid or Expired Service Account Credentials

**Symptom:** Error message shows "Invalid JWT Signature"

**Cause:** The service account key file is:
- Corrupted
- From a different Firebase project
- Expired or revoked
- Contains syntax errors

**Solution:**

1. **Generate a new service account key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `green-lens-47e9b`
   - Go to **Project Settings** (gear icon) → **Service accounts**
   - Click **Generate new private key**
   - Save as `service-account.json` in `Green_Lens/backend/`

2. **Verify the file structure:**
   ```json
   {
     "type": "service_account",
     "project_id": "green-lens-47e9b",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@green-lens-47e9b.iam.gserviceaccount.com",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "...",
     "universe_domain": "googleapis.com"
   }
   ```

3. **Important checks:**
   - ✅ `private_key` should start with `-----BEGIN PRIVATE KEY-----`
   - ✅ `private_key` should end with `-----END PRIVATE KEY-----\n`
   - ✅ `private_key` should contain `\n` characters (not actual newlines)
   - ✅ `project_id` should be `green-lens-47e9b`
   - ✅ No extra commas or syntax errors

---

### 2. Wrong Firebase Project

**Symptom:** Valid service account but still getting authentication errors

**Cause:** The service account is from a different Firebase project

**Solution:**

1. Verify project ID matches:
   ```bash
   cd Green_Lens/backend
   grep "project_id" service-account.json
   # Should show: "project_id": "green-lens-47e9b"
   ```

2. Check bucket name in `app.py`:
   ```python
   BUCKET_NAME = 'green-lens-47e9b.firebasestorage.app'
   ```

3. Ensure they match your Firebase Console project

---

### 3. Corrupted JSON File

**Symptom:** Error parsing service account file

**Cause:** File got corrupted during copy/paste or download

**Solution:**

1. **Validate JSON syntax:**
   ```bash
   cd Green_Lens/backend
   python -c "import json; json.load(open('service-account.json'))"
   ```

2. **Common issues:**
   - Missing commas between fields
   - Extra commas at the end of objects
   - Unescaped quotes in strings
   - Missing closing braces

3. **Fix:** Re-download from Firebase Console

---

### 4. File Permissions Issue

**Symptom:** File exists but can't be read

**Cause:** Incorrect file permissions

**Solution:**

**Windows:**
```powershell
# Check file exists
dir service-account.json

# Ensure it's readable
icacls service-account.json
```

**Mac/Linux:**
```bash
# Check file exists
ls -la service-account.json

# Ensure it's readable
chmod 600 service-account.json
```

---

### 5. Multiple Firebase App Initializations

**Symptom:** Intermittent authentication errors

**Cause:** Firebase Admin SDK initialized multiple times with different credentials

**Solution:**

The code already handles this, but if you modified it:

```python
# Correct approach (already implemented):
try:
    firebase_admin.get_app()
except ValueError:
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred, {
        'storageBucket': bucket_name
    })
```

---

## How to Observe Successful Retraining

When the feature works correctly, you should see:

### 1. Backend Console Logs (Progress Indicators)

```
================================================================================
Starting retraining for category: plants
Delete images after training: True
================================================================================

================================================================================
Downloading plants images from Firebase Storage...
================================================================================

Downloaded: rose/image1.jpg
Downloaded: rose/image2.jpg
...
Download Summary:
Total images downloaded: 15
Classes found: 3
  - rose: 5 images
  - tulip: 5 images
  - daisy: 5 images
================================================================================

Preparing data generators...
Found 12 training images belonging to 3 classes.
Found 3 validation images
Class Mapping: {'rose': 0, 'tulip': 1, 'daisy': 2}

Building model...
Model: "model"
_________________________________________________________________

--- Training the classifier head ---
Epoch 1/10
[Progress bars showing training]
...

--- Preparing for Fine-Tuning ---
--- Fine-tuning the top layers of the base model ---
Epoch 11/20
[Progress bars showing fine-tuning]
...

--- Final Model Evaluation ---
Final Validation Loss: 0.2345
Final Validation Accuracy: 0.9500

================================================================================
Saving Model and Metadata
================================================================================

Model saved to: downloaded_model/plants_img_classifier.keras
Model saved in .h5 format to: downloaded_model/plants_img_classifier.h5
Class mapping saved to: downloaded_model/plants_class_names.json

================================================================================
Uploading to Firebase Storage
================================================================================

Uploaded model to: plants_best_model.keras
Uploaded class names to: plants_class_names.json

Upload complete!

================================================================================
Deleting plants training images from Firebase...
================================================================================

Deleted from storage: modelPhotos/plants/rose.jpg
Deleted 15 images from Firebase

================================================================================
RETRAINING COMPLETE!
================================================================================
```

### 2. Frontend Success Message

After 5-30 minutes (depending on dataset size), you should see:

**Alert Dialog:**
```
Success

Model retraining completed successfully for plants!

Training images have been deleted.
```

OR

```
Success

Model retraining completed successfully for plants!

Training images have been kept for future training.
```

### 3. Expected Timeline

| Phase | Duration | What Happens |
|-------|----------|--------------|
| Connection | 1-2 sec | App connects to backend |
| Download Images | 10-60 sec | Downloads images from Firebase |
| Data Preparation | 5-10 sec | Organizes images, creates generators |
| Train Head | 3-8 min | Trains classifier layers (10 epochs) |
| Fine-tune | 3-8 min | Fine-tunes MobileNetV2 layers (10 epochs) |
| Save & Upload | 30-60 sec | Saves model, uploads to Firebase |
| Cleanup | 5-10 sec | Deletes training images (if selected) |
| **Total** | **5-15 min** | For small datasets (15-50 images) |

### 4. Firebase Console Verification

After successful retraining, check Firebase:

**Storage:**
- `plants_best_model.keras` - Should have new timestamp
- `plants_class_names.json` - Should have new timestamp

**Firestore (if "Delete Images" selected):**
- `modelPhotos/plants/images/` - Should be empty

---

## Testing Your Fix

After regenerating the service account key:

1. **Stop the backend:**
   ```bash
   # Press Ctrl+C in the terminal running python app.py
   ```

2. **Replace service-account.json:**
   ```bash
   cd Green_Lens/backend
   # Delete old file
   rm service-account.json
   
   # Download new one from Firebase Console
   # Save it as service-account.json in this directory
   ```

3. **Verify the file:**
   ```bash
   python -c "import json; print('Valid JSON') if json.load(open('service-account.json')) else None"
   ```

4. **Restart backend:**
   ```bash
   python app.py
   ```

5. **Test in app:**
   - Open app
   - Go to Developer Settings → Retrain Model
   - Click "Test Backend Connection" - should succeed
   - Try retraining again

---

## Common Mistakes

### ❌ Mistake 1: Using Old Service Account Key
Service account keys can be revoked or expire.

### ✅ Solution:
Always generate a fresh key when troubleshooting.

### ❌ Mistake 2: Copying Key Incorrectly
Copy/paste can introduce line breaks or encoding issues.

### ✅ Solution:
Download directly from Firebase Console (don't copy/paste the JSON).

### ❌ Mistake 3: Wrong Project
Using service account from a different Firebase project.

### ✅ Solution:
Verify `project_id` matches your Firebase Console.

### ❌ Mistake 4: Missing Newlines in Private Key
The `private_key` field must contain `\n` characters (literal backslash-n), not actual newlines.

### ✅ Solution:
If you see actual line breaks in the private key, the file is corrupted. Re-download.

---

## Debugging Steps

### 1. Enable Verbose Logging

Add this to `retrain_model_with_firebase.py` (line 48):

```python
self.db = firestore.client()
print(f"Firestore client created for project: {self.db.project}")
self.bucket = storage.bucket()
print(f"Storage bucket: {self.bucket.name}")
```

### 2. Test Firebase Connection Separately

Create `test_firebase.py` in `Green_Lens/backend/`:

```python
import firebase_admin
from firebase_admin import credentials, firestore, storage

try:
    cred = credentials.Certificate('service-account.json')
    app = firebase_admin.initialize_app(cred, {
        'storageBucket': 'green-lens-47e9b.firebasestorage.app'
    })
    
    # Test Firestore
    db = firestore.client()
    print(f"✓ Firestore connected: {db.project}")
    
    # Test Storage
    bucket = storage.bucket()
    print(f"✓ Storage connected: {bucket.name}")
    
    # Test read access
    test_ref = db.collection('modelPhotos').document('plants').collection('images')
    images = list(test_ref.limit(1).stream())
    print(f"✓ Firestore read access: {len(images)} documents found")
    
    print("\n✓ All Firebase services working!")
    
except Exception as e:
    print(f"✗ Firebase connection failed: {e}")
    import traceback
    traceback.print_exc()
```

Run:
```bash
cd Green_Lens/backend
python test_firebase.py
```

### 3. Check Firebase Service Status

Visit: https://status.firebase.google.com/

If Firebase services are down, you'll see errors even with valid credentials.

---

## Prevention

To avoid this issue in the future:

1. **Secure storage:** Keep service account key in a secure location
2. **Version control:** Never commit `service-account.json` to git (already in `.gitignore`)
3. **Documentation:** Document where to get a fresh key
4. **Backup:** Keep a backup copy in secure storage
5. **Monitoring:** Set up Firebase Console alerts for authentication failures

---

## Still Not Working?

### Get Firebase Project Details

```bash
cd Green_Lens/backend
python -c "
import json
with open('service-account.json') as f:
    data = json.load(f)
    print('Project ID:', data['project_id'])
    print('Client Email:', data['client_email'])
    print('Private Key ID:', data['private_key_id'][:20] + '...')
    print('Private Key Length:', len(data['private_key']))
"
```

Expected output:
```
Project ID: green-lens-47e9b
Client Email: firebase-adminsdk-xxxxx@green-lens-47e9b.iam.gserviceaccount.com
Private Key ID: 1234567890abcdef...
Private Key Length: 1600-1700 (approximately)
```

### Contact Support

If you've tried everything and it still doesn't work:

1. **Verify Firebase permissions:**
   - Go to Firebase Console
   - Check IAM & Admin → Service Accounts
   - Ensure the service account has required roles:
     - Firebase Admin SDK Administrator Service Agent
     - Cloud Datastore User
     - Storage Admin

2. **Create a new service account:**
   - Sometimes the service account itself is corrupted
   - Create a brand new one with all permissions

3. **Check quota limits:**
   - Firebase may have usage limits
   - Check Console for quota warnings

---

## Success Indicators

✅ **Everything is working when:**
1. Backend starts without Firebase errors
2. `test_firebase.py` runs successfully
3. Backend console shows image downloads
4. Training progress is visible in console
5. Model uploads to Firebase successfully
6. App shows success message after retraining

---

## Quick Reference

### Generate New Service Account Key

1. Go to https://console.firebase.google.com/
2. Select project: `green-lens-47e9b`
3. Project Settings (gear icon) → Service accounts
4. Click "Generate new private key"
5. Confirm and download
6. Save as `Green_Lens/backend/service-account.json`
7. Restart backend: `python app.py`

### Verify File

```bash
cd Green_Lens/backend

# Check exists
ls -l service-account.json

# Validate JSON
python -m json.tool service-account.json > /dev/null && echo "Valid JSON" || echo "Invalid JSON"

# Check project ID
grep "project_id" service-account.json
```

### Test Connection

```bash
cd Green_Lens/backend
python test_firebase.py
```

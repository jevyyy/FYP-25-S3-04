# Testing Guide: Model Retraining Feature

## Overview
This guide provides step-by-step instructions for testing the newly implemented model retraining feature.

## Prerequisites

### Backend Setup
1. **Python Dependencies**
   ```bash
   cd Green_Lens/backend
   pip install -r requirements.txt
   ```

2. **Firebase Configuration**
   - Ensure `service-account.json` is present in the backend directory
   - Verify Firebase Storage bucket: `green-lens-47e9b.firebasestorage.app`
   - Confirm Firestore collections exist:
     - `modelPhotos/flowers/images`
     - `modelPhotos/plants/images`
     - `modelPhotos/architecture/images`

3. **Start Backend Server**
   ```bash
   cd Green_Lens/backend
   python app.py
   # Server should start on http://localhost:5000
   ```

### Frontend Setup
1. **Install Dependencies**
   ```bash
   cd Green_Lens/frontend
   npm install
   ```

2. **Configure Environment Variables**
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and set your backend URL:
     ```bash
     # For local testing (emulator/simulator):
     EXPO_PUBLIC_API_URL=http://localhost:5000
     
     # For physical device testing:
     EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_IP>:5000
     ```
   - Find your IP address:
     - Windows: `ipconfig` (look for IPv4 Address)
     - Mac/Linux: `ifconfig | grep "inet"`

3. **Start Expo**
   ```bash
   npm start
   ```
   
   **Note:** Restart Expo if you change the `.env` file after starting it.

## Test Cases

### Test Case 1: Upload Training Images

**Objective**: Verify that developers can upload images with class labels

**Steps:**
1. Log in as Developer
2. Navigate to Developer_FlowersPage (or PlantsPage/ArchitecturesPage)
3. Click "New Flower" button
4. Select an image from device storage
5. Enter a class label (e.g., "rose", "tulip", "sunflower")
6. Click "Upload"

**Expected Result:**
- Image appears in the grid
- Image is stored in Firebase Storage at `modelPhotos/flowers/<class_name>.jpg`
- Firestore document created in `modelPhotos/flowers/images` collection
- Success alert shown

**Repeat for:**
- At least 3 different class labels
- Minimum 5 images per class
- All three categories (flowers, plants, architecture)

---

### Test Case 2: View Uploaded Images in Settings

**Objective**: Verify that uploaded images can be previewed before retraining

**Steps:**
1. Log in as Developer
2. Navigate to Developer_Settings
3. Expand "Retrain Model" section
4. Click "Retrain Model" button
5. Select a category (e.g., "Flowers")

**Expected Result:**
- Modal opens showing all uploaded images for that category
- Images are organized and displayed in a grid
- Each image shows its class label
- "Back" and "Retrain" buttons are visible

---

### Test Case 3: Model Retraining - Delete Images After

**Objective**: Verify successful model retraining with image deletion

**Steps:**
1. Complete Test Case 1 (upload at least 10-15 images across multiple classes)
2. Navigate to Developer_Settings → Retrain Model
3. Click "Retrain Model" button
4. Select category with uploaded images
5. Review the image preview
6. Click "Retrain" button
7. When prompted, select "Delete Images"

**Expected Result:**
- Training overlay appears with message: "Retraining model for [category]..."
- Backend console shows:
  - "Downloading [category] images from Firebase Storage..."
  - Download progress for each image
  - "Preparing data generators..."
  - "Building model..."
  - "Training the classifier head..."
  - Training progress (epochs, loss, accuracy)
  - "Fine-tuning the top layers..."
  - "Saving Model and Metadata"
  - "Uploading to Firebase Storage"
  - "Deleting [category] training images from Firebase..."
- After 5-15 minutes:
  - Training overlay disappears
  - Success alert shown: "Model retraining completed successfully!"
  - Training images deleted from Firebase
  - New model uploaded to Firebase Storage

**Verify:**
- Check Firebase Storage for new model file: `<category>_best_model.keras`
- Check Firebase Storage for new class names: `<category>_class_names.json`
- Confirm training images are deleted from Firestore and Storage
- Test the new model by taking a photo with the updated category

---

### Test Case 4: Model Retraining - Keep Images

**Objective**: Verify retraining with image retention for cumulative training

**Steps:**
1. Upload additional images (5-10 new images)
2. Navigate to Developer_Settings → Retrain Model
3. Click "Retrain Model" button
4. Select the same category
5. Click "Retrain" button
6. When prompted, select "Keep Images"

**Expected Result:**
- Training proceeds as in Test Case 3
- Success alert: "Model retraining completed successfully! Training images have been kept for future training."
- Training images remain in Firebase
- Model is updated with improved accuracy

**Verify:**
- Images still exist in Firebase Storage and Firestore
- Model file is updated (check timestamp)
- Can retrain again with additional images

---

### Test Case 5: Adding New Class Labels

**Objective**: Verify that new classes can be added to existing model

**Setup:**
- Assume model was trained with classes: ["rose", "tulip", "daisy"]

**Steps:**
1. Upload 10+ images of a NEW flower class (e.g., "sunflower")
2. Set class label to "sunflower"
3. Navigate to Developer_Settings → Retrain Model
4. Select "Flowers"
5. Verify new "sunflower" images appear in preview
6. Click "Retrain"
7. Choose "Delete Images"

**Expected Result:**
- Model retrains successfully
- Output layer updated from 3 classes to 4 classes
- New class is recognized in the app
- Existing classes still work correctly

**Verify:**
- Take photos of all 4 flower types
- Confirm correct classification for both old and new classes

---

### Test Case 6: Error Handling - No Images

**Objective**: Verify proper error handling when no images exist

**Steps:**
1. Ensure no training images exist for a category
2. Navigate to Developer_Settings → Retrain Model
3. Click "Retrain Model" button
4. Select the empty category
5. Click "Retrain"

**Expected Result:**
- Empty image grid shown in preview
- Training still initiated if user proceeds
- Backend logs: "No images found in Firebase. Aborting training."
- Error alert shown: "Model retraining failed. Please try again."
- No changes to existing model

---

### Test Case 7: Error Handling - Network Failure

**Objective**: Verify graceful handling of network errors

**Steps:**
1. Start retraining process
2. Disconnect network mid-training (or stop backend server)

**Expected Result:**
- Timeout error after reasonable wait
- Error alert: "Failed to retrain model: [error message]"
- Training overlay disappears
- User can retry

---

### Test Case 8: Multiple Categories

**Objective**: Verify each category can be retrained independently

**Steps:**
1. Upload images for all three categories:
   - Flowers: 3 classes, 5 images each
   - Plants: 3 classes, 5 images each
   - Architecture: 3 classes, 5 images each
2. Retrain Flowers category
3. Retrain Plants category
4. Retrain Architecture category

**Expected Result:**
- Each category retrains successfully
- Models don't interfere with each other
- All three models updated in Firebase
- Classification works correctly for all categories

---

### Test Case 9: UI/UX Validation

**Objective**: Verify user interface works correctly

**Checklist:**
- [ ] Category selection buttons are clearly labeled
- [ ] Image grid displays properly (2 columns)
- [ ] Images load and display correctly
- [ ] Modal can be dismissed by clicking outside or "Cancel"
- [ ] Training overlay is visible and centered
- [ ] Training progress message is clear
- [ ] Success/error alerts are informative
- [ ] "Back" button returns to category selection
- [ ] "Retrain" button is clearly labeled
- [ ] Confirmation dialog for image deletion is clear

---

### Test Case 10: Performance Testing

**Objective**: Measure training time and resource usage

**Test Data:**
- Small dataset: 3 classes, 5 images each (15 total)
- Medium dataset: 5 classes, 10 images each (50 total)
- Large dataset: 10 classes, 20 images each (200 total)

**Measure:**
- Download time from Firebase
- Training time (head training)
- Training time (fine-tuning)
- Upload time to Firebase
- Total duration
- Memory usage
- CPU usage

**Expected Performance:**
- Small dataset: 5-8 minutes
- Medium dataset: 10-15 minutes
- Large dataset: 20-30 minutes

---

## Known Limitations

1. **Training Duration**: Training can take 5-30 minutes depending on dataset size
2. **Memory Requirements**: Requires ~4GB RAM for training
3. **Network Dependency**: Requires stable internet for Firebase operations
4. **Concurrent Training**: Only one training session at a time
5. **Image Format**: Only JPEG and PNG supported
6. **Class Names**: Case-sensitive, use lowercase for consistency

## Troubleshooting

### Issue: Backend won't start
**Solution:** 
- Check that all dependencies are installed
- Verify `service-account.json` exists
- Check port 5000 is available

### Issue: "Failed to download images"
**Solution:**
- Verify Firebase Storage permissions
- Check network connectivity
- Confirm images exist in Firestore

### Issue: "Out of memory" error
**Solution:**
- Reduce batch size in training script (line 54)
- Close other applications
- Use a machine with more RAM

### Issue: Training takes too long
**Solution:**
- Reduce number of epochs (lines 55-56)
- Use fewer images for testing
- Reduce data augmentation

### Issue: Frontend can't reach backend
**Solution:**
- Verify backend is running
- Check API_URL in Developer_Settings.jsx
- Ensure firewall allows port 5000
- For mobile device: use computer's IP address, not localhost

## Success Criteria

All tests pass if:
1. ✅ Images can be uploaded with class labels
2. ✅ Uploaded images are visible in preview
3. ✅ Model retrains successfully for all categories
4. ✅ New models are deployed to Firebase
5. ✅ Image deletion option works correctly
6. ✅ New classes can be added to existing models
7. ✅ Error handling works as expected
8. ✅ UI is intuitive and responsive
9. ✅ Performance meets expectations
10. ✅ Retrained models improve classification accuracy

## Reporting Issues

When reporting issues, include:
1. Test case number
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots/videos if applicable
5. Backend console logs
6. Frontend console logs (React Native debugger)
7. Device information (OS, version)
8. Network conditions

## Next Steps After Testing

1. Document any bugs found
2. Create tickets for fixes
3. Update documentation with any discoveries
4. Consider additional features:
   - Progress tracking during training
   - Model versioning
   - A/B testing of models
   - Automated testing with validation set
   - Training history logs

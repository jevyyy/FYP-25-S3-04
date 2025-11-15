# Critical Fix: Model File Naming Mismatch

## Problem Discovery

After implementing both the class preservation and class index mapping fixes, users reported that **new classes were still not being recognized** after retraining, even though:
- Class names were correctly preserved in the JSON file
- Class indices were properly aligned
- Training completed successfully

## Root Cause Analysis

The issue was a **filename mismatch** between what the retraining script saved and what the app expected:

### The Problem

**Retraining Script (`retrain_model_with_firebase.py`):**
```python
# Saved locally as:
model_save_path = f'{category}_img_classifier.keras'  # e.g., plant_img_classifier.keras

# Uploaded to Firebase as:
model_blob = f'{category}_best_model.keras'  # e.g., plant_best_model.keras
```

**App.py:**
```python
# Expected filename:
'model_file': 'plant_best_model.keras'

# Load function behavior:
files_exist = os.path.exists(local_model_path)
if not files_exist:
    download_file_from_firebase(...)  # Download from Firebase
else:
    # Use existing local file (OLD MODEL!)
    models[category] = load_model(local_model_path)
```

### Why This Caused Issues

1. **Initial state:** App has old model as `plant_best_model.keras` locally
2. **Retraining:** Script saves new model as `plant_img_classifier.keras` locally
3. **Upload:** Script uploads new model to Firebase as `plant_best_model.keras`
4. **Reload:** App calls `load_model_and_classes_for_category('plant')`
5. **Check:** App finds `plant_best_model.keras` exists locally (the OLD file)
6. **Skip download:** App skips downloading from Firebase
7. **Load OLD model:** App loads the old `plant_best_model.keras` file
8. **Result:** New classes not recognized because old model is still being used!

### Sequence Diagram

```
Before Retraining:
  Local:    plant_best_model.keras (old, 10 classes)
  Firebase: plant_best_model.keras (old, 10 classes)

After Retraining (BEFORE FIX):
  Local:    plant_best_model.keras (old, 10 classes) ← Still here!
            plant_img_classifier.keras (new, 11 classes) ← Saved here
  Firebase: plant_best_model.keras (new, 11 classes) ← Uploaded correctly

On Reload (BEFORE FIX):
  App checks: plant_best_model.keras exists? YES (old file)
  App action: Skip download, load local file
  Result: OLD MODEL LOADED ❌

After Retraining (AFTER FIX):
  Local:    plant_best_model.keras (new, 11 classes) ← Directly saved here!
            plant_img_classifier.keras (new, 11 classes) ← Also saved for compatibility
  Firebase: plant_best_model.keras (new, 11 classes) ← Uploaded correctly

On Reload (AFTER FIX):
  App checks: plant_best_model.keras exists? YES (new file)
  App action: Force reload from disk (with force_reload=True)
  Result: NEW MODEL LOADED ✅
```

## Solution

The fix involves two changes:

### 1. Save Model with Correct Filename

**Modified:** `save_model_and_metadata()` in `retrain_model_with_firebase.py`

```python
# BEFORE:
model_save_path = self.output_dir / f'{category_singular}_img_classifier.keras'

# AFTER:
model_save_path = self.output_dir / f'{category_singular}_best_model.keras'
# Also save with img_classifier name for backward compatibility
img_classifier_path = self.output_dir / f'{category_singular}_img_classifier.keras'
model.save(str(img_classifier_path))
```

**Why:** Saves the model with the filename that app.py expects, ensuring the local file is updated correctly.

### 2. Force Model Reload

**Modified:** `load_model_and_classes_for_category()` in `app.py`

```python
# BEFORE:
def load_model_and_classes_for_category(category):
    # ... loads model from disk or Firebase

# AFTER:
def load_model_and_classes_for_category(category, force_reload=False):
    # ... with force_reload parameter
    if force_reload:
        print(f"Force reloading {category} model from local files (after retraining)")
    # Always loads from disk, ensuring new model is used
```

**And in the retrain endpoint:**

```python
# BEFORE:
load_model_and_classes_for_category(category_key)

# AFTER:
load_model_and_classes_for_category(category_key, force_reload=True)
```

**Why:** Even though the file exists locally, we force Keras to reload it from disk, ensuring the new model is loaded into memory.

## Complete Fix Flow

```
1. User triggers retraining via app
   
2. Retraining script runs:
   - Downloads new images
   - Merges classes (preserves existing)
   - Creates placeholders for existing classes
   - Trains with correct class indices
   - Saves model as plant_best_model.keras ✅ (correct name)
   - Saves model as plant_img_classifier.keras (compatibility)
   - Saves class names with merged mapping
   - Uploads to Firebase as plant_best_model.keras
   
3. App reloads model:
   - Calls load_model_and_classes_for_category('plant', force_reload=True)
   - Force reloads from local plant_best_model.keras (new model!)
   - Loads merged class names JSON
   
4. Result:
   - App has new model in memory ✅
   - New classes are recognized ✅
   - Existing classes still work ✅
```

## Testing

To verify the fix works:

1. **Check local files before retraining:**
   ```bash
   ls -lh Green_Lens/backend/downloaded_model/plant_*
   # Should see plant_best_model.keras with old timestamp
   ```

2. **Trigger retraining with new class**

3. **Check local files after retraining:**
   ```bash
   ls -lh Green_Lens/backend/downloaded_model/plant_*
   # Should see plant_best_model.keras with NEW timestamp
   # Should also see plant_img_classifier.keras
   ```

4. **Test classification:**
   ```bash
   # Send test image of new class
   # Should be correctly classified as new class ✅
   ```

## Key Takeaways

1. **Filename consistency is critical** - Retraining and app must use same filenames
2. **Local file caching can be problematic** - Must ensure new files replace old ones
3. **Force reload is necessary** - Even with correct filename, must reload from disk
4. **Backward compatibility** - Save both filenames during transition period

## Impact

This fix is essential for the retraining feature to work at all. Without it:
- ❌ Old model continues to be used after retraining
- ❌ New classes appear as "UNKNOWN" or get misclassified
- ❌ Users think retraining failed
- ❌ Training time and resources wasted

With the fix:
- ✅ New model is properly saved and loaded
- ✅ New classes are recognized immediately
- ✅ Retraining works as intended
- ✅ Resources are used effectively

## Related Issues

This fix completes the trilogy of retraining fixes:
1. **Class Preservation** - Existing classes not lost
2. **Class Index Mapping** - New classes map to correct neurons
3. **Model File Naming** - New model actually gets loaded (THIS FIX)

All three are required for incremental class addition to work correctly!

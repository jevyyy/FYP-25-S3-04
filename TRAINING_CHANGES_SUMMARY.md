# File Correlation Analysis and Changes Summary

## Original Structure Analysis

### File Correlations:

1. **downloaded_model folders:**
   - `Green_Lens/backend/downloaded_model/` - Used by `app.py` (line 23) for runtime model loading
   - `Green_Lens/backend/src/downloaded_model/` - **REDUNDANT** - Duplicate of the above
   
2. **output_model folders:**
   - `Green_Lens/backend/src/ouput_model/` (typo) - Used by training scripts to store trained models
   
3. **Model training:**
   - `model_training_script.py` - Original training script with hardcoded paths
   
4. **Model usage:**
   - `app.py` - Flask API that loads models from `downloaded_model/`
   - Downloads models from Firebase Storage at runtime

### Redundancy Identified:

The `src/downloaded_model/` folder was an exact duplicate of `backend/downloaded_model/`:
- Both contained identical files: `flower_img_classifier.keras`, `class_names.json`, `classes_to_name_dictionary.json`
- Only `backend/downloaded_model/` is referenced in `app.py`
- `src/downloaded_model/` was already in `.gitignore`

## Changes Made

### 1. Removed Redundant Folder ✅
- **Deleted:** `Green_Lens/backend/src/downloaded_model/`
- **Reason:** Duplicate of `backend/downloaded_model/`, not referenced anywhere
- **Impact:** Reduced repository size, eliminated confusion

### 2. Fixed Typo ✅
- **Renamed:** `src/ouput_model/` → `src/output_model/`
- **Reason:** Correct spelling for consistency
- **Impact:** Better code clarity

### 3. Updated .gitignore ✅
Added the following to prevent committing:
```
backend/src/output_model/
Green_Lens/backend/venv/
Green_Lens/backend/src/output_model/
Green_Lens/backend/src/downloaded_model/
```

### 4. Enhanced model_training_script.py ✅

**Changes:**
- ✅ **Dynamic paths:** Uses `pathlib.Path` for cross-platform compatibility
- ✅ **Output to src/output_model/:** All outputs now go to dynamically resolved `src/output_model/`
- ✅ **Enhanced preprocessing:** Added comprehensive data preprocessing
- ✅ **Data augmentation:** 
  - Rotation (±40°)
  - Width/height shifts (±20%)
  - Shear transformations (±20%)
  - Zoom (±20%)
  - Horizontal flips
  - Brightness adjustments (80-120%)
- ✅ **Training callbacks:**
  - EarlyStopping (patience=5)
  - ReduceLROnPlateau (factor=0.5, patience=3)
  - ModelCheckpoint (saves best model)
- ✅ **Enhanced architecture:**
  - Deeper network: 256→128 neurons (was 128)
  - More dropout: 0.3 and 0.2 (was 0.2)
- ✅ **Better logging:** More informative output during training
- ✅ **Configuration saved:** Saves training_config.json for reproducibility

### 5. Created ensemble_training_script.py ✅

**New Features:**
- ✅ **Homogeneous ensemble learning:** Multiple identical architectures
- ✅ **Bagging method:** Bootstrap aggregating with 5 models (configurable)
- ✅ **Bootstrap sampling:** Each model trained with different random seed
- ✅ **Prediction averaging:** Ensemble averages predictions from all models
- ✅ **Individual model saving:** Saves each model separately
- ✅ **Ensemble model saving:** Saves combined ensemble model
- ✅ **Same preprocessing/augmentation:** Consistent with single model script
- ✅ **Dynamic paths:** Uses same path resolution as single model script
- ✅ **Comprehensive output:** Saves all models, configs, and metadata

### 6. Created README_TRAINING.md ✅

**Documentation includes:**
- ✅ Overview of both training scripts
- ✅ Usage instructions
- ✅ Expected dataset structure
- ✅ Output structure for both scripts
- ✅ Preprocessing and augmentation details
- ✅ Model architecture explanation
- ✅ Training strategy (two-stage training)
- ✅ Ensemble method explanation (bagging)
- ✅ Hardware requirements
- ✅ Estimated training times
- ✅ Code examples for using trained models
- ✅ Troubleshooting guide

## File Correlation After Changes

```
Green_Lens/backend/
├── downloaded_model/              # Runtime models (from Firebase)
│   ├── flower_img_classifier.keras
│   ├── class_names.json
│   └── classes_to_name_dictionary.json
│
├── app.py                         # Uses downloaded_model/
│
└── src/
    ├── output_model/              # Training outputs (gitignored)
    │   ├── flower_img_classifier_new.keras
    │   ├── flower_img_classifier_new.h5
    │   ├── flower_img_classifier_ensemble.keras
    │   ├── flower_img_classifier_ensemble.h5
    │   ├── class_names.json
    │   ├── training_config.json
    │   └── individual_models/
    │       ├── model_0.keras
    │       ├── model_1.keras
    │       └── ...
    │
    └── utils/
        ├── model_training_script.py         # Single model training
        ├── ensemble_training_script.py      # Ensemble training
        └── README_TRAINING.md               # Documentation
```

## Path Flow

### Training Flow:
1. **Input:** User provides dataset path (update `DATASET_BASE` in scripts)
2. **Processing:** Scripts dynamically resolve `SRC_DIR / 'output_model'`
3. **Output:** All models saved to `Green_Lens/backend/src/output_model/`

### Deployment Flow:
1. **Training:** Models saved to `src/output_model/`
2. **Manual Upload:** User uploads models to Firebase Storage
3. **Runtime:** `app.py` downloads from Firebase to `downloaded_model/`
4. **Serving:** API uses models from `downloaded_model/`

## Benefits of Changes

1. **Eliminated Redundancy:**
   - Removed duplicate `src/downloaded_model/` folder
   - Clearer separation of concerns

2. **Improved Flexibility:**
   - Dynamic paths work on any machine
   - Easy to update dataset location
   - Cross-platform compatible (Windows/Linux/Mac)

3. **Enhanced Training:**
   - Better preprocessing and augmentation
   - Improved model architecture
   - Training callbacks for better convergence
   - Reproducible training with saved configs

4. **Ensemble Learning:**
   - New option for improved accuracy
   - Bagging method reduces overfitting
   - Multiple models for robustness
   - Easy to configure number of models

5. **Better Documentation:**
   - Comprehensive guide for training
   - Clear usage instructions
   - Troubleshooting help
   - Code examples

## Usage Examples

### Training a Single Model:
```bash
cd Green_Lens/backend/src/utils
# Update DATASET_BASE in model_training_script.py
python model_training_script.py
```

### Training an Ensemble:
```bash
cd Green_Lens/backend/src/utils
# Update DATASET_BASE in ensemble_training_script.py
python ensemble_training_script.py
```

### Using Trained Models:
```python
from tensorflow.keras.models import load_model
import json

# Load ensemble model
model = load_model('../output_model/flower_img_classifier_ensemble.keras')

# Load class mapping
with open('../output_model/class_names.json', 'r') as f:
    class_names = json.load(f)
```

## Next Steps

To use these scripts:
1. Ensure you have the flower dataset in the expected structure
2. Update `DATASET_BASE` path in the desired script
3. Run the training script
4. Wait for training to complete (1-10 hours depending on script)
5. Models will be saved to `src/output_model/`
6. Optionally upload the best model to Firebase Storage
7. Update `app.py` if needed to use the new model

## Notes

- The `downloaded_model/` folder remains as is (used by `app.py`)
- The `output_model/` folder is gitignored to avoid committing large model files
- Training scripts require a GPU for reasonable training times
- Ensemble training takes ~5x longer than single model training
- Both scripts save models in both `.keras` and `.h5` formats for compatibility

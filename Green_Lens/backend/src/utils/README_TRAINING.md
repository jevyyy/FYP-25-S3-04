# Model Training Scripts

This directory contains scripts for training flower and plant classification models using transfer learning with MobileNetV2.

## Available Scripts

### 1. model_training_script.py
Single model training script with enhanced preprocessing and data augmentation.

**Features:**
- Transfer learning using MobileNetV2
- Dynamic path configuration
- Comprehensive data augmentation (rotation, shift, zoom, brightness, etc.)
- Two-stage training (head training + fine-tuning)
- Callbacks for early stopping and learning rate reduction
- Saves both .keras and .h5 model formats

**Usage:**
```bash
cd Green_Lens/backend/src/utils
python model_training_script.py
```

**Configuration:**
Update the `DATASET_BASE` path in the script to point to your dataset location.

### 2. plant_training_script.py
Single model training script specifically designed for plant classification.

**Features:**
- Transfer learning using MobileNetV2
- Dynamic path configuration
- Comprehensive data augmentation (rotation, shift, zoom, brightness, etc.)
- Two-stage training (head training + fine-tuning)
- Callbacks for early stopping and learning rate reduction
- Saves both .keras and .h5 model formats
- **Simplified mapping**: Only generates class_names.json (no separate dictionary needed)

**Usage:**
```bash
cd Green_Lens/backend/src/utils
python plant_training_script.py
```

**Configuration:**
Update the `DATASET_BASE` path in the script to point to your plant dataset location (e.g., `C:\Users\User\Downloads\botanics_plants`).

**Key Difference from Flower Script:**
- Plant dataset folders are named with actual plant names (e.g., `botanics_plants/Rose/images`)
- Only generates `class_names.json` mapping index directly to plant names
- No need for separate `classes_to_name_dictionary.json`

### 3. ensemble_training_script.py
Homogeneous ensemble learning script using bagging method.

**Features:**
- Trains multiple MobileNetV2 models (default: 5 models)
- Bagging (Bootstrap Aggregating) for improved accuracy
- Each model trained with different random seed for bootstrap sampling
- Ensemble model created by averaging predictions
- All models saved individually + combined ensemble model
- Enhanced preprocessing and data augmentation

**Usage:**
```bash
cd Green_Lens/backend/src/utils
python ensemble_training_script.py
```

**Configuration:**
Update the `DATASET_BASE` path in the script to point to your dataset location.
Adjust `NUM_MODELS` to change the number of models in the ensemble (default: 5).

## Dataset Structure

### Flower Classification Dataset (model_training_script.py, ensemble_training_script.py)

The flower scripts expect the dataset to be organized as follows:

```
Flower_Classification_102_Classes/
├── train/
│   └── train/
│       ├── 1/              # Numeric class folders
│       │   ├── image1.jpg
│       │   ├── image2.jpg
│       │   └── ...
│       ├── 2/
│       │   └── ...
│       └── ...
└── valid/
    └── valid/
        ├── 1/
        ├── 2/
        └── ...
```

**Note:** Flower dataset uses numeric folder names that require mapping files (class_names.json + classes_to_name_dictionary.json).

### Plant Classification Dataset (plant_training_script.py)

The plant script expects the dataset to be organized as follows:

```
botanics_plants/
├── Rose/                    # Actual plant name folders
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
├── Sunflower/
│   ├── image1.jpg
│   └── ...
├── Tulip/
│   └── ...
└── ...
```

**Note:** Plant dataset uses actual plant names as folder names, requiring only class_names.json mapping.

## Output Structure

Both scripts save their outputs to `Green_Lens/backend/downloaded_model/`:

### Single Model Output (Flower):
```
downloaded_model/
├── flower_img_classifier_new.keras    # Trained model (.keras format)
├── flower_img_classifier_new.h5       # Trained model (.h5 format)
├── best_model.keras                   # Best model checkpoint
├── class_names.json                   # Class index to ID mapping
└── training_config.json               # Training configuration
```

### Single Model Output (Plant):
```
downloaded_model/
├── plant_img_classifier.keras         # Trained model (.keras format)
├── plant_img_classifier.h5            # Trained model (.h5 format)
├── best_model.keras                   # Best model checkpoint
├── class_names.json                   # Class index to plant name mapping (ONLY file needed)
└── training_config.json               # Training configuration
```

### Ensemble Model Output:
```
downloaded_model/
├── individual_models/
│   ├── model_0.keras
│   ├── model_1.keras
│   ├── model_2.keras
│   ├── model_3.keras
│   └── model_4.keras
├── flower_img_classifier_ensemble.keras  # Combined ensemble model
├── flower_img_classifier_ensemble.h5     # Combined ensemble (.h5)
├── class_names.json                      # Class index to ID mapping
└── training_config.json                  # Training configuration
```

## Preprocessing & Data Augmentation

Both scripts apply comprehensive preprocessing and augmentation:

### Preprocessing:
- MobileNetV2 preprocessing (normalization to [-1, 1])
- Resizing to 224x224 pixels

### Data Augmentation (Training only):
- Random rotations (±40 degrees)
- Random horizontal/vertical shifts (±20%)
- Random shear transformations (±20%)
- Random zoom (±20%)
- Random horizontal flips
- Random brightness adjustments (80% to 120%)

### Validation:
- Only preprocessing applied (no augmentation)

## Model Architecture

Both scripts use the same base architecture:

```
Input (224x224x3)
    ↓
MobileNetV2 (pretrained on ImageNet, frozen initially)
    ↓
Global Average Pooling
    ↓
Dense(256, relu)
    ↓
Dropout(0.3)
    ↓
Dense(128, relu)
    ↓
Dropout(0.2)
    ↓
Dense(num_classes, softmax)
```

## Training Strategy

### Two-Stage Training:

**Stage 1: Head Training**
- Base model frozen
- Train only new classification layers
- Learning rate: 1e-3
- Epochs: 10 (default)

**Stage 2: Fine-Tuning**
- Unfreeze last 50 layers of base model
- Train with lower learning rate
- Learning rate: 1e-5
- Epochs: 10 (default)

### Callbacks:
- **Early Stopping**: Stops training if validation loss doesn't improve for 5 epochs
- **Learning Rate Reduction**: Reduces learning rate by 50% if validation loss plateaus for 3 epochs
- **Model Checkpoint**: Saves best model based on validation accuracy

## Ensemble Method (Bagging)

The ensemble script uses bagging (Bootstrap Aggregating):

1. **Bootstrap Sampling**: Each model is trained with a different random seed, creating different data splits and augmentation patterns
2. **Independent Training**: Each model is trained independently
3. **Prediction Averaging**: Final predictions are the average of all model predictions
4. **Improved Robustness**: Reduces overfitting and variance

## Hardware Requirements

- **GPU**: Recommended (CUDA-compatible)
- **RAM**: Minimum 8GB, 16GB+ recommended
- **Storage**: ~500MB for models + space for dataset

## Training Time

Approximate training times (with GPU):

- **Single Model**: 1-2 hours (depends on dataset size)
- **Ensemble (5 models)**: 5-10 hours

## Using Trained Models

### Loading the Model (Flowers):
```python
from tensorflow.keras.models import load_model
import json

# Load model
model = load_model('downloaded_model/flower_img_classifier_new.keras')

# Load class mapping
with open('downloaded_model/class_names.json', 'r') as f:
    class_names = json.load(f)

# Load flower name dictionary
with open('downloaded_model/classes_to_name_dictionary.json', 'r') as f:
    class_dict = json.load(f)
```

### Loading the Model (Plants):
```python
from tensorflow.keras.models import load_model
import json

# Load model
model = load_model('downloaded_model/plant_img_classifier.keras')

# Load class mapping (plant names directly)
with open('downloaded_model/class_names.json', 'r') as f:
    class_names = json.load(f)

# No need for separate dictionary - class_names contains actual plant names
```

### Making Predictions (Flowers):
```python
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np

# Load and preprocess image
img = image.load_img('flower.jpg', target_size=(224, 224))
img_array = image.img_to_array(img)
img_array = np.expand_dims(img_array, axis=0)
img_array = preprocess_input(img_array)

# Predict
predictions = model.predict(img_array)
top_idx = np.argmax(predictions[0])
class_id = class_names[str(top_idx)]
flower_name = class_dict[class_id]  # Need to lookup in dictionary
confidence = predictions[0][top_idx]

print(f"Predicted flower: {flower_name}")
print(f"Confidence: {confidence:.2%}")
```

### Making Predictions (Plants):
```python
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np

# Load and preprocess image
img = image.load_img('plant.jpg', target_size=(224, 224))
img_array = image.img_to_array(img)
img_array = np.expand_dims(img_array, axis=0)
img_array = preprocess_input(img_array)

# Predict
predictions = model.predict(img_array)
top_idx = np.argmax(predictions[0])
plant_name = class_names[str(top_idx)]  # Direct mapping to plant name
confidence = predictions[0][top_idx]

print(f"Predicted plant: {plant_name}")
print(f"Confidence: {confidence:.2%}")
```

## Troubleshooting

### Out of Memory Errors:
- Reduce `batch_size` (try 16 or 8)
- Close other applications
- Use a machine with more RAM/VRAM

### Dataset Not Found:
- Verify the `DATASET_BASE` path in the script
- Ensure dataset structure matches expected format
- Use absolute paths if relative paths fail

### Training Too Slow:
- Ensure GPU is being used (check with `tf.config.list_physical_devices('GPU')`)
- Reduce number of epochs
- Use a smaller model (not recommended for accuracy)

### Poor Accuracy:
- Increase number of epochs
- Try ensemble method
- Collect more training data
- Balance class distribution

## Notes

- Models are saved in both `.keras` (new format) and `.h5` (legacy) formats for compatibility
- The `class_names.json` file is essential for interpreting model predictions
- Training configuration is saved for reproducibility
- Models use ImageNet pretrained weights for transfer learning

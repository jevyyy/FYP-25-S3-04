# Model Training Scripts

This directory contains scripts for training flower classification models using transfer learning with MobileNetV2.

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

### 2. ensemble_training_script.py
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

The scripts expect the dataset to be organized as follows:

```
Flower_Classification_102_Classes/
├── train/
│   └── train/
│       ├── class_1/
│       │   ├── image1.jpg
│       │   ├── image2.jpg
│       │   └── ...
│       ├── class_2/
│       │   └── ...
│       └── ...
└── valid/
    └── valid/
        ├── class_1/
        ├── class_2/
        └── ...
```

## Output Structure

Both scripts save their outputs to `Green_Lens/backend/downloaded_model/`:

### Single Model Output:
```
downloaded_model/
├── flower_img_classifier_new.keras    # Trained model (.keras format)
├── flower_img_classifier_new.h5       # Trained model (.h5 format)
├── best_model.keras                   # Best model checkpoint
├── class_names.json                   # Class index to ID mapping
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

### Loading the Model:
```python
from tensorflow.keras.models import load_model
import json

# Load model
model = load_model('output_model/flower_img_classifier_new.keras')

# Load class mapping
with open('output_model/class_names.json', 'r') as f:
    class_names = json.load(f)
```

### Making Predictions:
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
confidence = predictions[0][top_idx]

print(f"Predicted class: {class_id}")
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

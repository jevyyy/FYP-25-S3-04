# Quick Start: Plant Classification Training

This guide helps you get started with training a plant classification model using `plant_training_script.py`.

## Prerequisites

1. Python 3.8+
2. Required packages (install via `pip install -r requirements.txt`):
   - tensorflow==2.15.0
   - keras==2.15.0
   - pillow==11.3.0
   - numpy==1.26.4

## Dataset Preparation

### Expected Dataset Structure

Your plant dataset should be organized as follows:

```
botanics_plants/
├── Rose/
│   ├── rose_001.jpg
│   ├── rose_002.jpg
│   └── ...
├── Sunflower/
│   ├── sunflower_001.jpg
│   └── ...
├── Tulip/
│   └── ...
└── [other plant names]/
    └── ...
```

**Key Points:**
- Each folder name should be the actual plant name
- Each folder contains images of that specific plant
- Supported image formats: .jpg, .jpeg, .png
- Recommended: At least 100 images per plant species for good results

## Configuration

Edit `plant_training_script.py` and update the dataset path:

```python
# Line 35-40
DATASET_BASE = Path('C:\\Users\\User\\Downloads\\botanics_plants')  # Update this!
```

**Path Examples:**
- Windows: `Path('C:\\Users\\User\\Downloads\\botanics_plants')`
- Linux/Mac: `Path('/home/user/datasets/botanics_plants')`
- Relative: `Path('../datasets/botanics_plants')`

## Running the Training

1. Navigate to the utils directory:
```bash
cd Green_Lens/backend/src/utils
```

2. Run the training script:
```bash
python plant_training_script.py
```

3. Training will proceed in two stages:
   - **Stage 1:** Training the classifier head (~10 epochs)
   - **Stage 2:** Fine-tuning the base model (~10 epochs)

## Output Files

After training completes, you'll find these files in `Green_Lens/backend/downloaded_model/`:

- `plant_img_classifier.keras` - Main model file (use this)
- `plant_img_classifier.h5` - Legacy format model
- `class_names.json` - **IMPORTANT**: Maps prediction indices to plant names
- `training_config.json` - Training parameters used
- `best_model.keras` - Best checkpoint during training

## Using the Trained Model

### Loading and Making Predictions

```python
import tensorflow as tf
import json
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np

# Load the model
model = tf.keras.models.load_model('downloaded_model/plant_img_classifier.keras')

# Load class names
with open('downloaded_model/class_names.json', 'r') as f:
    class_names = json.load(f)

# Load and preprocess an image
img_path = 'path/to/your/plant_image.jpg'
img = image.load_img(img_path, target_size=(224, 224))
img_array = image.img_to_array(img)
img_array = np.expand_dims(img_array, axis=0)
img_array = preprocess_input(img_array)

# Make prediction
predictions = model.predict(img_array)
top_idx = np.argmax(predictions[0])
plant_name = class_names[str(top_idx)]
confidence = predictions[0][top_idx]

print(f"Predicted plant: {plant_name}")
print(f"Confidence: {confidence:.2%}")

# Get top 5 predictions
top_5_indices = np.argsort(predictions[0])[-5:][::-1]
print("\nTop 5 predictions:")
for i, idx in enumerate(top_5_indices, 1):
    print(f"{i}. {class_names[str(idx)]}: {predictions[0][idx]:.2%}")
```

## Troubleshooting

### "DATASET_BASE path does not exist"
- Check that your dataset path is correct
- Use absolute paths if relative paths fail
- Ensure the dataset follows the expected structure

### Out of Memory Errors
- Reduce `batch_size` in the script (try 16 or 8)
- Close other applications
- Ensure you have at least 8GB RAM

### Low Accuracy
- Collect more training data (aim for 100+ images per class)
- Balance the number of images across classes
- Increase training epochs
- Check image quality

### Training is Slow
- Use a GPU if available
- The script automatically uses GPU if detected
- CPU training is much slower but will work

## Key Differences from Flower Classification

If you're familiar with the flower classification script:

| Feature | Flower Script | Plant Script |
|---------|--------------|--------------|
| Dataset Structure | Numeric folders (1, 2, 3...) | Named folders (Rose, Tulip...) |
| Mapping Files | class_names.json + classes_to_name_dictionary.json | class_names.json only |
| Lookup | Two-step (index→ID→name) | One-step (index→name) |

## Advanced Configuration

You can adjust these parameters in the script:

```python
# Line 48-52
batch_size = 32          # Reduce if out of memory
epoch_head = 10          # Epochs for head training
epoch_finetune = 10      # Epochs for fine-tuning
learning_rate_head = 1e-3     # Initial learning rate
learning_rate_finetune = 1e-5  # Fine-tuning learning rate
```

## Next Steps

After training:
1. Test your model with the prediction code above
2. Integrate into your application (see app.py for reference)
3. Upload to Firebase Storage if using the full Green Lens application
4. Consider training an ensemble model for better accuracy (adapt ensemble_training_script.py)

## Need Help?

- Check the full documentation in `README_TRAINING.md`
- Review the code comments in `plant_training_script.py`
- Compare with `model_training_script.py` for reference

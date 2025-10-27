# Quick Start Guide for Training Models

## Prerequisites
- Python 3.10+ with TensorFlow 2.15.0
- GPU recommended for faster training
- Flower dataset in the expected structure

## Training Options

### Option 1: Single Model (Faster)
**Best for:** Quick iteration, testing, limited resources

```bash
cd Green_Lens/backend/src/utils
python model_training_script.py
```

**Training time:** ~1-2 hours with GPU

### Option 2: Ensemble Model (Better Accuracy)
**Best for:** Production, highest accuracy requirements

```bash
cd Green_Lens/backend/src/utils
python ensemble_training_script.py
```

**Training time:** ~5-10 hours with GPU

## Configuration

Before running, update the dataset path in the script:

```python
# Change this line to point to your dataset
DATASET_BASE = Path('C:\\Users\\User\\Downloads\\Flower_Classification_102_Classes')
```

## Expected Dataset Structure

```
Flower_Classification_102_Classes/
├── train/
│   └── train/
│       ├── 1/          # Class folder
│       ├── 2/
│       └── ...
└── valid/
    └── valid/
        ├── 1/
        ├── 2/
        └── ...
```

## Output Location

All models will be saved to:
```
Green_Lens/backend/downloaded_model/
```

## What Gets Created

### Single Model:
- `flower_img_classifier_new.keras` - Main model
- `flower_img_classifier_new.h5` - Legacy format
- `best_model.keras` - Best checkpoint
- `class_names.json` - Class mapping
- `training_config.json` - Training settings

### Ensemble Model:
- `flower_img_classifier_ensemble.keras` - Combined model
- `flower_img_classifier_ensemble.h5` - Legacy format
- `individual_models/model_0.keras` through `model_4.keras`
- `class_names.json` - Class mapping
- `training_config.json` - Training settings

## Key Features

Both scripts include:
- ✅ Dynamic paths (works on any machine)
- ✅ Comprehensive data augmentation
- ✅ Two-stage training (head + fine-tuning)
- ✅ Early stopping & learning rate reduction
- ✅ Automatic best model saving
- ✅ Cross-platform compatibility

## After Training

1. Models are saved to `backend/downloaded_model/`
2. Test directly with `app.py` (no upload needed for development)
3. For production, upload desired model to Firebase Storage
4. Test with `test_api.py`

## Troubleshooting

**Out of Memory?**
- Reduce `batch_size` in script (try 16 or 8)

**Dataset Not Found?**
- Update `DATASET_BASE` path
- Verify folder structure matches expected format

**Too Slow?**
- Ensure GPU is detected: `tf.config.list_physical_devices('GPU')`
- Reduce epochs for testing

## More Information

See `README_TRAINING.md` for detailed documentation.
See `TRAINING_CHANGES_SUMMARY.md` for change analysis.

# Model Retraining Feature Guide

## Overview

This feature allows developers to retrain the Green Lens classification models with new images uploaded through the application. The system supports three categories:
- **Flowers**: Flower classification model
- **Plants**: Plant classification model  
- **Architecture**: Architectural plant classification model

## How It Works

### 1. Upload Training Images

Developers can upload images for training through three dedicated pages:
- `Developer_FlowersPage.jsx` - Upload flower images
- `Developer_PlantsPage.jsx` - Upload plant images
- `Developer_ArchitecturesPage.jsx` - Upload architecture images

When uploading images, developers must specify:
- **Image file**: The actual image to upload
- **Class label**: The name/label for this image (e.g., "rose", "tulip", "oak")

Images are stored in Firebase Storage and metadata is stored in Firestore at:
```
Collection: modelPhotos
├── flowers
│   └── images (subcollection)
├── plants
│   └── images (subcollection)
└── architecture
    └── images (subcollection)
```

### 2. Retrain the Model

From the `Developer_Settings` page:

1. **Open Retrain Model section**: Click on "Retrain Model" to expand the section
2. **Click "Retrain Model" button**: This opens a modal to select the category
3. **Select Category**: Choose which model to retrain (flowers, plants, or architecture)
4. **Preview Images**: The system displays all uploaded images for that category
5. **Click "Retrain" button**: This triggers the retraining process
6. **Choose Image Retention**: 
   - **Delete Images**: Removes training images after successful training (recommended for one-time additions)
   - **Keep Images**: Keeps images for future cumulative training
   
The retraining process:
- Downloads all uploaded images from Firebase
- Organizes them by class label
- Trains/fine-tunes the model using transfer learning
- Uploads the new model back to Firebase
- Optionally deletes the training images

### 3. Model Deployment

The retrained model is automatically:
- Saved locally in `backend/downloaded_model/`
- Uploaded to Firebase Storage (replacing the old model)
- Reloaded by the backend API for immediate use

## Technical Details

### Backend Components

#### 1. Retraining Script (`retrain_model_with_firebase.py`)

Main class: `ModelRetrainer`

Key methods:
- `download_images_from_firebase()`: Downloads images organized by class labels
- `prepare_data_generators()`: Creates training/validation data pipelines with augmentation
- `build_model()`: Builds new model or loads existing model for fine-tuning
- `train_model()`: Two-stage training (head training + fine-tuning)
- `save_model_and_metadata()`: Saves model and class mappings
- `upload_to_firebase()`: Uploads trained model to Firebase Storage
- `delete_firebase_training_images()`: Cleans up training images

#### 2. Flask API Endpoint (`app.py`)

**Endpoint**: `POST /api/retrain`

**Request Body**:
```json
{
  "category": "flowers|plants|architecture",
  "deleteImagesAfter": true|false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Model retraining completed successfully for flowers",
  "category": "flowers",
  "images_deleted": true
}
```

### Frontend Components

#### Developer_Settings.jsx

Features:
- Category selection modal
- Image preview grid showing all uploaded images
- Training progress overlay
- Option to delete or keep training images

Key functions:
- `handleTrainPress()`: Opens the retraining modal
- `handleCategorySelect()`: Loads images for selected category
- `handleTrainConfirm()`: Asks user about image deletion preference
- `performRetraining()`: Calls backend API to execute retraining

## Training Process Details

### Data Augmentation

The training uses aggressive data augmentation to improve model generalization:
- Rotation: ±40 degrees
- Width/Height shift: ±20%
- Shear transformation: ±20%
- Zoom: ±20%
- Horizontal flip: Enabled
- Brightness adjustment: 80%-120%

### Training Strategy

**Stage 1: Head Training**
- Only train the custom classifier layers
- Base MobileNetV2 weights are frozen
- Learning rate: 1e-3
- Epochs: 10

**Stage 2: Fine-tuning**
- Unfreeze top 50 layers of MobileNetV2
- Lower learning rate: 1e-5
- Epochs: 10

### Model Architecture

```
Input (224x224x3)
    ↓
MobileNetV2 (pretrained on ImageNet)
    ↓
Dense (256 units, ReLU)
    ↓
Dropout (0.3)
    ↓
Dense (128 units, ReLU)
    ↓
Dropout (0.2)
    ↓
Dense (num_classes, Softmax)
```

### Callbacks

- **Early Stopping**: Stops training if validation loss doesn't improve for 5 epochs
- **Learning Rate Reduction**: Reduces LR by 50% if validation loss plateaus
- **Model Checkpoint**: Saves best model based on validation accuracy

## Usage Examples

### Scenario 1: Adding New Flower Class

1. Upload 10-20 images of the new flower species through Developer_FlowersPage
2. Set the class label to the flower name (e.g., "sunflower")
3. Go to Developer_Settings → Retrain Model
4. Select "Flowers" category
5. Review the uploaded images
6. Click "Retrain" and choose "Delete Images" (since you're adding a new class once)
7. Wait for training to complete (5-15 minutes)
8. New model is automatically deployed

### Scenario 2: Fine-tuning Existing Classes

1. Upload additional images of existing classes through the respective pages
2. Go to Developer_Settings → Retrain Model
3. Select the appropriate category
4. Review the images
5. Click "Retrain" and choose "Keep Images" (for future cumulative training)
6. Wait for training to complete
7. Model is updated with improved accuracy on existing classes

## Important Notes

### Image Requirements
- **Format**: JPEG, PNG
- **Recommended Size**: At least 224x224 pixels
- **Quantity**: Minimum 5 images per class (10-20 recommended)
- **Quality**: Clear, well-lit images showing the subject clearly

### Training Duration
- Depends on number of images and classes
- Typical range: 5-15 minutes
- More images = longer training time

### Memory Requirements
- Training requires adequate RAM (4GB+ recommended)
- Large batch sizes may cause out-of-memory errors

### Best Practices

1. **Balanced Dataset**: Try to have similar number of images per class
2. **Diverse Images**: Include various angles, lighting conditions, backgrounds
3. **Clean Labels**: Use consistent, lowercase labels for class names
4. **Regular Retraining**: Retrain periodically as you collect more images
5. **Backup Models**: Keep backups of well-performing models before retraining
6. **Test After Training**: Always test the new model with sample images

## Troubleshooting

### Issue: "No images found in Firebase"
- Check that images were actually uploaded through the upload pages
- Verify Firebase Storage permissions
- Check Firestore collection structure

### Issue: "Model retraining failed"
- Check backend logs for specific error messages
- Verify sufficient disk space for temporary training data
- Ensure all Python dependencies are installed
- Check that service account has proper Firebase permissions

### Issue: "Out of memory error"
- Reduce batch size in training script
- Close other applications to free up RAM
- Consider training on a machine with more memory

### Issue: "Training takes too long"
- Reduce number of epochs
- Use a smaller dataset for initial testing
- Consider reducing data augmentation complexity

## API Integration

To integrate retraining in custom applications:

```javascript
// Example: Trigger retraining from JavaScript
async function retrainModel(category, deleteImages = true) {
  try {
    const response = await fetch('http://localhost:5000/api/retrain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: category,
        deleteImagesAfter: deleteImages,
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Retraining successful:', result.message);
    } else {
      console.error('Retraining failed:', result.error);
    }
  } catch (error) {
    console.error('Error calling retrain API:', error);
  }
}
```

## Future Enhancements

Potential improvements for this feature:
1. Progress tracking during training (showing current epoch, loss, accuracy)
2. Training history and model versioning
3. A/B testing of different model versions
4. Automatic model evaluation with test dataset
5. Export trained models for offline use
6. Scheduled automated retraining
7. Multi-model ensemble training
8. Transfer learning from other model architectures

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs at `backend/app.py`
3. Check Firebase console for storage/database issues
4. Review the training script logs in console output

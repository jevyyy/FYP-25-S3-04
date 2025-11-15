# Class Preservation Fix for Model Retraining

## Problem Statement

Previously, the `retrain_model_with_firebase.py` script had a critical issue:
- When retraining with new images, it would **only save the newly uploaded classes** to `{category}_class_names.json`
- This caused **existing classes to be lost**, resulting in them being classified as "UNKNOWN"
- For example, if a model had 8 classes and was retrained with 2 new classes, only those 2 new classes would remain

## Root Cause

The issue occurred in the workflow:

1. **Download**: Only new training images were downloaded from Firebase
2. **Prepare Data**: Data generators were created from only the downloaded images
3. **Train**: Model was trained with only the new classes
4. **Save**: `class_indices` from the training generator (containing only new classes) was saved to JSON
5. **Result**: Old classes were overwritten and lost

## Solution

The fix implements a **class preservation and merging strategy**:

### 1. Load Existing Classes

```python
def load_existing_class_names(self):
    """Load existing class names from the saved JSON file"""
    category_singular = self.category.rstrip('s')
    class_names_path = self.output_dir / f'{category_singular}_class_names.json'
    
    if class_names_path.exists():
        with open(class_names_path, 'r') as f:
            existing_map = json.load(f)
            # Convert to {class_name: index} format
            class_name_to_index = {v: int(k) for k, v in existing_map.items()}
            return class_name_to_index
    return {}
```

### 2. Merge Existing and New Classes

```python
def prepare_data_generators(self, existing_class_mapping=None):
    """Prepare data generators with class merging"""
    # ... create generators ...
    
    if existing_class_mapping:
        # Get classes from downloaded training data
        new_classes_found = sorted([d for d in os.listdir(self.temp_dataset_dir) 
                                   if os.path.isdir(os.path.join(self.temp_dataset_dir, d))])
        
        # Merge: preserve existing indices, add new classes with next available indices
        merged_class_mapping = existing_class_mapping.copy()
        next_index = max(existing_class_mapping.values()) + 1
        
        for class_name in new_classes_found:
            if class_name not in merged_class_mapping:
                merged_class_mapping[class_name] = next_index
                next_index += 1
        
        # Store merged mapping for later use
        train_generator.merged_class_indices = merged_class_mapping
```

### 3. Save Merged Class Mapping

```python
def save_model_and_metadata(self, model, class_indices, merged_class_indices=None):
    """Save model with merged class names"""
    # Use merged mapping if available to preserve existing classes
    if merged_class_indices:
        class_names_map = {str(v): k for k, v in merged_class_indices.items()}
    else:
        class_names_map = {str(v): k for k, v in class_indices.items()}
    
    # Save to JSON
    with open(class_names_path, 'w') as f:
        json.dump(class_names_map, f, indent=4)
```

### 4. Updated Workflow

```python
def retrain(self, delete_images_after=True):
    """Complete retraining workflow"""
    # 1. Load existing class names FIRST
    existing_class_mapping = self.load_existing_class_names()
    
    # 2. Download new images
    image_count = self.download_images_from_firebase()
    
    # 3. Prepare data with existing class mapping
    train_gen, val_gen, num_classes = self.prepare_data_generators(existing_class_mapping)
    
    # 4. Build/load model with correct number of output neurons
    model = self.build_model(num_classes, existing_model_path)
    
    # 5. Train model
    model = self.train_model(model, train_gen, val_gen)
    
    # 6. Save with merged class mapping
    merged_class_indices = getattr(train_gen, 'merged_class_indices', train_gen.class_indices)
    model_path, class_names_path = self.save_model_and_metadata(
        model, train_gen.class_indices, merged_class_indices
    )
```

## Examples

### Example 1: Adding New Classes

**Before retraining:**
- Model has classes: `{0: "rose", 1: "tulip", 2: "daisy"}`

**Upload new images:**
- Upload images for "sunflower" and "lily"

**After retraining:**
- Model now has classes: `{0: "rose", 1: "tulip", 2: "daisy", 3: "lily", 4: "sunflower"}`
- **All original classes preserved!**

### Example 2: Re-training Existing Class

**Before retraining:**
- Model has classes: `{0: "cactus", 1: "fern", 2: "bamboo"}`

**Upload new images:**
- Upload more images for "cactus" (existing) and "aloe" (new)

**After retraining:**
- Model now has classes: `{0: "cactus", 1: "fern", 2: "bamboo", 3: "aloe"}`
- **Existing "cactus" keeps index 0**, other classes preserved

## Important Notes

### Model Output Layer Adjustment

The `build_model()` function already handled changing the number of output classes:

```python
if model.output_shape[-1] != num_classes:
    # Rebuild output layer with new number of classes
    base_model = Model(inputs=model.input, outputs=model.layers[-2].output)
    outputs = layers.Dense(num_classes, activation='softmax')(base_model.output)
    model = Model(inputs=base_model.input, outputs=outputs)
```

### Training Considerations

**Important**: When training with only new class images, the model only sees examples of the new classes during training. This means:

1. **Existing classes rely on pretrained weights**: The model's knowledge of existing classes comes from previous training
2. **New classes get trained**: Only new classes get updated weights
3. **Best practice**: Keep training images for cumulative retraining to maintain/improve accuracy on all classes

### Recommendation

When using the "Keep Images" option (instead of "Delete Images"), you can:
- Accumulate training data over time
- Retrain on ALL classes (old + new) for better results
- Continuously improve the model with more examples

## Testing

Three test files verify the fix:

### 1. `test_class_preservation.py`
Unit tests for individual functions:
- Loading existing class names
- Merging class mappings
- Saving merged class names
- Handling edge cases

### 2. `test_retraining_workflow.py`
Integration tests simulating complete workflows:
- Adding new classes to existing model
- Re-training existing classes
- Starting from scratch

### 3. Running Tests

```bash
cd Green_Lens/backend

# Run unit tests
python test_class_preservation.py

# Run integration tests
python test_retraining_workflow.py
```

All tests should pass with output showing:
```
✅ ALL TESTS PASSED
```

## Files Modified

1. **`src/utils/retrain_model_with_firebase.py`**
   - Added `load_existing_class_names()` method
   - Modified `prepare_data_generators()` to accept and merge existing classes
   - Modified `save_model_and_metadata()` to save merged class mapping
   - Updated `retrain()` workflow to orchestrate class preservation

## Backward Compatibility

The fix is **fully backward compatible**:
- If no existing class names file exists (first training), it works as before
- If class names file exists, it loads and preserves them
- No changes required to calling code or API

## Future Improvements

Consider these enhancements:
1. **Cumulative Training**: Automatically keep images for cumulative dataset
2. **Class Versioning**: Track when classes were added
3. **Class Validation**: Warn if existing classes have no recent training examples
4. **Smart Deletion**: Only delete images for newly added classes, keep existing class images

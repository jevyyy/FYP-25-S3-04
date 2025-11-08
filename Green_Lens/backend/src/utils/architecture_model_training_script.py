"""
Single Model Training Script for Architecture Plant Classification
This script trains a single MobileNetV2 model for architectural plant recognition.
Uses dynamic paths and comprehensive preprocessing with data augmentation.

Key Features:
- Architecture dataset structure: botanics_architecture/actual_plant_name/images
- Folder names are the actual plant names (no numeric mapping needed)
- Only generates class_names.json (index to plant name mapping)
"""

import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
import json
from tensorflow.keras import layers
from tensorflow.keras import Model
import os
from tensorflow.keras.applications import MobileNetV2
from pathlib import Path

# ======================
# 1. Configuration
# ======================

# Get the script directory and setup paths dynamically
SCRIPT_DIR = Path(__file__).resolve().parent
SRC_DIR = SCRIPT_DIR.parent
BACKEND_DIR = SRC_DIR.parent

# Dynamic paths for dataset - adjust based on your dataset location
# Default path structure: botanics_architecture/plant_name/images
# IMPORTANT: Update this path to point to your actual dataset location
# Examples:
#   - Windows: Path('C:\\Users\\User\\Downloads\\botanics_architecture')
#   - Linux/Mac: Path('/home/user/datasets/botanics_architecture')
#   - Relative: Path('../datasets/botanics_architecture')
DATASET_BASE = Path('C:\\Users\\User\\Downloads\\botanics_architecture')

# For architecture dataset, the root contains folders with actual plant names
train_data_path = DATASET_BASE

# If you have a separate validation directory, specify it here
# Otherwise, the script will use validation_split from training data
validation_data_path = None  # Set to a Path if you have separate validation data

# Output directory - saves to backend/downloaded_model for app.py to use
output_dir = BACKEND_DIR / 'downloaded_model'

# Model hyperparameters (optimized for small datasets)
input_size = (224, 224)
batch_size = 8  # Smaller batch size for limited data
epoch_head = 15  # More epochs for better learning
epoch_finetune = 15
learning_rate_head = 5e-4  # Lower learning rate for stability
learning_rate_finetune = 1e-5

# Create the output directory if it doesn't exist
output_dir.mkdir(parents=True, exist_ok=True)
print(f"Output directory: {output_dir}")
print(f"Training data path: {train_data_path}")
if validation_data_path:
    print(f"Validation data path: {validation_data_path}")

# ======================
# 2. Data Preparation, Preprocessing & Augmentation
# ======================

# Training data generator with AGGRESSIVE augmentation for small datasets
# This helps prevent overfitting and increases dataset diversity
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,  # MobileNetV2 preprocessing
    rotation_range=45,                        # Increased rotation
    width_shift_range=0.25,                   # Increased horizontal shift
    height_shift_range=0.25,                  # Increased vertical shift
    shear_range=0.25,                         # Increased shear
    zoom_range=0.25,                          # Increased zoom
    horizontal_flip=True,                     # Random horizontal flips
    vertical_flip=True,                       # Add vertical flips for more variety
    fill_mode='nearest',                      # Fill strategy for pixels after transformation
    brightness_range=[0.7, 1.3],             # Wider brightness range
    channel_shift_range=20.0,                # Add color variation
    validation_split=0.2                      # Use 20% of data for validation
)

# Validation data generator - only preprocessing, no augmentation
validation_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input
)

# Create training generator
# The class_indices will be created automatically from folder names
train_generator = train_datagen.flow_from_directory(
    str(train_data_path),  # Convert Path to string
    target_size=input_size,
    batch_size=batch_size,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

# Create validation generator
if validation_data_path and validation_data_path.exists():
    # Use separate validation directory if provided
    validation_generator = validation_datagen.flow_from_directory(
        str(validation_data_path),
        target_size=input_size,
        batch_size=batch_size,
        class_mode='categorical',
        shuffle=False
    )
else:
    # Use validation split from training data
    validation_generator = train_datagen.flow_from_directory(
        str(train_data_path),  # Convert Path to string
        target_size=input_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )

num_classes = len(train_generator.class_indices)
print(f"\nFound {train_generator.samples} training images belonging to {num_classes} classes.")
print(f"Found {validation_generator.samples} validation images")
# This will print the class mapping (folder names to indices)
print(f"Class Mapping (plant_name -> index): {train_generator.class_indices}")

# ======================
# 3. Build the Transfer Learning Model with Enhanced Architecture
# ======================

base_model = MobileNetV2(
    weights='imagenet',
    include_top=False,
    input_shape=(224, 224, 3),
    pooling='avg'
)

base_model.trainable = False

# Simpler architecture with more regularization to prevent overfitting
inputs = tf.keras.Input(shape=(224, 224, 3))
x = base_model(inputs, training=False)
x = layers.Dropout(0.5)(x)  # Higher dropout after base model
x = layers.Dense(128, activation='relu', kernel_regularizer=tf.keras.regularizers.l2(0.01))(x)  # L2 regularization
x = layers.Dropout(0.5)(x)  # Higher dropout
outputs = layers.Dense(num_classes, activation='softmax')(x)

model = Model(inputs, outputs)

model.summary()

# ======================
# 4. Compile the Model with Callbacks
# ======================

# Callbacks for better training with small datasets
early_stopping = EarlyStopping(
    monitor='val_loss',
    patience=8,  # Increased patience for small datasets
    restore_best_weights=True,
    verbose=1
)

reduce_lr = ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=5,  # Increased patience
    min_lr=1e-7,
    verbose=1
)

checkpoint = ModelCheckpoint(
    str(output_dir / 'architecture_best_model.keras'),
    monitor='val_accuracy',
    save_best_only=True,
    verbose=1
)

model.compile(
    optimizer=Adam(learning_rate=learning_rate_head),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# ======================
# 5. Train the Model (Stage 1: Train only the head)
# ======================
print("\n--- Training the new classifier head ---")
history = model.fit(
    train_generator,
    steps_per_epoch=max(1, train_generator.samples // batch_size),
    validation_data=validation_generator,
    validation_steps=max(1, validation_generator.samples // batch_size),
    epochs=epoch_head,
    callbacks=[early_stopping, reduce_lr, checkpoint],
    verbose=1
)

# ======================
# 6. Fine-Tuning (Stage 2: Unfreeze some base layers)
# ======================
print("\n--- Preparing for Fine-Tuning ---")
base_model.trainable = True

# Unfreeze only the last 30 layers to reduce overfitting risk
# With limited data, we want to be conservative with fine-tuning
# Note: MobileNetV2 has 155 layers, so this unfreezes roughly the top 20%
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=Adam(learning_rate=learning_rate_finetune),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

print("\n--- Fine-tuning the top layers of the base model ---")
history_fine = model.fit(
    train_generator,
    steps_per_epoch=max(1, train_generator.samples // batch_size),
    validation_data=validation_generator,
    validation_steps=max(1, validation_generator.samples // batch_size),
    epochs=epoch_head + epoch_finetune,
    initial_epoch=history.epoch[-1],
    callbacks=[early_stopping, reduce_lr, checkpoint],
    verbose=1
)

# =================================================================
# 7. Save the Final Model and Class Names
# =================================================================
# Save the Keras model in the modern .keras format
model_save_path = output_dir / 'architecture_img_classifier.keras'
model.save(str(model_save_path))
print(f"\nModel saved successfully to: {model_save_path}")

# Save the Keras model in the legacy .h5 format
h5_model_path = output_dir / 'architecture_img_classifier.h5'
model.save(str(h5_model_path))
print(f"Model saved successfully in .h5 format to: {h5_model_path}")

# --- Save class indices mapping ---
# For architecture plants, the mapping is straightforward: folder names are actual plant names
# class_indices dictionary holds: {'plant_name': index}
class_indices = train_generator.class_indices

# Invert it for easier lookup: {'index': 'plant_name'}
# This is the ONLY mapping needed - no separate dictionary required
class_names_map = {str(v): k for k, v in class_indices.items()}

# Save this mapping to class_names.json
class_names_path = output_dir / 'architecture_class_names.json'
with open(class_names_path, 'w') as f:
    json.dump(class_names_map, f, indent=4)

print(f"\nClass mapping saved to: {class_names_path}")
print("NOTE: For architecture plants, the class names ARE the actual plant names.")
print("No separate classes_to_name_dictionary.json is needed.")

# Save training configuration for reference
config = {
    'input_size': input_size,
    'batch_size': batch_size,
    'epoch_head': epoch_head,
    'epoch_finetune': epoch_finetune,
    'learning_rate_head': learning_rate_head,
    'learning_rate_finetune': learning_rate_finetune,
    'num_classes': num_classes,
    'model_architecture': 'MobileNetV2 + Custom Head',
    'dataset_type': 'architecture',
    'augmentation': {
        'rotation_range': 40,
        'width_shift_range': 0.2,
        'height_shift_range': 0.2,
        'shear_range': 0.2,
        'zoom_range': 0.2,
        'horizontal_flip': True,
        'brightness_range': [0.8, 1.2]
    }
}

config_path = output_dir / 'architecture_training_config.json'
with open(config_path, 'w') as f:
    json.dump(config, f, indent=4)

print(f"Training configuration saved to: {config_path}")

# Evaluate final model
print("\n--- Final Model Evaluation ---")
final_loss, final_accuracy = model.evaluate(validation_generator, verbose=0)
print(f"Final Validation Loss: {final_loss:.4f}")
print(f"Final Validation Accuracy: {final_accuracy:.4f}")

print("\n" + "="*80)
print("Training Complete!")
print("="*80)
print("\nUsage in Application:")
print(f"1. Load model from: {model_save_path}")
print(f"2. Load class mapping from: {class_names_path}")
print("3. The prediction index maps directly to plant names via class_names.json")

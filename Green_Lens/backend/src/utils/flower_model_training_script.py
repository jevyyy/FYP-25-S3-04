"""
Single Model Training Script for Flower Classification
This script trains a single MobileNetV2 model for flower/plant recognition.
Uses dynamic paths and comprehensive preprocessing with data augmentation.
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
# Default assumes dataset is in the same structure as before
DATASET_BASE = Path('C:\\Users\\User\\Downloads\\Flower_Classification_102_Classes')
train_data_path = DATASET_BASE / 'train' / 'train'
validation_data_path = DATASET_BASE / 'valid' / 'valid'

# Output directory - saves to backend/downloaded_model for app.py to use
output_dir = BACKEND_DIR / 'downloaded_model'

# Model hyperparameters
input_size = (224, 224)
batch_size = 32
epoch_head = 10
epoch_finetune = 10
learning_rate_head = 1e-3
learning_rate_finetune = 1e-5

# Create the output directory if it doesn't exist
output_dir.mkdir(parents=True, exist_ok=True)
print(f"Output directory: {output_dir}")
print(f"Training data path: {train_data_path}")
print(f"Validation data path: {validation_data_path}")

# ======================
# 2. Data Preparation, Preprocessing & Augmentation
# ======================

# Training data generator with comprehensive augmentation
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,  # MobileNetV2 preprocessing
    rotation_range=40,                        # Randomly rotate images by 40 degrees
    width_shift_range=0.2,                    # Randomly shift images horizontally
    height_shift_range=0.2,                   # Randomly shift images vertically
    shear_range=0.2,                          # Shear transformations
    zoom_range=0.2,                           # Random zoom
    horizontal_flip=True,                     # Random horizontal flips
    fill_mode='nearest',                      # Fill strategy for pixels after transformation
    brightness_range=[0.8, 1.2],             # Random brightness adjustments
    validation_split=0.2                      # Use 20% of data for validation
)

# Validation data generator - only preprocessing, no augmentation
validation_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input
)

# This is where the mapping is created internally
train_generator = train_datagen.flow_from_directory(
    str(train_data_path),  # Convert Path to string
    target_size=input_size,
    batch_size=batch_size,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

validation_generator = train_datagen.flow_from_directory(
    str(train_data_path),  # Convert Path to string
    target_size=input_size,
    batch_size=batch_size,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

# If separate validation directory exists, use it instead
if validation_data_path.exists():
    validation_generator = validation_datagen.flow_from_directory(
        str(validation_data_path),
        target_size=input_size,
        batch_size=batch_size,
        class_mode='categorical',
        shuffle=False
    )

num_classes = len(train_generator.class_indices)
print(f"\nFound {train_generator.samples} training images belonging to {num_classes} classes.")
print(f"Found {validation_generator.samples} validation images")
# This will print the class mapping
print(f"Ground Truth Class Mapping: {train_generator.class_indices}")

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

inputs = tf.keras.Input(shape=(224, 224, 3))
x = base_model(inputs, training=False)
x = layers.Dense(256, activation='relu')(x)
x = layers.Dropout(0.3)(x)
x = layers.Dense(128, activation='relu')(x)
x = layers.Dropout(0.2)(x)
outputs = layers.Dense(num_classes, activation='softmax')(x)

model = Model(inputs, outputs)

model.summary()

# ======================
# 4. Compile the Model with Callbacks
# ======================

# Callbacks for better training
early_stopping = EarlyStopping(
    monitor='val_loss',
    patience=5,
    restore_best_weights=True,
    verbose=1
)

reduce_lr = ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=3,
    min_lr=1e-7,
    verbose=1
)

checkpoint = ModelCheckpoint(
    str(output_dir / 'flower_best_model.keras'),
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
    steps_per_epoch=train_generator.samples // batch_size,
    validation_data=validation_generator,
    validation_steps=validation_generator.samples // batch_size,
    epochs=epoch_head,
    callbacks=[early_stopping, reduce_lr, checkpoint],
    verbose=1
)

# ======================
# 6. Fine-Tuning (Stage 2: Unfreeze some base layers)
# ======================
print("\n--- Preparing for Fine-Tuning ---")
base_model.trainable = True
for layer in base_model.layers[:-50]:
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
    steps_per_epoch=train_generator.samples // batch_size,
    validation_data=validation_generator,
    validation_steps=validation_generator.samples // batch_size,
    epochs=epoch_head + epoch_finetune,
    initial_epoch=history.epoch[-1],
    callbacks=[early_stopping, reduce_lr, checkpoint],
    verbose=1
)

# =================================================================
# 7. Save the Final Model and Class Names
# =================================================================
# Save the Keras model in the modern .keras format
model_save_path = output_dir / 'flower_img_classifier.keras'
model.save(str(model_save_path))
print(f"\nModel saved successfully to: {model_save_path}")

# Save the Keras model in the legacy .h5 format
h5_model_path = output_dir / 'flower_img_classifier.h5'
model.save(str(h5_model_path))
print(f"Model saved successfully in .h5 format to: {h5_model_path}")

# --- Save class indices mapping ---
# We capture the `class_indices` dictionary that ImageDataGenerator created.
# This dictionary holds the ground truth mapping (e.g., {'1': 0, '10': 1, '2': 2}).
class_indices = train_generator.class_indices

# To make it easier to use in the app, we invert it so we can look up by index.
# The result will be: {'0': '1', '1': '10', '2': '2'}
class_names_map = {str(v): k for k, v in class_indices.items()}

# We save this essential mapping to a new JSON file.
class_names_path = output_dir / 'flower_class_names.json'
with open(class_names_path, 'w') as f:
    json.dump(class_names_map, f, indent=4)

print(f"\nClass mapping saved to: {class_names_path}")
print("IMPORTANT: Use this file in your application to interpret predictions.")

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

config_path = output_dir / 'flower_training_config.json'
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
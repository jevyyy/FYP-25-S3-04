"""
Homogeneous Ensemble Learning with Bagging for Flower Classification
This script trains multiple MobileNetV2 models using bagging (bootstrap aggregating)
and combines them into an ensemble for improved prediction accuracy.
"""

import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
import json
from tensorflow.keras import layers
from tensorflow.keras import Model
import os
import numpy as np
from tensorflow.keras.applications import MobileNetV2
from pathlib import Path

# ======================
# 1. Configuration
# ======================

# Get the script directory and setup paths dynamically
SCRIPT_DIR = Path(__file__).resolve().parent
SRC_DIR = SCRIPT_DIR.parent
BACKEND_DIR = SRC_DIR.parent

# Dynamic paths - adjust these based on your dataset location
# Default assumes dataset is in the same structure as before
DATASET_BASE = Path('C:\\Users\\User\\Downloads\\Flower_Classification_102_Classes')
TRAIN_DATA_PATH = DATASET_BASE / 'train' / 'train'
VALIDATION_DATA_PATH = DATASET_BASE / 'valid' / 'valid'

# Output directory - saves to backend/downloaded_model for app.py to use
OUTPUT_DIR = BACKEND_DIR / 'downloaded_model'

# Model configuration
INPUT_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCH_HEAD = 10
EPOCH_FINETUNE = 10
NUM_MODELS = 5  # Number of models in the ensemble
LEARNING_RATE_HEAD = 1e-3
LEARNING_RATE_FINETUNE = 1e-5

# Create the output directory if it doesn't exist
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
print(f"Output directory: {OUTPUT_DIR}")
print(f"Training data path: {TRAIN_DATA_PATH}")
print(f"Validation data path: {VALIDATION_DATA_PATH}")

# ======================
# 2. Data Preprocessing & Augmentation
# ======================

def create_data_generators(train_path, validation_path, seed=None):
    """
    Create data generators with comprehensive preprocessing and augmentation.
    
    Args:
        train_path: Path to training data
        validation_path: Path to validation data
        seed: Random seed for reproducibility
        
    Returns:
        train_generator, validation_generator, num_classes, class_indices
    """
    
    # Training data with extensive augmentation
    train_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        rotation_range=40,           # Random rotations
        width_shift_range=0.2,       # Random horizontal shifts
        height_shift_range=0.2,      # Random vertical shifts
        shear_range=0.2,             # Shear transformations
        zoom_range=0.2,              # Random zoom
        horizontal_flip=True,        # Random horizontal flips
        fill_mode='nearest',         # Fill strategy for new pixels
        brightness_range=[0.8, 1.2], # Random brightness adjustments
        validation_split=0.2         # Use 20% for validation during training
    )
    
    # Validation data - only preprocessing, no augmentation
    validation_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input
    )
    
    # Create training generator
    train_generator = train_datagen.flow_from_directory(
        str(train_path),
        target_size=INPUT_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        seed=seed,
        shuffle=True
    )
    
    # Create validation generator from training split
    val_from_train_generator = train_datagen.flow_from_directory(
        str(train_path),
        target_size=INPUT_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        seed=seed,
        shuffle=False
    )
    
    # If separate validation directory exists, use it
    if validation_path.exists():
        validation_generator = validation_datagen.flow_from_directory(
            str(validation_path),
            target_size=INPUT_SIZE,
            batch_size=BATCH_SIZE,
            class_mode='categorical',
            seed=seed,
            shuffle=False
        )
    else:
        validation_generator = val_from_train_generator
    
    num_classes = len(train_generator.class_indices)
    class_indices = train_generator.class_indices
    
    print(f"\nFound {train_generator.samples} training images")
    print(f"Found {validation_generator.samples} validation images")
    print(f"Number of classes: {num_classes}")
    
    return train_generator, validation_generator, num_classes, class_indices


def build_model(num_classes, model_name='model'):
    """
    Build a transfer learning model using MobileNetV2.
    
    Args:
        num_classes: Number of output classes
        model_name: Name for the model
        
    Returns:
        Compiled Keras model
    """
    
    # Load pre-trained MobileNetV2 (without top classification layer)
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(224, 224, 3),
        pooling='avg'
    )
    
    # Freeze base model initially
    base_model.trainable = False
    
    # Build the model
    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = base_model(inputs, training=False)
    x = layers.Dense(256, activation='relu', name=f'{model_name}_dense1')(x)
    x = layers.Dropout(0.3, name=f'{model_name}_dropout1')(x)
    x = layers.Dense(128, activation='relu', name=f'{model_name}_dense2')(x)
    x = layers.Dropout(0.2, name=f'{model_name}_dropout2')(x)
    outputs = layers.Dense(num_classes, activation='softmax', name=f'{model_name}_output')(x)
    
    model = Model(inputs, outputs, name=model_name)
    
    return model, base_model


def train_single_model(model_idx, train_generator, validation_generator, num_classes, class_indices):
    """
    Train a single model with the given configuration.
    
    Args:
        model_idx: Index of the model in the ensemble
        train_generator: Training data generator
        validation_generator: Validation data generator
        num_classes: Number of classes
        class_indices: Class index mapping
        
    Returns:
        Trained model
    """
    
    print(f"\n{'='*80}")
    print(f"Training Model {model_idx + 1}/{NUM_MODELS}")
    print(f"{'='*80}")
    
    # Build model
    model, base_model = build_model(num_classes, model_name=f'ensemble_model_{model_idx}')
    
    # Compile model for initial training
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE_HEAD),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Callbacks for training
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
    
    # Stage 1: Train only the new head
    print(f"\n--- Stage 1: Training classifier head ---")
    history_head = model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // BATCH_SIZE,
        validation_data=validation_generator,
        validation_steps=validation_generator.samples // BATCH_SIZE,
        epochs=EPOCH_HEAD,
        callbacks=[early_stopping, reduce_lr],
        verbose=1
    )
    
    # Stage 2: Fine-tune top layers of base model
    print(f"\n--- Stage 2: Fine-tuning base model ---")
    base_model.trainable = True
    
    # Freeze all layers except the last 50
    for layer in base_model.layers[:-50]:
        layer.trainable = False
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE_FINETUNE),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    history_finetune = model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // BATCH_SIZE,
        validation_data=validation_generator,
        validation_steps=validation_generator.samples // BATCH_SIZE,
        epochs=EPOCH_HEAD + EPOCH_FINETUNE,
        initial_epoch=len(history_head.history['loss']),
        callbacks=[early_stopping, reduce_lr],
        verbose=1
    )
    
    # Evaluate model
    val_loss, val_accuracy = model.evaluate(validation_generator, verbose=0)
    print(f"\nModel {model_idx + 1} - Validation Accuracy: {val_accuracy:.4f}")
    
    return model


def create_ensemble_model(models, num_classes):
    """
    Create an ensemble model that averages predictions from all base models.
    
    Args:
        models: List of trained base models
        num_classes: Number of output classes
        
    Returns:
        Ensemble model
    """
    
    print(f"\n{'='*80}")
    print("Creating Ensemble Model")
    print(f"{'='*80}")
    
    # Create input layer
    inputs = tf.keras.Input(shape=(224, 224, 3))
    
    # Get predictions from all models
    predictions = []
    for i, model in enumerate(models):
        # Get output from each model
        pred = model(inputs)
        predictions.append(pred)
    
    # Average the predictions
    ensemble_output = tf.keras.layers.Average(name='ensemble_average')(predictions)
    
    # Create the ensemble model
    ensemble_model = Model(inputs=inputs, outputs=ensemble_output, name='ensemble_model')
    
    return ensemble_model


def save_models(models, ensemble_model, class_indices, output_dir):
    """
    Save all models and metadata.
    
    Args:
        models: List of base models
        ensemble_model: Ensemble model
        class_indices: Class index mapping
        output_dir: Directory to save models
    """
    
    print(f"\n{'='*80}")
    print("Saving Models")
    print(f"{'='*80}")
    
    # Save individual models
    models_dir = output_dir / 'individual_models'
    models_dir.mkdir(exist_ok=True)
    
    for i, model in enumerate(models):
        model_path = models_dir / f'model_{i}.keras'
        model.save(str(model_path))
        print(f"Saved individual model {i + 1} to: {model_path}")
    
    # Save ensemble model
    ensemble_path = output_dir / 'flower_img_classifier_ensemble.keras'
    ensemble_model.save(str(ensemble_path))
    print(f"\nSaved ensemble model to: {ensemble_path}")
    
    # Also save in .h5 format for compatibility
    ensemble_h5_path = output_dir / 'flower_img_classifier_ensemble.h5'
    ensemble_model.save(str(ensemble_h5_path))
    print(f"Saved ensemble model (.h5) to: {ensemble_h5_path}")
    
    # Save class mapping
    class_names_map = {str(v): k for k, v in class_indices.items()}
    class_names_path = output_dir / 'class_names.json'
    with open(class_names_path, 'w') as f:
        json.dump(class_names_map, f, indent=4)
    print(f"\nSaved class mapping to: {class_names_path}")
    
    # Save training configuration
    config = {
        'num_models': NUM_MODELS,
        'input_size': INPUT_SIZE,
        'batch_size': BATCH_SIZE,
        'epoch_head': EPOCH_HEAD,
        'epoch_finetune': EPOCH_FINETUNE,
        'learning_rate_head': LEARNING_RATE_HEAD,
        'learning_rate_finetune': LEARNING_RATE_FINETUNE,
        'num_classes': len(class_indices),
        'model_architecture': 'MobileNetV2 + Custom Head',
        'ensemble_method': 'Bagging (Bootstrap Aggregating)',
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
    
    config_path = output_dir / 'training_config.json'
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=4)
    print(f"Saved training configuration to: {config_path}")


def main():
    """
    Main training pipeline.
    """
    
    print(f"\n{'='*80}")
    print("Homogeneous Ensemble Learning with Bagging")
    print(f"{'='*80}\n")
    
    # Check if training data exists
    if not TRAIN_DATA_PATH.exists():
        print(f"ERROR: Training data path does not exist: {TRAIN_DATA_PATH}")
        print("\nPlease update DATASET_BASE in the script to point to your dataset.")
        return
    
    # Create data generators with initial seed
    train_gen, val_gen, num_classes, class_indices = create_data_generators(
        TRAIN_DATA_PATH, 
        VALIDATION_DATA_PATH,
        seed=42
    )
    
    # Train multiple models with different random seeds (bagging)
    trained_models = []
    
    for i in range(NUM_MODELS):
        # Create new generators with different seed for each model (bootstrap sampling)
        seed = 42 + i * 100
        train_gen_i, val_gen_i, _, _ = create_data_generators(
            TRAIN_DATA_PATH,
            VALIDATION_DATA_PATH,
            seed=seed
        )
        
        # Train model
        model = train_single_model(i, train_gen_i, val_gen_i, num_classes, class_indices)
        trained_models.append(model)
    
    # Create ensemble model
    ensemble_model = create_ensemble_model(trained_models, num_classes)
    
    # Evaluate ensemble
    print(f"\n{'='*80}")
    print("Evaluating Ensemble Model")
    print(f"{'='*80}")
    
    # Compile ensemble for evaluation
    ensemble_model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    ensemble_loss, ensemble_accuracy = ensemble_model.evaluate(val_gen, verbose=1)
    print(f"\nEnsemble Model - Validation Accuracy: {ensemble_accuracy:.4f}")
    print(f"Ensemble Model - Validation Loss: {ensemble_loss:.4f}")
    
    # Save all models
    save_models(trained_models, ensemble_model, class_indices, OUTPUT_DIR)
    
    print(f"\n{'='*80}")
    print("Training Complete!")
    print(f"{'='*80}")
    print(f"\nAll models saved to: {OUTPUT_DIR}")
    print("\nTo use the ensemble model in your application:")
    print(f"  - Load model from: {OUTPUT_DIR / 'flower_img_classifier_ensemble.keras'}")
    print(f"  - Load class mapping from: {OUTPUT_DIR / 'class_names.json'}")


if __name__ == '__main__':
    main()

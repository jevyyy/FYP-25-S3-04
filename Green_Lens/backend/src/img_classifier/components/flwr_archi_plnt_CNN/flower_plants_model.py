import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
import json
from tensorflow.keras import layers
from tensorflow.keras import Model
import os
from tensorflow.keras.applications import MobileNetV2

# import tensorflow as tf
# from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions
# from tensorflow.keras.preprocessing import image
# import numpy as np
# from tensorflow.keras.applications import MobileNetV2
# from tensorflow.keras.preprocessing.image import ImageDataGenerator
# from tensorflow.keras.optimizers import Adam
# import json
# from tensorflow.keras import layers
# from tensorflow.keras import Model

# ======================
# 1. Configuration
# ======================
# Using Windows paths as you will be training on Windows
train_data_path = 'C:\\Users\\User\\Downloads\\Flower_Classification_102_Classes\\train\\train'
validation_data_path = 'C:\\Users\\User\\Downloads\\Flower_Classification_102_Classes\\valid\\valid'
output_dir = 'output_model' # A dedicated folder for the final model and class names

input_size = (224, 224)
batch_size = 32
epoch_head = 10
epoch_finetune = 10

# Create the output directory if it doesn't exist
if not os.path.exists(output_dir):
    os.makedirs(output_dir)
    print(f"Created output directory: {output_dir}")

# ======================
# 2. Data Preparation & Preprocessing
# ======================

train_datagen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    validation_split=0.2
)

# This is where the mapping is created internally
train_generator = train_datagen.flow_from_directory(
    train_data_path,
    target_size=input_size,
    batch_size=batch_size,
    class_mode='categorical',
    subset='training'
)

validation_generator = train_datagen.flow_from_directory(
    train_data_path,
    target_size=input_size,
    batch_size=batch_size,
    class_mode='categorical',
    subset='validation'
)

num_classes = len(train_generator.class_indices)
print(f"Found {train_generator.samples} training images belonging to {num_classes} classes.")
# This will print the jumbled alphanumeric mapping, which is the ground truth
print(f"Ground Truth Class Mapping: {train_generator.class_indices}")

# ======================
# 3. Build the Transfer Learning Model
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
x = layers.Dense(128, activation='relu')(x)
x = layers.Dropout(0.2)(x)
outputs = layers.Dense(num_classes, activation='softmax')(x)

model = Model(inputs, outputs)

model.summary()

# ======================
# 4. Compile the Model
# ======================
model.compile(
    optimizer=Adam(learning_rate=1e-3),
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
    epochs=epoch_head
)

# ======================
# 6. (Optional) Fine-Tuning (Stage 2: Unfreeze some base layers)
# ======================
print("\n--- Preparing for Fine-Tuning ---")
base_model.trainable = True
for layer in base_model.layers[:-50]:
    layer.trainable = False

model.compile(
    optimizer=Adam(learning_rate=1e-5),
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
    initial_epoch=history.epoch[-1]
)

# =================================================================
# 7. Save the Final Model and Class Names (THE SOLUTION)
# =================================================================
# Save the Keras model to the output directory
model_save_path = os.path.join(output_dir, 'flower_img_classifier.keras')
model.save(model_save_path)
print(f"\nModel saved successfully to: {model_save_path}")

# --- THIS IS THE IMPLEMENTATION OF THE SOLUTION ---
# We capture the `class_indices` dictionary that ImageDataGenerator created.
# This dictionary holds the ground truth mapping (e.g., {'1': 0, '10': 1, '2': 2}).
class_indices = train_generator.class_indices

# To make it easier to use in the app, we invert it so we can look up by index.
# The result will be: {'0': '1', '1': '10', '2': '2'}
class_names_map = {str(v): k for k, v in class_indices.items()}

# We save this essential mapping to a new JSON file.
class_names_path = os.path.join(output_dir, 'class_names.json')
with open(class_names_path, 'w') as f:
    json.dump(class_names_map, f, indent=4)

print(f"CRITICAL: Class mapping saved to: {class_names_path}")
print("You MUST use this file in your application to interpret predictions.")
# --- END SOLUTION ---
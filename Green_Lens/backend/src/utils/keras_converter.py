import tensorflow as tf
import tensorflowjs as tfjs
import os

# --- Configuration ---
KERAS_MODEL_PATH = 'flower_img_classifier.keras'
OUTPUT_DIR = 'tfjs_flower_model'
# This is the corrected shape, WITHOUT the 'None' for the batch size.
# Keras's Input layer assumes a variable batch size by default.
INPUT_SHAPE = (224, 224, 3)

# --- Script ---
print("--- Starting Keras to TFJS Conversion (Corrected) ---")

# 1. Load your original Keras model
print(f"Loading original model from: {KERAS_MODEL_PATH}")
original_model = tf.keras.models.load_model(KERAS_MODEL_PATH)

# 2. Rebuild the model with an explicit Input layer using the correct 'shape' argument
print(f"Rebuilding model with explicit input shape: {INPUT_SHAPE}")
# THIS IS THE FIX: Use 'shape' instead of 'batch_input_shape'
input_layer = tf.keras.Input(shape=INPUT_SHAPE)
output = original_model(input_layer)
new_model = tf.keras.Model(inputs=input_layer, outputs=output)

print("\nNew model summary:")
new_model.summary()

# 3. Convert and save the new, corrected model
print(f"\nConverting and saving the new model to directory: '{OUTPUT_DIR}'")
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)
    
tfjs.converters.save_keras_model(new_model, OUTPUT_DIR)

print("\n--- Conversion Complete! ---")
print(f"The corrected model has been saved in the '{OUTPUT_DIR}' folder.")
import tensorflow as tf
import tensorflowjs as tfjs
import os

# --- Configuration ---
KERAS_MODEL_PATH = 'flower_img_classifier.keras'
OUTPUT_DIR = 'tfjs_flower_model'
# This is the crucial part: Define the exact input shape your model expects.
# (None, 224, 224, 3) means:
# None: A variable batch size (most flexible)
# 224, 224: Height and width of the image
# 3: RGB color channels
INPUT_SHAPE = (None, 224, 224, 3)

# --- Script ---
print("--- Starting Keras to TFJS Conversion ---")

# 1. Load your original Keras model
print(f"Loading original model from: {KERAS_MODEL_PATH}")
original_model = tf.keras.models.load_model(KERAS_MODEL_PATH)

# 2. Rebuild the model with an explicit Input layer to fix the error
# This is the Python equivalent of the --input_shape flag.
print(f"Rebuilding model with explicit input shape: {INPUT_SHAPE}")
input_layer = tf.keras.Input(batch_input_shape=INPUT_SHAPE)
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
import tensorflowjs as tfjs
import tensorflow as tf
import os

# Get the directory of the current script (src/utils)
script_dir = os.path.dirname(os.path.abspath(__file__))
# Define the final, correct output path (src/tc/tfjs_flower_model)
output_path = os.path.join(script_dir, '..', 'tc', 'tfjs_flower_model')

# --- The only change is here ---
# Use the newly created .h5 file as the input
input_path = 'flower_img_classifier.h5'
model = tf.keras.models.load_model(input_path)
# --- End of change ---

# Ensure the output directory exists
os.makedirs(output_path, exist_ok=True)

# Delete old files in the target directory to be safe
print(f"Clearing old model files from {output_path}...")
for f in os.listdir(output_path):
    os.remove(os.path.join(output_path, f))

print(f"Converting {input_path} to TF.js format...")
tfjs.converters.save_keras_model(model, output_path)

print(f"\nSUCCESS: Model converted and saved directly to {output_path}")
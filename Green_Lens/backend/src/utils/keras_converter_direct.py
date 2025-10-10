import tensorflow as tf
import tensorflowjs as tfjs

# TO USE UBUNTU 22.04: wsl -d Ubuntu-22.04
# TO ACTIVATE VENV IN UBUNTU 22.04: source py310env/bin/activate 
# Run script: python keras_converter_direct.py
# 
# for /tfjs's server.js specifically: 
# 1. convert .keras to .h5 using resave_to_h5.py
# 2. run clean_json.py to manually make model.json compatible with tfjs conversion (keras_converter.py)
# 3. then upload to firebase and run server.js

# converts keras mdoel to tfjs model
# Load your Keras model
model = tf.keras.models.load_model('flower_img_classifier.keras')

# Convert and save as TFJS format
tfjs.converters.save_keras_model(model, 'tfjs_flower_model')
print("Model converted and saved to ../tfjs_model")
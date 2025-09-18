import tensorflow as tf
import tensorflowjs as tfjs

# TO USE UBUNTU 22.04: wsl -d Ubuntu-22.04
# TO ACTIVATE VENV IN UBUNTU 22.04: source py310env/bin/activate           
# converts keras mdoel to tfjs model
# Load your Keras model
model = tf.keras.models.load_model('flower_img_classifier.keras')

# Convert and save as TFJS format
tfjs.converters.save_keras_model(model, 'tfjs_model.keras')
print("Model converted and saved to ../tfjs_model")
import tensorflow as tf
import tensorflowjs as tfjs

# converts keras mdoel to tfjs model
# Load your Keras model
model = tf.keras.models.load_model('flower_img_classifier.keras')
model = tf.keras.models.load_model('C:\\Users\\User\\Desktop\\Terence\\New folder\\FYP-25-S3-04\\Green_Lens\\backend\\src\\camera\\flower_img_classifier.keras')

# Convert and save as TFJS format
tfjs.converters.save_keras_model(model, 'C:\\Users\\User\\Desktop\\Terence\\New folder\\FYP-25-S3-04\\Green_Lens\\backend\\src\\camera\\tfjs_model')
print("Model converted and saved to ../tfjs_model")
import tensorflow as tf
import os

# Ensure we are in the script's directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("Loading model from flower_img_classifier.keras...")
# Load the model from the new .keras format
model = tf.keras.models.load_model('flower_img_classifier.keras')

print("Re-saving model to flower_img_classifier.h5...")
# Save the model in the older, more compatible .h5 format
model.save('flower_img_classifier.h5', save_format='h5')

print("\nSUCCESS: Model has been re-saved to flower_img_classifier.h5")
print("You can now run the conversion script on the .h5 file.")
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image
import numpy as np
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
import json
from tensorflow.keras import layers
from tensorflow.keras import Model

# Resize to a fixed size (e.g., 128x128, 224x224).

# Scale pixel values to a standard range, typically [0, 1] by dividing by 255.

# (Optional but Recommended) Normalize using the mean and standard deviation of your own training dataset. This is better than using ImageNet stats.

# take the first 5 kaggle tabs

# An image is forward passed through the network.

# The convolutional and pooling layers work together to extract and condense important features.

# The dense layer uses these features to make a guess.

# The guess is compared to the truth, calculating a loss (error).

# Back propagation calculates how much each weight contributed to that error.

# Gradient descent uses this calculation to nudge all the weights a tiny amount to make a better guess next time.

# Repeat this process thousands of times.

# mexican aster, madagascar periwinkle, marigold, daisy, buttercup, Morning glory, rose, Blackberry lily, 

# class flower_plants_model:
#     def __init__(self):
#         self.model = keras.applications.MobileNetV2(
#             # input_shape=None,
#             alpha=0.9,
#             include_top=False,
#             weights="imagenet",
#             pooling="avg",
#             # input_tensor=None,
#             # classes=1000,
#             # classifier_activation="softmax",
#             # name=None,
#         )

#     def train_model(self)
    
#     def freeze_base(self):
#         self.model.trainable = False
        
#     def unfreeze_base(self):
#         self.model.trainable = True

#     def preprocess_image(self, img_path):
#         img = image.load_img(img_path, target_size=(224, 224))
#         img_array = image.img_to_array(img)
#         img_array = np.expand_dims(img_array, axis=0)
#         img_array = preprocess_input(img_array)
#         return img_array

#     def predict(self, img_path):
#         preprocessed_img = self.preprocess_image(img_path)
#         predictions = self.model.predict(preprocessed_img)
#         decoded_predictions = decode_predictions(predictions, top=3)[0]
#         return decoded_predictions

# model= MobileNetV2(
#     alpha=0.9,
#     include_top=False,
#     weights="imagenet",
#     pooling="avg",
# )

# model.trainable = False

# train_data_path= 
# test_data_path= 
# validation_data_path= 

# input_size= (224, 224)
# batch_size= 32
# num_classes= 5
# epoch_head= 10
# epoch_finetune= 10

# train_datagen = ImageDataGenerator(
#     preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input,
#     shear_range=0.2,
#     zoom_range=0.2,
#     horizontal_flip=True,  # Augmentation for training data
#     validation_split=0.2   # Use 20% of data for validation
# )


# load the predefined class dictionary
with open('C:\\Users\\User\\Downloads\\Flower_Classification_102_Classes\\classes_to_name_dictionary.json', 'r') as f:
    predefined_class_dict = json.load(f)

# ======================
# 1. Configuration
# ======================
train_data_path = 'C:\\Users\\User\\Downloads\\Flower_Classification_102_Classes\\train\\train'  # e.g., 'data/train'
validation_data_path = 'C:\\Users\\User\\Downloads\\Flower_Classification_102_Classes\\valid\\valid' # e.g., 'data/val'
input_size = (224, 224)  # MobileNetV2 requires this size
batch_size = 32 # can try 64 or 16
num_classes = 5  # Number of classes in your dataset
epoch_head = 10  # Epochs for training the new head
epoch_finetune = 10 # Epochs for fine-tuning (optional)

# ======================
# 2. Data Preparation & Preprocessing
# ======================

# Create data generators that apply the necessary preprocessing
# This includes resizing to 224x224 and applying MobileNetV2's specific scaling
# ImageDataGenerator is a utility class for loading and augmenting image data from directories in real-time during training
train_datagen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input, # THE KEY LINE
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,  # Augmentation for training data
    validation_split=0.2   # Use 20% of data for validation
)

# Flow training images from directory
train_generator = train_datagen.flow_from_directory(
    train_data_path,
    target_size=input_size,
    batch_size=batch_size,
    class_mode='categorical',
    subset='training'  # Specify this is the training set
)

# just to see the class indices dict
print("train Generator's class_indices (automatic):", train_generator.class_indices)

# Flow validation images from directory
validation_generator = train_datagen.flow_from_directory(
    train_data_path,  # Same directory, but different subset
    target_size=input_size,
    batch_size=batch_size,
    class_mode='categorical',
    subset='validation'  # Specify this is the validation set
)

print("validation Generator's class_indices (automatic):", validation_generator.class_indices)

# Get the number of classes and class indices from the generator
num_classes = len(train_generator.class_indices)
print(f"Found {train_generator.samples} training images in {num_classes} classes.")
print(f"Class names: {list(train_generator.class_indices.keys())}")

# ======================
# 3. Build the Transfer Learning Model
# ======================

# Load the pre-trained MobileNetV2 model, without the top (head)
base_model = MobileNetV2(
    weights='imagenet',       # Load weights pre-trained on ImageNet
    include_top=False,        # Do not include the ImageNet classifier at the top
    input_shape=(224, 224, 3),
    pooling='avg'             # Add GlobalAveragePooling2D at the end
)

# Freeze the base model to prevent its weights from being updated during initial training
base_model.trainable = False

# Create a new model on top
inputs = tf.keras.Input(shape=(224, 224, 3))

# The base model contains preprocessing layers (scaling) and the pre-trained backbone
# When calling the base model, training=False ensures it runs in inference mode. 
# This is critical when the base model contains layers like Dropout or BatchNormalization that behave differently during training vs. inference. 
# It does not freeze weights (freezing is done by base_model.trainable = False); it controls layer behavior.
x = base_model(inputs, training=False)  # Pass data through the base model

# Add a new classifier head (Dense layers)
x = layers.Dense(128, activation='relu')(x)  # Optional intermediate layer
x = layers.Dropout(0.2)(x)                   # Add dropout for regularization

# Final output layer: number of units = number of your classes
outputs = layers.Dense(num_classes, activation='softmax')(x)

# Combine the base model and the new head into a full model
model = Model(inputs, outputs)

# Print model summary to see the architecture
model.summary()

# ======================
# 4. Compile the Model
# ======================
model.compile(
    optimizer=Adam(learning_rate=1e-3), # Higher learning rate for new layers
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# ======================
# 5. Train the Model (Stage 1: Train only the head)
# ======================
print("Training the new classifier head...")
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

# Unfreeze the top N layers of the base model while leaving the bottom frozen
base_model.trainable = True
# Let's unfreeze the last 50 layers
for layer in base_model.layers[:-50]:
    layer.trainable = False
for layer in base_model.layers[-50:]:
    layer.trainable = True

# Recompile the model with a very low learning rate for fine-tuning
model.compile(
    optimizer=Adam(learning_rate=1e-5),  # Low learning rate is crucial!
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Print number of trainable and non-trainable parameters
model.summary()

# Continue training (fine-tuning)
print("Fine-tuning the last layers of the base model...")
history_fine = model.fit(
    train_generator,
    steps_per_epoch=train_generator.samples // batch_size,
    validation_data=validation_generator,
    validation_steps=validation_generator.samples // batch_size,
    epochs=epoch_head + epoch_finetune, # Start from where we left off
    initial_epoch=history.epoch[-1] # Start from the last epoch of head training
)

# ======================
# 7. Save the Model
# ======================
model.save('flower_img_classifier.keras')
print("Model saved successfully!")
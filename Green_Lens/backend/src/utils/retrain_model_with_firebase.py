"""
Model Retraining Script with Firebase Integration
This script downloads images from Firebase Storage, trains/fine-tunes the model,
and uploads the trained model back to Firebase Storage.
"""

import os
import sys
import json
import shutil
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras import layers
from tensorflow.keras import Model
from tensorflow.keras.applications import MobileNetV2
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore, storage
import requests
from PIL import Image
import io

class ModelRetrainer:
    def __init__(self, category, service_account_path, bucket_name):
        """
        Initialize the Model Retrainer
        
        Args:
            category: 'flowers', 'plants', or 'architecture'
            service_account_path: Path to Firebase service account JSON
            bucket_name: Firebase storage bucket name
        """
        self.category = category
        self.bucket_name = bucket_name
        
        # Initialize Firebase if not already initialized
        try:
            firebase_admin.get_app()
        except ValueError:
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred, {
                'storageBucket': bucket_name
            })
        
        self.db = firestore.client()
        self.bucket = storage.bucket()
        
        # Setup paths
        self.script_dir = Path(__file__).resolve().parent
        self.backend_dir = self.script_dir.parent.parent
        self.temp_dataset_dir = self.backend_dir / 'temp_training_data' / category
        self.output_dir = self.backend_dir / 'downloaded_model'
        
        # Create directories
        self.temp_dataset_dir.mkdir(parents=True, exist_ok=True)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Model hyperparameters
        self.input_size = (224, 224)
        self.batch_size = 8
        self.epoch_head = 10
        self.epoch_finetune = 10
        self.learning_rate_head = 1e-3
        self.learning_rate_finetune = 1e-5
        
    def download_images_from_firebase(self):
        """
        Download images from Firebase Storage organized by class labels
        Returns the number of images downloaded
        """
        print(f"\n{'='*80}")
        print(f"Downloading {self.category} images from Firebase Storage...")
        print(f"{'='*80}\n")
        
        # Query Firestore for images
        images_ref = self.db.collection('modelPhotos').document(self.category).collection('images')
        images = images_ref.stream()
        
        image_count = 0
        class_counts = {}
        
        for img_doc in images:
            img_data = img_doc.to_dict()
            image_url = img_data.get('imageUrl')
            class_name = img_data.get('name', 'unknown')
            
            if not image_url or not class_name:
                continue
            
            # Create class directory
            class_dir = self.temp_dataset_dir / class_name
            class_dir.mkdir(parents=True, exist_ok=True)
            
            # Download image
            try:
                response = requests.get(image_url, timeout=10)
                if response.status_code == 200:
                    # Save image
                    img_path = class_dir / f"{img_doc.id}.jpg"
                    with open(img_path, 'wb') as f:
                        f.write(response.content)
                    
                    image_count += 1
                    class_counts[class_name] = class_counts.get(class_name, 0) + 1
                    print(f"Downloaded: {class_name}/{img_doc.id}.jpg")
                else:
                    print(f"Failed to download {image_url}: Status {response.status_code}")
            except Exception as e:
                print(f"Error downloading {image_url}: {str(e)}")
        
        print(f"\n{'='*80}")
        print(f"Download Summary:")
        print(f"Total images downloaded: {image_count}")
        print(f"Classes found: {len(class_counts)}")
        for class_name, count in class_counts.items():
            print(f"  - {class_name}: {count} images")
        print(f"{'='*80}\n")
        
        return image_count
    
    def prepare_data_generators(self):
        """
        Prepare training and validation data generators
        """
        print("Preparing data generators...")
        
        # Training data generator with augmentation
        train_datagen = ImageDataGenerator(
            preprocessing_function=preprocess_input,
            rotation_range=40,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            fill_mode='nearest',
            brightness_range=[0.8, 1.2],
            validation_split=0.2
        )
        
        # Validation data generator - only preprocessing
        validation_datagen = ImageDataGenerator(
            preprocessing_function=preprocess_input
        )
        
        # Create generators
        train_generator = train_datagen.flow_from_directory(
            str(self.temp_dataset_dir),
            target_size=self.input_size,
            batch_size=self.batch_size,
            class_mode='categorical',
            subset='training',
            shuffle=True
        )
        
        validation_generator = train_datagen.flow_from_directory(
            str(self.temp_dataset_dir),
            target_size=self.input_size,
            batch_size=self.batch_size,
            class_mode='categorical',
            subset='validation',
            shuffle=False
        )
        
        num_classes = len(train_generator.class_indices)
        print(f"Found {train_generator.samples} training images belonging to {num_classes} classes.")
        print(f"Found {validation_generator.samples} validation images")
        print(f"Class Mapping: {train_generator.class_indices}")
        
        return train_generator, validation_generator, num_classes
    
    def build_model(self, num_classes, existing_model_path=None):
        """
        Build or load existing model for fine-tuning
        
        Args:
            num_classes: Number of output classes
            existing_model_path: Path to existing model for fine-tuning (optional)
        """
        print("\nBuilding model...")
        
        if existing_model_path and os.path.exists(existing_model_path):
            # Load existing model for fine-tuning
            print(f"Loading existing model from {existing_model_path}")
            try:
                model = tf.keras.models.load_model(existing_model_path)
                
                # Check if output layer needs to be updated (new classes added)
                if model.output_shape[-1] != num_classes:
                    print(f"Output classes changed from {model.output_shape[-1]} to {num_classes}")
                    print("Rebuilding output layer...")
                    
                    # Get the base model (everything except the last Dense layer)
                    base_model = Model(inputs=model.input, outputs=model.layers[-2].output)
                    
                    # Add new output layer
                    outputs = layers.Dense(num_classes, activation='softmax', name='new_output')(base_model.output)
                    model = Model(inputs=base_model.input, outputs=outputs)
                
                return model
            except Exception as e:
                print(f"Failed to load existing model: {str(e)}")
                print("Building new model from scratch...")
        
        # Build new model from scratch
        base_model = MobileNetV2(
            weights='imagenet',
            include_top=False,
            input_shape=(224, 224, 3),
            pooling='avg'
        )
        
        base_model.trainable = False
        
        inputs = tf.keras.Input(shape=(224, 224, 3))
        x = base_model(inputs, training=False)
        x = layers.Dense(256, activation='relu')(x)
        x = layers.Dropout(0.3)(x)
        x = layers.Dense(128, activation='relu')(x)
        x = layers.Dropout(0.2)(x)
        outputs = layers.Dense(num_classes, activation='softmax')(x)
        
        model = Model(inputs, outputs)
        
        return model
    
    def train_model(self, model, train_generator, validation_generator):
        """
        Train the model
        """
        print("\n" + "="*80)
        print("Starting Model Training")
        print("="*80 + "\n")
        
        # Callbacks
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
        
        checkpoint_path = self.output_dir / f'{self.category}_best_model.keras'
        checkpoint = ModelCheckpoint(
            str(checkpoint_path),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        )
        
        # Compile model
        model.compile(
            optimizer=Adam(learning_rate=self.learning_rate_head),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        # Train head
        print("\n--- Training the classifier head ---")
        history = model.fit(
            train_generator,
            steps_per_epoch=max(1, train_generator.samples // self.batch_size),
            validation_data=validation_generator,
            validation_steps=max(1, validation_generator.samples // self.batch_size),
            epochs=self.epoch_head,
            callbacks=[early_stopping, reduce_lr, checkpoint],
            verbose=1
        )
        
        # Fine-tuning
        print("\n--- Preparing for Fine-Tuning ---")
        
        # Find the base model in the current model
        base_model = None
        for layer in model.layers:
            if isinstance(layer, MobileNetV2):
                base_model = layer
                break
        
        if base_model:
            base_model.trainable = True
            for layer in base_model.layers[:-50]:
                layer.trainable = False
            
            model.compile(
                optimizer=Adam(learning_rate=self.learning_rate_finetune),
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )
            
            print("\n--- Fine-tuning the top layers of the base model ---")
            history_fine = model.fit(
                train_generator,
                steps_per_epoch=max(1, train_generator.samples // self.batch_size),
                validation_data=validation_generator,
                validation_steps=max(1, validation_generator.samples // self.batch_size),
                epochs=self.epoch_head + self.epoch_finetune,
                initial_epoch=history.epoch[-1],
                callbacks=[early_stopping, reduce_lr, checkpoint],
                verbose=1
            )
        
        # Evaluate
        print("\n--- Final Model Evaluation ---")
        final_loss, final_accuracy = model.evaluate(validation_generator, verbose=0)
        print(f"Final Validation Loss: {final_loss:.4f}")
        print(f"Final Validation Accuracy: {final_accuracy:.4f}")
        
        return model
    
    def save_model_and_metadata(self, model, class_indices):
        """
        Save model and class mapping to local directory
        """
        print("\n" + "="*80)
        print("Saving Model and Metadata")
        print("="*80 + "\n")
        
        # Save model
        model_save_path = self.output_dir / f'{self.category}_img_classifier.keras'
        model.save(str(model_save_path))
        print(f"Model saved to: {model_save_path}")
        
        # Save .h5 format
        h5_model_path = self.output_dir / f'{self.category}_img_classifier.h5'
        model.save(str(h5_model_path))
        print(f"Model saved in .h5 format to: {h5_model_path}")
        
        # Save class mapping
        class_names_map = {str(v): k for k, v in class_indices.items()}
        class_names_path = self.output_dir / f'{self.category}_class_names.json'
        with open(class_names_path, 'w') as f:
            json.dump(class_names_map, f, indent=4)
        print(f"Class mapping saved to: {class_names_path}")
        
        return model_save_path, class_names_path
    
    def upload_to_firebase(self, model_path, class_names_path):
        """
        Upload trained model and class names to Firebase Storage
        """
        print("\n" + "="*80)
        print("Uploading to Firebase Storage")
        print("="*80 + "\n")
        
        # Upload model
        model_blob = self.bucket.blob(f'{self.category}_best_model.keras')
        model_blob.upload_from_filename(str(model_path))
        print(f"Uploaded model to: {self.category}_best_model.keras")
        
        # Upload class names
        class_names_blob = self.bucket.blob(f'{self.category}_class_names.json')
        class_names_blob.upload_from_filename(str(class_names_path))
        print(f"Uploaded class names to: {self.category}_class_names.json")
        
        print("\nUpload complete!")
    
    def cleanup_training_data(self):
        """
        Remove temporary training data
        """
        print("\n" + "="*80)
        print("Cleaning up temporary training data...")
        print("="*80 + "\n")
        
        if self.temp_dataset_dir.exists():
            shutil.rmtree(self.temp_dataset_dir)
            print(f"Removed: {self.temp_dataset_dir}")
    
    def delete_firebase_training_images(self):
        """
        Delete training images from Firebase Storage and Firestore
        """
        print("\n" + "="*80)
        print(f"Deleting {self.category} training images from Firebase...")
        print("="*80 + "\n")
        
        # Query Firestore for images
        images_ref = self.db.collection('modelPhotos').document(self.category).collection('images')
        images = images_ref.stream()
        
        deleted_count = 0
        
        for img_doc in images:
            try:
                img_data = img_doc.to_dict()
                storage_path = img_data.get('storagePath')
                
                # Delete from Storage
                if storage_path:
                    try:
                        blob = self.bucket.blob(storage_path)
                        blob.delete()
                        print(f"Deleted from storage: {storage_path}")
                    except Exception as e:
                        print(f"Warning: Could not delete storage file {storage_path}: {str(e)}")
                
                # Delete from Firestore
                img_doc.reference.delete()
                deleted_count += 1
                
            except Exception as e:
                print(f"Error deleting document {img_doc.id}: {str(e)}")
        
        print(f"\nDeleted {deleted_count} images from Firebase")
    
    def retrain(self, delete_images_after=True):
        """
        Complete retraining workflow
        
        Args:
            delete_images_after: Whether to delete training images after successful training
        """
        try:
            # Download images
            image_count = self.download_images_from_firebase()
            
            if image_count == 0:
                print("No images found in Firebase. Aborting training.")
                return False
            
            # Prepare data
            train_gen, val_gen, num_classes = self.prepare_data_generators()
            
            # Check if existing model exists for fine-tuning
            existing_model_path = self.output_dir / f'{self.category}_best_model.keras'
            
            # Build model
            model = self.build_model(num_classes, existing_model_path if existing_model_path.exists() else None)
            
            # Train model
            model = self.train_model(model, train_gen, val_gen)
            
            # Save model and metadata
            model_path, class_names_path = self.save_model_and_metadata(model, train_gen.class_indices)
            
            # Upload to Firebase
            self.upload_to_firebase(model_path, class_names_path)
            
            # Cleanup
            self.cleanup_training_data()
            
            # Delete Firebase training images if requested
            if delete_images_after:
                self.delete_firebase_training_images()
            
            print("\n" + "="*80)
            print("RETRAINING COMPLETE!")
            print("="*80 + "\n")
            
            return True
            
        except Exception as e:
            error_msg = str(e)
            print(f"\nERROR during retraining: {error_msg}")
            
            # Check for Firebase authentication errors
            if "invalid_grant" in error_msg.lower() or "invalid jwt signature" in error_msg.lower():
                print("\n" + "="*80)
                print("FIREBASE AUTHENTICATION ERROR DETECTED")
                print("="*80)
                print("\nThe service account credentials are invalid or expired.")
                print("\nTO FIX THIS:")
                print("1. Go to Firebase Console: https://console.firebase.google.com/")
                print("2. Select your project: green-lens-47e9b")
                print("3. Go to Project Settings → Service accounts")
                print("4. Click 'Generate new private key'")
                print("5. Save as 'service-account.json' in Green_Lens/backend/")
                print("6. Restart the backend server: python app.py")
                print("\nFor detailed instructions, see: FIREBASE_AUTH_TROUBLESHOOTING.md")
                print("="*80 + "\n")
            elif "503" in error_msg or "ServiceUnavailable" in error_msg:
                print("\n" + "="*80)
                print("FIREBASE SERVICE ERROR")
                print("="*80)
                print("\nUnable to connect to Firebase services.")
                print("\nPossible causes:")
                print("1. Invalid service account credentials")
                print("2. Firebase services temporarily unavailable")
                print("3. Network connectivity issues")
                print("\nTO FIX THIS:")
                print("1. Check Firebase status: https://status.firebase.google.com/")
                print("2. Regenerate service account key (see FIREBASE_AUTH_TROUBLESHOOTING.md)")
                print("3. Verify network connectivity")
                print("="*80 + "\n")
            
            import traceback
            traceback.print_exc()
            
            # Cleanup on failure
            self.cleanup_training_data()
            
            return False


def main():
    """
    Main function for command-line usage
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Retrain model with Firebase images')
    parser.add_argument('category', choices=['flowers', 'plants', 'architecture'], 
                        help='Category to retrain')
    parser.add_argument('--service-account', required=True,
                        help='Path to Firebase service account JSON')
    parser.add_argument('--bucket', required=True,
                        help='Firebase storage bucket name')
    parser.add_argument('--keep-images', action='store_true',
                        help='Keep training images in Firebase after training')
    
    args = parser.parse_args()
    
    retrainer = ModelRetrainer(args.category, args.service_account, args.bucket)
    success = retrainer.retrain(delete_images_after=not args.keep_images)
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()

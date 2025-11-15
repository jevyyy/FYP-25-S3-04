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
    def __init__(self, category, firebase_credentials, bucket_name):
        """
        Initialize the Model Retrainer
        
        Args:
            category: 'flowers', 'plants', or 'architecture'
            firebase_credentials: Firebase Admin SDK credentials object
            bucket_name: Firebase storage bucket name
        """
        self.category = category
        self.bucket_name = bucket_name
        
        # Initialize Firebase if not already initialized
        try:
            firebase_admin.get_app()
        except ValueError:
            firebase_admin.initialize_app(firebase_credentials, {
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
        
        Tries two methods:
        1. From Firestore metadata (preferred - uploaded via app)
        2. Direct from Storage (fallback - manually uploaded files)
        """
        print(f"\n{'='*80}")
        print(f"Downloading {self.category} images from Firebase Storage...")
        print(f"{'='*80}\n")
        
        # Try Method 1: Query Firestore for images with metadata
        try:
            images_ref = self.db.collection('modelPhotos').document(self.category).collection('images')
            images_list = list(images_ref.stream())
            
            if images_list:
                print(f"Found {len(images_list)} images in Firestore metadata. Using Firestore method.")
                return self._download_from_firestore(images_list)
            else:
                print("No images found in Firestore metadata. Trying direct Storage listing...")
        except Exception as e:
            print(f"Firestore query failed: {str(e)}")
            print("Trying direct Storage listing...")
        
        # Method 2: List files directly from Storage
        return self._download_from_storage_direct()
    
    def _download_from_firestore(self, images_list):
        """Download images using Firestore metadata (preferred method)"""
        image_count = 0
        class_counts = {}
        
        for img_doc in images_list:
            img_data = img_doc.to_dict()
            image_url = img_data.get('imageUrl')
            raw_name = img_data.get('name', 'unknown')
            
            if not image_url or not raw_name:
                continue
            
            # Extract class name by removing trailing numbers
            # "copperleaf 10" -> "copperleaf"
            # "areca palm 123" -> "areca palm"
            import re
            class_name = re.sub(r'\s+\d+$', '', raw_name).strip()
            
            if not class_name:
                class_name = 'unknown'
            
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
        
        self._print_download_summary(image_count, class_counts)
        return image_count
    
    def _download_from_storage_direct(self):
        """Download images by listing Storage directly (fallback method)"""
        print(f"Listing files from Storage: modelPhotos/{self.category}/")
        
        image_count = 0
        class_counts = {}
        
        try:
            # List all blobs in the category folder
            blobs = self.bucket.list_blobs(prefix=f'modelPhotos/{self.category}/')
            
            for blob in blobs:
                # Skip if it's a folder or not an image
                if blob.name.endswith('/') or not blob.name.lower().endswith(('.jpg', '.jpeg', '.png')):
                    continue
                
                # Extract filename: modelPhotos/plants/areca palm 1.jpg -> areca palm 1.jpg
                filename = blob.name.split('/')[-1]
                
                # Extract class name by removing number and extension
                # "areca palm 1.jpg" -> "areca palm"
                # Remove file extension
                name_without_ext = filename.rsplit('.', 1)[0]
                
                # Remove trailing number pattern (space + digit(s))
                import re
                class_name = re.sub(r'\s+\d+$', '', name_without_ext).strip()
                
                if not class_name:
                    class_name = 'unknown'
                
                # Create class directory
                class_dir = self.temp_dataset_dir / class_name
                class_dir.mkdir(parents=True, exist_ok=True)
                
                # Download image
                try:
                    # Generate signed URL for download
                    blob_url = blob.generate_signed_url(expiration=3600)  # 1 hour expiration
                    
                    response = requests.get(blob_url, timeout=10)
                    if response.status_code == 200:
                        # Save image with sanitized filename
                        safe_filename = filename.replace(' ', '_')
                        img_path = class_dir / safe_filename
                        with open(img_path, 'wb') as f:
                            f.write(response.content)
                        
                        image_count += 1
                        class_counts[class_name] = class_counts.get(class_name, 0) + 1
                        print(f"Downloaded: {class_name}/{safe_filename}")
                    else:
                        print(f"Failed to download {blob.name}: Status {response.status_code}")
                except Exception as e:
                    print(f"Error downloading {blob.name}: {str(e)}")
        
        except Exception as e:
            print(f"Error listing Storage files: {str(e)}")
            print("\nTroubleshooting:")
            print("1. Ensure images are uploaded in: modelPhotos/plants/, modelPhotos/flowers/, or modelPhotos/architecture/")
            print("2. Or upload through the app: Developer_PlantsPage, Developer_FlowersPage, Developer_ArchitecturesPage")
            return 0
        
        self._print_download_summary(image_count, class_counts)
        return image_count
    
    def _print_download_summary(self, image_count, class_counts):
        """Print download summary"""
        print(f"\n{'='*80}")
        print(f"Download Summary:")
        print(f"Total images downloaded: {image_count}")
        print(f"Classes found: {len(class_counts)}")
        for class_name, count in class_counts.items():
            print(f"  - {class_name}: {count} images")
        print(f"{'='*80}\n")
    
    def load_existing_class_names(self):
        """
        Load existing class names from the saved JSON file
        Returns a dictionary mapping class names to indices, or empty dict if file doesn't exist
        """
        category_singular = self.category.rstrip('s')
        class_names_path = self.output_dir / f'{category_singular}_class_names.json'
        
        if class_names_path.exists():
            print(f"Loading existing class names from: {class_names_path}")
            with open(class_names_path, 'r') as f:
                # Load the existing mapping (format: {"0": "class_name1", "1": "class_name2", ...})
                existing_map = json.load(f)
                # Convert to {class_name: index} format for easier use
                class_name_to_index = {v: int(k) for k, v in existing_map.items()}
                print(f"Found {len(class_name_to_index)} existing classes: {list(class_name_to_index.keys())}")
                return class_name_to_index
        else:
            print("No existing class names file found. Starting fresh.")
            return {}
    
    def prepare_data_generators(self, existing_class_mapping=None):
        """
        Prepare training and validation data generators
        
        Args:
            existing_class_mapping: Optional dict mapping class names to indices from previous training
        """
        print("Preparing data generators...")
        
        if existing_class_mapping:
            print(f"Using existing class mapping with {len(existing_class_mapping)} classes")
        
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
        
        # If we have existing classes, we need to ensure the class indices align
        # Create generators with custom classes parameter if available
        if existing_class_mapping:
            # Get the classes found in the downloaded training data
            import os
            new_classes_found = sorted([d for d in os.listdir(self.temp_dataset_dir) 
                                       if os.path.isdir(os.path.join(self.temp_dataset_dir, d))])
            print(f"New classes found in training data: {new_classes_found}")
            
            # Merge existing and new classes
            merged_class_mapping = existing_class_mapping.copy()
            next_index = max(existing_class_mapping.values()) + 1 if existing_class_mapping else 0
            
            for class_name in new_classes_found:
                if class_name not in merged_class_mapping:
                    merged_class_mapping[class_name] = next_index
                    print(f"Adding new class: {class_name} -> index {next_index}")
                    next_index += 1
                else:
                    print(f"Class {class_name} already exists at index {merged_class_mapping[class_name]}")
            
            # CRITICAL FIX: Create a classes list that matches the merged mapping order
            # This ensures the generator's class_indices align with the model's output neurons
            # Sort by index to get correct order: ["rose", "tulip", "daisy", "lily", "sunflower"]
            classes_list = [name for name, idx in sorted(merged_class_mapping.items(), key=lambda x: x[1])]
            print(f"Creating generators with class order: {classes_list}")
            
            # Create placeholder directories for existing classes that don't have new training images
            # This is necessary so flow_from_directory recognizes all classes
            for class_name in classes_list:
                class_dir = self.temp_dataset_dir / class_name
                if not class_dir.exists():
                    class_dir.mkdir(parents=True)
                    print(f"Created placeholder directory for existing class: {class_name}")
        else:
            classes_list = None
            merged_class_mapping = None
        
        # Create generators with explicit class ordering to match merged mapping
        train_generator = train_datagen.flow_from_directory(
            str(self.temp_dataset_dir),
            target_size=self.input_size,
            batch_size=self.batch_size,
            class_mode='categorical',
            subset='training',
            shuffle=True,
            classes=classes_list  # CRITICAL: Explicit class ordering
        )
        
        validation_generator = train_datagen.flow_from_directory(
            str(self.temp_dataset_dir),
            target_size=self.input_size,
            batch_size=self.batch_size,
            class_mode='categorical',
            subset='validation',
            shuffle=False,
            classes=classes_list  # CRITICAL: Explicit class ordering
        )
        
        # If we have a merged class mapping, store it for later use
        # We need to return this so it can be used when saving
        if merged_class_mapping:
            # Store the merged mapping for saving later
            train_generator.merged_class_indices = merged_class_mapping
            num_classes = len(merged_class_mapping)
            print(f"Total classes (existing + new): {num_classes}")
            print(f"Generator class_indices after fix: {train_generator.class_indices}")
            
            # Verify the mapping is correct
            for class_name, expected_idx in merged_class_mapping.items():
                actual_idx = train_generator.class_indices.get(class_name, -1)
                if actual_idx != expected_idx:
                    print(f"⚠️  WARNING: Class '{class_name}' has index {actual_idx} in generator but should be {expected_idx}")
        else:
            train_generator.merged_class_indices = train_generator.class_indices
            num_classes = len(train_generator.class_indices)
        
        print(f"Found {train_generator.samples} training images belonging to {len(train_generator.class_indices)} classes.")
        print(f"Found {validation_generator.samples} validation images")
        print(f"Class Mapping for training data: {train_generator.class_indices}")
        
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
            pooling='avg',
            name='mobilenetv2_base'  # Assign a name for easy lookup
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
        
        # Find the base model by its name (new way) or default name (old way)
        base_model = None
        try:
            # Try to get the layer by the new, explicit name
            base_model = model.get_layer('mobilenetv2_base')
        except ValueError:
            print("Could not find layer 'mobilenetv2_base'. Looking for default name...")
            try:
                # Fallback to the default name for older models
                base_model = model.get_layer('mobilenetv2_1.00_224')
                print("Found base model with default name: 'mobilenetv2_1.00_224'")
            except ValueError:
                print("ERROR: Could not find the MobileNetV2 base model layer by name.")

        if base_model:
            base_model.trainable = True
            # Fine-tune the top 50 layers
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
    
    def save_model_and_metadata(self, model, class_indices, merged_class_indices=None):
        """
        Save model and class mapping to local directory
        
        Args:
            model: The trained model
            class_indices: The class indices from the training generator (only new classes)
            merged_class_indices: The merged class indices including existing classes (optional)
        """
        print("\n" + "="*80)
        print("Saving Model and Metadata")
        print("="*80 + "\n")
        
        # Save model
        # Use singular category name for file path
        category_singular = self.category.rstrip('s')
        model_save_path = self.output_dir / f'{category_singular}_img_classifier.keras'
        model.save(str(model_save_path))
        print(f"Model saved to: {model_save_path}")
        
        # Save .h5 format
        h5_model_path = self.output_dir / f'{category_singular}_img_classifier.h5'
        model.save(str(h5_model_path))
        print(f"Model saved in .h5 format to: {h5_model_path}")
        
        # Save class mapping - use merged mapping if available to preserve existing classes
        if merged_class_indices:
            print("Using merged class indices (preserving existing classes)")
            class_names_map = {str(v): k for k, v in merged_class_indices.items()}
        else:
            print("Using class indices from training data only")
            class_names_map = {str(v): k for k, v in class_indices.items()}
        
        class_names_path = self.output_dir / f'{category_singular}_class_names.json'
        with open(class_names_path, 'w') as f:
            json.dump(class_names_map, f, indent=4)
        print(f"Class mapping saved to: {class_names_path}")
        print(f"Total classes saved: {len(class_names_map)}")
        for idx, name in sorted([(int(k), v) for k, v in class_names_map.items()]):
            print(f"  {idx}: {name}")
        
        return model_save_path, class_names_path
    
    def upload_to_firebase(self, model_path, class_names_path):
        """
        Upload trained model and class names to Firebase Storage
        """
        print("\n" + "="*80)
        print("Uploading to Firebase Storage")
        print("="*80 + "\n")
        
        # Ensure singular category name for Firebase path
        category_singular = self.category.rstrip('s')
        
        # Upload model
        model_blob = self.bucket.blob(f'{category_singular}_best_model.keras')
        model_blob.upload_from_filename(str(model_path))
        print(f"Uploaded model to: {category_singular}_best_model.keras")
        
        # Upload class names
        class_names_blob = self.bucket.blob(f'{category_singular}_class_names.json')
        class_names_blob.upload_from_filename(str(class_names_path))
        print(f"Uploaded class names to: {category_singular}_class_names.json")
        
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
        Tries two methods:
        1. Delete via Firestore metadata (preferred)
        2. Delete directly from Storage (fallback)
        """
        print("\n" + "="*80)
        print(f"Deleting {self.category} training images from Firebase...")
        print("="*80 + "\n")
        
        # Try Method 1: Delete via Firestore metadata
        try:
            images_ref = self.db.collection('modelPhotos').document(self.category).collection('images')
            images_list = list(images_ref.stream())
            
            if images_list:
                print(f"Found {len(images_list)} images in Firestore. Deleting via Firestore method.")
                self._delete_via_firestore(images_list)
                return
            else:
                print("No images found in Firestore. Trying direct Storage deletion...")
        except Exception as e:
            print(f"Firestore query failed: {str(e)}")
            print("Trying direct Storage deletion...")
        
        # Method 2: Delete directly from Storage
        self._delete_from_storage_direct()
    
    def _delete_via_firestore(self, images_list):
        """Delete images using Firestore metadata (preferred method)"""
        deleted_count = 0
        
        for img_doc in images_list:
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
    
    def _delete_from_storage_direct(self):
        """Delete images by listing Storage directly (fallback method)"""
        print(f"Deleting files directly from Storage: modelPhotos/{self.category}/")
        
        deleted_count = 0
        
        try:
            # List all blobs in the category folder
            blobs = self.bucket.list_blobs(prefix=f'modelPhotos/{self.category}/')
            
            for blob in blobs:
                # Skip if it's a folder or not an image
                if blob.name.endswith('/') or not blob.name.lower().endswith(('.jpg', '.jpeg', '.png')):
                    continue
                
                try:
                    blob.delete()
                    deleted_count += 1
                    print(f"Deleted from storage: {blob.name}")
                except Exception as e:
                    print(f"Error deleting {blob.name}: {str(e)}")
            
            print(f"\nDeleted {deleted_count} images from Firebase Storage")
            
        except Exception as e:
            print(f"Error listing Storage files for deletion: {str(e)}")
    
    def retrain(self, delete_images_after=True):
        """
        Complete retraining workflow
        
        Args:
            delete_images_after: Whether to delete training images after successful training
        """
        try:
            # Load existing class names to preserve them
            existing_class_mapping = self.load_existing_class_names()
            
            # Download images
            image_count = self.download_images_from_firebase()
            
            if image_count == 0:
                print("No images found in Firebase. Aborting training.")
                return False
            
            # Prepare data with existing class mapping
            train_gen, val_gen, num_classes = self.prepare_data_generators(existing_class_mapping)
            
            # Check if existing model exists for fine-tuning
            # Use singular form for model filename
            category_singular = self.category.rstrip('s')
            existing_model_path = self.output_dir / f'{category_singular}_img_classifier.keras'
            
            # Build model
            model = self.build_model(num_classes, existing_model_path if existing_model_path.exists() else None)
            
            # Train model
            model = self.train_model(model, train_gen, val_gen)
            
            # Save model and metadata with merged class mapping
            # The merged_class_indices was stored in the train_generator during prepare_data_generators
            merged_class_indices = getattr(train_gen, 'merged_class_indices', train_gen.class_indices)
            model_path, class_names_path = self.save_model_and_metadata(
                model, 
                train_gen.class_indices,
                merged_class_indices
            )
            
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

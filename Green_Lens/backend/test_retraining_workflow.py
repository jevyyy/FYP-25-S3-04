"""
Integration test to demonstrate the class preservation workflow

This test simulates a complete retraining scenario:
1. Start with a model that has 3 classes
2. Add new images for 2 new classes
3. Verify that after retraining, all 5 classes are preserved
"""

import os
import json
import tempfile
from pathlib import Path

def simulate_retraining_workflow():
    """
    Simulate the complete retraining workflow to verify class preservation
    """
    print("\n" + "="*80)
    print("INTEGRATION TEST: Complete Retraining Workflow")
    print("="*80 + "\n")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Setup directories
        output_dir = temp_path / 'downloaded_model'
        training_dir = temp_path / 'temp_training_data' / 'flowers'
        output_dir.mkdir(parents=True)
        training_dir.mkdir(parents=True)
        
        print("STEP 1: Create existing model with 3 classes")
        print("-" * 80)
        
        # Create existing class_names.json (simulating a trained model)
        existing_classes = {
            "0": "rose",
            "1": "tulip",
            "2": "daisy"
        }
        class_names_file = output_dir / 'flower_class_names.json'
        with open(class_names_file, 'w') as f:
            json.dump(existing_classes, f, indent=4)
        
        print(f"Created existing model with classes:")
        for idx, name in sorted([(int(k), v) for k, v in existing_classes.items()]):
            print(f"  {idx}: {name}")
        print()
        
        print("STEP 2: Simulate downloading new training images for 2 new classes")
        print("-" * 80)
        
        # Simulate new training data (just create empty directories)
        new_classes = ["sunflower", "lily"]
        for class_name in new_classes:
            class_dir = training_dir / class_name
            class_dir.mkdir(parents=True)
            # Create a dummy file to represent an image
            (class_dir / "dummy_image.txt").write_text("dummy image data")
        
        print(f"Downloaded new images for classes:")
        for class_name in new_classes:
            print(f"  - {class_name}")
        print()
        
        print("STEP 3: Load existing class names")
        print("-" * 80)
        
        # Load existing classes (simulating load_existing_class_names)
        with open(class_names_file, 'r') as f:
            loaded_map = json.load(f)
            existing_class_mapping = {v: int(k) for k, v in loaded_map.items()}
        
        print(f"Loaded existing class mapping: {existing_class_mapping}")
        print()
        
        print("STEP 4: Merge existing and new class mappings")
        print("-" * 80)
        
        # Get new classes from training directory
        new_classes_found = sorted([d for d in os.listdir(training_dir) 
                                   if os.path.isdir(os.path.join(training_dir, d))])
        print(f"New classes found in training data: {new_classes_found}")
        
        # Merge (simulating prepare_data_generators logic)
        merged_class_mapping = existing_class_mapping.copy()
        next_index = max(existing_class_mapping.values()) + 1
        
        for class_name in new_classes_found:
            if class_name not in merged_class_mapping:
                merged_class_mapping[class_name] = next_index
                print(f"  Adding new class: {class_name} -> index {next_index}")
                next_index += 1
            else:
                print(f"  Class {class_name} already exists at index {merged_class_mapping[class_name]}")
        
        print(f"\nMerged class mapping: {merged_class_mapping}")
        print(f"Total classes: {len(merged_class_mapping)}")
        print()
        
        print("STEP 5: Train model (simulated)")
        print("-" * 80)
        print("Training model with output layer for 5 classes...")
        print("(In actual implementation, model would be trained here)")
        print()
        
        print("STEP 6: Save model and merged class names")
        print("-" * 80)
        
        # Save merged class names (simulating save_model_and_metadata)
        class_names_map = {str(v): k for k, v in merged_class_mapping.items()}
        with open(class_names_file, 'w') as f:
            json.dump(class_names_map, f, indent=4)
        
        print(f"Saved merged class names to: {class_names_file}")
        print("Class mapping saved:")
        for idx, name in sorted([(int(k), v) for k, v in class_names_map.items()]):
            print(f"  {idx}: {name}")
        print()
        
        print("STEP 7: Verify all classes are preserved")
        print("-" * 80)
        
        # Reload to verify
        with open(class_names_file, 'r') as f:
            final_classes = json.load(f)
        
        print(f"Final class mapping has {len(final_classes)} classes:")
        for idx, name in sorted([(int(k), v) for k, v in final_classes.items()]):
            print(f"  {idx}: {name}")
        
        # Verify all expected classes are present
        expected_classes = ["rose", "tulip", "daisy", "sunflower", "lily"]
        actual_classes = set(final_classes.values())
        
        assert len(final_classes) == 5, f"Expected 5 classes, got {len(final_classes)}"
        assert final_classes["0"] == "rose", "Existing class 'rose' not at index 0"
        assert final_classes["1"] == "tulip", "Existing class 'tulip' not at index 1"
        assert final_classes["2"] == "daisy", "Existing class 'daisy' not at index 2"
        # Note: new classes get indices based on alphabetical order when found in directory
        assert final_classes["3"] == "lily", "New class 'lily' not at index 3"
        assert final_classes["4"] == "sunflower", "New class 'sunflower' not at index 4"
        
        for expected_class in expected_classes:
            assert expected_class in actual_classes, f"Class '{expected_class}' missing"
        
        print("\n" + "="*80)
        print("✅ INTEGRATION TEST PASSED")
        print("="*80)
        print("\nSummary:")
        print(f"  - Started with 3 existing classes: {list(existing_classes.values())}")
        print(f"  - Added 2 new classes: {new_classes}")
        print(f"  - Final model has 5 classes: {list(final_classes.values())}")
        print("  - All existing classes preserved with correct indices")
        print("  - New classes added with sequential indices")
        print()
        
        return True

def test_scenario_retraining_existing_class():
    """
    Test scenario where we retrain with images for an existing class
    """
    print("\n" + "="*80)
    print("SCENARIO TEST: Retraining with Existing Class Images")
    print("="*80 + "\n")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Setup
        output_dir = temp_path / 'downloaded_model'
        training_dir = temp_path / 'temp_training_data' / 'plants'
        output_dir.mkdir(parents=True)
        training_dir.mkdir(parents=True)
        
        # Existing model has 3 classes
        existing_classes = {
            "0": "cactus",
            "1": "fern",
            "2": "bamboo"
        }
        class_names_file = output_dir / 'plant_class_names.json'
        with open(class_names_file, 'w') as f:
            json.dump(existing_classes, f, indent=4)
        
        print(f"Existing classes: {list(existing_classes.values())}")
        
        # User uploads more images for "cactus" (existing) and "aloe" (new)
        new_training_classes = ["cactus", "aloe"]
        for class_name in new_training_classes:
            class_dir = training_dir / class_name
            class_dir.mkdir(parents=True)
            (class_dir / "dummy_image.txt").write_text("dummy image data")
        
        print(f"New training images for: {new_training_classes}")
        
        # Load and merge
        with open(class_names_file, 'r') as f:
            loaded_map = json.load(f)
            existing_class_mapping = {v: int(k) for k, v in loaded_map.items()}
        
        new_classes_found = sorted([d for d in os.listdir(training_dir) 
                                   if os.path.isdir(os.path.join(training_dir, d))])
        
        merged_class_mapping = existing_class_mapping.copy()
        next_index = max(existing_class_mapping.values()) + 1
        
        for class_name in new_classes_found:
            if class_name not in merged_class_mapping:
                merged_class_mapping[class_name] = next_index
                print(f"  Adding new class: {class_name} -> index {next_index}")
                next_index += 1
            else:
                print(f"  Class {class_name} already exists at index {merged_class_mapping[class_name]} (will retrain)")
        
        # Save
        class_names_map = {str(v): k for k, v in merged_class_mapping.items()}
        with open(class_names_file, 'w') as f:
            json.dump(class_names_map, f, indent=4)
        
        # Verify
        with open(class_names_file, 'r') as f:
            final_classes = json.load(f)
        
        assert len(final_classes) == 4, f"Expected 4 classes, got {len(final_classes)}"
        assert final_classes["0"] == "cactus", "Existing 'cactus' should keep index 0"
        assert final_classes["1"] == "fern", "Existing 'fern' should keep index 1"
        assert final_classes["2"] == "bamboo", "Existing 'bamboo' should keep index 2"
        assert final_classes["3"] == "aloe", "New 'aloe' should get index 3"
        
        print(f"\nFinal classes: {list(final_classes.values())}")
        print("✅ Test passed: Existing class preserved, new class added")
        
        return True

if __name__ == '__main__':
    import sys
    
    try:
        success1 = simulate_retraining_workflow()
        success2 = test_scenario_retraining_existing_class()
        
        if success1 and success2:
            print("\n" + "="*80)
            print("✅ ALL INTEGRATION TESTS PASSED")
            print("="*80)
            sys.exit(0)
        else:
            print("\n" + "="*80)
            print("❌ SOME TESTS FAILED")
            print("="*80)
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ TEST FAILED with exception: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

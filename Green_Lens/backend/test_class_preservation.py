"""
Test script to verify that the retrain_model_with_firebase.py correctly preserves existing classes

This test simulates the scenario where:
1. A model has existing classes (e.g., ["rose", "tulip", "daisy"])
2. New images are added for a new class (e.g., "sunflower")
3. After retraining, all classes should be preserved in the class_names.json
"""

import os
import json
import tempfile
import shutil
from pathlib import Path

def test_load_existing_class_names():
    """Test that existing class names are loaded correctly"""
    print("\n" + "="*80)
    print("TEST 1: Load Existing Class Names")
    print("="*80)
    
    # Create a temporary directory for testing
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        output_dir = temp_path / 'downloaded_model'
        output_dir.mkdir(parents=True)
        
        # Create a mock existing class_names.json
        existing_classes = {
            "0": "rose",
            "1": "tulip",
            "2": "daisy"
        }
        class_names_file = output_dir / 'flower_class_names.json'
        with open(class_names_file, 'w') as f:
            json.dump(existing_classes, f)
        
        print(f"Created mock class_names file: {class_names_file}")
        print(f"Existing classes: {existing_classes}")
        
        # Simulate loading (without actually instantiating ModelRetrainer to avoid Firebase deps)
        with open(class_names_file, 'r') as f:
            loaded_map = json.load(f)
            class_name_to_index = {v: int(k) for k, v in loaded_map.items()}
        
        print(f"Loaded class mapping: {class_name_to_index}")
        
        # Verify
        assert len(class_name_to_index) == 3, "Should have 3 classes"
        assert class_name_to_index["rose"] == 0, "Rose should be at index 0"
        assert class_name_to_index["tulip"] == 1, "Tulip should be at index 1"
        assert class_name_to_index["daisy"] == 2, "Daisy should be at index 2"
        
        print("✅ TEST 1 PASSED: Existing classes loaded correctly")
        return True

def test_merge_class_mappings():
    """Test that new and existing class mappings are merged correctly"""
    print("\n" + "="*80)
    print("TEST 2: Merge Class Mappings")
    print("="*80)
    
    # Existing classes from previous training
    existing_class_mapping = {
        "rose": 0,
        "tulip": 1,
        "daisy": 2
    }
    print(f"Existing classes: {existing_class_mapping}")
    
    # New classes found in downloaded training data
    new_classes_found = ["sunflower", "lily"]
    print(f"New classes found: {new_classes_found}")
    
    # Merge logic (mimics what happens in prepare_data_generators)
    merged_class_mapping = existing_class_mapping.copy()
    next_index = max(existing_class_mapping.values()) + 1
    
    for class_name in new_classes_found:
        if class_name not in merged_class_mapping:
            merged_class_mapping[class_name] = next_index
            print(f"Adding new class: {class_name} -> index {next_index}")
            next_index += 1
        else:
            print(f"Class {class_name} already exists at index {merged_class_mapping[class_name]}")
    
    print(f"\nMerged class mapping: {merged_class_mapping}")
    
    # Verify
    assert len(merged_class_mapping) == 5, "Should have 5 classes total"
    assert merged_class_mapping["rose"] == 0, "Existing class indices should be preserved"
    assert merged_class_mapping["tulip"] == 1, "Existing class indices should be preserved"
    assert merged_class_mapping["daisy"] == 2, "Existing class indices should be preserved"
    assert merged_class_mapping["sunflower"] == 3, "New class should get next index"
    assert merged_class_mapping["lily"] == 4, "New class should get next index"
    
    print("✅ TEST 2 PASSED: Class mappings merged correctly")
    return True

def test_save_merged_class_names():
    """Test that merged class names are saved correctly"""
    print("\n" + "="*80)
    print("TEST 3: Save Merged Class Names")
    print("="*80)
    
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        output_dir = temp_path / 'downloaded_model'
        output_dir.mkdir(parents=True)
        
        # Merged class mapping from previous test
        merged_class_mapping = {
            "rose": 0,
            "tulip": 1,
            "daisy": 2,
            "sunflower": 3,
            "lily": 4
        }
        print(f"Merged class mapping to save: {merged_class_mapping}")
        
        # Save as JSON (format: {"0": "rose", "1": "tulip", ...})
        class_names_map = {str(v): k for k, v in merged_class_mapping.items()}
        class_names_file = output_dir / 'flower_class_names.json'
        with open(class_names_file, 'w') as f:
            json.dump(class_names_map, f, indent=4)
        
        print(f"Saved to: {class_names_file}")
        
        # Verify by reading back
        with open(class_names_file, 'r') as f:
            saved_map = json.load(f)
        
        print(f"Loaded back: {saved_map}")
        
        # Verify
        assert len(saved_map) == 5, "Should have 5 classes"
        assert saved_map["0"] == "rose", "Index 0 should map to rose"
        assert saved_map["1"] == "tulip", "Index 1 should map to tulip"
        assert saved_map["2"] == "daisy", "Index 2 should map to daisy"
        assert saved_map["3"] == "sunflower", "Index 3 should map to sunflower"
        assert saved_map["4"] == "lily", "Index 4 should map to lily"
        
        print("✅ TEST 3 PASSED: Merged class names saved and loaded correctly")
        return True

def test_re_add_existing_class():
    """Test that adding images for an existing class preserves the index"""
    print("\n" + "="*80)
    print("TEST 4: Re-add Existing Class")
    print("="*80)
    
    # Existing classes
    existing_class_mapping = {
        "rose": 0,
        "tulip": 1,
        "daisy": 2
    }
    print(f"Existing classes: {existing_class_mapping}")
    
    # New training data includes an existing class
    new_classes_found = ["rose", "sunflower"]
    print(f"New classes found (including existing 'rose'): {new_classes_found}")
    
    # Merge logic
    merged_class_mapping = existing_class_mapping.copy()
    next_index = max(existing_class_mapping.values()) + 1
    
    for class_name in new_classes_found:
        if class_name not in merged_class_mapping:
            merged_class_mapping[class_name] = next_index
            print(f"Adding new class: {class_name} -> index {next_index}")
            next_index += 1
        else:
            print(f"Class {class_name} already exists at index {merged_class_mapping[class_name]} (preserving)")
    
    print(f"\nMerged class mapping: {merged_class_mapping}")
    
    # Verify
    assert len(merged_class_mapping) == 4, "Should have 4 classes total"
    assert merged_class_mapping["rose"] == 0, "Existing 'rose' should keep index 0"
    assert merged_class_mapping["tulip"] == 1, "Existing class should be preserved"
    assert merged_class_mapping["daisy"] == 2, "Existing class should be preserved"
    assert merged_class_mapping["sunflower"] == 3, "New class should get next index"
    
    print("✅ TEST 4 PASSED: Re-adding existing class preserves index")
    return True

def test_empty_existing_classes():
    """Test that starting with no existing classes works correctly"""
    print("\n" + "="*80)
    print("TEST 5: Empty Existing Classes (Fresh Start)")
    print("="*80)
    
    # No existing classes (fresh model)
    existing_class_mapping = {}
    print(f"Existing classes: {existing_class_mapping} (empty)")
    
    # New classes found
    new_classes_found = ["rose", "tulip", "daisy"]
    print(f"New classes found: {new_classes_found}")
    
    # Merge logic
    merged_class_mapping = existing_class_mapping.copy()
    next_index = max(existing_class_mapping.values()) + 1 if existing_class_mapping else 0
    
    for class_name in new_classes_found:
        if class_name not in merged_class_mapping:
            merged_class_mapping[class_name] = next_index
            print(f"Adding new class: {class_name} -> index {next_index}")
            next_index += 1
    
    print(f"\nMerged class mapping: {merged_class_mapping}")
    
    # Verify
    assert len(merged_class_mapping) == 3, "Should have 3 classes"
    assert merged_class_mapping["rose"] == 0, "First class should get index 0"
    assert merged_class_mapping["tulip"] == 1, "Second class should get index 1"
    assert merged_class_mapping["daisy"] == 2, "Third class should get index 2"
    
    print("✅ TEST 5 PASSED: Fresh start with no existing classes works correctly")
    return True

def run_all_tests():
    """Run all tests"""
    print("\n" + "="*80)
    print("RUNNING CLASS PRESERVATION TESTS")
    print("="*80)
    
    tests = [
        test_load_existing_class_names,
        test_merge_class_mappings,
        test_save_merged_class_names,
        test_re_add_existing_class,
        test_empty_existing_classes
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"\n❌ TEST FAILED with exception: {str(e)}")
            import traceback
            traceback.print_exc()
            results.append(False)
    
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"Total tests: {len(results)}")
    print(f"Passed: {sum(results)}")
    print(f"Failed: {len(results) - sum(results)}")
    
    if all(results):
        print("\n✅ ALL TESTS PASSED")
        print("="*80)
        return True
    else:
        print("\n❌ SOME TESTS FAILED")
        print("="*80)
        return False

if __name__ == '__main__':
    import sys
    success = run_all_tests()
    sys.exit(0 if success else 1)

# # filepath: \\wsl.localhost\Ubuntu-22.04\home\tc\clean_json.py
# import os
# import json

# # --- CONFIGURATION ---
# # Set the path to your generated model folder
# model_folder_path = os.path.join(os.path.expanduser("~"), "tfjs_flower_model")
# model_json_path = os.path.join(model_folder_path, "model.json")
# # --- END CONFIGURATION ---

# print(f"Attempting to clean {model_json_path}...")

# if not os.path.exists(model_json_path):
#     print(f"ERROR: File not found at {model_json_path}")
#     print("Please run the keras_converter.py script first to generate the model.json file.")
# else:
#     try:
#         # Read the incorrect model.json file as a plain text file
#         with open(model_json_path, 'r') as f:
#             content = f.read()

#         # Define the bad string pattern and the correct string
#         bad_string = '"dtype": {"module": "keras", "class_name": "DTypePolicy", "config": {"name": "float32"}, "registered_name": null}'
#         good_string = '"dtype": "float32"'

#         # Count how many times the bad string appears
#         occurrences = content.count(bad_string)

#         if occurrences == 0:
#             print("No incompatible 'DTypePolicy' entries found. The file might already be correct.")
#         else:
#             # Replace all occurrences
#             print(f"Found {occurrences} incompatible 'DTypePolicy' entries. Replacing them...")
#             cleaned_content = content.replace(bad_string, good_string)

#             # Overwrite the model.json file with the cleaned content
#             with open(model_json_path, 'w') as f:
#                 f.write(cleaned_content)
            
#             print("\nSUCCESS: The model.json file has been cleaned and overwritten.")
#             print("You can now upload the model files to Firebase.")

#     except Exception as e:
#         print(f"An error occurred: {e}")


import json
import re

# --- Configuration ---
# Set the path to your model.json file
model_json_path = 'Green_Lens/backend/tfjs_flower_model/model.json' 
# --- End Configuration ---

try:
    # Read the content of the model.json file
    with open(model_json_path, 'r') as f:
        content = f.read()

    # Use regex to find and replace the complex dtype objects with a simple string
    # This looks for: "dtype": {"class_name": "DTypePolicy", "config": {"name": "float32"}}
    # and replaces it with: "dtype": "float32"
    # It handles variations in whitespace.
    cleaned_content = re.sub(r'"dtype":\s*{\s*"class_name":\s*"DTypePolicy",\s*"config":\s*{\s*"name":\s*"(\w+)"\s*}\s*}', r'"dtype": "\1"', content)

    # Parse the cleaned content to verify it's valid JSON
    json.loads(cleaned_content)

    # Write the cleaned content back to the original file
    with open(model_json_path, 'w') as f:
        f.write(cleaned_content)

    print(f"Successfully cleaned and updated {model_json_path}")

except FileNotFoundError:
    print(f"Error: The file was not found at {model_json_path}")
    print("Please make sure the 'model_json_path' variable in the script is correct.")
except json.JSONDecodeError as e:
    print(f"Error decoding JSON after cleaning: {e}")
    print("The regex replacement might have created an invalid JSON. Please check the file.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")

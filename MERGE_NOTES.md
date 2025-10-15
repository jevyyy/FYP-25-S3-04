# Branch Merge Notes: KX + fastAPI

## What Was Merged

This branch consolidates content from two separate branches:
- **fastAPI branch**: Basic plant recognition functionality with a simple UI
- **KX branch**: Full-featured application with navigation, authentication, and multiple user roles

## Changes Made

### 1. Removed Deprecated Root-Level Files
The following files at `Green_Lens/` root were removed as they were older versions from the fastAPI branch:

- ❌ `App.js` (20 lines - basic version)
- ❌ `index.js` (duplicate of frontend/index.js)
- ❌ `package.json` (minimal dependencies)
- ❌ `package-lock.json`
- ❌ `.gitignore` (identical to frontend version)
- ❌ `app.json` (less complete than frontend version)

### 2. Removed Duplicate Directories
- ❌ `Green_Lens/screens/` - Identical copy of `frontend/screens/`
- ❌ `Green_Lens/assets/` - Merged into `frontend/assets/`
- ❌ `Green_Lens/frontend/Script_DB_Populate - Copy/` - Duplicate backup directory

### 3. Consolidated Files
- ✅ `Green_Lens/services/` → Moved to `Green_Lens/frontend/services/`
- ✅ `Green_Lens/assets/splash-icon.png` → Copied to `frontend/assets/`

### 4. Enhanced Configuration Files
Updated `Green_Lens/frontend/app.json`:
- Added iOS support (`supportsTablet: true`)
- Fixed splash screen to use `splash-icon.png`
- Fixed adaptive icon to use `adaptive-icon.png`
- Kept Android permissions from KX branch

## Final Structure

```
Green_Lens/
├── backend/              # Python Flask API for plant recognition
│   ├── app.py
│   ├── requirements.txt
│   ├── src/
│   ├── downloaded_model/
│   └── ...
│
└── frontend/             # React Native Expo application
    ├── App.js            # Main app with navigation (382 lines)
    ├── index.js          # Expo entry point
    ├── package.json      # All dependencies (navigation, Firebase, etc.)
    ├── app.json          # Expo configuration (merged)
    ├── .gitignore        # Standard Expo gitignore
    ├── assets/           # All app assets (merged)
    ├── screens/          # All app screens
    ├── services/         # API services (plantRecognitionApi.js)
    ├── functions/        # Firebase functions
    ├── Script_DB_Populate/ # Database population scripts
    └── Testcases/        # Test files
```

## Why These Changes?

1. **Eliminated Duplication**: The root-level files were exact duplicates or older versions of files in the `frontend/` directory
2. **Proper Organization**: All frontend code is now in `frontend/`, all backend code in `backend/`
3. **Complete Feature Set**: Kept the KX branch's full application (navigation, auth, multiple roles) rather than the simpler fastAPI version
4. **Best of Both**: 
   - Full navigation and authentication from KX branch
   - Plant recognition API service from fastAPI branch
   - Merged configurations to include all necessary settings

## How to Run

### Backend (Python Flask API)
```bash
cd Green_Lens/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd src
python app.py
```

### Frontend (React Native Expo)
```bash
cd Green_Lens/frontend
npm install
npm start
```

## Key Files to Note

### Frontend Main Entry Points
- **`frontend/App.js`**: Main application with full navigation structure
- **`frontend/index.js`**: Expo entry point that registers the App component
- **`frontend/services/plantRecognitionApi.js`**: Service to communicate with backend API

### Backend
- **`backend/src/app.py`**: Flask API with plant recognition endpoints
- **`backend/requirements.txt`**: Python dependencies (TensorFlow, Flask, etc.)

## Dependencies

### Frontend (from frontend/package.json)
- React Native 0.81.4
- Expo 54.0.0
- React Navigation (drawer, bottom tabs, native stack)
- Firebase (@react-native-firebase)
- Expo Camera, Image Picker, Media Library
- And more...

### Backend (from backend/requirements.txt)
- TensorFlow 2.15.0
- Flask
- Firebase Admin SDK
- And more...

## Notes for Developers

1. **No Duplicate Files**: All duplicate files have been removed. If you need to add new screens/services, add them in the `frontend/` directory
2. **Plant Recognition**: The plant recognition API service is now at `frontend/services/plantRecognitionApi.js`
3. **Database Scripts**: Use `frontend/Script_DB_Populate/` for populating Firebase database
4. **Configuration**: All Expo configuration is in `frontend/app.json`
5. **Assets**: All images and assets are in `frontend/assets/`

## Testing the Merge

To verify everything works:

1. **Test Backend**:
   ```bash
   curl http://localhost:5000/health
   ```

2. **Test Frontend**:
   ```bash
   cd Green_Lens/frontend
   npm start
   ```
   
3. **Test Plant Recognition**: Use the app to take a photo and send it to the backend API

## Version Control Files

All version control files (`.gitignore`, `.expo`) are now properly configured:
- `.gitignore` in `frontend/` excludes `node_modules/`, `.expo/`, and other build artifacts
- Root `.gitignore` handles repository-level exclusions

# Path Configuration Summary

This document summarizes all the path improvements made to ensure the application uses dynamic, robust paths that won't break easily.

## Changes Made

### 1. Backend API Configuration (Frontend)

**File**: `Green_Lens/frontend/services/plantRecognitionApi.js`

**Before:**
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

**After:**
```javascript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
```

**Benefit**: API URL can now be configured via environment variables, making it easy to switch between development, staging, and production environments without code changes.

### 2. Backend Service Account Path

**File**: `Green_Lens/backend/app.py`

**Before:**
```python
SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'Green_Lens', 'backend', 'service-account.json')
```

**After:**
```python
SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), 'service-account.json')
```

**Benefit**: Uses dynamic path resolution relative to the script location. Works correctly regardless of where the script is run from.

### 3. FirebaseConfig Import Standardization

**Files Updated:**
- `Green_Lens/frontend/Script_DB_Populate/populateRewards.js`
- `Green_Lens/frontend/Script_DB_Populate/seedQuestions.js`
- `Green_Lens/frontend/Script_DB_Populate/seedUsers.js`
- `Green_Lens/frontend/Testcases/loginTest.js`
- `Green_Lens/frontend/screens/Admin/Admin_HomePage.jsx`

**Changes:**
- Removed unnecessary `.js` extensions from imports
- Removed redundant comments like "// adjust path if needed"
- All imports now use consistent format: `import { app } from '../firebaseConfig'` or `import { app } from '../../firebaseConfig'`

**Benefit**: Consistent import style across all files, modern ES6 module syntax without extensions.

### 4. Asset Path Comment Cleanup

**File**: `Green_Lens/frontend/screens/LoginSelectionPage.jsx`

**Before:**
```javascript
source={require('../assets/Green_Lens_logo.png')} // adjust path if necessary
```

**After:**
```javascript
source={require('../assets/Green_Lens_logo.png')}
```

**Benefit**: Removed misleading comment; path is already correct and uses relative path resolution.

### 5. Environment Configuration

**New File**: `Green_Lens/frontend/.env.example`

```bash
# Backend API Configuration
# Copy this file to .env and update with your values

# Backend API URL
# For local development:
EXPO_PUBLIC_API_URL=http://localhost:5000

# For production (uncomment and set your production URL):
# EXPO_PUBLIC_API_URL=https://your-api-domain.com
```

**Updated**: `Green_Lens/frontend/.gitignore`
- Added `.env` to gitignore
- Added `!.env.example` to ensure example file is tracked

**Benefit**: Provides a template for environment configuration while keeping actual credentials out of version control.

### 6. Documentation Updates

**Files Updated:**
- `README.md`: Added section on environment configuration
- `MERGE_NOTES.md`: Added comprehensive path configuration documentation

## Path Structure Reference

### Frontend Relative Paths

All relative paths are based on the importing file's location:

```
frontend/
├── firebaseConfig.js              # Firebase configuration
├── App.js                         # Imports: './screens/...'
├── screens/
│   ├── LoginSelectionPage.jsx    # Imports: '../firebaseConfig', '../assets/...'
│   ├── Admin/
│   │   └── *.jsx                 # Imports: '../../firebaseConfig', '../../assets/...'
│   └── User/
│       └── *.jsx                 # Imports: '../../firebaseConfig', '../../assets/...'
├── Script_DB_Populate/
│   └── *.js                      # Imports: '../firebaseConfig'
└── Testcases/
    └── *.js                      # Imports: '../firebaseConfig'
```

### Backend Dynamic Paths

All backend paths use `os.path` for dynamic resolution:

```python
# Service account (relative to app.py)
SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), 'service-account.json')

# Downloaded model directory (relative to app.py)
LOCAL_MODEL_DIR = os.path.join(os.path.dirname(__file__), 'downloaded_model')
```

## Usage Guidelines

### For Developers Adding New Files

1. **New Screen Component**: 
   - If in `screens/`: use `import { app } from '../firebaseConfig'`
   - If in `screens/Subfolder/`: use `import { app } from '../../firebaseConfig'`
   - For assets: use `require('../assets/...')` or `require('../../assets/...')` accordingly

2. **New API Service**:
   - Place in `services/` directory
   - Use environment variable for configurable URLs: `process.env.EXPO_PUBLIC_API_URL || 'default_url'`

3. **New Backend Script**:
   - Use `os.path.dirname(__file__)` as base for all file paths
   - Never use absolute paths like `/home/user/...` or `C:\Users\...`

### For Deployment

1. **Frontend**:
   ```bash
   cd Green_Lens/frontend
   cp .env.example .env
   # Edit .env with your production API URL
   npm install
   npm start
   ```

2. **Backend**:
   ```bash
   cd Green_Lens/backend
   # Place service-account.json in this directory
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python app.py
   ```

## Benefits Summary

✅ **Dynamic Path Resolution**: All paths are relative or use environment variables
✅ **Environment-Specific Configuration**: Easy to switch between dev/staging/prod
✅ **Consistent Code Style**: Standardized imports across all files
✅ **No Hardcoded Paths**: Won't break when deployed to different environments
✅ **Well-Documented**: Clear examples and guidelines for developers
✅ **Secure**: Environment variables keep sensitive data out of code
✅ **Maintainable**: Easier to update and modify paths when needed

## Verification

All paths have been verified to:
- ✓ Use relative imports based on file location
- ✓ Use environment variables for configurable values
- ✓ Use dynamic path resolution in backend
- ✓ Follow consistent import patterns
- ✓ Work correctly from any working directory

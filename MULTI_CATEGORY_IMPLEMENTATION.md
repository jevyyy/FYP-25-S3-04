# Multi-Category Recognition Implementation

## Overview
This document describes the implementation of multi-category recognition support (flower, plant, architecture) for the Green Lens application.

## Changes Made

### Backend Changes (`Green_Lens/backend/app.py`)

#### 1. Configuration Structure
Created a centralized configuration dictionary for all three categories:

```python
CATEGORIES = {
    'flower': {
        'model_file': 'flower_best_model.keras',
        'class_names_file': 'flower_class_names.json',
        'class_dict_file': 'classes_to_name_dictionary.json',
        'use_class_dict': True  # 2-step mapping
    },
    'plant': {
        'model_file': 'plant_best_model.keras',
        'class_names_file': 'plant_class_names.json',
        'use_class_dict': False  # Direct mapping
    },
    'architecture': {
        'model_file': 'architecture_best_model.keras',
        'class_names_file': 'architecture_class_names.json',
        'use_class_dict': False  # Direct mapping
    }
}
```

#### 2. Model Loading
- `load_model_and_classes_for_category(category)`: Loads a specific category's model and class mappings
- `load_all_models()`: Loads all category models on startup
- Models are stored in dictionaries: `models`, `class_names_dict`, `class_dict_dict`
- Checks if files exist locally before downloading from Firebase (optimization)

#### 3. API Endpoints

##### `/health` (GET)
Returns health status including loaded models:
```json
{
  "status": "healthy",
  "models_loaded": 3,
  "available_categories": ["flower", "plant", "architecture"],
  "flower_loaded": true,
  "plant_loaded": true,
  "architecture_loaded": true
}
```

##### `/predict` (POST)
Accepts category parameter in form data (default: 'flower'):
```json
{
  "success": true,
  "category": "flower",
  "predictions": [...],
  "top_prediction": {
    "class_id": "74",
    "flower_name": "rose",  // or plant_name, architecture_name
    "name": "rose",          // generic field for all categories
    "confidence": 0.95,
    "confidence_percentage": 95.0
  }
}
```

##### `/classes` (GET)
Accepts category query parameter (default: 'flower'):
```
GET /classes?category=plant
```

##### `/categories` (GET) - NEW
Returns list of available categories:
```json
{
  "success": true,
  "categories": ["flower", "plant", "architecture"],
  "loaded_categories": ["flower", "plant", "architecture"]
}
```

#### 4. Prediction Logic
Handles both mapping types:
- **Flower (2-step)**: index → class_id (from flower_class_names.json) → name (from classes_to_name_dictionary.json)
- **Plant/Architecture (direct)**: index → name (from plant/architecture_class_names.json)

### Frontend Changes

#### 1. API Service (`services/plantRecognitionApi.js`)

Updated functions to support category parameter:

```javascript
// Updated to accept category parameter
export const predictPlant = async (imageUri, category = 'flower')

// Updated to accept category parameter
export const getClasses = async (category = 'flower')

// New function to get available categories
export const getCategories = async ()
```

#### 2. Home Pages (Guest_HomePage.jsx & User_HomePage.jsx)

##### Added Category Selector
- Three buttons: 🌸 Flower, 🌿 Plant, 🏛️ Architecture
- State management: `selectedCategory` (default: 'flower')
- Visual feedback: Active category highlighted with green background and white border
- Positioned at top-left of camera view

```jsx
const categories = [
  { id: 'flower', label: 'Flower', icon: '🌸' },
  { id: 'plant', label: 'Plant', icon: '🌿' },
  { id: 'architecture', label: 'Architecture', icon: '🏛️' },
];
```

##### Updated Prediction Flow
- Pass `selectedCategory` to `predictPlant()` function
- Pass `category` to navigation parameters
- Update loading message: `"Recognizing {selectedCategory}..."`
- Update error message: `"Unable to recognize the {selectedCategory}"`

##### Styling
```javascript
categorySelector: {
  position: 'absolute',
  top: 20,
  left: 20,
  flexDirection: 'row',
  gap: 10,
},
categoryButton: {
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 20,
  borderWidth: 2,
  borderColor: 'transparent',
},
categoryButtonActive: {
  backgroundColor: 'rgba(76, 175, 80, 0.8)',
  borderColor: '#fff',
}
```

#### 3. View Summary Pages (Guest_ViewSummaryPage.jsx & User_ViewSummaryPage.jsx)

##### Extract Category from Navigation
```jsx
const { photoUri, predictionData, category = 'flower' } = route.params || {};
```

##### Dynamic Object Name Extraction
```jsx
let objectName = 'Unknown Object';
if (topPrediction) {
  if (category === 'flower') {
    objectName = topPrediction.flower_name || topPrediction.name || 'Unknown Flower';
  } else if (category === 'plant') {
    objectName = topPrediction.plant_name || topPrediction.name || 'Unknown Plant';
  } else if (category === 'architecture') {
    objectName = topPrediction.architecture_name || topPrediction.name || 'Unknown Architecture';
  }
}
```

## Category-Specific Details

### Flower Category
- **Model**: `flower_best_model.keras` (28.5 MB)
- **Mapping**: 2-step (index → class_id → name)
- **Files**: 
  - `flower_class_names.json` (102 classes)
  - `classes_to_name_dictionary.json` (102 names)
- **Example**: Index 0 → Class "1" → "pink primrose"

### Plant Category
- **Model**: `plant_best_model.keras` (29 MB)
- **Mapping**: Direct (index → name)
- **Files**: 
  - `plant_class_names.json` (9 classes)
- **Example**: Index 0 → "Angsana"

### Architecture Category
- **Model**: `architecture_best_model.keras` (12 MB)
- **Mapping**: Direct (index → name)
- **Files**: 
  - `architecture_class_names.json` (5 classes)
- **Example**: Index 0 → "Bandstand"

## User Experience Flow

1. User opens camera (Guest or User HomePage)
2. User selects category using top-left buttons (Flower/Plant/Architecture)
3. User takes photo or selects from gallery
4. App shows loading: "Recognizing {category}..."
5. Backend predicts using selected category's model
6. User sees results in ViewSummary page with category-specific information

## Backward Compatibility

- Default category is 'flower' if not specified
- API endpoints maintain backward compatibility
- Frontend handles missing category parameter gracefully

## Testing Checklist

- [ ] Flower recognition works correctly
- [ ] Plant recognition works correctly
- [ ] Architecture recognition works correctly
- [ ] Category selector UI displays properly
- [ ] Category selection persists during photo taking
- [ ] Loading messages show correct category
- [ ] ViewSummary pages display correct names
- [ ] Error messages reference correct category
- [ ] Backend loads all models on startup
- [ ] API endpoints return correct category-specific data

## Security

- CodeQL scan passed: 0 vulnerabilities found
- All file paths validated
- Category parameter validated against allowed list
- Model loading errors handled gracefully

## Performance Considerations

- All models loaded on startup (total ~70 MB in memory)
- Local files used if available (skip Firebase download)
- Models cached in dictionaries for fast access
- No model switching overhead during runtime

## Future Enhancements

1. Add model download progress indicator in frontend
2. Implement lazy loading (load model only when category selected)
3. Add category-specific tips in help section
4. Store user's preferred category in local storage
5. Add category-specific history/favorites
6. Implement confidence threshold per category

## Files Modified

### Backend
- `Green_Lens/backend/app.py` - Complete refactor for multi-category support

### Frontend
- `Green_Lens/frontend/services/plantRecognitionApi.js` - Added category parameters
- `Green_Lens/frontend/screens/Guest/Guest_HomePage.jsx` - Added category selector
- `Green_Lens/frontend/screens/User/User_HomePage.jsx` - Added category selector
- `Green_Lens/frontend/screens/Guest/Guest_ViewSummaryPage.jsx` - Handle category
- `Green_Lens/frontend/screens/User/User_ViewSummaryPage.jsx` - Handle category

## Deployment Notes

### Firebase Storage Requirements
Ensure these files are uploaded to Firebase Storage:
- `flower_best_model.keras`
- `flower_class_names.json`
- `classes_to_name_dictionary.json`
- `plant_best_model.keras`
- `plant_class_names.json`
- `architecture_best_model.keras`
- `architecture_class_names.json`

### Local Development
All files already exist in `backend/downloaded_model/` directory, so local development works without Firebase.

### Environment Variables
No new environment variables required. Uses existing `EXPO_PUBLIC_API_URL` for backend URL.

## Troubleshooting

### Model Not Loading
- Check if model files exist in `backend/downloaded_model/`
- Verify Firebase Storage has the correct files
- Check backend logs for download errors

### Wrong Predictions
- Verify correct category is selected in UI
- Check that category is passed to prediction API
- Verify model file matches the category

### UI Issues
- Category selector should appear at top-left
- Active category should have green background
- Help icon should not overlap with category selector

## Related Documentation
- [FLOWER_MODEL_INTEGRATION_SUMMARY.md](./FLOWER_MODEL_INTEGRATION_SUMMARY.md) - Original flower model integration
- [Backend README.md](./Green_Lens/backend/README.md) - Backend API documentation

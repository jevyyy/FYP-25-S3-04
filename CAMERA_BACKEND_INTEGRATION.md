# Camera to Backend Integration - Guest User

## Overview

This implementation connects the frontend camera functionality to the backend plant recognition API for guest users.

## Changes Made

### 1. Guest_HomePage.jsx

**Added:**
- Import of `predictPlant` API service
- `ActivityIndicator` for loading state
- State management for processing status (`isProcessing`)
- `processImage()` function that calls the backend API
- Loading overlay UI during image processing
- Error handling and user feedback

**Flow:**
1. User takes photo or selects from gallery
2. Loading overlay appears with "Recognizing plant..." message
3. Image is sent to backend API via `predictPlant()` function
4. API returns prediction data with top prediction and alternatives
5. User is navigated to summary page with both photo and prediction data

### 2. Guest_ViewSummaryPage.jsx

**Added:**
- Support for receiving `predictionData` from route params
- Extraction of prediction information (top prediction, confidence, alternatives)
- Dynamic display of plant name based on API response
- Confidence percentage display
- Alternative matches section (top 3 alternatives with confidence)
- Fallback UI when no prediction data is available
- ScrollView for content that may overflow

**Features:**
- Shows identified plant name with confidence percentage
- Displays top prediction in green text
- Lists up to 3 alternative matches with their confidence levels
- Maintains existing share and Google search functionality
- Graceful handling of missing or failed predictions

## API Integration

### Request
- **Endpoint:** `POST /predict`
- **Content-Type:** `multipart/form-data`
- **Payload:** Image file from camera or gallery

### Response
```json
{
  "success": true,
  "predictions": [
    {
      "class_id": "74",
      "flower_name": "rose",
      "confidence": 0.95,
      "confidence_percentage": 95.0
    },
    ...
  ],
  "top_prediction": {
    "class_id": "74",
    "flower_name": "rose",
    "confidence": 0.95,
    "confidence_percentage": 95.0
  }
}
```

## User Experience

1. **Photo Capture:** User opens Guest_HomePage and takes a photo
2. **Processing:** Loading overlay appears with animation
3. **Recognition:** Backend processes image and returns results
4. **Results Display:** User sees identified plant with confidence level
5. **Alternatives:** Other possible matches are shown below
6. **Actions:** User can share the result or search for more information

## Error Handling

- Network errors: Shows alert with error message
- API failures: Displays fallback message in summary page
- Permission issues: Existing camera permission flow maintained
- Timeout handling: Uses default fetch timeout

## Testing

To test the integration:

1. **Start Backend:**
   ```bash
   cd Green_Lens/backend
   python app.py
   ```

2. **Start Frontend:**
   ```bash
   cd Green_Lens/frontend
   npm start
   ```

3. **Test Flow:**
   - Navigate to Guest Home
   - Take a photo of a plant/flower
   - Wait for processing (loading overlay)
   - View results in summary page

## Notes

- Implementation is guest-user only as requested
- Backend API URL is configurable via `.env` file
- Default API URL is `http://localhost:5000`
- Loading state prevents multiple simultaneous API calls
- ScrollView ensures content is accessible on smaller screens

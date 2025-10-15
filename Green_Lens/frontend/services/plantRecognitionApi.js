/**
 * Plant Recognition API Service
 * 
 * This service handles communication with the Python backend API
 * for plant/flower recognition using the trained MobileNetV2 model.
 */

// Configure your backend API URL here
// For local development: http://localhost:5000
// For production: replace with your deployed backend URL
const API_BASE_URL = 'http://localhost:5000';

/**
 * Check if the backend API is healthy and ready
 * @returns {Promise<Object>} Health status response
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all available plant/flower classes
 * @returns {Promise<Object>} Classes response
 */
export const getClasses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/classes`);
    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Get classes failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Predict plant/flower from an image
 * @param {string} imageUri - URI of the image to predict
 * @returns {Promise<Object>} Prediction results
 */
export const predictPlant = async (imageUri) => {
  try {
    // Create form data
    const formData = new FormData();
    
    // Extract filename from URI or use default
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    
    // Append the image file
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg', // Adjust if needed
      name: filename
    });
    
    // Send request
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        data
      };
    } else {
      return {
        success: false,
        error: data.error || 'Prediction failed'
      };
    }
  } catch (error) {
    console.error('Prediction failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Predict plant/flower from a base64 encoded image
 * @param {string} base64Image - Base64 encoded image string
 * @returns {Promise<Object>} Prediction results
 */
export const predictPlantFromBase64 = async (base64Image) => {
  try {
    // Convert base64 to blob
    const response = await fetch(base64Image);
    const blob = await response.blob();
    
    // Create form data
    const formData = new FormData();
    formData.append('image', blob, 'photo.jpg');
    
    // Send request
    const apiResponse = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await apiResponse.json();
    
    if (apiResponse.ok) {
      return {
        success: true,
        data
      };
    } else {
      return {
        success: false,
        error: data.error || 'Prediction failed'
      };
    }
  } catch (error) {
    console.error('Prediction failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update the API base URL (useful for switching between dev/prod)
 * @param {string} newUrl - New base URL for the API
 */
export const setApiBaseUrl = (newUrl) => {
  API_BASE_URL = newUrl;
};

/**
 * Get the current API base URL
 * @returns {string} Current base URL
 */
export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

export default {
  checkHealth,
  getClasses,
  predictPlant,
  predictPlantFromBase64,
  setApiBaseUrl,
  getApiBaseUrl
};

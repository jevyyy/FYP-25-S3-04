/**
 * API Service for communicating with the Flask backend
 * Handles image classification requests
 */

// Configuration
// Replace with your backend server IP address
// For local testing on physical device, use your computer's IP (e.g., '192.168.1.100')
// For Android emulator, use '10.0.2.2'
// For iOS simulator, use 'localhost' or '127.0.0.1'
const API_BASE_URL = 'http://localhost:5000';

/**
 * Check if the API server is healthy
 * @returns {Promise<Object>} Health status object
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

/**
 * Get all available classes from the API
 * @returns {Promise<Object>} Classes object with mapping
 */
export const getClasses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/classes`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch classes:', error);
    throw error;
  }
};

/**
 * Predict flower class from image
 * @param {string} imageUri - URI of the image to classify
 * @returns {Promise<Object>} Prediction results with top predictions
 */
export const predictImage = async (imageUri) => {
  try {
    // Create FormData
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = imageUri.split('/').pop();
    const fileType = filename.split('.').pop();
    
    // Append image to FormData
    formData.append('image', {
      uri: imageUri,
      type: `image/${fileType}`,
      name: filename || 'image.jpg',
    });
    
    // Send request
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Prediction failed:', error);
    throw error;
  }
};

/**
 * Test connection to the API server
 * @returns {Promise<boolean>} True if connection successful
 */
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

// Export API base URL for configuration
export { API_BASE_URL };

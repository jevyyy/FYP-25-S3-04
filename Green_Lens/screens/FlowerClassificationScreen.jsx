/**
 * Example Component: Flower Classification Screen
 * Demonstrates how to integrate the camera with the backend API
 * 
 * This is a complete example showing:
 * 1. Camera integration
 * 2. Image selection from gallery
 * 3. API prediction
 * 4. Results display
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { predictImage, checkHealth, API_BASE_URL } from '../services/apiService';

export default function FlowerClassificationScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('Unknown');

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const health = await checkHealth();
      if (health.status === 'healthy' && health.model_loaded) {
        setApiStatus('Connected ✓');
      } else {
        setApiStatus('Model Not Loaded ⚠');
      }
    } catch (error) {
      setApiStatus('Disconnected ✗');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        setPrediction(null); // Clear previous prediction
        await classifyImage(uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        setPrediction(null); // Clear previous prediction
        await classifyImage(uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo: ' + error.message);
    }
  };

  const classifyImage = async (uri) => {
    setLoading(true);
    try {
      const result = await predictImage(uri);
      
      if (result.success) {
        setPrediction(result);
      } else {
        Alert.alert('Error', 'Failed to classify image');
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        `Could not connect to API server.\n\nMake sure:\n1. Backend server is running\n2. API_BASE_URL is set correctly\n\nCurrent URL: ${API_BASE_URL}\n\nError: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌸 Flower Classifier</Text>
        <Text style={styles.apiStatus}>API: {apiStatus}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>📸 Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
          <Text style={styles.buttonText}>🖼️ Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Analyzing image...</Text>
        </View>
      )}

      {prediction && !loading && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Results:</Text>
          
          <View style={styles.topPrediction}>
            <Text style={styles.topPredictionLabel}>Top Prediction</Text>
            <Text style={styles.topPredictionClass}>
              Class: {prediction.top_prediction.class_id}
            </Text>
            <Text style={styles.topPredictionConfidence}>
              Confidence: {prediction.top_prediction.percentage}
            </Text>
          </View>

          <Text style={styles.othersTitle}>Top 5 Predictions:</Text>
          {prediction.top_5_predictions.map((pred, index) => (
            <View key={index} style={styles.predictionItem}>
              <Text style={styles.predictionRank}>#{index + 1}</Text>
              <Text style={styles.predictionClass}>Class {pred.class_id}</Text>
              <Text style={styles.predictionConfidence}>{pred.percentage}</Text>
            </View>
          ))}
        </View>
      )}

      {!imageUri && !loading && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            Take a photo or select an image from gallery to classify
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  apiStatus: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  topPrediction: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  topPredictionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  topPredictionClass: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 5,
  },
  topPredictionConfidence: {
    fontSize: 18,
    color: '#388E3C',
  },
  othersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#666',
  },
  predictionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  predictionRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    width: 40,
  },
  predictionClass: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  predictionConfidence: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  placeholderContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

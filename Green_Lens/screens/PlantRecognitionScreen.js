import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { predictPlant, checkHealth } from '../services/plantRecognitionApi';

export default function PlantRecognitionScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  // Check API health on component mount
  React.useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    const result = await checkHealth();
    if (result.success) {
      setApiStatus('connected');
    } else {
      setApiStatus('disconnected');
      Alert.alert(
        'Backend Not Connected',
        'Unable to connect to the backend API. Please make sure the Python backend is running.',
        [{ text: 'OK' }]
      );
    }
  };

  const pickImageFromGallery = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Sorry, we need camera roll permissions to make this work!',
        [{ text: 'OK' }]
      );
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setPredictions(null); // Clear previous predictions
    }
  };

  const takePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Sorry, we need camera permissions to make this work!',
        [{ text: 'OK' }]
      );
      return;
    }

    // Take photo
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setPredictions(null); // Clear previous predictions
    }
  };

  const recognizePlant = async () => {
    if (!imageUri) {
      Alert.alert('No Image', 'Please select or take a photo first!');
      return;
    }

    setLoading(true);
    setPredictions(null);

    try {
      const result = await predictPlant(imageUri);

      if (result.success) {
        setPredictions(result.data.predictions);
      } else {
        Alert.alert(
          'Recognition Failed',
          result.error || 'Unable to recognize the plant. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Plant Recognition</Text>
        
        {/* API Status Indicator */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot,
            { backgroundColor: apiStatus === 'connected' ? '#4CAF50' : '#F44336' }
          ]} />
          <Text style={styles.statusText}>
            Backend: {apiStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </Text>
        </View>

        {/* Image Display */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={pickImageFromGallery}
          >
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={takePhoto}
          >
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          {imageUri && (
            <TouchableOpacity
              style={[styles.button, styles.recognizeButton]}
              onPress={recognizePlant}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Recognize Plant</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Predictions Display */}
        {predictions && predictions.length > 0 && (
          <View style={styles.predictionsContainer}>
            <Text style={styles.predictionsTitle}>Top Predictions:</Text>
            {predictions.map((prediction, index) => (
              <View key={index} style={styles.predictionItem}>
                <View style={styles.predictionHeader}>
                  <Text style={styles.predictionRank}>{index + 1}</Text>
                  <Text style={styles.predictionName}>
                    {prediction.flower_name}
                  </Text>
                </View>
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceFill,
                      { width: `${prediction.confidence_percentage}%` }
                    ]}
                  />
                </View>
                <Text style={styles.confidenceText}>
                  {prediction.confidence_percentage}% confident
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  buttonContainer: {
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
  },
  recognizeButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  predictionsContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  predictionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  predictionItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  predictionRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 10,
  },
  predictionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
  },
});

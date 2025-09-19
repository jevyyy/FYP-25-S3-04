import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, Linking, Share, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Configuration for backend URL
const BASE_URL = __DEV__ ? 'http://192.168.1.13:3000' : 'https://your-production-url.com';

export default function Guest_ViewSummaryPage({ route }) {
  const { photoUri } = route.params || {};
  const [flowerInfo, setFlowerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default fallback data (your original hardcoded content)
  const fallbackData = {
    name: "Sunflower",
    description: "The sunflower is a tall, bright, and cheerful flowering plant known for its large yellow blooms that follow the sun's movement across the sky. Its broad petals surround a central disk packed with seeds, which are edible and used for oil production. Sunflowers symbolize adoration, loyalty, and positivity, and they are often grown in fields, gardens, and as ornamental plants that attract pollinators.",
    family: "Asteraceae",
    colors: "Yellow (most common), red, orange, maroon, and bi-colored varieties.",
    poisonous: "No"
  };

  useEffect(() => {
    if (photoUri) {
      classifyImage();
    } else {
      setError('No image provided');
      setLoading(false);
    }
  }, [photoUri]);

  const classifyImage = async () => {
    console.log('Starting classification with photoUri:', photoUri);
    setLoading(true);
    setError(null);
    
    try {
      // Create FormData to upload the actual image file
      const formData = new FormData();
      formData.append('image', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'plant.jpg'
      });

      console.log('Sending image to backend...');
      const response = await fetch(`${BASE_URL}/classify`, {
        method: 'POST',
        body: formData,
        headers: {
          
        },
        timeout: 30000,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Classification result:', result);
      
      // Transform the result to match the expected format
      const transformedResult = {
        name: result.flower?.name || fallbackData.name,
        description: result.flower?.description || `This is a ${result.flower?.name || fallbackData.name}`,
        family: result.flower?.family || fallbackData.family,
        colors: result.flower?.colors || fallbackData.colors,
        poisonous: result.flower?.poisonous || fallbackData.poisonous,
        confidence: result.flower?.confidence,
        scientificName: result.flower?.scientificName,
        characteristics: result.flower?.characteristics
      };
      
      setFlowerInfo(transformedResult);
      
    } catch (error) {
      console.error('Classification failed:', error);
      setError(error.message);
      // Use fallback data on error
      setFlowerInfo(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  // Share function (text + photo link)
  const handleShare = async () => {
    if (!photoUri) {
      Alert.alert('No photo available to share');
      return;
    }

    const objectName = flowerInfo?.name || fallbackData.name;
    
    try {
      await Share.share({
        message: `🌻 Check out this ${objectName} I identified with Green Lens!\n\n${photoUri}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
      Alert.alert('Error sharing', error.message);
    }
  };

  // Google search function
  const handleGoogleSearch = () => {
    const objectName = flowerInfo?.name || fallbackData.name;
    
    if (!objectName) {
      Alert.alert('No object name available');
      return;
    }
    const query = encodeURIComponent(objectName);
    const url = `https://www.google.com/search?q=${query}`;
    Linking.openURL(url).catch((err) =>
      Alert.alert('Error', 'Failed to open browser: ' + err.message)
    );
  };

  const currentData = flowerInfo || fallbackData;

  return (
    <View style={styles.container}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.image} />
      ) : (
        <Text style={styles.noPhotoText}>No photo available</Text>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Identifying plant...</Text>
        </View>
      ) : (
        <>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{currentData.name}</Text>
            {flowerInfo?.confidence && (
              <Text style={styles.confidence}>
                {(flowerInfo.confidence * 100).toFixed(1)}% confident
              </Text>
            )}
          </View>

          <View style={styles.labelColumn}>
            <Text style={styles.placeholderText}>
              {currentData.description}
            </Text>
            
            <Text style={styles.secondaryLabel}>
              Family - {currentData.family}{"\n"}
              Colors - {currentData.colors}{"\n"}
              Poisonous - {currentData.poisonous}
            </Text>
            
            {flowerInfo?.scientificName && (
              <Text style={styles.scientificName}>
                Scientific Name: {flowerInfo.scientificName}
              </Text>
            )}
            
            {flowerInfo?.characteristics && flowerInfo.characteristics.length > 0 && (
              <View style={styles.characteristicsContainer}>
                <Text style={styles.characteristicsTitle}>Key Features:</Text>
                {flowerInfo.characteristics.slice(0, 3).map((char, index) => (
                  <Text key={index} style={styles.characteristic}>
                    • {char}
                  </Text>
                ))}
              </View>
            )}
            
            {error && (
              <Text style={styles.errorNote}>
                Note: Using sample data due to connection issues
              </Text>
            )}
          </View>

          <View style={styles.buttonColumn}>
            <TouchableOpacity style={styles.seeMoreButton} onPress={handleGoogleSearch}>
              <Text style={styles.seeMoreText}>See More</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    padding: 20 
  },
  image: { 
    width: 250, 
    height: 250, 
    borderRadius: 10, 
    marginBottom: 20, 
    marginTop: 40 
  },
  noPhotoText: { 
    fontSize: 16, 
    color: '#999', 
    marginVertical: 20, 
    textAlign: 'center' 
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 50
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  titleContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 15
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 5
  },
  confidence: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600'
  },
  labelColumn: { 
    width: '100%', 
    alignItems: 'flex-start', 
    marginBottom: 20 
  },
  placeholderText: { 
    fontSize: 16, 
    color: '#555', 
    marginBottom: 8, 
    textAlign: 'left' 
  },
  secondaryLabel: { 
    fontSize: 14, 
    color: '#777', 
    textAlign: 'left',
    marginBottom: 10
  },
  scientificName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 10
  },
  characteristicsContainer: {
    marginTop: 10
  },
  characteristicsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 5
  },
  characteristic: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
    paddingLeft: 10
  },
  errorNote: {
    fontSize: 12,
    color: '#ff9800',
    fontStyle: 'italic',
    marginTop: 10
  },
  buttonColumn: { 
    width: '100%', 
    alignItems: 'flex-end' 
  },
  seeMoreButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 18, 
    borderRadius: 8, 
    backgroundColor: '#1E90FF', 
    marginBottom: 12 
  },
  seeMoreText: { 
    fontSize: 16, 
    color: '#fff', 
    fontWeight: '600' 
  },
  shareButton: { 
    width: 46, 
    height: 46, 
    borderRadius: 23, 
    backgroundColor: '#000', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});
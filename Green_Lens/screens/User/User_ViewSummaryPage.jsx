import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';

export default function ViewSummaryPage({ route }) {
  const { photoUri } = route.params || {};
  const [flowerInfo, setFlowerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (photoUri) {
      classifyImage();
    }
  }, [photoUri]);

  const classifyImage = async () => {
    console.log('Starting classification with photoUri:', photoUri);
    setLoading(true);
    
    try {
      // Create FormData to upload the actual image file
      const formData = new FormData();
      formData.append('image', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'plant.jpg'
      });

      console.log('Sending image to backend...');
      const response = await fetch('http://192.168.1.13:3000/classify', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Classification result:', result);
      setFlowerInfo(result.flower);
      
    } catch (error) {
      console.error('Classification failed:', error);
      setFlowerInfo({ error: 'Failed to classify image: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plant Recognition</Text>
      
      {photoUri && <Image source={{ uri: photoUri }} style={styles.image} />}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Analyzing plant...</Text>
        </View>
      ) : flowerInfo ? (
        flowerInfo.error ? (
          <Text style={styles.error}>{flowerInfo.error}</Text>
        ) : (
          <View style={styles.resultContainer}>
            <Text style={styles.plantName}>{flowerInfo.name}</Text>
            <Text style={styles.description}>{flowerInfo.description}</Text>
            {flowerInfo.confidence && (
              <Text style={styles.confidence}>
                Confidence: {(flowerInfo.confidence * 100).toFixed(1)}%
              </Text>
            )}
          </View>
        )
      ) : (
        <Text style={styles.error}>No classification result</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20,
    color: '#2E7D32'
  },
  image: { 
    width: 250, 
    height: 250, 
    borderRadius: 15, 
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4CAF50'
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  resultContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  plantName: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#2E7D32',
    marginBottom: 10
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10
  },
  confidence: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600'
  },
  error: { 
    fontSize: 16, 
    color: 'red',
    textAlign: 'center',
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8
  }
});
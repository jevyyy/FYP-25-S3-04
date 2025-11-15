import React, { useRef, useState, useEffect } from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useIsFocused } from '@react-navigation/native';
import { predictPlant } from '../../services/plantRecognitionApi';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Component to show last photo and allow user to pick image from gallery
function ImagePreview({ onSelectImage }) {
  const [lastPhotoUri, setLastPhotoUri] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync(); // Request media library permission
      if (status === 'granted') {
        const assets = await MediaLibrary.getAssetsAsync({
          sortBy: ['creationTime'],
          mediaType: 'photo',
          first: 1,
        });
        if (assets.assets.length > 0) {
          setLastPhotoUri(assets.assets[0].uri); // Set last photo from gallery
        }
      }
    })();
  }, []);

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setLastPhotoUri(uri); // Update last photo
      onSelectImage(uri); // Pass selected image to parent
    }
  };

  return (
    <TouchableOpacity onPress={openGallery} style={styles.thumbnailContainer}>
      {lastPhotoUri && <Image source={{ uri: lastPhotoUri }} style={styles.thumbnail} />}
    </TouchableOpacity>
  );
}

export default function Guest_HomePage() {
  const isFocused = useIsFocused(); // Track if screen is focused
  const [facing, setFacing] = useState('back'); // Camera facing state
  const [permission, requestPermission] = useCameraPermissions(); // Camera permission
  const cameraRef = useRef(null); // Camera reference
  const [selectedImageUri, setSelectedImageUri] = useState(null); // Selected photo URI
  const [isProcessing, setIsProcessing] = useState(false); // Recognition loading state
  const [selectedCategory, setSelectedCategory] = useState('flower'); // Selected category (flower/plant/architecture)

  const [detectedObject, setDetectedObject] = useState(null); // Detected object name
  const [confidence, setConfidence] = useState(null); // Detection confidence
  const [summaryData, setSummaryData] = useState(null); // Fetched object info from Firestore

  const categories = [
    { id: 'flower', label: 'Flower', icon: '🌸' },
    { id: 'plant', label: 'Plant', icon: '🌿' },
    { id: 'architecture', label: 'Architecture', icon: '🏛️' },
  ];

  // Auto-hide detected object info after 5 seconds
  useEffect(() => {
    if (detectedObject) {
      const timer = setTimeout(() => {
        setDetectedObject(null);
        setConfidence(null);
        setSummaryData(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [detectedObject]);
  
  // Handle camera permission
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          To take photos and recognize plants, we need access to your camera.
        </Text>
        <Button onPress={requestPermission} title="Allow Camera Access" />
      </View>
    );
  }

  const toggleCameraFacing = () =>
    setFacing((current) => (current === 'back' ? 'front' : 'back')); // Switch camera

  // Fetch object summary info from Firestore
  const fetchSummary = async (objectName) => {
    try {
      const docRef = doc(db, 'objectInfo', objectName.toLowerCase());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSummaryData(docSnap.data());
      } else {
        setSummaryData({ description: 'No information available yet.' });
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummaryData({ description: 'Failed to load summary.' });
    }
  };

  // Process image for plant recognition
  const processImage = async (photoUri) => {
    setIsProcessing(true);
    try {
      const result = await predictPlant(photoUri, selectedCategory);
      if (result.success) {
        const topPrediction = result.data?.top_prediction;
        if (topPrediction) {
          let name = topPrediction.name || 'Unknown';
          if (selectedCategory === 'flower') name = topPrediction.flower_name || name;
          if (selectedCategory === 'plant') name = topPrediction.plant_name || name;
          if (selectedCategory === 'architecture') name = topPrediction.architecture_name || name;

          setDetectedObject(name); // Set detected name
          setConfidence(topPrediction.confidence_percentage); // Set confidence
          await fetchSummary(name); // Fetch additional info
        }
      } else {
        Alert.alert('Recognition Failed', result.error || 'Unable to recognize. Try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process image: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Capture photo using camera
  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });
        await MediaLibrary.saveToLibraryAsync(photo.uri); // Save to library
        setSelectedImageUri(photo.uri);
        await processImage(photo.uri); // Process captured image
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo: ' + error.message);
      }
    }
  };

  // Handle image selected from gallery
  const handleImageSelected = async (uri) => {
    setSelectedImageUri(uri);
    await processImage(uri);
  };

  return (
    <View style={styles.container}>
      {isFocused && <CameraView style={styles.camera} facing={facing} ref={cameraRef} />}

      {detectedObject && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Detected: {detectedObject}</Text>
          {confidence && (
            <Text style={styles.confidenceText}>Confidence: {confidence.toFixed(2)}%</Text>
          )}
          {summaryData ? (
            <ScrollView style={styles.summaryBox}>
              {summaryData.description && (
                <Text style={styles.summaryText}>Description: {summaryData.description}</Text>
              )}
              {summaryData.characteristics && (
                <Text style={styles.summaryText}>Characteristics: {summaryData.characteristics}</Text>
              )}
              {summaryData.healthTip && (
                <Text style={styles.summaryText}>Health Tip: {summaryData.healthTip}</Text>
              )}
              {summaryData.funFact && (
                <Text style={styles.summaryText}>Fun Fact: {summaryData.funFact}</Text>
              )}
            </ScrollView>
          ) : (
            <Text style={styles.summaryText}>Loading summary...</Text>
          )}
        </View>
      )}

      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Recognizing {selectedCategory}...</Text>
        </View>
      )}

      {/* Category selector buttons */}
      <View style={styles.categorySelector}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
            disabled={isProcessing}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === category.id && styles.categoryLabelActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom overlay with camera controls */}
      <View style={styles.overlay}>
        <ImagePreview onSelectImage={handleImageSelected} />
        <TouchableOpacity
          style={[styles.button, isProcessing && styles.buttonDisabled]}
          onPress={takePhoto}
          disabled={isProcessing}
        >
          <Text style={styles.text}>📸</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>🔄</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  resultContainer: { position: 'absolute', top: 80, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: 10, zIndex: 20 },
  resultTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  confidenceText: { color: '#90ee90', fontSize: 16, marginTop: 4 },
  summaryBox: { marginTop: 8, maxHeight: 120 },
  summaryText: { color: '#fff', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  overlay: { position: 'absolute', bottom: 30, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  button: { backgroundColor: '#00000080', padding: 12, borderRadius: 40 },
  buttonDisabled: { opacity: 0.5 },
  text: { color: 'white', fontSize: 20 },
  thumbnailContainer: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' },
  thumbnail: { width: '100%', height: '100%' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  loadingText: { color: '#ffffff', fontSize: 16, marginTop: 10 },
  categorySelector: { position: 'absolute', top: 20, left: 20, flexDirection: 'row', gap: 10 },
  categoryButton: { backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  categoryButtonActive: { backgroundColor: 'rgba(76,175,80,0.8)', borderColor: '#fff' },
  categoryIcon: { fontSize: 16, marginRight: 4 },
  categoryLabel: { color: '#fff', fontSize: 12, fontWeight: '600' },
  categoryLabelActive: { fontWeight: 'bold' },
});
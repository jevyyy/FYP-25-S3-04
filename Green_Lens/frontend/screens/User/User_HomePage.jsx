import React, { useRef, useState, useEffect } from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View, Alert, Animated, ActivityIndicator, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useDrawerStatus } from '@react-navigation/drawer';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { predictPlant } from '../../services/plantRecognitionApi';

// Component to show the most recent photo from device library and allow selecting images
function ImagePreview({ onSelectImage }) {
  const [lastPhotoUri, setLastPhotoUri] = useState(null);

  // Fetch last photo from media library on mount
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        const assets = await MediaLibrary.getAssetsAsync({
          sortBy: ['creationTime'],
          mediaType: 'photo',
          first: 1,
        });
        if (assets.assets.length > 0) {
          setLastPhotoUri(assets.assets[0].uri);
        }
      }
    })();
  }, []);

  // Open device gallery to pick a photo
  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setLastPhotoUri(uri);       // Update thumbnail
      onSelectImage(uri);         // Send selected image to parent
    }
  };

  return (
    <TouchableOpacity onPress={openGallery} style={styles.thumbnailContainer}>
      {lastPhotoUri && <Image source={{ uri: lastPhotoUri }} style={styles.thumbnail} />}
    </TouchableOpacity>
  );
}

// Main user homepage with camera, tips, and category selector
export default function User_HomePage() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [facing, setFacing] = useState('back'); // Front or back camera
  const [permission, requestPermission] = useCameraPermissions(); // Camera permissions
  const cameraRef = useRef(null); // Camera reference
  const [selectedImageUri, setSelectedImageUri] = useState(null); // Captured/selected image
  const [isProcessing, setIsProcessing] = useState(false); // Image processing state
  const [selectedCategory, setSelectedCategory] = useState('flower'); // Selected category for recognition
  const drawerStatus = useDrawerStatus();
  const isDrawerOpen = drawerStatus === 'open';

  // Tip system with fade animation
  const [showTips, setShowTips] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Category configuration
  const categories = [
    { id: 'flower', label: 'Flower', icon: '🌸' },
    { id: 'plant', label: 'Plant', icon: '🌿' },
    { id: 'architecture', label: 'Architecture', icon: '🏛️' },
  ];

  // Helpful tips to guide user for better recognition
  const tips = [
    '------------------------------Helpful Tips------------------------------',
    '🌿 Make sure your plant is centered and in focus for better results.',
    '☀️ Use natural lighting when possible to improve image recognition.',
    '📷 Avoid blurry or shaky photos — hold your phone steady.',
    '🍃 Try to capture only one plant in the frame for more accurate detection.',
    '🌸 Make sure the background is clear and not too cluttered.',
  ];

  // Show tips and auto-hide after 5 seconds
  const toggleTips = () => {
    if (showTips) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowTips(false));
    } else {
      setShowTips(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowTips(false));
      }, 5000);
    }
  };

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

  // Toggle camera between front and back
  const toggleCameraFacing = () =>
    setFacing((current) => (current === 'back' ? 'front' : 'back'));

  // Send image to plant recognition API
  const processImage = async (photoUri) => {
    setIsProcessing(true);
    try {
      const result = await predictPlant(photoUri, selectedCategory);
      if (result.success) {
        navigation.navigate('User_ViewSummary', {
          photoUri,
          predictionData: result.data,
          category: selectedCategory,
        });
      } else {
        Alert.alert(
          'Recognition Failed',
          result.error || `Unable to recognize the ${selectedCategory}. Please try again.`
        );
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
        await MediaLibrary.saveToLibraryAsync(photo.uri); // Save to gallery
        setSelectedImageUri(photo.uri);
        await processImage(photo.uri); // Send for recognition
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
      {/* Show camera view only if screen is focused and drawer is closed */}
      {isFocused && !isDrawerOpen && (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      )}

      {/* Loading overlay during recognition */}
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Recognizing {selectedCategory}...</Text>
        </View>
      )}

      {/* Category selection buttons */}
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

      {/* Help icon to show tips */}
      <TouchableOpacity style={styles.helpIcon} onPress={toggleTips}>
        <Ionicons name="help-circle-outline" size={32} color="white" />
      </TouchableOpacity>

      {/* Tip box */}
      {showTips && (
        <Animated.View style={[styles.tipBox, { opacity: fadeAnim }]}>
          <ScrollView>
            {tips.map((tip, index) => (
              <Text key={index} style={styles.tipText}>
                {tip}
              </Text>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Camera controls: gallery thumbnail, take photo, switch camera */}
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
  overlay: { position: 'absolute', bottom: 30, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  button: { backgroundColor: '#00000080', padding: 12, borderRadius: 40 },
  buttonDisabled: { opacity: 0.5 },
  text: { color: 'white', fontSize: 20 },
  thumbnailContainer: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' },
  thumbnail: { width: '100%', height: '100%' },
  helpIcon: { position: 'absolute', top: 20, right: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 26, padding: 6 },
  tipBox: { position: 'absolute', top: 70, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.75)', padding: 16, borderRadius: 10, maxHeight: 400 },
  tipText: { color: '#fff', fontSize: 15, textAlign: 'left', lineHeight: 22, marginBottom: 6 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  loadingText: { color: '#ffffff', fontSize: 16, marginTop: 10 },
  categorySelector: { position: 'absolute', top: 20, left: 20, flexDirection: 'row', gap: 10 },
  categoryButton: { backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  categoryButtonActive: { backgroundColor: 'rgba(76,175,80,0.8)', borderColor: '#fff' },
  categoryIcon: { fontSize: 16, marginRight: 4 },
  categoryLabel: { color: '#fff', fontSize: 12, fontWeight: '600' },
  categoryLabelActive: { fontWeight: 'bold' },
});

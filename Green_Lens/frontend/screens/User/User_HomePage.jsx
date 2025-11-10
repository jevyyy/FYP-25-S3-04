import React, { useRef, useState, useEffect } from 'react';
import {
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Animated,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useDrawerStatus } from '@react-navigation/drawer';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { predictPlant } from '../../services/plantRecognitionApi';

function ImagePreview({ onSelectImage }) {
  const [lastPhotoUri, setLastPhotoUri] = useState(null);

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

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setLastPhotoUri(uri);
      onSelectImage(uri);
    }
  };

  return (
    <TouchableOpacity onPress={openGallery} style={styles.thumbnailContainer}>
      {lastPhotoUri && <Image source={{ uri: lastPhotoUri }} style={styles.thumbnail} />}
    </TouchableOpacity>
  );
}

export default function User_HomePage() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const drawerStatus = useDrawerStatus();
  const isDrawerOpen = drawerStatus === 'open';

  // 🌿 Tip system (show all tips)
  const [showTips, setShowTips] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const tips = [
    '------------------------------Helpful Tips------------------------------',
    '🌿 Make sure your plant is centered and in focus for better results.',
    '☀️ Use natural lighting when possible to improve image recognition.',
    '📷 Avoid blurry or shaky photos — hold your phone steady.',
    '🍃 Try to capture only one plant in the frame for more accurate detection.',
    '🌸 Make sure the background is clear and not too cluttered.',
  ];

  // Show tips and auto-close after 5 seconds
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

      // Auto-close after 5 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowTips(false));
      }, 5000);
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const toggleCameraFacing = () =>
    setFacing((current) => (current === 'back' ? 'front' : 'back'));

  const processImage = async (photoUri) => {
    setIsProcessing(true);
    try {
      const result = await predictPlant(photoUri);
      if (result.success) {
        navigation.navigate('User_ViewSummary', {
          photoUri: photoUri,
          predictionData: result.data,
        });
      } else {
        Alert.alert(
          'Recognition Failed',
          result.error || 'Unable to recognize the plant. Please try again.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process image: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        setSelectedImageUri(photo.uri);
        await processImage(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo: ' + error.message);
      }
    }
  };

  const handleImageSelected = async (uri) => {
    setSelectedImageUri(uri);
    await processImage(uri);
  };

  return (
    <View style={styles.container}>
      {isFocused && !isDrawerOpen && (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      )}

      {/* Loading overlay */}
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Recognizing plant...</Text>
        </View>
      )}

      {/* Help icon */}
      <TouchableOpacity style={styles.helpIcon} onPress={toggleTips}>
        <Ionicons name="help-circle-outline" size={32} color="white" />
      </TouchableOpacity>

      {/* Tip box showing all tips */}
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

      {/* Camera controls */}
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
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  loadingText: { color: '#ffffff', fontSize: 16, marginTop: 10 },
});

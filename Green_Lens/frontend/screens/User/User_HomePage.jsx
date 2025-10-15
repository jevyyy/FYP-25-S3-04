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
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useDrawerStatus } from '@react-navigation/drawer';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // for the question mark icon

function ImagePreview({ onSelectImage }) {
  const [lastPhotoUri, setLastPhotoUri] = useState(null);
  const navigation = useNavigation();

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setLastPhotoUri(uri);
      onSelectImage(uri);
      navigation.navigate('User_ViewSummary', { photoUri: uri });
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
  const drawerStatus = useDrawerStatus();
  const isDrawerOpen = drawerStatus === 'open';

  // Helpful tips
  const [showTip, setShowTip] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [currentTip, setCurrentTip] = useState('');

  const tips = [
    '🌿 Make sure your plant is centered and in focus for better results.',
    '☀️ Use natural lighting when possible to improve image recognition.',
    '📷 Avoid blurry or shaky photos — hold your phone steady.',
    '🍃 Try to capture only one plant in the frame for more accurate detection.',
    '🌸 Make sure the background is clear and not too cluttered.',
  ];

  const handleToggleTip = () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentTip(randomTip);

    if (showTip) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowTip(false));
    } else {
      setShowTip(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide after 5 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowTip(false));
      }, 5000);
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const toggleCameraFacing = () =>
    setFacing((current) => (current === 'back' ? 'front' : 'back'));

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        setSelectedImageUri(photo.uri);
        navigation.navigate('User_ViewSummary', { photoUri: photo.uri });
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo: ' + error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      {isFocused && !isDrawerOpen && (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      )}

      {/* Top-right question mark icon */}
      <TouchableOpacity style={styles.helpIcon} onPress={handleToggleTip}>
        <Ionicons name="help-circle-outline" size={32} color="white" />
      </TouchableOpacity>

      {/* Floating Helpful Tip Box */}
      {showTip && (
        <Animated.View style={[styles.tipBox, { opacity: fadeAnim }]}>
          <Text style={styles.tipText}>{currentTip}</Text>
        </Animated.View>
      )}

      {/* Camera overlay controls */}
      <View style={styles.overlay}>
        {/* Thumbnail on the left */}
        <ImagePreview onSelectImage={(uri) => setSelectedImageUri(uri)} />

        {/* camera button */}
        <TouchableOpacity style={[styles.circleButton, styles.shutterButton]} onPress={takePhoto}>
          <Text style={styles.cameraIcon}>📸</Text>
        </TouchableOpacity>

        {/* toggle button */}
        <TouchableOpacity style={[styles.circleButton, styles.toggleButton]} onPress={toggleCameraFacing}>
          <Text style={styles.toggleIcon}>🔄</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },

  //Circular button base
  circleButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 2,
    borderColor: '#fff',
  },

  //main camera button 
  shutterButton: {
    width: 90,
    height: 90,
  },
  cameraIcon: {
    fontSize: 36,
    color: 'white',
  },

  //toggle button
  toggleButton: {
    width: 55,
    height: 55,
  },
  toggleIcon: {
    fontSize: 20,
    color: 'white',
  },

  thumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  thumbnail: { width: '100%', height: '100%' },

  helpIcon: {
    position: 'absolute',
    top: 20,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 26,
    padding: 6,
  },
  tipBox: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 16,
    borderRadius: 10,
  },
  tipText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
});
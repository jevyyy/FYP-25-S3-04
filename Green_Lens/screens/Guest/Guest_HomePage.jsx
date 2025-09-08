import React, { useRef, useState, useEffect } from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useDrawerStatus } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

export default function Guest_HomePage() {
  const navigation = useNavigation();
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [selectedImageUri, setSelectedImageUri] = useState(null);

  const drawerStatus = useDrawerStatus();
  const isDrawerOpen = drawerStatus === 'open';

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const toggleCameraFacing = () => setFacing((current) => (current === 'back' ? 'front' : 'back'));

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        setSelectedImageUri(photo.uri);

        // Pass 'from' as 'guest' so burger menu knows
        navigation.navigate('Guest_ViewSummary', { photoUri: photo.uri });
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo: ' + error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      {!isDrawerOpen && <CameraView style={styles.camera} facing={facing} ref={cameraRef} />}

      <View style={styles.overlay}>
        <ImagePreview onSelectImage={(uri) => setSelectedImageUri(uri)} />

        <TouchableOpacity style={styles.button} onPress={takePhoto}>
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
  overlay: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#00000080',
    padding: 12,
    borderRadius: 40,
  },
  text: { color: 'white', fontSize: 20 },
  thumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  thumbnail: { width: '100%', height: '100%' },
});

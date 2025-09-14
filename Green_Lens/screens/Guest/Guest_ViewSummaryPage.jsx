import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function Guest_ViewSummaryPage({ route }) {
  const { photoUri } = route.params || {}; // Only camera/photo URL
  const objectName = "Sunflower"; // ✅ Renamed from plantName to objectName

  // Share function
  const handleShare = async () => {
    if (!photoUri) {
      Alert.alert('No photo available to share');
      return;
    }

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing is not available on this device');
        return;
      }

      let shareUri = photoUri;

      // On Android, copy to cache to avoid permission issues
      if (Platform.OS === 'android' && !photoUri.startsWith(FileSystem.cacheDirectory)) {
        const fileName = photoUri.split('/').pop();
        const cacheUri = FileSystem.cacheDirectory + fileName;
        await FileSystem.copyAsync({ from: photoUri, to: cacheUri });
        shareUri = cacheUri;
      }

      await Sharing.shareAsync(shareUri, {
        dialogTitle: 'Check out this photo from Green Lens!',
      });
    } catch (error) {
      console.log('Error sharing:', error);
      Alert.alert('Error sharing photo', error.message);
    }
  };

  // Google search function
  const handleGoogleSearch = () => {
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

  return (
    <View style={styles.container}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.image} />
      ) : (
        <Text style={styles.noPhotoText}>No photo available</Text>
      )}

      <Text style={styles.title}>{objectName}</Text>

      <View style={styles.labelColumn}>
        <Text style={styles.placeholderText}>
          The sunflower is a tall, bright, and cheerful flowering plant known for its large yellow blooms that follow the sun’s movement across the sky. Its broad petals surround a central disk packed with seeds, which are edible and used for oil production. Sunflowers symbolize adoration, loyalty, and positivity, and they are often grown in fields, gardens, and as ornamental plants that attract pollinators.
        </Text>
        <Text style={styles.secondaryLabel}>
          Family - Asteraceae{"\n"}
          Colors - Yellow (most common), red, orange, maroon, and bi-colored varieties.{"\n"}
          Poisonous - No
        </Text>
      </View>

      <View style={styles.buttonColumn}>
        <TouchableOpacity style={styles.seeMoreButton} onPress={handleGoogleSearch}>
          <Text style={styles.seeMoreText}>See More</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', padding: 20 },
  image: { width: 250, height: 250, borderRadius: 10, marginBottom: 20, marginTop: 40 },
  noPhotoText: { fontSize: 16, color: '#999', marginVertical: 20, textAlign: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, alignSelf: 'flex-start' },
  labelColumn: { width: '100%', alignItems: 'flex-start', marginBottom: 20 },
  placeholderText: { fontSize: 16, color: '#555', marginBottom: 8, textAlign: 'left' },
  secondaryLabel: { fontSize: 14, color: '#777', textAlign: 'left' },
  buttonColumn: { width: '100%', alignItems: 'flex-end' },
  seeMoreButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#1E90FF', marginBottom: 12 },
  seeMoreText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  shareButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
});

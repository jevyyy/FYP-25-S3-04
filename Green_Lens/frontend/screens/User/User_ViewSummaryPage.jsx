import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Platform, 
  Linking, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

export default function User_ViewSummaryPage({ route }) {
  const { photoUri, predictionData } = route.params || {};

  // Extract prediction info from the backend
  const topPrediction = predictionData?.top_prediction || null;
  const allPredictions = predictionData?.predictions || [];

  const objectName = topPrediction?.flower_name || "Unknown Plant";
  const confidence = topPrediction?.confidence_percentage || 0;

  // ---------------------------
  // 📤 Share function
  // ---------------------------
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

      // On Android, copy to cache directory to prevent permission issues
      if (Platform.OS === 'android' && !photoUri.startsWith(FileSystem.cacheDirectory)) {
        const fileName = photoUri.split('/').pop();
        const cacheUri = FileSystem.cacheDirectory + fileName;
        await FileSystem.copyAsync({ from: photoUri, to: cacheUri });
        shareUri = cacheUri;
      }

      await Sharing.shareAsync(shareUri, {
        dialogTitle: `Check out my ${objectName} summary from Green Lens!`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
      Alert.alert('Error sharing photo', error.message);
    }
  };

  // ---------------------------
  // 🌐 Google search function
  // ---------------------------
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
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.image} />
        ) : (
          <Text style={styles.noPhotoText}>No photo available</Text>
        )}

        <Text style={styles.title}>{objectName}</Text>
        {confidence > 0 && (
          <Text style={styles.confidence}>Confidence: {confidence.toFixed(2)}%</Text>
        )}

        <View style={styles.labelColumn}>
          {topPrediction ? (
            <>
              <Text style={styles.placeholderText}>
                This plant has been identified with {confidence.toFixed(2)}% confidence.
                The recognition is based on visual features analyzed by our AI model.
              </Text>

              {allPredictions.length > 1 && (
                <View style={styles.alternativesContainer}>
                  <Text style={styles.alternativesTitle}>Other possible matches:</Text>
                  {allPredictions.slice(1, 4).map((pred, index) => (
                    <Text key={index} style={styles.alternativeText}>
                      • {pred.flower_name} ({pred.confidence_percentage.toFixed(2)}%)
                    </Text>
                  ))}
                </View>
              )}
            </>
          ) : (
            <Text style={styles.placeholderText}>
              No prediction data available. Please try taking another photo.
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', padding: 20 },
  image: { width: 250, height: 250, borderRadius: 10, marginBottom: 20, marginTop: 40 },
  noPhotoText: { fontSize: 16, color: '#999', marginVertical: 20, textAlign: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 5, alignSelf: 'flex-start' },
  confidence: { fontSize: 16, color: '#4CAF50', marginBottom: 15, alignSelf: 'flex-start', fontWeight: '600' },
  labelColumn: { width: '100%', alignItems: 'flex-start', marginBottom: 20 },
  placeholderText: { fontSize: 16, color: '#555', marginBottom: 8, textAlign: 'left' },
  alternativesContainer: { marginTop: 15, width: '100%' },
  alternativesTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  alternativeText: { fontSize: 14, color: '#666', marginLeft: 10, marginBottom: 4 },
  buttonColumn: { width: '100%', alignItems: 'flex-end' },
  seeMoreButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#1E90FF', marginBottom: 12 },
  seeMoreText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  shareButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
});

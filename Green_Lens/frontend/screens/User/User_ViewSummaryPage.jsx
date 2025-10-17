import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // adjust path

export default function User_ViewSummaryPage({ route }) {
  const { photoUri, predictionData } = route.params || {};
  const topPrediction = predictionData?.top_prediction || null;
  const objectName = topPrediction?.flower_name || 'Unknown Object';
  const confidence = topPrediction?.confidence_percentage || 0;

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch summary from Firebase
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const docRef = doc(db, 'objectInfo', objectName.toLowerCase());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSummaryData(docSnap.data());
        } else {
          setSummaryData({ description: 'No information available yet.' });
        }
      } catch (error) {
        console.error('Error fetching object:', error);
        setSummaryData({ description: 'Failed to load object info.' });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [objectName]);

  // Share function
  const handleShare = async () => {
    if (!photoUri) return Alert.alert('No photo available to share');
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) return Alert.alert('Sharing not available on this device');

      let shareUri = photoUri;
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
      Alert.alert('Error sharing photo', error.message);
    }
  };

  // Google search
  const handleGoogleSearch = () => {
    const query = encodeURIComponent(objectName);
    const url = `https://www.google.com/search?q=${query}`;
    Linking.openURL(url).catch(err => Alert.alert('Error', 'Failed to open browser: ' + err.message));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        {/* ---------- PHOTO + OBJECT NAME + CONFIDENCE ---------- */}
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.image} />
        ) : (
          <Text style={styles.noPhotoText}>No photo available</Text>
        )}
        {confidence > 0 && (
          <Text style={styles.confidence}>Confidence: {confidence.toFixed(2)}%</Text>
        )}
        <Text style={styles.title}>{objectName}</Text>
        
        {/* ---------- SUMMARY DATA FROM FIREBASE ---------- */}
        <View style={styles.labelColumn}>
          {summaryData ? (
            <>
              <Text style={styles.description}>{summaryData.description}</Text>

              {summaryData.characteristics && (
                <>
                  <Text style={styles.characteristicsTitle}>Characteristics:</Text>
                  <Text style={styles.characteristics}>{summaryData.characteristics}</Text>
                </>
              )}

              {summaryData.habitat && <Text style={styles.info}>Habitat: {summaryData.habitat}</Text>}
              {summaryData.location && <Text style={styles.info}>Location: {summaryData.location}</Text>}
              {summaryData.built_year && <Text style={styles.info}>Built Year: {summaryData.built_year}</Text>}
            </>
          ) : (
            <Text style={styles.placeholderText}>
              No prediction data available. Please try taking another photo.
            </Text>
          )}
        </View>

        {/* ---------- BUTTONS ---------- */}
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
  description: { fontSize: 16, color: '#555', marginBottom: 10, textAlign: 'left', alignSelf: 'flex-start' },
  characteristicsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4, alignSelf: 'flex-start' },
  characteristics: { fontSize: 16, color: '#555', marginBottom: 10, alignSelf: 'flex-start' },
  info: { fontSize: 14, color: '#333', marginBottom: 6, alignSelf: 'flex-start' },
  buttonColumn: { width: '100%', alignItems: 'flex-end', marginTop: 15 },
  seeMoreButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#1E90FF', marginBottom: 12 },
  seeMoreText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  shareButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

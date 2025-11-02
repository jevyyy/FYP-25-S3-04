import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Share,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useFocusEffect } from '@react-navigation/native';

export default function Guest_ViewSummaryPage({ route }) {
  const { photoUri, predictionData } = route.params || {};
  const topPrediction = predictionData?.top_prediction || null;
  const objectName = topPrediction?.flower_name || "Unknown Plant";
  const confidence = topPrediction?.confidence_percentage || 0;

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  const viewRef = useRef();
  const scrollRef = useRef();

  // Reset scroll to top when leaving the page
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ y: 0, animated: false });
        }
      };
    }, [])
  );

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

  const handleShare = async () => {
    if (!viewRef.current) return Alert.alert('Error', 'Unable to capture view');

    try {
      setSharing(true);
      const uri = await captureRef(viewRef, { format: 'jpg', quality: 0.9 });
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        // Share only the captured image, no text message
        await Sharing.shareAsync(uri, { mimeType: 'image/jpeg' });
      } else {
        // Fallback for devices that do not support expo-sharing
        await Share.share({ url: uri });
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error sharing', error.message);
    } finally {
      setSharing(false);
    }
  };

  const handleGoogleSearch = () => {
    const query = encodeURIComponent(objectName);
    const url = `https://www.google.com/search?q=${query}`;
    Linking.openURL(url).catch(err =>
      Alert.alert('Error', 'Failed to open browser: ' + err.message)
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <View ref={viewRef} style={styles.captureView} collapsable={false}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.image} />
          ) : (
            <Text style={styles.noPhotoText}>No photo available</Text>
          )}

          {confidence > 0 && (
            <Text style={styles.confidence}>Confidence: {confidence.toFixed(2)}%</Text>
          )}

          <Text style={styles.title}>{summaryData?.name || objectName}</Text>

          <View style={styles.labelColumn}>
            {summaryData ? (
              <>
                {summaryData.description && (
                  <>
                    <Text style={styles.characteristicsTitle}>Description:</Text>
                    <Text style={styles.characteristics}>{summaryData.description}</Text>
                  </>
                )}
                {summaryData.characteristics && (
                  <>
                    <Text style={styles.characteristicsTitle}>Characteristics:</Text>
                    <Text style={styles.characteristics}>{summaryData.characteristics}</Text>
                  </>
                )}
                {summaryData.healthTip && (
                  <>
                    <Text style={styles.characteristicsTitle}>Health Tip:</Text>
                    <Text style={styles.characteristics}>{summaryData.healthTip}</Text>
                  </>
                )}
                {summaryData.funFact && (
                  <>
                    <Text style={styles.characteristicsTitle}>Fun Fact:</Text>
                    <Text style={styles.characteristics}>{summaryData.funFact}</Text>
                  </>
                )}
              </>
            ) : (
              <Text style={styles.placeholderText}>
                No prediction data available. Please try taking another photo.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.seeMoreButton} onPress={handleGoogleSearch}>
          <Text style={styles.seeMoreText}>See More</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shareButton, sharing && styles.shareButtonDisabled]}
          onPress={handleShare}
          disabled={sharing}
        >
          {sharing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="share-social-outline" size={22} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flex: 1 },
  captureView: { width: '100%', backgroundColor: '#fff', padding: 10, alignItems: 'center' },
  image: { width: 250, height: 250, borderRadius: 10, marginVertical: 20 },
  noPhotoText: { fontSize: 16, color: '#999', marginVertical: 20, textAlign: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 5, alignSelf: 'flex-start', width: '100%' },
  confidence: { fontSize: 16, color: '#4CAF50', marginBottom: 15, fontWeight: '600', width: '100%', alignSelf: 'flex-start' },
  labelColumn: { width: '100%', alignItems: 'flex-start', marginBottom: 10 },
  placeholderText: { fontSize: 16, color: '#555', marginBottom: 8, textAlign: 'left' },
  characteristicsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4, alignSelf: 'flex-start', marginTop: 8 },
  characteristics: { fontSize: 16, color: '#555', marginBottom: 5, width: '100%' },

  floatingButtons: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
  },
  seeMoreButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#1E90FF', marginBottom: 12 },
  seeMoreText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  shareButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  shareButtonDisabled: { opacity: 0.6 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

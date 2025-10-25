import React, { useEffect, useState, useRef } from 'react';
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
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export default function Guest_ViewSummaryPage({ route }) {
  const { photoUri, predictionData } = route.params || {};
  const topPrediction = predictionData?.top_prediction || null;
  const objectName = topPrediction?.flower_name || "Unknown Plant";
  const confidence = topPrediction?.confidence_percentage || 0;

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const viewRef = useRef();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const docRef = doc(db, 'objectInfo', objectName.toLowerCase());
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSummaryData(data);
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
    if (!viewRef.current) {
      return Alert.alert('Error', 'Unable to capture view');
    }

    try {
      setSharing(true);

      // Capture the view as an image
      const uri = await captureRef(viewRef, {
        format: 'jpg',
        quality: 0.9,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          dialogTitle: `My ${objectName} Discovery - Green Lens`,
          mimeType: 'image/jpeg',
        });
      } else {
        // Fallback to regular Share API
        await Share.share({
          message: `Check out this ${objectName} I found using Green Lens!`,
          url: uri,
          title: `My ${objectName} Discovery`
        });
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
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Capturable View */}
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
                    <Text style={styles.characteristicsTitle}>📖 Description:</Text>
                    <Text style={styles.characteristics}>{summaryData.description}</Text>
                  </>
                )}

                {summaryData.characteristics && (
                  <>
                    <Text style={styles.characteristicsTitle}>🌿 Characteristics:</Text>
                    <Text style={styles.characteristics}>{summaryData.characteristics}</Text>
                  </>
                )}

                {summaryData.healthTip && (
                  <>
                    <Text style={styles.characteristicsTitle}>💚 Health Tip:</Text>
                    <Text style={styles.characteristics}>{summaryData.healthTip}</Text>
                  </>
                )}

                {summaryData.funFact && (
                  <>
                    <Text style={styles.characteristicsTitle}>💡 Fun Fact:</Text>
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

          {/* Watermark */}
          <Text style={styles.watermark}>Shared via Green Lens 🌱</Text>
        </View>

        {/* Buttons (outside capture view) */}
        <View style={styles.buttonColumn}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: '#fff' },
  container: { 
    flex: 1, 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    padding: 20 
  },
  captureView: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  image: { 
    width: 250, 
    height: 250, 
    borderRadius: 10, 
    marginBottom: 20, 
    marginTop: 20 
  },
  noPhotoText: { 
    fontSize: 16, 
    color: '#999', 
    marginVertical: 20, 
    textAlign: 'center' 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 5, 
    alignSelf: 'flex-start',
    width: '100%'
  },
  confidence: { 
    fontSize: 16, 
    color: '#4CAF50', 
    marginBottom: 15, 
    alignSelf: 'flex-start', 
    fontWeight: '600',
    width: '100%'
  },
  labelColumn: { 
    width: '100%', 
    alignItems: 'flex-start', 
    marginBottom: 10 
  },
  placeholderText: { 
    fontSize: 16, 
    color: '#555', 
    marginBottom: 8, 
    textAlign: 'left' 
  },
  characteristicsTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 4, 
    alignSelf: 'flex-start',
    marginTop: 8
  },
  characteristics: { 
    fontSize: 16, 
    color: '#555', 
    marginBottom: 10, 
    alignSelf: 'flex-start',
    width: '100%'
  },
  watermark: {
    fontSize: 14,
    color: '#999',
    marginTop: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    width: '100%'
  },
  buttonColumn: { 
    width: '100%', 
    alignItems: 'flex-end', 
    marginTop: 20 
  },
  seeMoreButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 18, 
    borderRadius: 8, 
    backgroundColor: '#1E90FF', 
    marginBottom: 12 
  },
  seeMoreText: { 
    fontSize: 16, 
    color: '#fff', 
    fontWeight: '600' 
  },
  shareButton: { 
    width: 46, 
    height: 46, 
    borderRadius: 23, 
    backgroundColor: '#000', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  shareButtonDisabled: {
    opacity: 0.6
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});
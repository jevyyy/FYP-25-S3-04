import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // expo install @expo/vector-icons

export default function Guest_ViewSummaryPage({ route }) {
  const { photoUri } = route.params || {};

  // Share function
  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out this photo from Green Lens!',
        url: photoUri,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Photo at the top */}
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.image} />
      ) : (
        <Text style={styles.noPhotoText}>No photo available</Text>
      )}

      {/* Title below image */}
      <Text style={styles.title}>Guest Photo Summary</Text>

      {/* Labels */}
      <View style={styles.labelColumn}>
        <Text style={styles.placeholderText}>
          This is a placeholder for additional summary details for Guest.
        </Text>
        <Text style={styles.secondaryLabel}>
          More descriptive information can go here.
        </Text>
      </View>

      {/* Buttons below labels */}
      <View style={styles.buttonColumn}>
        {/* "See More" button */}
        <TouchableOpacity style={styles.seeMoreButton}>
          <Text style={styles.seeMoreText}>See More</Text>
        </TouchableOpacity>

        {/* Share button (round with icon) */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    padding: 20 
  },
  image: { 
    width: 250, 
    height: 250, 
    borderRadius: 10, 
    marginBottom: 20, 
    marginTop: 40 
  },
  noPhotoText: {
    fontSize: 16,
    color: '#999',
    marginVertical: 20,
    textAlign: 'center',
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    alignSelf: 'flex-start',
  },
  labelColumn: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  placeholderText: { 
    fontSize: 16, 
    color: '#555', 
    marginBottom: 8,
    textAlign: 'left',
  },
  secondaryLabel: {
    fontSize: 14,
    color: '#777',
    textAlign: 'left',
  },
  buttonColumn: {
    width: '100%',
    alignItems: 'flex-end',
  },
  seeMoreButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#1E90FF',
    marginBottom: 12,
  },
  seeMoreText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  shareButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

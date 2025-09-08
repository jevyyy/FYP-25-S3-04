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
      <Text style={styles.title}>Rose</Text>

      {/* Labels */}
      <View style={styles.labelColumn}>
        <Text style={styles.placeholderText}>
          The rose is a woody perennial flowering plant admired for its beauty and fragrance. Its velvety petals form rounded blossoms in colors like red, pink, white, yellow, and orange, each symbolizing emotions such as love, friendship, or purity. With thorny stems and dark green leaves, roses are widely grown in gardens, used in bouquets and perfumes, and remain a universal symbol of love.
        </Text>
        <Text style={styles.secondaryLabel}>
          Family - Rosaceae{"\n"}
          Colors - red, pink, white, yellow, orange, lavender, and more.{"\n"}
          Poisonous - No
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

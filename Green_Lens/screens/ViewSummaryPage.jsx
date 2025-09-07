// ./screens/Guest/ViewSummaryPage.jsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function ViewSummaryPage({ route }) {
  const { photoUri } = route.params || {}; // get photoUri from navigation params

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photo Summary</Text>

      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.image} />
      ) : (
        <Text>No photo available</Text>
      )}

      <Text style={styles.placeholderText}>
        This is a placeholder for additional summary details.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  image: { width: 250, height: 250, borderRadius: 10, marginBottom: 20 },
  placeholderText: { fontSize: 16, color: '#555', textAlign: 'center' },
});

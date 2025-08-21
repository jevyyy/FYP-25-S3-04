// CameraScreen.jsx (testing page)
import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';

export default function CameraScreen() {
  const handlePress = () => {
    Alert.alert('Test Button Pressed', 'This is your testing page!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚀 Test Page</Text>
      <Text style={styles.subtitle}>Your CameraScreen is working!</Text>

      <Button title="Press Me" onPress={handlePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
});

// ./screens/Developer/Developer_HomePage.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Developer_HomePage({ route }) {
  const navigation = useNavigation();
  const { username, role } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {username || 'Developer'}!</Text>
      <Text style={styles.subtitle}>Role: {role || 'developer'}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('LoginSelectionPage')}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 40,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#000',
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

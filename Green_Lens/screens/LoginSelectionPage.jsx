// LoginSelectionPage.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function LoginSelectionPage({ navigation }) {
  const handleUserLogin = () => {
    console.log("Green Lens User");
  };

  const handleAdminLogin = () => {
    console.log("Admin/Developer");
  };

  return (
    <View style={styles.outerContainer}>
      {/* Logo + Title */}
      <View style={styles.titleContainer}>
        <Image
          source={require('../assets/Green_Lens_logo.png')} // adjust path if necessary
          style={styles.logo}
        />
        <Text style={styles.title}>Login as:</Text>
      </View>

      {/* Buttons stacked below title */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleUserLogin}>
          <Text style={styles.buttonText}>Green Lens User</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleAdminLogin}>
          <Text style={styles.buttonText}>Admin/Developer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: '#f9f9f9',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 200,   // increased width
    height: 80,   // increased height
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    width: '80%',
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

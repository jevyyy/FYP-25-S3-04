import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LoginSelectionPage() {
  const navigation = useNavigation();

  const handleUserLogin = () => navigation.navigate('User_Login');
  const handleAdminLogin = () => navigation.navigate('Admin_Developer_Login');

  return (
    <View style={styles.outerContainer}>
      {/* Logo above the text */}
      <Image
        source={require('../assets/Green_Lens_logo.png')} // adjust path if necessary
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Login as:</Text>

      <TouchableOpacity style={styles.button} onPress={handleUserLogin}>
        <Text style={styles.buttonText}>Green Lens User</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleAdminLogin}>
        <Text style={styles.buttonText}>Admin / Developer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: '#f9f9f9',
    alignItems: 'center', // center everything horizontally
  },
  logo: {
    width: 200,  // adjust size as needed
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
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

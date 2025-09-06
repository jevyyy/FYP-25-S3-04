// LoginSelectionPage.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function LoginSelectionPage({ navigation }) {
  const handleUserLogin = () => {
    console.log("Login as Green Lens User");
    // navigation.navigate("UserLogin"); // if you have UserLogin screen
  };

  const handleAdminLogin = () => {
    console.log("Login as Admin/Developer");
    // navigation.navigate("AdminLogin"); // if you have AdminLogin screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Login Type</Text>

      <TouchableOpacity style={styles.button} onPress={handleUserLogin}>
        <Text style={styles.buttonText}>Login as Green Lens User</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleAdminLogin}>
        <Text style={styles.buttonText}>Login as Admin / Developer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    width: '80%',
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 2,          // 👈 border only
    borderColor: '#333',     // 👈 dark gray border
  },
  buttonText: {
    color: '#333',           // 👈 matches border color
    fontSize: 18,
    fontWeight: '600',
  },
});

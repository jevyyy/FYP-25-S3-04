// ./screens/Admin_HomePage.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Admin_HomePage({ route, navigation }) {
  // Get params passed from login
  const { username, role } = route.params || {};

  const handleLogout = () => {
    navigation.replace('Admin_Developer_LoginPage'); // redirect to login
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {username}!</Text>
      <Text style={styles.subtitle}>Role: {role}</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {/* Add more admin functionality buttons here */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Manage Users</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>View Reports</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 20, marginBottom: 30 },
  button: { width: '80%', paddingVertical: 15, borderRadius: 10, backgroundColor: '#000', alignItems: 'center', marginVertical: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});

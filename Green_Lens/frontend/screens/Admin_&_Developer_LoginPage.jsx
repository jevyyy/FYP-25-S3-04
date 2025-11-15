import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { auth, app } from '../firebaseConfig';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

const db = getFirestore(app);

export default function Admin_Developer_LoginPage({ navigation }) {
  // State to hold username and password input values
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Handle login logic
  const handleLogin = async () => {
    // Make sure username and password are entered
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    try {
      // Query Firestore to find user by username
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);

      // If user not found, show error
      if (querySnapshot.empty) {
        Alert.alert('Login Failed', 'Username not found');
        return;
      }

      const userData = querySnapshot.docs[0].data();

      // Only allow Admin or Developer roles
      if (userData.role !== 'Admin' && userData.role !== 'Developer') {
        Alert.alert('Access Denied', 'You do not have permission to login here.');
        return;
      }

      // Authenticate user using Firebase email and password
      await signInWithEmailAndPassword(auth, userData.email, password);

      // Navigate based on role
      if (userData.role === 'Admin') {
        navigation.replace('AdminFlow', {
          screen: 'Admin_HomePage',
          params: { username: userData.username, role: userData.role },
        });
      } else if (userData.role === 'Developer') {
        navigation.replace('DeveloperFlow', {
          screen: 'Developer_HomePage',
          params: { username: userData.username, role: userData.role },
        });
      }
    } catch (error) {
      // Handle login errors
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Login Failed', 'Incorrect password');
      } else {
        Alert.alert('Login Failed', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/Green_Lens_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Sign in For Admin / Developer</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={{ height: 30 }} />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60, backgroundColor: '#f9f9f9', alignItems: 'center' },
  logo: { width: 200, height: 80, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 40, textAlign: 'left', alignSelf: 'flex-start' },
  form: { width: '100%' },
  label: { alignSelf: 'flex-start', fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#333', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, backgroundColor: '#fff' },
  button: { width: '100%', paddingVertical: 15, borderRadius: 10, backgroundColor: '#000', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
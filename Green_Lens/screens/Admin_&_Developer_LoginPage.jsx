// ./screens/Admin_&_Developer_LoginPage.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { auth, app } from '../firebaseConfig';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

const db = getFirestore(app);

export default function Admin_Developer_LoginPage({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    try {
      // Query Firestore for username
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Login Failed', 'Username not found');
        return;
      }

      const userData = querySnapshot.docs[0].data();

      // Check role
      if (userData.role !== 'admin' && userData.role !== 'developer') {
        Alert.alert('Access Denied', 'You do not have permission to login here.');
        return;
      }

      // Sign in with email & password
      await signInWithEmailAndPassword(auth, userData.email, password);

      // Navigate based on role
      if (userData.role === 'admin') {
        navigation.replace('AdminFlow', {
          screen: 'Admin_HomePage',
          params: { username: userData.username, role: userData.role },
        });
      } else if (userData.role === 'developer') {
        navigation.replace('DeveloperFlow', {
          screen: 'Developer_HomePage',
          params: { username: userData.username, role: userData.role },
        });
      }
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Login Failed', 'Incorrect password');
      } else {
        Alert.alert('Login Failed', error.message);
      }
    }
  };

  const goToForgotPassword = () => {
    navigation.navigate('Forgot_PasswordPage'); // redirect to Forgot_PasswordPage
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/Green_Lens_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Sign in For Admin / Developer</Text>

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

      <TouchableOpacity onPress={goToForgotPassword} style={styles.forgotPasswordContainer}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  logo: { width: 200, height: 80, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 40, textAlign: 'left', alignSelf: 'flex-start' },
  label: { alignSelf: 'flex-start', fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#333', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, backgroundColor: '#fff' },
  forgotPasswordContainer: { width: '100%', alignItems: 'flex-end', marginBottom: 20 },
  forgotPasswordText: { fontSize: 14, color: '#1E90FF', fontWeight: 'bold' },
  button: { width: '100%', paddingVertical: 15, borderRadius: 10, backgroundColor: '#000', alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});

// ./screens/User/User_Login.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, app } from '../../firebaseConfig';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const db = getFirestore(app);

export default function User_Login() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const checkPasswordStrength = (password) => {
    // Check if password meets strong requirements
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol;
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    try {
      // Find the email by username in Firestore
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Login Failed', 'Username not found');
        return;
      }

      const userData = querySnapshot.docs[0].data();

      // Check role
      if (!userData.role || userData.role !== 'User') {
        Alert.alert('Access Denied', 'Your account does not have user access');
        return;
      }

      const email = userData.email;

      // Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);

      // Check password strength AFTER successful login
      const isStrongPassword = checkPasswordStrength(password);

      if (!isStrongPassword) {
        // Password is weak - SIGN OUT and force them to change it
        await signOut(auth);
        
        Alert.alert(
          'Weak Password Detected',
          'Your current password does not meet the password requirements \n\n' +
          'Requirements:\n' +
          '• At least 8 characters\n' +
          '• One uppercase letter (A-Z)\n' +
          '• One lowercase letter (a-z)\n' +
          '• One number (0-9)\n' +
          '• One special character (!@#$%^&*)'+
          '\n\nPlease reset your password again by pressing "RESET PASSWORD"',
          [
            {
              text: 'Reset Password',
              onPress: () => {
                navigation.navigate('Forgot_PasswordPage');
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
        return;
      }

      // Navigate to home page
      navigation.replace('UserFlow', {
        screen: 'User_HomePage',
        params: { username: userData.username },
      });
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        Alert.alert('Login Failed', 'Invalid username or password');
      } else {
        Alert.alert('Login Failed', error.message);
      }
    }
  };

  const goToRegister = () => {
    navigation.navigate('User_Register');
  };

  const goToForgotPassword = () => {
    navigation.navigate('Forgot_PasswordPage');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/Green_Lens_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Sign in For Green Lens</Text>

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

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={goToRegister}>
          <Text style={styles.registerLink}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60, backgroundColor: '#f9f9f9', alignItems: 'center' },
  logo: { width: 200, height: 80, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 40, textAlign: 'left', alignSelf: 'flex-start' },
  label: { alignSelf: 'flex-start', fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#333', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, backgroundColor: '#fff' },
  forgotPasswordContainer: { width: '100%', alignItems: 'flex-end', marginBottom: 20 },
  forgotPasswordText: { fontSize: 14, color: '#1E90FF', fontWeight: 'bold' },
  button: { width: '100%', paddingVertical: 15, borderRadius: 10, backgroundColor: '#000', alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  registerContainer: { flexDirection: 'row' },
  registerText: { fontSize: 16, color: '#333' },
  registerLink: { fontSize: 16, color: '#1E90FF', fontWeight: 'bold' },
});
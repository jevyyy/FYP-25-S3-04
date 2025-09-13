// ./screens/User/Forgot_PasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail, confirmPasswordReset } from 'firebase/auth';

export default function Forgot_PasswordPage({ route }) {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // If your app handles deep links, the oobCode can be passed via route.params
  const { oobCode } = route.params || {};

  const validatePassword = (password) => {
    const strongPassword =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!strongPassword.test(password)) {
      return '*Password too weak (at least 8 chars, include uppercase, lowercase, number & special character)';
    }
    return null;
  };

  // Step 1: Send reset email
  const handleSendResetEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);

      Alert.alert(
        'Success',
        'Password reset link sent to your email!',
        [
          {
            text: 'Return to Login',
            onPress: () => navigation.navigate('User_Login'),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'No user found with this email');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'Invalid email address');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  // Step 2: Set new password (after clicking link)
  const handleSetNewPassword = async () => {
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      Alert.alert('Error', passwordError);
      return;
    }

    if (!oobCode) {
      Alert.alert('Error', 'Invalid or missing reset code.');
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      Alert.alert('Success', 'Password has been reset!', [
        { text: 'Return to Login', onPress: () => navigation.navigate('User_Login') },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Optional: handle deep link (if user opens "greenlens://reset-password?oobCode=...")
  useEffect(() => {
    const handleLink = (event) => {
      const url = event.url;
      const match = url.match(/oobCode=([^&]+)/);
      if (match && match[1]) {
        const code = match[1];
        // Pass code to route params or state
        // You can update state or navigate to this page with oobCode
      }
    };

    Linking.addEventListener('url', handleLink);
    return () => Linking.removeEventListener('url', handleLink);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/Green_Lens_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Forgot Password</Text>

      {!oobCode ? (
        <>
          {/* Step 1: Ask for email only */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.button} onPress={handleSendResetEmail}>
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Step 2: Set new password */}
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleSetNewPassword}>
            <Text style={styles.buttonText}>Set New Password</Text>
          </TouchableOpacity>
        </>
      )}
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
  logo: {
    width: 200,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    alignSelf: 'flex-start',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

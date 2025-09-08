// ./screens/User/User_Login.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function User_Login() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    // ✅ Correct navigation to nested drawer
    navigation.replace('UserFlow', {
      screen: 'User_HomePage',
      params: { username },
    });
  };

  const goToRegister = () => {
    navigation.navigate('User_Register');
  };

  const goToForgotPassword = () => {
    navigation.navigate('Forgot_PasswordPage');
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../../assets/Green_Lens_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Sign in For Green Lens</Text>

      {/* Username Field */}
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      {/* Password Field */}
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Forgot Password link */}
      <TouchableOpacity onPress={goToForgotPassword} style={styles.forgotPasswordContainer}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don’t have an account? </Text>
        <TouchableOpacity onPress={goToRegister}>
          <Text style={styles.registerLink}>Register</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 40,
    textAlign: 'left',
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
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  forgotPasswordContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#1E90FF',
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
  },
  registerText: {
    fontSize: 16,
    color: '#333',
  },
  registerLink: {
    fontSize: 16,
    color: '#1E90FF',
    fontWeight: 'bold',
  },
});

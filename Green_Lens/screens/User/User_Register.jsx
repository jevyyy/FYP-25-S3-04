// ./screens/User/User_Register.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, app } from '../../firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const db = getFirestore(app);

export default function User_Register() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  const validatePassword = (password) => {
    const strongPassword =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!strongPassword.test(password)) {
      return '*Password too weak (at least 8 chars, include uppercase, lowercase, number & special character)';
    }
    return null;
  };

  const handleSubmit = async () => {
    let newErrors = {};
    if (!name.trim()) newErrors.name = '*Name cannot be empty';
    if (!username.trim()) newErrors.username = '*Username cannot be empty';
    if (!email.trim()) newErrors.email = '*Email cannot be empty';

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update displayName in Auth
        await updateProfile(user, { displayName: name });

        // Save info in Firestore with role
        await setDoc(doc(db, 'users', user.uid), {
          name: name,
          username: username,
          email: email,
          role: "user", // ✅ added role field
        });

        setModalVisible(true); // show success modal
      } catch (firebaseError) {
        let fbErrors = {};
        if (firebaseError.code === 'auth/email-already-in-use') {
          fbErrors.email = '*Email already in use';
        } else if (firebaseError.code === 'auth/invalid-email') {
          fbErrors.email = '*Invalid email address';
        } else if (firebaseError.code === 'auth/weak-password') {
          fbErrors.password = '*Weak password';
        } else {
          fbErrors.general = firebaseError.message;
        }
        setErrors(fbErrors);
      }
    }
  };

  const handleCancel = () => {
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setErrors({});
    navigation.navigate('User_Login');
  };

  const handleReturnToLogin = () => {
    setModalVisible(false);
    navigation.navigate('User_Login');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/Green_Lens_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Register for Green Lens</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.blackButton]} onPress={handleCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.blackButton]} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Account Successfully Registered!</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleReturnToLogin}>
              <Text style={styles.buttonText}>Return to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60, backgroundColor: '#f9f9f9', alignItems: 'center' },
  logo: { width: 200, height: 80, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  label: { alignSelf: 'flex-start', fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#333', borderRadius: 10, paddingHorizontal: 15, marginBottom: 10, backgroundColor: '#fff' },
  errorText: { alignSelf: 'flex-start', color: 'red', fontSize: 14, marginBottom: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, width: '100%' },
  button: { paddingVertical: 15, paddingHorizontal: 25, borderRadius: 10, alignItems: 'center', marginLeft: 10 },
  blackButton: { backgroundColor: '#000' },
  buttonText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: '#fff', padding: 25, borderRadius: 10, alignItems: 'center' },
  modalText: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalButton: { width: '70%', paddingVertical: 15, borderRadius: 8, alignItems: 'center', backgroundColor: '#000' },
});

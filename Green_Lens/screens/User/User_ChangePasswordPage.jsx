// ./screens/User/User_ChangePasswordPage.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function User_ChangePasswordPage() {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Password strength check using single regex
  const validatePassword = (password) => {
    const strongPassword =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (!strongPassword.test(password)) {
      return '*Password too weak (at least 8 chars, include uppercase, lowercase, number & special character)';
    }
    return null;
  };

  const handleSubmit = () => {
    let newErrors = {};

    // Dummy current password check
    if (currentPassword !== '#User1234') {
      newErrors.currentPassword = '*Incorrect Password';
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) newErrors.newPassword = passwordError;

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = '*Password Do Not Match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Clear input fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Show success modal
      setModalVisible(true);
    }
  };

  // ✅ Cancel / Return navigation
  const handleCancelOrReturn = () => {
    setModalVisible(false); // close modal if open
    navigation.navigate('UserFlow', { screen: 'SettingPage' });
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/Green_Lens_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.header}>Change Password</Text>

      <Text style={styles.label}>Current Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter current password"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}

      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleCancelOrReturn}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
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
            <Text style={styles.modalText}>Password Has Been Changed</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleCancelOrReturn}>
              <Text style={styles.buttonText}>Return</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  logo: { width: 150, height: 50, alignSelf: 'center', marginBottom: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, alignSelf: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5, marginLeft: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    alignSelf: 'flex-start',
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 5,
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  button: {
    flex: 0.48,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#000',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: '#fff', padding: 25, borderRadius: 10, alignItems: 'center' },
  modalText: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalButton: { width: '50%', paddingVertical: 15, borderRadius: 8, alignItems: 'center', backgroundColor: '#000' },
});

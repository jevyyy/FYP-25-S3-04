import React, { useState } from "react"; // Import React and useState hook
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"; // UI components
import { Picker } from "@react-native-picker/picker"; // Dropdown component for selecting role
import { useNavigation, useRoute } from "@react-navigation/native"; // Navigation hooks
import { SafeAreaView } from "react-native-safe-area-context"; // Ensures layout stays within safe area
import { getAuth } from "firebase/auth"; // Firebase authentication
import { LogBox } from "react-native"; 
LogBox.ignoreAllLogs(false); // Show all warnings/logs

export default function Admin_UpdateAccountPage() {
  const navigation = useNavigation(); // Navigation object to move between screens
  const route = useRoute(); // Get route parameters passed from previous screen
  const { user } = route.params; // Get the user object (includes name, email, id, etc.)

  // State variables to track input fields
  const [name, setName] = useState(user.name || ""); 
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || ""); 
  const [role, setRole] = useState(user.role || "User");
  const [newPassword, setNewPassword] = useState(""); 
  const [errors, setErrors] = useState({}); // Track validation errors for inputs

  // Function to validate password strength
  const validatePassword = (password) => {
    const strongPassword =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/; // Regex for strong password
    if (!strongPassword.test(password)) {
      return '*Password too weak (min 8 chars, uppercase, lowercase, number & special char)';
    }
    return null;
  };

  // Function to handle updating user account
  const handleUpdate = async () => {
    let newErrors = {};
    
    // Validate input fields
    if (!name.trim()) newErrors.name = '*Name cannot be empty';
    if (!username.trim()) newErrors.username = '*Username cannot be empty';
    if (!email.trim()) newErrors.email = '*Email cannot be empty';
    if (newPassword.trim()) {
      const passwordError = validatePassword(newPassword);
      if (passwordError) newErrors.newPassword = passwordError;
    }

    setErrors(newErrors); // Update error state to show messages
    if (Object.keys(newErrors).length > 0) return; // Stop update if there are validation errors

    try {
      const auth = getAuth(); // Get current Firebase auth instance
      const idToken = await auth.currentUser.getIdToken(); // Get admin's token for authorization

      // Prepare payload to send to Firebase Cloud Function
      const payload = {
        targetUid: user.id, // User to update
        name,
        username,
        email: email.toLowerCase(), // Make email lowercase
        role,
        password: newPassword.trim() || null, // Only update password if provided
      };

      // Call Cloud Function to update user
      const res = await fetch("https://us-central1-green-lens-47e9b.cloudfunctions.net/updateUserAuth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`, // Authorization header with admin token
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json(); // Parse response

      if (res.ok) {
        // Show success alert and go back to previous screen
        Alert.alert("Success", "User updated successfully!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        // Handle specific errors returned by server
        if (data.message.includes("email-already-in-use")) {
          setErrors({ email: '*Email already in use' });
        } else if (data.message.includes("invalid-email")) {
          setErrors({ email: '*Invalid email address' });
        } else {
          Alert.alert("Error", data.message || "Failed to update user.");
        }
      }
    } catch (error) {
      console.error(error); // Log any errors
      Alert.alert("Error", "Failed to update user."); // Show alert for network/server errors
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Account Details</Text>

      {/* Name input field */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName} // Update state when typing
          placeholder="Enter name"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>} 
      </View>

      {/* Username input field */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          autoCapitalize="none" // Keep username lowercase
        />
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
      </View>

      {/* Email input field */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* New password input field */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry // Hide password
          placeholder="Enter new password (optional)"
        />
        {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
      </View>

      {/* Role selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Role</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={role}
            onValueChange={(itemValue) => setRole(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="User" value="User" />
            <Picker.Item label="Admin" value="Admin" />
            <Picker.Item label="Developer" value="Developer" />
          </Picker>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()} // Cancel button navigates back
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={handleUpdate} // Trigger update function
        >
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24, paddingTop: 50 },
  header: { fontSize: 22, fontWeight: "600", textAlign: "center", marginBottom: 30 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, color: "#333", marginBottom: 6 },
  input: { backgroundColor: "#f5f6fa", borderRadius: 10, padding: 12, fontSize: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  pickerContainer: { backgroundColor: "#f5f6fa", borderRadius: 10, overflow: "hidden" },
  picker: { height: 50, width: "100%" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
  cancelButton: { backgroundColor: "#333" },
  updateButton: { backgroundColor: "#333" },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "500" },
  errorText: { color: "red", fontSize: 13, marginTop: 4 },
});

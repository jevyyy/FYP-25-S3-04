import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { getAuth } from "firebase/auth";

export default function Admin_UpdateAccountPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params; // must include email and id (Firestore doc id)

  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || ""); 
  const [role, setRole] = useState(user.role || "User");
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validatePassword = (password) => {
    const strongPassword =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!strongPassword.test(password)) {
      return '*Password too weak (min 8 chars, uppercase, lowercase, number & special char)';
    }
    return null;
  };

  const handleUpdate = async () => {
    let newErrors = {};
    if (!name.trim()) newErrors.name = '*Name cannot be empty';
    if (!username.trim()) newErrors.username = '*Username cannot be empty';
    if (!email.trim()) newErrors.email = '*Email cannot be empty';
    if (newPassword.trim()) {
      const passwordError = validatePassword(newPassword);
      if (passwordError) newErrors.newPassword = passwordError;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // Get current admin token
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken();

      // Prepare payload
      const payload = {
        targetUid: user.id, // Firebase UID or Firestore doc id if you map
        name,
        username,
        email: email.toLowerCase(), // ensure lowercase first letter
        role,
        password: newPassword.trim() || null,
      };

      const res = await fetch("https://us-central1-YOUR_PROJECT.cloudfunctions.net/updateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", "User updated successfully!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        // Handle server errors
        if (data.message.includes("email-already-in-use")) {
          setErrors({ email: '*Email already in use' });
        } else if (data.message.includes("invalid-email")) {
          setErrors({ email: '*Invalid email address' });
        } else {
          Alert.alert("Error", data.message || "Failed to update user.");
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update user.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Account Details</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          autoCapitalize="none"
        />
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
      </View>

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

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="Enter new password (optional)"
        />
        {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
      </View>

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

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={handleUpdate}
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
  input: {
    backgroundColor: "#f5f6fa",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerContainer: { backgroundColor: "#f5f6fa", borderRadius: 10, overflow: "hidden" },
  picker: { height: 50, width: "100%" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
  cancelButton: { backgroundColor: "#333" },
  updateButton: { backgroundColor: "#333" },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "500" },
  errorText: { color: "red", fontSize: 13, marginTop: 4 },
});

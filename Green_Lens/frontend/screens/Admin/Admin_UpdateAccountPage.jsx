// Admin_UpdateAccountPage.jsx
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
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { app } from "../../firebaseConfig";

export default function Admin_UpdateAccountPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params; // now must include email

  const db = getFirestore(app);

  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || ""); // email comes from params
  const [role, setRole] = useState(user.role || "User");
  const [newPassword, setNewPassword] = useState(""); // for password change

  const handleUpdate = async () => {
    try {
      const userRef = doc(db, "users", user.id);

      // Prepare update object
      const updateData = { name, username, email, role };
      if (newPassword.trim() !== "") {
        updateData.password = newPassword; // only update if a new password is entered
      }

      await updateDoc(userRef, updateData);

      Alert.alert("Success", "User updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Update error:", error);
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
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
        />
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
});

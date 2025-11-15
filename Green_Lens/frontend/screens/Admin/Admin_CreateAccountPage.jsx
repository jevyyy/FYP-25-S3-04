import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig";
import { Picker } from "@react-native-picker/picker";
import { initializeApp, deleteApp } from "firebase/app";

// Component for creating a new user account (Admin only)
export default function Admin_CreateAccountPage() {
  const navigation = useNavigation(); // Navigation object to move between screens
  const auth = getAuth(app); // Firebase Auth reference
  const db = getFirestore(app); // Firestore database reference

  // State variables for input fields
  const [name, setName] = useState(""); // Full name of user
  const [username, setUsername] = useState(""); // Username
  const [password, setPassword] = useState(""); // Password
  const [email, setEmail] = useState(""); // Email
  const [role, setRole] = useState("Admin"); // User role: Admin or Developer
  const [errors, setErrors] = useState({}); // Stores validation or Firebase errors

  // Function to validate password strength
  const validatePassword = (pwd) => {
    const strongPassword = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!strongPassword.test(pwd)) {
      return '*Password too weak (at least 8 chars, include uppercase, lowercase, number & special character)';
    }
    return null;
  };

  // Function to handle form submission and user creation
  const handleCreate = async () => {
    let newErrors = {};
    if (!name) newErrors.name = '*Name cannot be empty';
    if (!username) newErrors.username = '*Username cannot be empty';
    if (!email) newErrors.email = '*Email cannot be empty';

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return; // Stop if validation fails

    try {
      // Use a secondary Firebase app to create a user without affecting current login
      const secondaryApp = initializeApp(app.options, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );
      const uid = userCredential.user.uid; // Get new user's UID

      // Add user details to Firestore users collection
      await setDoc(doc(db, "users", uid), {
        name,
        username,
        email,
        role,
        status: "active", // Default status is active
      });

      // Sign out secondary app and delete it
      await secondaryAuth.signOut();
      await deleteApp(secondaryApp);

      // Show success alert and navigate back to accounts page
      Alert.alert("Success", "Account created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("AdminTabs", { screen: "Admin_AccountsPage" }),
        },
      ]);

      // Reset form fields
      setName("");
      setUsername("");
      setPassword("");
      setEmail("");
      setRole("Admin");
      setErrors({});
    } catch (firebaseError) {
      // Handle Firebase errors
      let fbErrors = {};
      if (firebaseError.code === 'auth/email-already-in-use') {
        fbErrors.email = '*Email already in use';
      } else if (firebaseError.code === 'auth/invalid-email') {
        fbErrors.email = '*Invalid email address';
      } else {
        fbErrors.general = firebaseError.message; // Catch all other errors
      }
      setErrors(fbErrors); // Display errors to user
    }
  };

  // Render form UI
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Creation</Text>

      {/* Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      {/* Username Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        autoCapitalize="none"
        onChangeText={setUsername}
      />
      {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        autoCapitalize="none"
        onChangeText={(text) => setEmail(text.toLowerCase())}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

      {/* Role Selection */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={role}
          onValueChange={(value) => setRole(value)}
          mode="dropdown"
          style={styles.picker}
        >
          <Picker.Item label="Admin" value="Admin" />
          <Picker.Item label="Developer" value="Developer" />
        </Picker>
      </View>

      {/* Buttons for Cancel and Create */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.cancel]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.create]} onPress={handleCreate}>
          <Text style={styles.buttonText}>Create</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles for the page
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  input: { backgroundColor: "#F5F5F5", padding: 12, borderRadius: 8, marginBottom: 12 },
  errorText: { color: "red", fontSize: 14, marginBottom: 10 },
  pickerContainer: { borderWidth: 1, borderRadius: 8, borderColor: "#ccc", marginBottom: 20, overflow: "hidden" },
  picker: { height: 50, width: "100%" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center", marginHorizontal: 5 },
  cancel: { backgroundColor: "black" },
  create: { backgroundColor: "black" },
  buttonText: { color: "white", fontWeight: "600" },
});
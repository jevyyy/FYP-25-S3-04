import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig";
import { Picker } from "@react-native-picker/picker";
import { initializeApp, deleteApp } from "firebase/app";

export default function Admin_CreateAccountPage() {
  const navigation = useNavigation();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Admin");

  const handleCreate = async () => {
    if (!name || !username || !password || !email) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      console.log(
        `👤 Current logged-in user: ${currentUser?.email || "Unknown"} | UID: ${
          currentUser?.uid || "N/A"
        }`
      );

      // ✅ Initialize a temporary secondary app for user creation
      const secondaryApp = initializeApp(app.options, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);

      // ✅ Create new user without affecting main session
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email.trim(),
        password
      );
      const uid = userCredential.user.uid;

      // ✅ Save user info to Firestore (no createdAt)
      await setDoc(doc(db, "users", uid), {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        role,
        status: "active",
      });

      console.log(`✅ New account created successfully: ${email} | UID: ${uid}`);

      // ✅ Sign out & clean up secondary app
      await secondaryAuth.signOut();
      await deleteApp(secondaryApp);

      Alert.alert("Success", "Account created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("AdminTabs", { screen: "Admin_AccountsPage" }),
        },
      ]);

      // ✅ Reset form
      setName("");
      setUsername("");
      setPassword("");
      setEmail("");
      setRole("Admin");
    } catch (error) {
      console.error("❌ Error creating account:", error);
      Alert.alert("Error", error.message || "Failed to create account.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Creation</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        autoCapitalize="none"
        onChangeText={(text) => setUsername(text.toLowerCase())}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />

      {/* Role Picker */}
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

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancel]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.create]}
          onPress={handleCreate}
        >
          <Text style={styles.buttonText}>Create</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
    marginBottom: 20,
    overflow: "hidden",
  },
  picker: { height: 50, width: "100%" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancel: { backgroundColor: "black" },
  create: { backgroundColor: "black" },
  buttonText: { color: "white", fontWeight: "600" },
});

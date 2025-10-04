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

export default function Admin_CreateAccountPage() {
  const navigation = useNavigation();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Admin"); // Default

  const handleCreate = async () => {
    if (!name || !username || !password || !email) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        name,
        username: username.toLowerCase(), // force lowercase
        email,
        role,
        status: "active",
      });

      // Navigate to Admin_AccountsPage inside AdminTabs
      Alert.alert(
        "Success",
        "Account created successfully!",
        [
          {
            text: "Return to Home",
            onPress: () =>
              navigation.navigate("AdminFlow", { screen: "Admin_AccountsPage" }),
          },
        ],
        { cancelable: false }
      );

      // Reset form fields
      setName("");
      setUsername("");
      setPassword("");
      setEmail("");
      setRole("Admin");
    } catch (error) {
      console.error("Error creating user:", error);
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
        autoCapitalize="none" // prevent first letter uppercase
        onChangeText={(text) => setUsername(text.toLowerCase())} // force lowercase
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

      {/* Role Selection Dropdown */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
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
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center", marginHorizontal: 5 },
  cancel: { backgroundColor: "black" },
  create: { backgroundColor: "black" },
  buttonText: { color: "white", fontWeight: "600" },
});

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
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default function Admin_CreateAccountPage() {
  const navigation = useNavigation();
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
      await addDoc(collection(db, "users"), {
        name,
        username,
        password, // ⚠️ Hash in production
        email,
        role,
        status: "active",
      });
      Alert.alert("Success", "Account created successfully!", [
        { text: "Return to Home", onPress: () => navigation.navigate("Admin_HomePage") },
      ]);
    } catch (error) {
      Alert.alert("Error", "Could not create account.");
      console.error("Error creating account:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Creation</Text>

      <TextInput style={styles.input} placeholder="Enter your name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Enter your username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Enter your password" value={password} secureTextEntry onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Enter your email" value={email} onChangeText={setEmail} />

      {/* Role Selection */}
      <View style={styles.roleBox}>
        <TouchableOpacity onPress={() => setRole("Admin")}>
          <Text style={[styles.roleOption, role === "Admin" && styles.selectedRole]}>Admin</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRole("Developer")}>
          <Text style={[styles.roleOption, role === "Developer" && styles.selectedRole]}>Developer</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  roleBox: { flexDirection: "row", justifyContent: "space-around", marginVertical: 20 },
  roleOption: { fontSize: 16, padding: 8, borderWidth: 1, borderRadius: 6 },
  selectedRole: { backgroundColor: "black", color: "white" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center", marginHorizontal: 5 },
  cancel: { backgroundColor: "gray" },
  create: { backgroundColor: "black" },
  buttonText: { color: "white", fontWeight: "600" },
});

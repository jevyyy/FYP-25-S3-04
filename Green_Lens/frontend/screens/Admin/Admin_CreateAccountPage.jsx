import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
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
  const [errors, setErrors] = useState({});

  const validatePassword = (pwd) => {
    const strongPassword = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!strongPassword.test(pwd)) {
      return '*Password too weak (at least 8 chars, include uppercase, lowercase, number & special character)';
    }
    return null;
  };

  const handleCreate = async () => {
    let newErrors = {};
    if (!name) newErrors.name = '*Name cannot be empty';
    if (!username) newErrors.username = '*Username cannot be empty';
    if (!email) newErrors.email = '*Email cannot be empty';

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      const secondaryApp = initializeApp(app.options, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        name,
        username,
        email,
        role,
        status: "active",
      });

      await secondaryAuth.signOut();
      await deleteApp(secondaryApp);

      Alert.alert("Success", "Account created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("AdminTabs", { screen: "Admin_AccountsPage" }),
        },
      ]);

      setName("");
      setUsername("");
      setPassword("");
      setEmail("");
      setRole("Admin");
      setErrors({});
    } catch (firebaseError) {
      let fbErrors = {};
      if (firebaseError.code === 'auth/email-already-in-use') {
        fbErrors.email = '*Email already in use';
      } else if (firebaseError.code === 'auth/invalid-email') {
        fbErrors.email = '*Invalid email address';
      } else {
        fbErrors.general = firebaseError.message;
      }
      setErrors(fbErrors);
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
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        autoCapitalize="none"
        onChangeText={setUsername}
      />
      {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={(text) => {
          if (text.length === 1) {
            setEmail(text.toLowerCase());
          } else {
            setEmail(text);
          }
        }}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

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

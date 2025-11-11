// Admin_SuspendAccountPage.jsx
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../firebaseConfig";
import { LogBox } from "react-native"; // <-- Add this
LogBox.ignoreAllLogs(false); // <-- Show all warnings and logs

export default function Admin_SuspendAccountPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params;

  const auth = getAuth(app);
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState(user.status);
  const [loading, setLoading] = useState(false);

  // --- Track logged-in admin ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
      else navigation.navigate("Login");
    });

    return () => unsubscribe();
  }, []);

  const toggleSuspend = async () => {
    if (!currentUser) return;

    if (user.id === currentUser.uid) {
      Alert.alert("Action Denied", "You cannot suspend your own account!");
      return;
    }

    setLoading(true);

    try {
      const idToken = await currentUser.getIdToken(true);
      const functionUrl =
            "https://us-central1-green-lens-47e9b.cloudfunctions.net/toggleUserStatus";


      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUid: user.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error calling Cloud Function");

      setStatus(data.newStatus);

      Alert.alert(
        "Success",
        `User account has been ${data.newStatus === "inactive" ? "suspended" : "reactivated"}.`,
        [{ text: "OK", onPress: () => navigation.navigate("AdminTabs", { screen: "Admin_AccountsPage" }) }]
      );
    } catch (error) {
      console.error("Error toggling status:", error);
      Alert.alert("Error", error.message || "Unable to update account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Account Details</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user.name}</Text>

        <Text style={styles.label}>Username:</Text>
        <Text style={styles.value}>{user.username}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>

        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{user.role}</Text>

        <Text style={styles.label}>Status:</Text>
        <Text
          style={[
            styles.value,
            { color: status === "active" ? "green" : "red" },
          ]}
        >
          {status === "active" ? "Active" : "Suspended"}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            status === "active" ? styles.suspendButton : styles.reactivateButton,
          ]}
          onPress={toggleSuspend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {status === "active" ? "Suspend" : "Reactivate"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24, paddingTop: 50 },
  header: { fontSize: 22, fontWeight: "600", textAlign: "center", marginBottom: 30 },
  infoBox: { backgroundColor: "#f5f6fa", padding: 16, borderRadius: 10, marginBottom: 30 },
  label: { fontSize: 14, color: "#333", fontWeight: "500", marginTop: 10 },
  value: { fontSize: 15, color: "#555" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  button: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
  cancelButton: { backgroundColor: "#333" },
  suspendButton: { backgroundColor: "red" },
  reactivateButton: { backgroundColor: "green" },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "500" },
});

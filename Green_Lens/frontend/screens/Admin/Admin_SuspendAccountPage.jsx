import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../firebaseConfig";
import { LogBox } from "react-native";

// Show all warnings and logs for debugging
LogBox.ignoreAllLogs(false);

export default function Admin_SuspendAccountPage() {
  const navigation = useNavigation(); // Navigation object to navigate between screens
  const route = useRoute(); // Route object to access passed parameters
  const { user } = route.params; // Get the user data passed to this screen

  const auth = getAuth(app); // Get Firebase auth instance
  const [currentUser, setCurrentUser] = useState(null); // Store the logged-in admin
  const [status, setStatus] = useState(user.status); // Track the status of the target user (active/suspended)
  const [loading, setLoading] = useState(false); // Track if a network operation is in progress

  // Effect to track currently logged-in admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user); // Set current admin if logged in
      else navigation.navigate("Login"); // Redirect to Login if no admin is logged in
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  // Function to suspend/reactivate user account
  const toggleSuspend = async () => {
    if (!currentUser) return; // Do nothing if no admin is logged in

    // Prevent admin from suspending their own account
    if (user.id === currentUser.uid) {
      Alert.alert("Action Denied", "You cannot suspend your own account!");
      return;
    }

    setLoading(true); // Show loading spinner

    try {
      // Get ID token from admin to authenticate with cloud function
      const idToken = await currentUser.getIdToken(true);

      // URL of Firebase Cloud Function that toggles user status
      const functionUrl =
        "https://us-central1-green-lens-47e9b.cloudfunctions.net/toggleUserStatus";

      // Call the cloud function
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`, // Authenticate request
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUid: user.id }), // Send target user's ID
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error calling Cloud Function");

      setStatus(data.newStatus); // Update status in UI

      // Show success message
      Alert.alert(
        "Success",
        `User account has been ${data.newStatus === "inactive" ? "suspended" : "reactivated"}.`,
        [{ text: "OK", onPress: () => navigation.navigate("AdminTabs", { screen: "Admin_AccountsPage" }) }]
      );
    } catch (error) {
      console.error("Error toggling status:", error);
      Alert.alert("Error", error.message || "Unable to update account.");
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Page header */}
      <Text style={styles.header}>Account Details</Text>

      {/* Box showing target user information */}
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
            { color: status === "active" ? "green" : "red" }, // Green for active, red for suspended
          ]}
        >
          {status === "active" ? "Active" : "Suspended"}
        </Text>
      </View>

      {/* Buttons row */}
      <View style={styles.buttonRow}>
        {/* Cancel button goes back to previous screen */}
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={loading} // Disable during loading
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        {/* Suspend / Reactivate button */}
        <TouchableOpacity
          style={[
            styles.button,
            status === "active" ? styles.suspendButton : styles.reactivateButton,
          ]}
          onPress={toggleSuspend} // Call function to toggle user status
          disabled={loading} // Disable during loading
        >
          {loading ? (
            <ActivityIndicator color="#fff" /> // Show spinner while loading
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
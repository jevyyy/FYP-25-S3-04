import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebaseConfig";
import GreenLensLogo from "../../assets/Green_Lens_logo.png";

// Main component for the Admin Home Page
export default function Admin_HomePage() {
  // State variables to store counts and username
  const [totalUsers, setTotalUsers] = useState(0); // Total number of users
  const [activeUsers, setActiveUsers] = useState(0); // Number of active users
  const [inactiveUsers, setInactiveUsers] = useState(0); // Number of inactive users
  const [feedbackCount, setFeedbackCount] = useState(0); // Total number of feedbacks
  const [username, setUsername] = useState("Admin"); // Current admin username

  const db = getFirestore(app); // Firestore database reference
  const auth = getAuth(app); // Firebase authentication reference

  // useEffect runs once when the component mounts
  useEffect(() => {
    const currentUser = auth.currentUser; // Get the current logged-in user

    // Fetch the username of the current admin from Firestore
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid); // Reference to the user's document
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setUsername(docSnap.data().username || "Admin"); // Set username state
          }
        })
        .catch((err) => console.log("Error fetching username:", err)); // Log error if failed
    }

    // Live listener for the users collection to get real-time counts
    const usersCol = collection(db, "users"); // Reference to the "users" collection
    const unsubscribeUsers = onSnapshot(
      usersCol,
      (snapshot) => {
        const total = snapshot.size; // Total users in collection
        let active = 0;
        let inactive = 0;

        // Count active and inactive users
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === "active") active++;
          else if (data.status === "inactive") inactive++;
        });

        setTotalUsers(total); // Update total users state
        setActiveUsers(active); // Update active users state
        setInactiveUsers(inactive); // Update inactive users state
      },
      (error) => {
        console.error("Error fetching users:", error); // Log errors if snapshot fails
      }
    );

    // Live listener for the feedback collection to get real-time count
    const feedbackCol = collection(db, "feedback"); // Reference to the "feedback" collection
    const unsubscribeFeedback = onSnapshot(
      feedbackCol,
      (snapshot) => {
        setFeedbackCount(snapshot.size); // Update feedback count state
      },
      (error) => {
        console.error("Error fetching feedback:", error); // Log errors if snapshot fails
      }
    );

    // Cleanup function: remove listeners when component unmounts
    return () => {
      unsubscribeUsers();
      unsubscribeFeedback();
    };
  }, []);

  // Render UI
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <Image source={GreenLensLogo} style={styles.logoImage} /> {/* Display logo */}
        <Text style={styles.greeting}>Hi {username},</Text> {/* Display greeting with admin username */}
      </View>

      <View style={styles.cardContainer}>
        {/* Card showing total users */}
        <View style={[styles.card, { backgroundColor: "#FDE9C9" }]}>
          <Text style={styles.cardTitle}>Total GreenLens Users:</Text>
          <Text style={styles.cardValue}>{totalUsers}</Text>
        </View>

        {/* Card showing active users */}
        <View style={[styles.card, { backgroundColor: "#E2F1F5" }]}>
          <Text style={styles.cardTitle}>Active User Accounts:</Text>
          <Text style={styles.cardValue}>{activeUsers}</Text>
        </View>

        {/* Card showing inactive users */}
        <View style={[styles.card, { backgroundColor: "#DFF0E1" }]}>
          <Text style={styles.cardTitle}>Inactive User Accounts:</Text>
          <Text style={styles.cardValue}>{inactiveUsers}</Text>
        </View>

        {/* Card showing total feedback received */}
        <View style={[styles.card, { backgroundColor: "#E7DEFA" }]}>
          <Text style={styles.cardTitle}>Total Feedback Received:</Text>
          <Text style={styles.cardValue}>{feedbackCount}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50, paddingHorizontal: 20 },
  header: { flexDirection: "column", alignItems: "flex-start", marginBottom: 30 },
  logoImage: { width: 150, height: 50, resizeMode: "contain", marginBottom: 10, marginLeft: -5 },
  greeting: { fontSize: 22, fontWeight: "600", color: "#333" },
  cardContainer: { marginBottom: 100 },
  card: { borderRadius: 12, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 14, color: "#333", marginBottom: 8 },
  cardValue: { fontSize: 20, fontWeight: "700", fontStyle: "italic", color: "#222" },
});
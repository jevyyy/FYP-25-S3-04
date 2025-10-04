import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { app } from "../../firebaseConfig"; // adjust path if needed

export default function Admin_HomePage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);

  useEffect(() => {
    const db = getFirestore(app);

    // Live listener for users collection
    const usersCol = collection(db, "users");
    const unsubscribeUsers = onSnapshot(usersCol, (snapshot) => {
      const total = snapshot.size;
      let active = 0;
      let inactive = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "active") active++;
        else if (data.status === "inactive") inactive++;
      });

      setTotalUsers(total);
      setActiveUsers(active);
      setInactiveUsers(inactive);
    }, (error) => {
      console.error("Error fetching users:", error);
    });

    // Live listener for feedback collection
    const feedbackCol = collection(db, "feedback"); // adjust name
    const unsubscribeFeedback = onSnapshot(feedbackCol, (snapshot) => {
      setFeedbackCount(snapshot.size);
    }, (error) => {
      console.error("Error fetching feedback:", error);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeUsers();
      unsubscribeFeedback();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hi Admin,</Text>

      <View style={styles.cardContainer}>
        <View style={[styles.card, { backgroundColor: "#FDE9C9" }]}>
          <Text style={styles.cardTitle}>Total GreenLens Users:</Text>
          <Text style={styles.cardValue}>{totalUsers}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#E2F1F5" }]}>
          <Text style={styles.cardTitle}>Active User Accounts:</Text>
          <Text style={styles.cardValue}>{activeUsers}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#DFF0E1" }]}>
          <Text style={styles.cardTitle}>Inactive User Accounts:</Text>
          <Text style={styles.cardValue}>{inactiveUsers}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#E7DEFA" }]}>
          <Text style={styles.cardTitle}>Total Feedback Received:</Text>
          <Text style={styles.cardValue}>{feedbackCount}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
  },
  cardContainer: {
    marginBottom: 100,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "700",
    fontStyle: "italic",
    color: "#222",
  },
});

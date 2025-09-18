import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function Admin_HomePage() {
  const navigation = useNavigation();

  // States for statistics
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);

  // Fetch statistics from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const users = usersSnapshot.docs.map((doc) => doc.data());
        setTotalUsers(users.length);

        const active = users.filter((u) => u.status === "active").length;
        const inactive = users.filter((u) => u.status === "inactive").length;

        setActiveUsers(active);
        setInactiveUsers(inactive);

        // Fetch Feedback
        const feedbackSnapshot = await getDocs(collection(db, "feedback"));
        setFeedbackCount(feedbackSnapshot.size);
      } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      {/* Greeting */}
      <Text style={styles.greeting}>Hi Admin,</Text>

      {/* Statistic Cards */}
      <View style={styles.cardContainer}>
        <View style={[styles.card, { backgroundColor: "#FDE9C9" }]}>
          <Text style={styles.cardTitle}>Total GreenLens User:</Text>
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

      {/* Bottom Navigation */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Admin_HomePage")}
        >
          <Ionicons name="home" size={22} color="white" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Admin_AccountsPage")}
        >
          <Ionicons name="people" size={22} color="white" />
          <Text style={styles.navText}>Accounts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Admin_ReportPage")}
        >
          <Ionicons name="document-text" size={22} color="white" />
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Admin_Settings")}
        >
          <Ionicons name="settings" size={22} color="white" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
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
    marginBottom: 100, // space above navbar
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
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#000",
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    color: "white",
    fontSize: 12,
    marginTop: 2,
  },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function Admin_Reports() {
  const navigation = useNavigation();
  const [feedbacks, setFeedbacks] = useState([]);
  const [ratingsCount, setRatingsCount] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const snapshot = await getDocs(collection(db, "feedbacks"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setFeedbacks(data);

        // Count ratings
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        data.forEach((f) => {
          if (f.rating >= 1 && f.rating <= 5) counts[f.rating]++;
        });
        setRatingsCount(counts);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };
    fetchFeedbacks();
  }, []);

  const renderBar = (stars) => {
    const total = Object.values(ratingsCount).reduce((a, b) => a + b, 0) || 1;
    const percentage = (ratingsCount[stars] / total) * 100;

    return (
      <View style={styles.barRow} key={stars}>
        <Text style={styles.starLabel}>{stars}★</Text>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.count}>{ratingsCount[stars]}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Ionicons name="leaf" size={28} color="green" />
        <Text style={styles.logoText}>GREEN LENS</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Review Summary</Text>

      <ScrollView>
        {/* Ratings Chart */}
        <View style={styles.chartContainer}>
          {[5, 4, 3, 2, 1].map((stars) => renderBar(stars))}
        </View>

        {/* Recent Feedback */}
        <Text style={styles.subtitle}>Most Recent Feedback</Text>
        <FlatList
          data={feedbacks.slice(0, 5)} // latest 5 feedbacks
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackRating}>Rating: {item.rating}★</Text>
              <Text style={styles.feedbackText}>{item.review}</Text>
              <Text style={styles.feedbackUser}>By: {item.username || "Anonymous"}</Text>
            </View>
          )}
        />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate("Admin_HomePage")}>
          <Ionicons name="home" size={22} color="white" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Admin_AccountsPage")}>
          <Ionicons name="people" size={22} color="white" />
          <Text style={styles.navText}>Accounts</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="document-text" size={22} color="white" />
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Admin_Settings")}>
          <Ionicons name="settings" size={22} color="white" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16, paddingTop: 50 },
  logoContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  logoText: { fontSize: 20, fontWeight: "bold", marginLeft: 8, color: "green" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  chartContainer: { marginBottom: 20 },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  starLabel: { width: 30, fontWeight: "600" },
  barBackground: {
    flex: 1,
    height: 12,
    backgroundColor: "#eee",
    borderRadius: 6,
    marginHorizontal: 6,
  },
  barFill: {
    height: 12,
    backgroundColor: "green",
    borderRadius: 6,
  },
  count: { width: 30, textAlign: "right" },
  subtitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  feedbackCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  feedbackRating: { fontWeight: "600", marginBottom: 4 },
  feedbackText: { fontStyle: "italic", marginBottom: 4 },
  feedbackUser: { fontSize: 12, color: "#555" },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "black",
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navText: { color: "white", fontSize: 12, textAlign: "center" },
});

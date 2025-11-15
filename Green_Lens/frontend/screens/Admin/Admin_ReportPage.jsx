import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";
import { getFirestore, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { app } from "../../firebaseConfig";
import GreenLensLogo from "../../assets/Green_Lens_logo.png";

export default function Admin_Reports() {
  const db = getFirestore(app); // Firestore database reference

  // State variables
  const [feedbacks, setFeedbacks] = useState([]); // Stores all user feedback documents
  const [ratingsCount, setRatingsCount] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }); // Stores count of each star rating

  // Fetch feedback from Firestore and listen for real-time updates
  useEffect(() => {
    const feedbackRef = collection(db, "feedback"); // Reference to feedback collection
    const q = query(feedbackRef, orderBy("createdAt", "desc")); // Order feedback by newest first

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Map Firestore documents to an array
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeedbacks(list);

      // Count the number of feedbacks for each star rating
      const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      list.forEach((f) => {
        if (f.rating >= 1 && f.rating <= 5) counts[f.rating]++;
      });
      setRatingsCount(counts);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  // Function to render each rating bar in the chart
  const renderBar = (stars) => {
    const total = Object.values(ratingsCount).reduce((a, b) => a + b, 0) || 1; // Total feedbacks
    const percentage = (ratingsCount[stars] / total) * 100; // Percentage width of the bar

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
      {/* App Logo */}
      <View style={styles.logoContainer}>
        <Image source={GreenLensLogo} style={styles.logoImage} />
      </View>

      {/* Page Title */}
      <Text style={styles.title}>Review Summary</Text>

      {/* Ratings Chart */}
      <View style={styles.chartContainer}>
        {[5, 4, 3, 2, 1].map((stars) => renderBar(stars))} {/* Render rating bars from 5★ to 1★ */}
      </View>

      {/* User Feedback List */}
      <Text style={styles.subtitle}>User Feedback</Text>
      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackRating}>Rating: {item.rating}★</Text> {/* Show rating */}
            <Text style={styles.feedbackText}>{item.suggestion}</Text> {/* Show feedback text */}
            <Text style={styles.feedbackUser}>By: {item.username || "Anonymous"}</Text> {/* Show user */}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16, paddingTop: 50 },
  logoContainer: { alignItems: "flex-start", marginBottom: 20 },
  logoImage: { width: 150, height: 50, resizeMode: "contain" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  chartContainer: { marginBottom: 20 },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  starLabel: { width: 30, fontWeight: "600" },
  barBackground: { flex: 1, height: 12, backgroundColor: "#eee", borderRadius: 6, marginHorizontal: 6 },
  barFill: { height: 12, backgroundColor: "green", borderRadius: 6 },
  count: { width: 30, textAlign: "right" },
  subtitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  feedbackCard: { backgroundColor: "#f9f9f9", padding: 12, borderRadius: 8, marginBottom: 10 },
  feedbackRating: { fontWeight: "600", marginBottom: 4 },
  feedbackText: { fontStyle: "italic", marginBottom: 4 },
  feedbackUser: { fontSize: 12, color: "#555" },
});
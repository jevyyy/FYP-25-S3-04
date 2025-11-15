import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";
import { getFirestore, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { app } from "../../firebaseConfig";
import GreenLensLogo from "../../assets/Green_Lens_logo.png";

export default function Admin_Reports() {
  const db = getFirestore(app); // Reference to Firestore database

  const [feedbacks, setFeedbacks] = useState([]); // Store all feedback documents
  const [ratingsCount, setRatingsCount] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }); // Count of each star rating

  useEffect(() => {
    // Reference to the feedback collection, ordered by newest first
    const feedbackRef = collection(db, "feedback");
    const q = query(feedbackRef, orderBy("createdAt", "desc"));

    // Listen to the feedback collection in real-time
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeedbacks(list); // Update feedbacks state

      // Count how many feedbacks each star rating has
      const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      list.forEach((f) => {
        const rating = Number(f.rating);
        if (rating >= 1 && rating <= 5) counts[rating]++;
      });
      setRatingsCount(counts); // Update ratings count
    });

    // Remove listener when component unmounts
    return () => unsubscribe();
  }, []);

  // Render a horizontal bar for each star rating in the chart
  const renderBar = (stars) => {
    const total = Object.values(ratingsCount).reduce((a, b) => a + b, 0) || 1;
    const percentage = (ratingsCount[stars] / total) * 100;

    return (
      <View style={styles.barRow} key={stars}>
        <Text style={styles.starLabel}>{String(stars)}★</Text>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.count}>{String(ratingsCount[stars])}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Display app logo */}
      <View style={styles.logoContainer}>
        {GreenLensLogo && <Image source={GreenLensLogo} style={styles.logoImage} />}
      </View>

      <Text style={styles.title}>Review Summary</Text>

      {/* Ratings chart */}
      <View style={styles.chartContainer}>
        {[5, 4, 3, 2, 1].map((stars) => renderBar(stars))} 
      </View>

      <Text style={styles.subtitle}>User Feedback</Text>

      {/* List all user feedback */}
      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackRating}>Rating: {String(item.rating)}★</Text>
            <Text style={styles.feedbackText}>{String(item.suggestion || "")}</Text>
            <Text style={styles.feedbackUser}>By: {String(item.username || "Anonymous")}</Text>
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

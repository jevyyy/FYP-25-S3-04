import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";
import { getFirestore, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { app } from "../../firebaseConfig";
import GreenLensLogo from "../../assets/Green_Lens_logo.png"; // adjust path if needed

export default function Admin_Reports() {
  const db = getFirestore(app);

  const [feedbacks, setFeedbacks] = useState([]);
  const [ratingsCount, setRatingsCount] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

  useEffect(() => {
    const feedbackRef = collection(db, "feedback");
    const q = query(feedbackRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeedbacks(list);

      // Count star ratings
      const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      list.forEach((f) => {
        if (f.rating >= 1 && f.rating <= 5) counts[f.rating]++;
      });
      setRatingsCount(counts);
    });

    return () => unsubscribe();
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
        <Image source={GreenLensLogo} style={styles.logoImage} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Review Summary</Text>

      {/* Ratings Chart */}
      <View style={styles.chartContainer}>
        {[5, 4, 3, 2, 1].map((stars) => renderBar(stars))}
      </View>

      {/* Feedback */}
      <Text style={styles.subtitle}>User Feedback</Text>
      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackRating}>Rating: {item.rating}★</Text>
            <Text style={styles.feedbackText}>{item.suggestion}</Text>
            <Text style={styles.feedbackUser}>By: {item.username || "Anonymous"}</Text>
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

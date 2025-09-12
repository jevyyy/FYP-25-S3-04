// ./screens/User/User_RankingPage.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { app } from '../../firebaseConfig';

const db = getFirestore(app);

export default function User_RankingPage() {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Assume you store each quiz result in 'quizResults' collection with a 'points' field
        const resultsSnapshot = await getDocs(collection(db, 'quizResults'));

        // Aggregate total points per user
        const userScores = {};
        resultsSnapshot.forEach(doc => {
          const data = doc.data();
          const userId = data.userId;
          if (!userScores[userId]) {
            userScores[userId] = {
              username: data.username || 'Anonymous',
              totalPoints: 0,
            };
          }
          userScores[userId].totalPoints += data.points || 0;
        });

        // Convert object to array and sort by totalPoints descending
        const sortedUsers = Object.entries(userScores)
          .map(([userId, info], index) => ({
            rank: 0, // temporary, will update below
            userId,
            username: info.username,
            pt: info.totalPoints,
          }))
          .sort((a, b) => b.pt - a.pt);

        // Assign rank based on sorted order
        sortedUsers.forEach((user, idx) => {
          user.rank = idx + 1;
        });

        // Only top 10 users
        setTopUsers(sortedUsers.slice(0, 10));
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.rank}>{item.rank}</Text>
      <Text style={styles.username}>{item.username}</Text>
      <Text style={styles.pt}>{item.pt} PT</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <FlatList
        data={topUsers}
        keyExtractor={(item) => item.userId}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  rank: { fontSize: 18, fontWeight: 'bold', width: 30 },
  username: { fontSize: 16, fontWeight: '600', flex: 1 },
  pt: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
});

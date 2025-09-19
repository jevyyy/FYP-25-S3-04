// ./screens/User/User_RankingPage.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { app } from '../../firebaseConfig';

const db = getFirestore(app);

export default function User_RankingPage() {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      // Map and filter by role = "user"
      const users = snapshot.docs
        .map(doc => ({
          userId: doc.id,
          username: doc.data().username || 'Anonymous',
          pt: doc.data().totalPoints || 0,
          role: doc.data().role || 'user',
        }))
        .filter(user => user.role === 'user'); // <-- only include users with role "user"

      // Sort by points descending
      users.sort((a, b) => b.pt - a.pt);

      // Assign rank
      users.forEach((user, index) => {
        user.rank = index + 1;
      });

      // Only top 10
      setTopUsers(users.slice(0, 10));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
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
      <Text style={styles.title}>Ranking</Text>
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

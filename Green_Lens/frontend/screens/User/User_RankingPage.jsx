// ./screens/User/User_RankingPage.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { app } from '../../firebaseConfig';

const db = getFirestore(app);

export default function User_RankingPage() {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const users = snapshot.docs
          .map((doc) => ({
            userId: doc.id,
            username: doc.data().username || 'Anonymous',
            pt: doc.data().totalPoints || 0,
            role: doc.data().role || 'User',
          }))
          .filter((user) => user.role === 'User')// <-- only include users with role "user"
          // Sort by points descending
          users.sort((a, b) => b.pt - a.pt);

          // Assign rank
          users.forEach((user, index) => {
            user.rank = index + 1;
          });

        // Only top 10 users
        setTopUsers(users.slice(0, 10));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching leaderboard:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const topThree = topUsers.slice(0, 3);
  const remainingUsers = topUsers.slice(3);

  const renderItem = ({ item }) => {
    const isUser = item.username.toLowerCase() === 'you'; //highlight own user 

    return (
      <View style={[styles.listItem, isUser && styles.currentUser]}>
        <Text style={styles.rankText}>{item.rank}</Text>
        <Text style={styles.usernameText}>{item.username}</Text>
        <Text style={styles.pointsText}>{item.pt} PT</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Leaderboard</Text>

      {/* Top 3 Podium */}
      <View style={styles.podiumContainer}>
        {/* 2nd Place */}
        {topThree[1] && (
          <View style={[styles.podiumItem, { marginTop: 30 }]}>
            <View style={[styles.circle, { backgroundColor: '#D1E7DD' }]}>
              <Text style={styles.rankCircle}>🥈</Text>
            </View>
            <Text style={styles.podiumName}>{topThree[1].username}</Text>
            <Text style={styles.podiumPoints}>{topThree[1].pt} PT</Text>
          </View>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <View style={[styles.podiumItem, { marginTop: 0 }]}>
            <View style={[styles.circle, styles.goldCircle]}>
              <Text style={styles.rankCircle}>🥇</Text>
            </View>
            <Text style={[styles.podiumName, styles.winnerName]}>{topThree[0].username}</Text>
            <Text style={[styles.podiumPoints, styles.winnerPoints]}>
              {topThree[0].pt} PT
            </Text>
          </View>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <View style={[styles.podiumItem, { marginTop: 40 }]}>
            <View style={[styles.circle, { backgroundColor: '#FADADD' }]}>
              <Text style={styles.rankCircle}>🥉</Text>
            </View>
            <Text style={styles.podiumName}>{topThree[2].username}</Text>
            <Text style={styles.podiumPoints}>{topThree[2].pt} PT</Text>
          </View>
        )}
      </View>

      {/* Remaining Users */}
      <View style={styles.listContainer}>
        <FlatList
          data={remainingUsers}
          keyExtractor={(item) => item.userId}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF8', padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  podiumItem: {
    alignItems: 'center',
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldCircle: {
    backgroundColor: '#FFE066',
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  rankCircle: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#000',
  },
  podiumName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6,
  },
  winnerName: {
    fontWeight: 'bold',
    fontSize: 25,
  },
  podiumPoints: {
    fontSize: 14,
    color: '#4CAF50',
  },
  winnerPoints: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '700',
  },
  listContainer: {
    backgroundColor: '#EAF4E4',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 5,
  },
  currentUser: {
    backgroundColor: '#6AA84F',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 25,
    color: '#000',
  },
  usernameText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  pointsText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
});
// ./screens/User/User_RankingPage.jsx
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function User_RankingPage() {
  // Sample data for top 10 users
  const topUsers = [
    { rank: 1, username: '@user1', pt: 1200 },
    { rank: 2, username: '@user2', pt: 1150 },
    { rank: 3, username: '@user3', pt: 1100 },
    { rank: 4, username: '@user4', pt: 1080 },
    { rank: 5, username: '@user5', pt: 1050 },
    { rank: 6, username: '@user6', pt: 1020 },
    { rank: 7, username: '@user7', pt: 980 },
    { rank: 8, username: '@user8', pt: 950 },
    { rank: 9, username: '@user9', pt: 900 },
    { rank: 10, username: '@user10', pt: 850 },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.rank}>{item.rank}</Text>
      <Text style={styles.username}>{item.username}</Text>
      <Text style={styles.pt}>{item.pt} PT</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <FlatList
        data={topUsers}
        keyExtractor={(item) => item.rank.toString()}
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

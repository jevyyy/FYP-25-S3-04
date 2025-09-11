import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function User_RewardPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Rewards Page</Text>
      <Text style={styles.text}>This is a placeholder for the User Rewards.</Text>
      <Text style={styles.text}>You can display points, badges, or any reward info here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 16, textAlign: 'center', marginBottom: 10 },
});

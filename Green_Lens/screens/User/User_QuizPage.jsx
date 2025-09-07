// ./screens/User/User_QuizPage.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function User_QuizPage() {
  const navigation = useNavigation();

  const handlePressCategory = (category) => {
    // Placeholder: Replace with your logic
    console.log(`${category} button pressed`);
  };

  return (
    <View style={styles.container}>
      {/* Ranking button at top right */}
      <TouchableOpacity
        style={styles.rankingButton}
        onPress={() => navigation.navigate('User_RankingPage')}
      >
        <Text style={styles.rankingButtonText}>Ranking</Text>
      </TouchableOpacity>

      {/* Category buttons row */}
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => handlePressCategory('Flower')}
        >
          <Text style={styles.categoryText}>Flower</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => handlePressCategory('Plant')}
        >
          <Text style={styles.categoryText}>Plant</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => handlePressCategory('Architecture')}
        >
          <Text style={styles.categoryText}>Architecture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  rankingButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  rankingButtonText: { color: '#fff', fontWeight: '600' },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 80, // increased spacing between ranking button and category buttons
  },
  categoryButton: {
    width: 100,
    height: 100,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  categoryText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Developer_PlantsPage() {
  // Dummy data
  const plants = [
    { id: 1, name: 'Orchid', count: 120 },
    { id: 2, name: 'Fern', count: 85 },
    { id: 3, name: 'Bamboo', count: 42 },
    { id: 4, name: 'Palm', count: 67 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="leaf" size={32} color="#2E7D32" />
          <Text style={styles.headerText}>Plants Overview</Text>
        </View>

        {plants.map((plant) => (
          <View key={plant.id} style={styles.card}>
            <Text style={styles.plantName}>{plant.name}</Text>
            <Text style={styles.plantCount}>Total Records: {plant.count}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>This is dummy data for Plants Page.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // space for bottom tabs
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#2E7D32',
  },
  card: {
    backgroundColor: '#C8E6C9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  plantCount: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

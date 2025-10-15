import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Developer_ArchitecturePage() {
  // Dummy data
  const architectures = [
    { id: 1, name: 'Botanic Garden Pavilion', type: 'Pavilion', count: 12 },
    { id: 2, name: 'Greenhouse Dome', type: 'Greenhouse', count: 7 },
    { id: 3, name: 'Observation Tower', type: 'Tower', count: 5 },
    { id: 4, name: 'Visitor Center', type: 'Building', count: 3 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="office-building-outline" size={32} color="#2E7D32" />
          <Text style={styles.headerText}>Architecture Overview</Text>
        </View>

        {architectures.map((arch) => (
          <View key={arch.id} style={styles.card}>
            <Text style={styles.archName}>{arch.name}</Text>
            <Text style={styles.archType}>Type: {arch.type}</Text>
            <Text style={styles.archCount}>Records: {arch.count}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>This is dummy data for Architecture Page.</Text>
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
    backgroundColor: '#DFF0E1',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  archName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  archType: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  archCount: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
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

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = __DEV__ ? 'http://192.168.1.13:3000' : 'https://your-production-url.com';

export default function Developer_HomePage({ route }) {
  const [stats, setStats] = useState({
    totalImages: 15092,
    lastTrainingTime: '8 August 2025',
    modelVersion: '1.0'
  });
  const [loading, setLoading] = useState(false);

  // Get username from route params or use default
  const username = route?.params?.username || 'Developer1';

  useEffect(() => {
    fetchModelStats();
  }, []);

  const fetchModelStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/model-stats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalImages: data.totalImages || stats.totalImages,
          lastTrainingTime: data.lastTrainingTime || stats.lastTrainingTime,
          modelVersion: data.modelVersion || stats.modelVersion
        });
      }
    } catch (error) {
      console.log('Using default stats:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with logo and greeting */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="leaf" size={32} color="#2E7D32" />
            </View>
            <Text style={styles.logoText}>GREEN LENS</Text>
          </View>
          <Text style={styles.greeting}>Hi {username},</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.yellowCard]}>
            <Text style={styles.statLabel}>Total Images in Database:</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text style={styles.statValue}>{stats.totalImages.toLocaleString()}</Text>
            )}
          </View>

          <View style={[styles.statCard, styles.greenCard]}>
            <Text style={styles.statLabel}>Last Training Time:</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text style={styles.statValue}>{stats.lastTrainingTime}</Text>
            )}
          </View>

          <View style={[styles.statCard, styles.purpleCard]}>
            <Text style={styles.statLabel}>Current Model Version:</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text style={styles.statValue}>{stats.modelVersion}</Text>
            )}
          </View>
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
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    letterSpacing: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  statCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  yellowCard: {
    backgroundColor: '#FFF9C4',
  },
  greenCard: {
    backgroundColor: '#C8E6C9',
  },
  purpleCard: {
    backgroundColor: '#E1BEE7',
  },
  statLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontStyle: 'italic',
  },
});

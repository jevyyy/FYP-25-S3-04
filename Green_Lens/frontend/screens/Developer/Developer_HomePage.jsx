import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { getStorage, ref, listAll } from 'firebase/storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebaseConfig';
import GreenLensLogo from '../../assets/Green_Lens_logo.png';

export default function Developer_HomePage() {
  const [stats, setStats] = useState({
    totalImages: 0,
    lastTrainingTime: '8 August 2025',
    modelVersion: '1.0',
  });
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('Developer');

  const storage = getStorage(app);
  const db = getFirestore(app);
  const auth = getAuth(app);

  useEffect(() => {
    fetchUsername();
    fetchModelStats();

    // 🔁 auto-refresh every 10 seconds
    const interval = setInterval(fetchModelStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsername = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username || 'Developer');
        }
      } catch (err) {
        console.error('Error fetching username:', err);
      }
    }
  };

  const fetchModelStats = async () => {
    setLoading(true);
    try {
      const categories = ['architecture', 'plants', 'flowers']; 
      let totalImagesCount = 0;

      for (const category of categories) {
        const folderRef = ref(storage, `modelPhotos/${category}/`);
        const res = await listAll(folderRef);
        totalImagesCount += res.items.length;
      }

      setStats(prev => ({ ...prev, totalImages: totalImagesCount }));
    } catch (error) {
      console.log('Firebase Storage fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={GreenLensLogo} style={styles.logoImage} />
          <Text style={styles.greeting}>Hi {username},</Text>
        </View>

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
            <Text style={styles.statValue}>{stats.lastTrainingTime}</Text>
          </View>

          <View style={[styles.statCard, styles.purpleCard]}>
            <Text style={styles.statLabel}>Current Model Version:</Text>
            <Text style={styles.statValue}>{stats.modelVersion}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 30, backgroundColor: '#fff' },
  logoImage: { width: 150, height: 50, resizeMode: 'contain', marginBottom: 10 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  statsContainer: { paddingHorizontal: 20 },
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
  yellowCard: { backgroundColor: '#FFF9C4' },
  greenCard: { backgroundColor: '#C8E6C9' },
  purpleCard: { backgroundColor: '#E1BEE7' },
  statLabel: { fontSize: 16, color: '#555', marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#333', fontStyle: 'italic' },
});

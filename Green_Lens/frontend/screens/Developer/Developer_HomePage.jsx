import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { getStorage, ref, listAll } from 'firebase/storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebaseConfig';
import GreenLensLogo from '../../assets/Green_Lens_logo.png';

export default function Developer_HomePage() {
  // Store image statistics for each dataset and total
  const [stats, setStats] = useState({
    plants: 0,
    flowers: 0,
    architecture: 0,
    totalImages: 0,
  });

  const [loading, setLoading] = useState(false); // Loading indicator while fetching stats
  const [username, setUsername] = useState('Developer'); // Current logged-in user's name

  const storage = getStorage(app); // Firebase Storage reference
  const db = getFirestore(app); // Firestore reference
  const auth = getAuth(app); // Firebase Auth reference

  // On component mount: fetch username and dataset stats
  useEffect(() => {
    fetchUsername();
    fetchModelStats();

    // Auto-refresh stats every 5 seconds
    const interval = setInterval(fetchModelStats, 5000);
    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  // Fetch the username of the logged-in developer
  const fetchUsername = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username || 'Developer'); // Default if no username
        }
      } catch (err) {
        console.error('Error fetching username:', err);
      }
    }
  };

  // Fetch total images for each dataset category and overall total
  const fetchModelStats = async () => {
    setLoading(true);
    try {
      const categories = ['plants', 'flowers', 'architecture'];
      const counts = { plants: 0, flowers: 0, architecture: 0 };
      let total = 0;

      // Count images in each category folder in Firebase Storage
      for (const category of categories) {
        const folderRef = ref(storage, `modelPhotos/${category}/`);
        const res = await listAll(folderRef);
        counts[category] = res.items.length;
        total += res.items.length;
      }

      setStats({ ...counts, totalImages: total });
    } catch (error) {
      console.log('Firebase Storage fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with logo and greeting */}
        <View style={styles.header}>
          <Image source={GreenLensLogo} style={styles.logoImage} />
          <Text style={styles.greeting}>Hi {username},</Text>
        </View>

        <View style={styles.statsContainer}>
          {/* Card showing total images across all datasets */}
          <View style={[styles.statCard, styles.yellowCard]}>
            <Text style={styles.statLabel}>Total Dataset Images in Database:</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text style={styles.statValue}>{stats.totalImages.toLocaleString()}</Text>
            )}
          </View>

          {/* Card showing total images in Plants dataset */}
          <View style={[styles.statCard, styles.greenCard]}>
            <Text style={styles.statLabel}>Total Dataset Image (Plants):</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text style={styles.statValue}>{stats.plants.toLocaleString()}</Text>
            )}
          </View>

          {/* Card showing total images in Flowers dataset */}
          <View style={[styles.statCard, styles.purpleCard]}>
            <Text style={styles.statLabel}>Total Dataset Image (Flowers):</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text style={styles.statValue}>{stats.flowers.toLocaleString()}</Text>
            )}
          </View>

          {/* Card showing total images in Architecture dataset */}
          <View style={[styles.statCard, styles.blueCard]}>
            <Text style={styles.statLabel}>Total Dataset Image (Architecture):</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text style={styles.statValue}>{stats.architecture.toLocaleString()}</Text>
            )}
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
  statCard: { borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  yellowCard: { backgroundColor: '#FFF9C4' },
  greenCard: { backgroundColor: '#C8E6C9' },
  purpleCard: { backgroundColor: '#E1BEE7' },
  blueCard: { backgroundColor: '#BBDEFB' },
  statLabel: { fontSize: 16, color: '#555', marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#333', fontStyle: 'italic' },
});
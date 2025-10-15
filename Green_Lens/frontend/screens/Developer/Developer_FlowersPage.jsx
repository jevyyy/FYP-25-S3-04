import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const BASE_URL = __DEV__ ? 'http://192.168.1.13:3000' : 'https://your-production-url.com';

export default function Developer_PlantsPage() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [plantImages, setPlantImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const placeholderImages = [
    { id: '1', uri: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400', name: 'Fern' },
    { id: '2', uri: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400', name: 'Succulent' },
    { id: '3', uri: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400', name: 'Leaf' },
    { id: '4', uri: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400', name: 'Palm' },
    { id: '5', uri: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400', name: 'Monstera' },
    { id: '6', uri: 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?w=400', name: 'Fern 2' },
    { id: '7', uri: 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=400', name: 'Vine' },
    { id: '8', uri: 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=400', name: 'Garden' },
  ];

  useEffect(() => {
    fetchPlantImages();
  }, []);

  const fetchPlantImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/images?category=plants`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setPlantImages(data.images || placeholderImages);
      } else {
        setPlantImages(placeholderImages);
      }
    } catch (error) {
      console.log('Using placeholder images:', error.message);
      setPlantImages(placeholderImages);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = plantImages.filter(img =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNewPlant = () => {
    navigation.navigate('Developer_AddPlant');
  };

  const handleImagePress = (image) => {
    navigation.navigate('Developer_PlantDetail', { imageData: image });
  };

  const renderImageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.imageCard}
      onPress={() => handleImagePress(item)}
    >
      <Image
        source={{ uri: item.uri }}
        style={styles.imageThumb}
        resizeMode="cover"
      />
      <Text style={styles.imageName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="leaf" size={28} color="#2E7D32" />
          </View>
          <Text style={styles.logoText}>GREEN LENS</Text>
        </View>

        <Text style={styles.pageTitle}>Dataset Images</Text>

        <View style={styles.controlsRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddNewPlant}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>New plant</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading plants...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredImages}
          renderItem={renderImageItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.imageGrid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  logo: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  logoText: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', letterSpacing: 1 },
  pageTitle: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 12, height: 45 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#66BB6A', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, gap: 5 },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  imageGrid: { paddingHorizontal: 15, paddingTop: 15, paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
  imageCard: { width: '48%', marginBottom: 15, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  imageThumb: { width: '100%', height: 150, backgroundColor: '#f0f0f0' },
  imageName: { padding: 10, fontSize: 14, color: '#333', fontWeight: '500' },
});

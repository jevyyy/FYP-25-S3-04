// ./screens/Developer/Developer_PlantsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  FlatList,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Firebase
import { app } from '../../firebaseConfig';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';

// Import your logo
import LogoImage from '../../assets/Green_Lens_logo.png';

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export default function Developer_PlantsPage() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [plantImages, setPlantImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload / preview state
  const [previewUri, setPreviewUri] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Update state
  const [selectedPlant, setSelectedPlant] = useState(null);

  // Input
  const [plantName, setPlantName] = useState('');

  const isMounted = useRef(true);

  const plantImagesCollectionRef = () =>
    collection(doc(collection(db, 'modelPhotos'), 'plants'), 'images');

  useEffect(() => {
    isMounted.current = true;
    const q = query(plantImagesCollectionRef(), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!isMounted.current) return;
        const items = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            uri: data.imageUrl,
            name: data.name || data.uploadedBy || 'User Upload',
            uploadedBy: data.uploadedBy || '',
            storagePath: data.storagePath || null,
            createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : null,
          };
        });
        setPlantImages(items);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore snapshot error (plants):', err);
        if (!isMounted.current) return;
        setPlantImages([]);
        setLoading(false);
      }
    );

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, []);

  const filteredImages = plantImages.filter((img) =>
    (img.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Add new plant ---
  const handleAddNewPlant = async () => {
    setSelectedPlant(null);
    setPlantName('');
    setPreviewUri(null);
    await handleSelectImage();
  };

  const handleImagePress = (image) => {
    setSelectedPlant(image);
    setPlantName(image.name);
    setPreviewUri(image.uri);
    setPreviewModalVisible(true);
  };

  // --- Image Picker ---
  const handleSelectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Media library permission is required to pick images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        setPreviewUri(uri);
        setPreviewModalVisible(true);
      }
    } catch (err) {
      console.error('ImagePicker error:', err);
      Alert.alert('Error', 'Could not open image picker.');
    }
  };

  // --- Upload or Update with old image deletion ---
  const handleConfirmUpload = () => {
    if (!selectedPlant) {
      performUploadOrUpdate();
    } else {
      Alert.alert(
        'Confirm Update',
        'Are you sure you want to apply the changes?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes', onPress: () => performUploadOrUpdate() },
        ]
      );
    }
  };

  const performUploadOrUpdate = async () => {
    if (!plantName.trim()) {
      Alert.alert('Validation', 'Please enter Plant Name.');
      return;
    }

    setUploading(true);

    try {
      const user = auth.currentUser;
      const uid = user?.uid || 'anonymous';
      let downloadUrl = previewUri;

      if (!selectedPlant) {
        // New upload
        const response = await fetch(previewUri);
        const blob = await response.blob();
        const filename = `modelPhotos/plants/${Date.now()}_${uid}.jpg`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, blob);
        downloadUrl = await getDownloadURL(storageRef);

        let uploadedBy = 'Developer';
        try {
          const userDocRef = doc(db, 'users', uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists() && userSnap.data().username) uploadedBy = userSnap.data().username;
          else if (user?.email) uploadedBy = user.email.split('@')[0];
        } catch (e) {
          uploadedBy = user?.email?.split('@')[0] || uploadedBy;
        }

        await addDoc(plantImagesCollectionRef(), {
          imageUrl: downloadUrl,
          uploadedBy,
          name: plantName.trim().toLowerCase(),
          createdAt: serverTimestamp(),
          storagePath: filename,
        });

        Alert.alert('Success', 'Plant image added!');
      } else {
        // Update existing
        let newImageUrl = null;
        let newStoragePath = null;

        if (previewUri !== selectedPlant.uri) {
          const response = await fetch(previewUri);
          const blob = await response.blob();
          const filename = `modelPhotos/plants/${Date.now()}_${selectedPlant.id}.jpg`;
          const storageRef = ref(storage, filename);
          await uploadBytes(storageRef, blob);
          newImageUrl = await getDownloadURL(storageRef);
          newStoragePath = filename;

          if (selectedPlant.storagePath) {
            try {
              const oldRef = ref(storage, selectedPlant.storagePath);
              await deleteObject(oldRef);
            } catch (err) {
              console.warn('Failed to delete old image:', err);
            }
          }
        }

        const plantDocRef = doc(plantImagesCollectionRef(), selectedPlant.id);
        await updateDoc(plantDocRef, {
          name: plantName.trim().toLowerCase(),
          ...(newImageUrl ? { imageUrl: newImageUrl, storagePath: newStoragePath } : {}),
          updatedAt: serverTimestamp(),
        });

        Alert.alert('Success', 'Plant image updated!');
      }

      setPreviewModalVisible(false);
      setPreviewUri(null);
      setPlantName('');
      setSelectedPlant(null);
    } catch (err) {
      console.error('Upload/Update error:', err);
      Alert.alert('Failed', 'Could not upload or update the plant image.');
    } finally {
      if (isMounted.current) setUploading(false);
    }
  };

  // --- Delete existing plant ---
  const handleDeletePlant = () => {
    if (!selectedPlant) return;

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this plant image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setUploading(true);
            try {
              const plantDocRef = doc(plantImagesCollectionRef(), selectedPlant.id);
              await deleteDoc(plantDocRef);

              if (selectedPlant.storagePath) {
                const oldRef = ref(storage, selectedPlant.storagePath);
                await deleteObject(oldRef);
              }

              Alert.alert('Success', 'Plant image deleted!');
              setPreviewModalVisible(false);
              setPreviewUri(null);
              setPlantName('');
              setSelectedPlant(null);
            } catch (err) {
              console.error('Delete error:', err);
              Alert.alert('Error', 'Failed to delete plant image.');
            } finally {
              if (isMounted.current) setUploading(false);
            }
          },
        },
      ]
    );
  };

  const renderImageItem = ({ item }) => (
    <TouchableOpacity style={styles.imageCard} onPress={() => handleImagePress(item)}>
      <Image source={{ uri: item.uri }} style={styles.imageThumb} resizeMode="cover" />
      <View style={{ padding: 10 }}>
        <Text style={styles.imageName} numberOfLines={1}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={LogoImage} style={{ width: 150, height: 50, resizeMode: 'contain', marginRight: 8 }} />
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

          <TouchableOpacity style={styles.addButton} onPress={handleAddNewPlant} disabled={uploading}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>{uploading ? 'Uploading' : 'New Plant'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading plant images...</Text>
        </View>
      ) : plantImages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No plant images uploaded yet.</Text>
        </View>
      ) : filteredImages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No results found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredImages}
          renderItem={renderImageItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.imageGrid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Preview/Update Modal */}
      <Modal
        visible={previewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!uploading) {
            setPreviewModalVisible(false);
            setPreviewUri(null);
            setPlantName('');
            setSelectedPlant(null);
          }
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            if (!uploading) {
              setPreviewModalVisible(false);
              setPreviewUri(null);
              setPlantName('');
              setSelectedPlant(null);
            }
          }}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalBoxWrapper}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <ScrollView contentContainerStyle={styles.modalBox}>
                  {previewUri && (
                    <Image
                      source={{ uri: previewUri }}
                      style={{ width: 320, height: 320, borderRadius: 10, marginBottom: 16 }}
                    />
                  )}

                  <View style={{ width: '100%', marginBottom: 12 }}>
                    <Text style={{ marginBottom: 6, fontWeight: '600' }}>Plant Name</Text>
                    <TextInput
                      value={plantName}
                      onChangeText={setPlantName}
                      placeholder="Common name (required)"
                      style={styles.input}
                      editable={!uploading}
                    />
                  </View>

                  <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 12 }}>
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                      onPress={() => {
                        if (!uploading) {
                          setPreviewModalVisible(false);
                          setPreviewUri(null);
                          setPlantName('');
                          setSelectedPlant(null);
                        }
                      }}
                      disabled={uploading}
                    >
                      <Text style={{ color: '#000', fontWeight: '600' }}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: '#2E7D32' }]}
                      onPress={handleConfirmUpload}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={{ color: '#fff', fontWeight: '600' }}>
                          {selectedPlant ? 'Update' : 'Upload'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Retake / Update Image Button */}
                  {previewUri && (
                    <TouchableOpacity
                      style={{ marginTop: 8 }}
                      onPress={handleSelectImage}
                      disabled={uploading}
                    >
                      <Text style={{ color: '#2E7D32', fontWeight: '600' }}>
                        {selectedPlant
                          ? 'Update image from Device Storage'
                          : 'Retake image from Device Storage'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Delete Button */}
                  {selectedPlant && (
                    <TouchableOpacity
                      style={{ marginTop: 8 }}
                      onPress={handleDeletePlant}
                      disabled={uploading}
                    >
                      <Text style={{ color: '#D32F2F', fontWeight: '600' }}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  pageTitle: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  controlsRow: { flexDirection: 'row', alignItems: 'center' },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 12, height: 45 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#66BB6A', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, marginLeft: 8 },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
  imageGrid: { paddingHorizontal: 15, paddingTop: 15, paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
  imageCard: { width: '48%', marginBottom: 15, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  imageThumb: { width: '100%', height: 150, backgroundColor: '#f0f0f0' },
  imageName: { fontSize: 14, color: '#333', fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalBoxWrapper: { width: '100%', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: 340, backgroundColor: '#fff', borderRadius: 12, padding: 18, alignItems: 'center' },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
});

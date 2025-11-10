// ./screens/Developer/Developer_FlowerPage.jsx
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
  TouchableWithoutFeedback,
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
  where,
  getDocs,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getMetadata,
} from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';

// Import your logo
import LogoImage from '../../assets/Green_Lens_logo.png';

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export default function Developer_FlowerPage() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [flowerImages, setFlowerImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewUri, setPreviewUri] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFlower, setSelectedFlower] = useState(null);
  const [flowerName, setFlowerName] = useState('');

  const isMounted = useRef(true);

  const flowersImagesCollectionRef = () =>
    collection(doc(collection(db, 'modelPhotos'), 'flowers'), 'images');

  useEffect(() => {
    isMounted.current = true;
    const q = query(flowersImagesCollectionRef(), orderBy('createdAt', 'desc'));
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
            createdAt: data.createdAt
              ? data.createdAt.toDate
                ? data.createdAt.toDate()
                : data.createdAt
              : null,
          };
        });
        setFlowerImages(items);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore snapshot error (flowers):', err);
        if (!isMounted.current) return;
        setFlowerImages([]);
        setLoading(false);
      }
    );

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, []);

  const filteredImages = flowerImages.filter((img) =>
    (img.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNewFlower = async () => {
    setSelectedFlower(null);
    setFlowerName('');
    setPreviewUri(null);
    await handleSelectImage();
  };

  const handleImagePress = (image) => {
    setSelectedFlower(image);
    setFlowerName(image.name);
    setPreviewUri(image.uri);
    setPreviewModalVisible(true);
  };

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

  const handleConfirmUpload = () => {
    if (!selectedFlower) {
      performUploadOrUpdate();
    } else {
      Alert.alert('Confirm Update', 'Are you sure you want to apply the changes?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => performUploadOrUpdate() },
      ]);
    }
  };

  const performUploadOrUpdate = async () => {
    if (!flowerName.trim()) {
      Alert.alert('Validation', 'Please enter Flower Name.');
      return;
    }

    setUploading(true);

    try {
      const cleanName = flowerName.trim().toLowerCase();
      const newStoragePath = `modelPhotos/flowers/${cleanName}.jpg`;
      const newImageRef = ref(storage, newStoragePath);

      // 🔹 DUPLICATE CHECKS
      const q = query(flowersImagesCollectionRef(), where('name', '==', cleanName));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty && (!selectedFlower || selectedFlower.name !== cleanName)) {
        Alert.alert('Duplicate Name', 'A flower dataset image with this name already exists.');
        setUploading(false);
        return;
      }

      try {
        await getMetadata(newImageRef);
        if (!selectedFlower || selectedFlower.storagePath !== newStoragePath) {
          Alert.alert(
            'Duplicate File',
            'An image file with this name already exists in storage. Rename or delete the existing one first.'
          );
          setUploading(false);
          return;
        }
      } catch (err) {
        if (err.code !== 'storage/object-not-found') {
          console.error('Error checking file existence:', err);
          Alert.alert('Error', 'Could not verify file existence.');
          setUploading(false);
          return;
        }
      }

      let newImageUrl = null;

      if (!selectedFlower) {
        if (!previewUri) {
          Alert.alert('Error', 'No image selected.');
          setUploading(false);
          return;
        }

        const response = await fetch(previewUri);
        const blob = await response.blob();
        await uploadBytes(newImageRef, blob, { contentType: 'image/jpeg' });
        newImageUrl = await getDownloadURL(newImageRef);

        let uploadedBy = 'Developer';
        const user = auth.currentUser;
        const uid = user?.uid || 'anonymous';
        try {
          const userDocRef = doc(db, 'users', uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists() && userSnap.data().username) uploadedBy = userSnap.data().username;
          else if (user?.email) uploadedBy = user.email.split('@')[0];
        } catch {}

        await addDoc(flowersImagesCollectionRef(), {
          imageUrl: newImageUrl,
          uploadedBy,
          name: cleanName,
          createdAt: serverTimestamp(),
          storagePath: newStoragePath,
        });

        Alert.alert('Success', 'Flower image added!');
      } else {
        if (previewUri && previewUri.startsWith('file://')) {
          const response = await fetch(previewUri);
          const blob = await response.blob();
          await uploadBytes(newImageRef, blob, { contentType: 'image/jpeg' });
          newImageUrl = await getDownloadURL(newImageRef);
        } else if (selectedFlower.storagePath !== newStoragePath) {
          const oldRef = ref(storage, selectedFlower.storagePath);
          const oldUrl = await getDownloadURL(oldRef);
          const res = await fetch(oldUrl);
          const blob = await res.blob();
          await uploadBytes(newImageRef, blob, { contentType: 'image/jpeg' });
          newImageUrl = await getDownloadURL(newImageRef);
        }

        if (selectedFlower.storagePath && selectedFlower.storagePath !== newStoragePath) {
          try {
            const oldRef = ref(storage, selectedFlower.storagePath);
            await deleteObject(oldRef);
          } catch (err) {
            console.warn('Failed to delete old image:', err);
          }
        }

        const flowerDocRef = doc(flowersImagesCollectionRef(), selectedFlower.id);
        await updateDoc(flowerDocRef, {
          name: cleanName,
          imageUrl: newImageUrl || selectedFlower.uri,
          storagePath: newStoragePath,
        });

        Alert.alert('Success', 'Flower image updated!');
      }

      setPreviewModalVisible(false);
      setPreviewUri(null);
      setFlowerName('');
      setSelectedFlower(null);
    } catch (err) {
      console.error('Upload/Update error:', err);
      Alert.alert('Failed', 'Could not upload or update the flower.');
    } finally {
      if (isMounted.current) setUploading(false);
    }
  };

  const handleDeleteFlower = () => {
    if (!selectedFlower) return;

    Alert.alert('Confirm Delete', 'Are you sure you want to delete this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setUploading(true);
          try {
            const flowerDocRef = doc(flowersImagesCollectionRef(), selectedFlower.id);
            await deleteDoc(flowerDocRef);

            if (selectedFlower.storagePath) {
              const oldRef = ref(storage, selectedFlower.storagePath);
              await deleteObject(oldRef);
            }

            Alert.alert('Success', 'Image deleted!');
            setPreviewModalVisible(false);
            setPreviewUri(null);
            setFlowerName('');
            setSelectedFlower(null);
          } catch (err) {
            console.error('Delete error:', err);
            Alert.alert('Error', 'Failed to delete flower image.');
          } finally {
            if (isMounted.current) setUploading(false);
          }
        },
      },
    ]);
  };

  const renderImageItem = ({ item }) => (
    <TouchableOpacity style={styles.imageCard} onPress={() => handleImagePress(item)}>
      <Image source={{ uri: item.uri }} style={styles.imageThumb} resizeMode="cover" />
      <View style={{ padding: 10 }}>
        <Text style={styles.imageName} numberOfLines={1}>
          {item.name}
        </Text>
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

          <TouchableOpacity style={styles.addButton} onPress={handleAddNewFlower} disabled={uploading}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>{uploading ? 'Uploading' : 'New Flower'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading flowers...</Text>
        </View>
      ) : flowerImages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No flower images uploaded yet.</Text>
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

      {/* Modal */}
      <Modal
        visible={previewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !uploading && setPreviewModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => !uploading && setPreviewModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalBoxWrapper}
            >
              <View style={styles.modalBox} onStartShouldSetResponder={() => true}>
                {previewUri && (
                  <Image
                    source={{ uri: previewUri }}
                    style={{ width: 320, height: 320, borderRadius: 10, marginBottom: 16 }}
                  />
                )}

                <View style={{ width: '100%', marginBottom: 12 }}>
                  <Text style={{ marginBottom: 6, fontWeight: '600' }}>Flower Name</Text>
                  <TextInput
                    value={flowerName}
                    onChangeText={setFlowerName}
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
                        setFlowerName('');
                        setSelectedFlower(null);
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
                    {uploading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>{selectedFlower ? 'Update' : 'Upload'}</Text>}
                  </TouchableOpacity>
                </View>

                {previewUri && (
                  <TouchableOpacity style={{ marginTop: 8 }} onPress={handleSelectImage} disabled={uploading}>
                    <Text style={{ color: '#2E7D32', fontWeight: '600' }}>
                      {selectedFlower ? 'Update image from Device Storage' : 'Retake image from Device Storage'}
                    </Text>
                  </TouchableOpacity>
                )}

                {selectedFlower && (
                  <TouchableOpacity style={{ marginTop: 8 }} onPress={handleDeleteFlower} disabled={uploading}>
                    <Text style={{ color: '#D32F2F', fontWeight: '600' }}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
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

// ./screens/User/User_Explore.jsx
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Alert, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, query, where, deleteDoc, getDoc, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebaseConfig';

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export default function User_Explore() {
  const navigation = useNavigation();
  const [modalPreviewVisible, setModalPreviewVisible] = useState(false);
  const [modalUploadSuccessVisible, setModalUploadSuccessVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setCurrentUser(u);
    });
    return unsubscribe;
  }, []);

  const fetchPosts = async () => {
    try {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSelectPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your media library to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setSelectedImage(result.assets[0].uri);
      setModalPreviewVisible(true);
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'No image selected.');
      return;
    }
    if (!currentUser) {
      Alert.alert('Error', 'User not ready yet. Try again.');
      return;
    }

    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      const filename = `uploads/${Date.now()}_${currentUser.uid}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      const name = userSnap.exists() && userSnap.data().name
        ? userSnap.data().name
        : currentUser.displayName || 'Anonymous';

      await addDoc(collection(db, 'posts'), {
        imageUrl: downloadUrl,
        uploadedBy: name,
        createdAt: new Date(),
        votesUp: 0,
        votesDown: 0,
      });

      setModalPreviewVisible(false);
      setModalUploadSuccessVisible(true);
      fetchPosts();
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const handleVote = async (postId, type) => {
    if (!currentUser) return;

    try {
      const votesRef = collection(db, 'votes');
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const q = query(votesRef, where('postId', '==', postId), where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const existingVote = snapshot.docs[0];
        const prevType = existingVote.data().type;
        const voteDocRef = doc(db, 'votes', existingVote.id);

        if (prevType === type) {
          await deleteDoc(voteDocRef);
          await updateDoc(postRef, {
            votesUp: type === 'up' ? post.votesUp - 1 : post.votesUp,
            votesDown: type === 'down' ? post.votesDown - 1 : post.votesDown,
          });
        } else {
          await updateDoc(voteDocRef, { type });
          await updateDoc(postRef, {
            votesUp: type === 'up' ? post.votesUp + 1 : post.votesUp - 1,
            votesDown: type === 'down' ? post.votesDown + 1 : post.votesDown - 1,
          });
        }
      } else {
        await addDoc(votesRef, { postId, userId: currentUser.uid, type });
        await updateDoc(postRef, {
          votesUp: type === 'up' ? post.votesUp + 1 : post.votesUp,
          votesDown: type === 'down' ? post.votesDown + 1 : post.votesDown,
        });
      }

      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id !== postId) return p;

        let votesUp = p.votesUp;
        let votesDown = p.votesDown;

        if (!snapshot.empty) {
          if (snapshot.docs[0].data().type === type) {
            if (type === 'up') votesUp--; else votesDown--;
          } else {
            if (type === 'up') { votesUp++; votesDown--; } else { votesDown++; votesUp--; }
          }
        } else {
          if (type === 'up') votesUp++; else votesDown++;
        }

        return { ...p, votesUp, votesDown };
      }));

    } catch (error) {
      console.error('Vote error:', error);
      Alert.alert('Error', 'Failed to vote');
    }
  };

  const handleDownload = async (imageUrl) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Cannot save image without permission.');
        return;
      }

      const fileUri = FileSystem.cacheDirectory + `${Date.now()}.jpg`;
      const download = await FileSystem.downloadAsync(imageUrl, fileUri);
      await MediaLibrary.saveToLibraryAsync(download.uri);
      Alert.alert('Download', 'Image Has Been Downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download image.');
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.imagePlaceholder}>
        <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
      </View>

      <View style={styles.postFooter}>
        <Text style={styles.name}>
          @{item.uploadedBy}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.voteButton} onPress={() => handleVote(item.id, 'up')}>
            <Text style={styles.voteText}>👍 {item.votesUp}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.voteButton} onPress={() => handleVote(item.id, 'down')}>
            <Text style={styles.voteText}>👎 {item.votesDown}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { paddingVertical: 6, paddingHorizontal: 12 }]} onPress={() => handleDownload(item.imageUrl)}>
            <Text style={[styles.buttonText, { fontSize: 14 }]}>Download</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.uploadButton]} onPress={handleSelectPhoto}>
          <Ionicons name="cloud-upload-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={[styles.buttonText, { color: '#fff' }]}>Upload</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.rankingButton]} onPress={() => navigation.navigate('User_RankingPage')}>
          <Ionicons name="trophy-outline" size={18} color="#000" style={{ marginRight: 6 }} />
          <Text style={[styles.buttonText, { color: '#000' }]}>Ranking</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.recentLabel}>Recent Photos</Text>

      {loading ? <Text>Loading...</Text> : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
        />
      )}

      {/* Preview Modal */}
      <Modal transparent visible={modalPreviewVisible} animationType="slide" onRequestClose={() => setModalPreviewVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {selectedImage && <Image source={{ uri: selectedImage }} style={{ width: 250, height: 250, borderRadius: 10, marginBottom: 20 }} />}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity style={[styles.button, { marginRight: 10, flex: 1 }]} onPress={() => setModalPreviewVisible(false)}>
                <Text style={[styles.buttonText, { textAlign: 'center' }]}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { flex: 1 }]} onPress={handleUploadPhoto}>
                <Text style={[styles.buttonText, { textAlign: 'center' }]}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Upload Success Modal */}
      <Modal transparent visible={modalUploadSuccessVisible} animationType="fade" onRequestClose={() => setModalUploadSuccessVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>Photo Uploaded Successfully!</Text>
            <TouchableOpacity style={[styles.button, { marginTop: 20, alignSelf: 'flex-end' }]} onPress={() => setModalUploadSuccessVisible(false)}>
              <Text style={styles.buttonText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 30, gap: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  uploadButton: { backgroundColor: '#000' },
  rankingButton: { backgroundColor: '#FFD43B' },
  buttonText: { fontSize: 15, fontWeight: '600' },
  recentLabel: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  postContainer: { marginBottom: 20, backgroundColor: '#fff', borderRadius: 10, padding: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  imagePlaceholder: { width: '100%', height: 200, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  name: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  voteButton: { marginHorizontal: 5, alignItems: 'center' },
  voteText: { fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: 300, backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center', position: 'relative' },
  modalText: { marginTop: 20, fontSize: 16, fontWeight: '600', color: '#333', textAlign: 'center' },
});

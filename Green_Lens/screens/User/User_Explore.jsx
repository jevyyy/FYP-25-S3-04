// ./screens/User/User_Explore.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Alert, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, query, where, getDoc } from 'firebase/firestore';
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

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setCurrentUser(u);
      console.log("👤 Current user:", u?.email);
    });
    return unsubscribe;
  }, []);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'posts'));
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

  // Select image
  const handleSelectPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your media library to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setSelectedImage(result.assets[0].uri);
      setModalPreviewVisible(true);
    }
  };

  // Helper: get username from Firestore (using UID as document ID)
  const getUsername = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data().username || userSnap.data().name || 'anonymous';
      }
      return 'anonymous';
    } catch (error) {
      console.error('Error fetching username:', error);
      return 'anonymous';
    }
  };

  // Upload photo
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

      const username = await getUsername(currentUser.uid); // use username instead of email

      await addDoc(collection(db, 'posts'), {
        imageUrl: downloadUrl,
        uploadedBy: username,
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

  // Voting
  const handleVote = async (postId, type) => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, 'votes'),
        where('postId', '==', postId),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        Alert.alert('Error', 'You already voted on this post!');
        return;
      }

      await addDoc(collection(db, 'votes'), {
        postId,
        userId: currentUser.uid,
        type,
      });

      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      await updateDoc(postRef, {
        votesUp: type === 'up' ? post.votesUp + 1 : post.votesUp,
        votesDown: type === 'down' ? post.votesDown + 1 : post.votesDown,
      });

      fetchPosts();
    } catch (error) {
      console.error('Vote error:', error);
      Alert.alert('Error', 'Failed to vote');
    }
  };

  // Render post
  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.imagePlaceholder}>
        <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
      </View>

      <View style={styles.postFooter}>
        <Text style={styles.username}>@{item.uploadedBy}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.voteButton} onPress={() => handleVote(item.id, 'up')}>
            <Text style={styles.voteText}>👍 {item.votesUp}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.voteButton} onPress={() => handleVote(item.id, 'down')}>
            <Text style={styles.voteText}>👎 {item.votesDown}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, { marginRight: 15, backgroundColor: '#000' }]} onPress={handleSelectPhoto}>
          <Text style={styles.buttonText}>Upload</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#000' }]} onPress={() => navigation.navigate('User_RankingPage')}>
          <Text style={styles.buttonText}>Ranking</Text>
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
              <TouchableOpacity style={[styles.button, { marginRight: 10, backgroundColor: '#000', flex: 1 }]} onPress={() => setModalPreviewVisible(false)}>
                <Text style={[styles.buttonText, { textAlign: 'center' }]}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#000', flex: 1 }]} onPress={handleUploadPhoto}>
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
            <TouchableOpacity style={[styles.button, { marginTop: 20, backgroundColor: '#000', alignSelf: 'flex-end' }]} onPress={() => setModalUploadSuccessVisible(false)}>
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
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 30 },
  button: { backgroundColor: '#000', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, elevation: 2 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  recentLabel: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  postContainer: { marginBottom: 20, backgroundColor: '#fff', borderRadius: 10, padding: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  imagePlaceholder: { width: '100%', height: 200, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  username: { fontSize: 16, fontWeight: '600', color: '#333' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  voteButton: { marginHorizontal: 5 },
  voteText: { fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: 300, backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center', position: 'relative' },
  modalText: { marginTop: 20, fontSize: 16, fontWeight: '600', color: '#333', textAlign: 'center' },
});

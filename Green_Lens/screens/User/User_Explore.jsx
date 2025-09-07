// ./screens/User/User_Explore.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native'; // ✅ added

export default function User_Explore() {
  const navigation = useNavigation(); // ✅ added
  const [modalDownloadVisible, setModalDownloadVisible] = useState(false);
  const [modalPreviewVisible, setModalPreviewVisible] = useState(false);
  const [modalUploadSuccessVisible, setModalUploadSuccessVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Open phone media gallery
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

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setModalPreviewVisible(true);
    }
  };

  // Upload photo
  const handleUploadPhoto = () => {
    setModalPreviewVisible(false);
    setModalUploadSuccessVisible(true);
  };

  // Download placeholder
  const handleDownload = () => {
    setModalDownloadVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Buttons Row */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { marginRight: 15, backgroundColor: '#000' }]}
          onPress={handleSelectPhoto}
        >
          <Text style={styles.buttonText}>Upload</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#000' }]}
          onPress={() => navigation.navigate('User_RankingPage')} // ✅ navigate to User_RankingPage
        >
          <Text style={styles.buttonText}>Ranking</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Photos Label */}
      <Text style={styles.recentLabel}>Recent Photos</Text>

      {/* Post #1 */}
      <View style={styles.postContainer}>
        <View style={styles.imagePlaceholder}>
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: '100%', height: '100%', borderRadius: 8 }}
            />
          ) : (
            <Text style={{ color: '#aaa' }}>Image Placeholder</Text>
          )}
        </View>

        <View style={styles.postFooter}>
          <Text style={styles.username}>@user1</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.voteButton}><Text style={styles.voteText}>👍</Text></TouchableOpacity>
            <TouchableOpacity style={styles.voteButton}><Text style={styles.voteText}>👎</Text></TouchableOpacity>
            <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
              <Text style={styles.downloadText}>Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Post #2 */}
      <View style={styles.postContainer}>
        <View style={styles.imagePlaceholder}>
          <Text style={{ color: '#aaa' }}>Image Placeholder</Text>
        </View>

        <View style={styles.postFooter}>
          <Text style={styles.username}>@user2</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.voteButton}><Text style={styles.voteText}>👍</Text></TouchableOpacity>
            <TouchableOpacity style={styles.voteButton}><Text style={styles.voteText}>👎</Text></TouchableOpacity>
            <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
              <Text style={styles.downloadText}>Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Download Modal */}
      <Modal transparent visible={modalDownloadVisible} animationType="fade" onRequestClose={() => setModalDownloadVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity style={styles.closeButtonTop} onPress={() => setModalDownloadVisible(false)}>
              <Text style={styles.closeText}>✖</Text>
            </TouchableOpacity>
            <Text style={styles.modalText}>Image Has Been Downloaded!</Text>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal transparent visible={modalPreviewVisible} animationType="slide" onRequestClose={() => setModalPreviewVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={{ width: 250, height: 250, borderRadius: 10, marginBottom: 20 }} />
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity
                style={[styles.button, { marginRight: 10, backgroundColor: '#000', flex: 1 }]}
                onPress={() => setModalPreviewVisible(false)}
              >
                <Text style={[styles.buttonText, { textAlign: 'center' }]}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#000', flex: 1 }]}
                onPress={handleUploadPhoto}
              >
                <Text style={[styles.buttonText, { textAlign: 'center' }]}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Upload Success Modal */}
      <Modal
        transparent
        visible={modalUploadSuccessVisible}
        animationType="fade"
        onRequestClose={() => setModalUploadSuccessVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity style={styles.closeButtonTop} onPress={() => setModalUploadSuccessVisible(false)}>
              <Text style={styles.closeText}>✖</Text>
            </TouchableOpacity>
            <Text style={styles.modalText}>Photo Uploaded Successfully!</Text>
            <TouchableOpacity
              style={[styles.button, { marginTop: 20, backgroundColor: '#000', alignSelf: 'flex-end' }]}
              onPress={() => setModalUploadSuccessVisible(false)}
            >
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
  downloadButton: { backgroundColor: '#000', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginLeft: 10 },
  downloadText: { color: '#fff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: 300, backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center', position: 'relative' },
  closeButtonTop: { position: 'absolute', top: 8, right: 8 },
  closeText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalText: { marginTop: 20, fontSize: 16, fontWeight: '600', color: '#333', textAlign: 'center' },
});

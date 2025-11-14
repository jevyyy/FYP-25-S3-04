// ./screens/Developer/Developer_SettingsPage.jsx
import React, { useState, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking, Image, Modal, FlatList, ActivityIndicator 
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';

// Firebase
import { app } from '../../firebaseConfig';
import { getFirestore, collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

// Logo
import GreenLensLogo from '../../assets/Green_Lens_logo.png';

const db = getFirestore(app);

export default function Developer_SettingsPage() {
  const navigation = useNavigation();
  const [showTrain, setShowTrain] = useState(false);
  const [showDeployment, setShowDeployment] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);

  // --- Train Model modal state ---
  const [trainModalVisible, setTrainModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // --- Silent buffer overlay ---
  const [trainingBuffer, setTrainingBuffer] = useState(false);

  const isMounted = useRef(true);

  const fetchImages = async (category) => {
    isMounted.current = true;
    setLoadingImages(true);
    setImages([]);

    try {
      const collectionRef = collection(doc(collection(db, 'modelPhotos'), category), 'images');
      const q = query(collectionRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!isMounted.current) return;
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          uri: d.data().imageUrl,
          name: d.data().name || d.data().uploadedBy || 'User Upload',
        }));
        setImages(items);
        setLoadingImages(false);
      });
      return () => {
        isMounted.current = false;
        unsubscribe();
      };
    } catch (err) {
      console.error('Fetch images error:', err);
      setLoadingImages(false);
    }
  };



  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'GuestFlow', state: { routes: [{ name: 'Guest_HomePage' }] } }],
            })
          );
        },
      },
    ]);
  };

  const openURL = (url) => {
    Linking.canOpenURL(url)
      .then((supported) => (supported ? Linking.openURL(url) : Alert.alert("Cannot open URL")))
      .catch((err) => console.error("Error opening URL:", err));
  };

  const renderOption = (title, expanded, toggle, content) => (
    <>
      <TouchableOpacity style={styles.option} onPress={toggle}>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>{title}</Text>
          <Text style={styles.arrow}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
      {expanded && <View style={styles.dropdownInfo}>{content}</View>}
    </>
  );

  const handleTrainPress = () => setTrainModalVisible(true);
  const handleCategorySelect = (category) => { setSelectedCategory(category); fetchImages(category); };
  
  const handleTrainConfirm = async () => {
    // Ask if they want to delete images after training
    Alert.alert(
      'Retrain Model',
      `Do you want to delete the uploaded images after successful training?\n\nNote: Deleting images means next training will only use newly uploaded images. Keeping them allows cumulative training.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Keep Images',
          onPress: () => performRetraining(false)
        },
        {
          text: 'Delete Images',
          style: 'destructive',
          onPress: () => performRetraining(true)
        },
      ]
    );
  };

  const performRetraining = async (deleteImagesAfter) => {
    setTrainModalVisible(false);
    setTrainingBuffer(true);

    try {
      // Read API URL from environment variable
      // Configure in .env file (copy from .env.example if needed)
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.3:5000';
      const API_URL = `${API_BASE_URL}/api/retrain`;
      
      console.log(`Attempting to connect to: ${API_URL}`);
      
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout for initial connection
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory,
          deleteImagesAfter: deleteImagesAfter,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle HTTP errors
        const errorText = await response.text();
        console.error(`HTTP Error ${response.status}:`, errorText);
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      setTrainingBuffer(false);

      if (result.success) {
        Alert.alert(
          'Success',
          `Model retraining completed successfully for ${selectedCategory}!\n\n${
            deleteImagesAfter ? 'Training images have been deleted.' : 'Training images have been kept for future training.'
          }`
        );
        setSelectedCategory(null);
        setImages([]);
      } else {
        Alert.alert('Error', result.error || 'Model retraining failed. Please try again.');
      }
    } catch (error) {
      setTrainingBuffer(false);
      console.error('Retraining error:', error);
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to retrain model: ';
      
      if (error.name === 'AbortError') {
        errorMessage += 'Request timeout. The server took too long to respond.';
      } else if (error.message.includes('Network request failed')) {
        const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
        errorMessage += `Cannot connect to backend server.\n\n`;
        errorMessage += `Current URL: ${API_BASE_URL}\n\n`;
        errorMessage += `Troubleshooting:\n`;
        errorMessage += `1. Check backend is running (python app.py)\n`;
        errorMessage += `2. Verify EXPO_PUBLIC_API_URL in .env file\n`;
        errorMessage += `3. For physical devices, use your computer's IP address\n`;
        errorMessage += `4. Ensure phone and computer are on the same WiFi\n`;
        errorMessage += `5. Check firewall allows port 5000`;
      } else {
        errorMessage += error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const testConnection = async () => {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
    
    try {
      Alert.alert('Testing Connection', `Attempting to connect to:\n${API_BASE_URL}/categories`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for test
      
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const result = await response.json();
        Alert.alert(
          'Connection Success ✓', 
          `Successfully connected to backend!\n\nURL: ${API_BASE_URL}\n\nAvailable categories: ${result.categories?.join(', ') || 'N/A'}`
        );
      } else {
        Alert.alert(
          'Connection Failed',
          `Server responded with error ${response.status}\n\nURL: ${API_BASE_URL}\n\nThe backend is reachable but returned an error.`
        );
      }
    } catch (error) {
      let message = `Cannot connect to backend.\n\nURL: ${API_BASE_URL}\n\n`;
      
      if (error.name === 'AbortError') {
        message += 'Connection timeout. Server did not respond within 10 seconds.';
      } else if (error.message.includes('Network request failed')) {
        message += 'Network request failed. Please check:\n\n';
        message += '1. Backend is running (python app.py)\n';
        message += '2. .env file has correct EXPO_PUBLIC_API_URL\n';
        message += '3. For physical devices, use computer IP (not localhost)\n';
        message += '4. Phone and computer on same WiFi\n';
        message += '5. Firewall allows port 5000';
      } else {
        message += `Error: ${error.message}`;
      }
      
      Alert.alert('Connection Failed', message);
    }
  };

  const renderImageItem = ({ item }) => (
    <View style={styles.imageCard}>
      <Image source={{ uri: item.uri }} style={styles.imageThumb} resizeMode="cover" />
      <Text style={styles.imageName} numberOfLines={1}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image source={GreenLensLogo} style={styles.logoImage} />
        </View>

        {/* Retrain Model */}
        {renderOption(
          'Retrain Model',
          showTrain,
          () => setShowTrain(!showTrain),
          <>
            <Text style={{ marginBottom: 10, fontSize: 14, color: '#666' }}>
              Retrain the model with newly uploaded images. You can fine-tune existing class labels or add new ones.
            </Text>
            <View style={{ marginBottom: 10 }}>
              <TouchableOpacity 
                style={[styles.greenButton, { backgroundColor: '#4CAF50' }]} 
                onPress={testConnection}
              >
                <Text style={styles.buttonText}>Test Backend Connection</Text>
              </TouchableOpacity>
              <Text style={{ marginTop: 5, fontSize: 12, color: '#888', fontStyle: 'italic' }}>
                Use this to verify your backend is accessible before retraining
              </Text>
            </View>
            <TouchableOpacity style={styles.greenButton} onPress={handleTrainPress}>
              <Text style={styles.buttonText}>Retrain Model</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Deployment */}
        {renderOption(
          'Deployment',
          showDeployment,
          () => setShowDeployment(!showDeployment),
          <TouchableOpacity style={styles.greenButton} onPress={() => openURL("https://drive.google.com/your-folder-link")}>
            <Text style={styles.buttonText}>Deploy Model</Text>
          </TouchableOpacity>
        )}

        {/* Rate Us */}
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('FeedbackPage')}>
          <Text style={styles.optionText}>Rate Us</Text>
        </TouchableOpacity>

        {/* App Info */}
        {renderOption(
          'App Info',
          showAppInfo,
          () => setShowAppInfo(!showAppInfo),
          <>
            <Text>Version: 1.0.0</Text>
            <Text>Green Lens Developer App</Text>
            <Text>Developed by: GreenLens Team</Text>
          </>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Text style={[styles.optionText, { color: 'red' }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- Train Modal --- */}
      <Modal visible={trainModalVisible} transparent animationType="slide" onRequestClose={() => setTrainModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {!selectedCategory ? (
              <>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>Select Category</Text>
                <View style={styles.categoryGrid}>
                  {['plants', 'flowers', 'architecture'].map((cat) => (
                    <TouchableOpacity key={cat} style={styles.categoryButton} onPress={() => handleCategorySelect(cat)}>
                      <Text style={styles.categoryButtonText}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={[styles.greenButton, { backgroundColor: '#ccc' }]} onPress={() => setTrainModalVisible(false)}>
                  <Text style={[styles.buttonText, { color: '#000' }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>
                  {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Dataset Images
                </Text>
                {loadingImages ? (
                  <ActivityIndicator size="large" color="#2E7D32" />
                ) : (
                  <FlatList
                    data={images}
                    keyExtractor={(item) => item.id}
                    renderItem={renderImageItem}
                    numColumns={2}
                    contentContainerStyle={{ paddingBottom: 10 }}
                    columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 10 }}
                  />
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                  <TouchableOpacity style={[styles.greenButton, { flex: 1, marginRight: 5, backgroundColor: '#ccc' }]} onPress={() => { setSelectedCategory(null); setImages([]); }}>
                    <Text style={[styles.buttonText, { color: '#000' }]}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.greenButton, { flex: 1, marginLeft: 5 }]} onPress={handleTrainConfirm}>
                    <Text style={styles.buttonText}>Retrain</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* --- Training Buffer Overlay --- */}
      {trainingBuffer && (
        <View style={styles.bufferOverlay}>
          <View style={styles.bufferBox}>
            <Text style={{ fontSize: 16, marginBottom: 10, textAlign: 'center' }}>
              Retraining model for {selectedCategory}...
            </Text>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 10, textAlign: 'center' }}>
              This may take several minutes. Please do not close the app.
            </Text>
            <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 10 }} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  logoImage: { width: 150, height: 50, resizeMode: 'contain', marginRight: 8, marginTop: 30 },
  option: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionText: { fontSize: 18, color: '#333' },
  arrow: { fontSize: 22, color: '#333' },
  dropdownInfo: { paddingVertical: 10, paddingLeft: 15, backgroundColor: '#f2f2f2', marginBottom: 10 },
  greenButton: { backgroundColor: '#2E7D32', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, alignSelf: 'flex-start', marginVertical: 5 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', padding: 20 },
  modalBox: { width: '100%', maxHeight: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  imageCard: { width: '48%', marginBottom: 10, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f0f0f0' },
  imageThumb: { width: '100%', height: 120 },
  imageName: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginVertical: 4 },

  // --- new grid styles ---
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 },
  categoryButton: { flexBasis: '48%', backgroundColor: '#2E7D32', paddingVertical: 15, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  categoryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  // --- buffer overlay styles ---
  bufferOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  bufferBox: { padding: 20, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center' },
});

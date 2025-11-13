// ./screens/Developer/Developer_SettingsPage.jsx
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking, Image, Modal, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { app } from '../../firebaseConfig';
import { getFirestore, collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import GreenLensLogo from '../../assets/Green_Lens_logo.png';

const db = getFirestore(app);

export default function Developer_SettingsPage() {
  const navigation = useNavigation();
  const [showPretrain, setShowPretrain] = useState(false);
  const [showTrain, setShowTrain] = useState(false);
  const [showDeployment, setShowDeployment] = useState(false);
  const [showTesting, setShowTesting] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);

  // --- Train Model modal state ---
  const [trainModalVisible, setTrainModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // --- Pretrain Model modal state ---
  const [pretrainModalVisible, setPretrainModalVisible] = useState(false);
  const [pretrainCategory, setPretrainCategory] = useState(null);
  const [pretrainImages, setPretrainImages] = useState([]);
  const [loadingPretrainImages, setLoadingPretrainImages] = useState(false);

  // --- Silent buffer overlays ---
  const [trainingBuffer, setTrainingBuffer] = useState(false);
  const [pretrainingBuffer, setPretrainingBuffer] = useState(false);

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

  const fetchPretrainImages = async (category) => {
    setLoadingPretrainImages(true);
    setPretrainImages([]);
    try {
      const collectionRef = collection(doc(collection(db, 'modelPhotos'), category), 'images');
      const q = query(collectionRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          uri: d.data().imageUrl,
          name: d.data().name || d.data().uploadedBy || 'User Upload',
        }));
        setPretrainImages(items);
        setLoadingPretrainImages(false);
      });
      return unsubscribe;
    } catch (err) {
      console.error('Fetch pretrain images error:', err);
      setLoadingPretrainImages(false);
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

  //Terence, your Script i think can put here
  const handleTrainPress = () => setTrainModalVisible(true);
  const handleCategorySelect = (category) => { setSelectedCategory(category); fetchImages(category); };
  const handleTrainConfirm = () => {
    setTrainModalVisible(false);
    setTrainingBuffer(true); // show overlay

    setTimeout(() => {
      setTrainingBuffer(false); // hide overlay
      Alert.alert('Done', `Training Model Completed!`);
      setSelectedCategory(null);
    }, 5000); // buffer 5s
  };
  
  //Terence, your Script i think can put here
  const handlePretrainPress = () => setPretrainModalVisible(true);
  const handlePretrainCategorySelect = (category) => { setPretrainCategory(category); fetchPretrainImages(category); };
  const handlePretrainConfirm = () => {
    setPretrainModalVisible(false);
    setPretrainingBuffer(true); // show overlay

    setTimeout(() => {
      setPretrainingBuffer(false); // hide overlay
      Alert.alert('Done', `Pre-Training Model Completed!`);
      setPretrainCategory(null);
    }, 5000); // buffer 5s
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

        {/* Pre-train Model */}
        {renderOption(
          'Pre-train Model',
          showPretrain,
          () => setShowPretrain(!showPretrain),
          <TouchableOpacity style={styles.greenButton} onPress={handlePretrainPress}>
            <Text style={styles.buttonText}>Pre-Train Model</Text>
          </TouchableOpacity>
        )}

        {/* Train Model */}
        {renderOption(
          'Train Model',
          showTrain,
          () => setShowTrain(!showTrain),
          <TouchableOpacity style={styles.greenButton} onPress={handleTrainPress}>
            <Text style={styles.buttonText}>Train Model</Text>
          </TouchableOpacity>
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

        {/* Testing */}
        {renderOption(
          'Testing',
          showTesting,
          () => setShowTesting(!showTesting),
          <TouchableOpacity
            style={styles.greenButton}
            onPress={() => navigation.navigate('Developer_TestModelPage')}
          >
            <Text style={styles.buttonText}>Test Model</Text>
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
                    <Text style={[styles.buttonText, { color: '#000' }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.greenButton, { flex: 1, marginLeft: 5 }]} onPress={handleTrainConfirm}>
                    <Text style={styles.buttonText}>Train</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* --- Pretrain Modal --- */}
      <Modal visible={pretrainModalVisible} transparent animationType="slide" onRequestClose={() => setPretrainModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {!pretrainCategory ? (
              <>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>Select Category</Text>
                <View style={styles.categoryGrid}>
                  {['plants', 'flowers', 'architecture'].map((cat) => (
                    <TouchableOpacity key={cat} style={styles.categoryButton} onPress={() => handlePretrainCategorySelect(cat)}>
                      <Text style={styles.categoryButtonText}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={[styles.greenButton, { backgroundColor: '#ccc' }]} onPress={() => setPretrainModalVisible(false)}>
                  <Text style={[styles.buttonText, { color: '#000' }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>
                  {pretrainCategory.charAt(0).toUpperCase() + pretrainCategory.slice(1)} Dataset Images
                </Text>
                {loadingPretrainImages ? (
                  <ActivityIndicator size="large" color="#2E7D32" />
                ) : (
                  <FlatList
                    data={pretrainImages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderImageItem}
                    numColumns={2}
                    contentContainerStyle={{ paddingBottom: 10 }}
                    columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 10 }}
                  />
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                  <TouchableOpacity style={[styles.greenButton, { flex: 1, marginRight: 5, backgroundColor: '#ccc' }]} onPress={() => { setPretrainCategory(null); setPretrainImages([]); }}>
                    <Text style={[styles.buttonText, { color: '#000' }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.greenButton, { flex: 1, marginLeft: 5 }]} onPress={handlePretrainConfirm}>
                    <Text style={styles.buttonText}>Pre-Train</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* --- Silent Buffer Overlays --- */}
      {trainingBuffer && (
        <View style={styles.bufferOverlay}>
          <View style={styles.bufferBox}>
            <Text style={{ fontSize: 16 }}>Training model for {selectedCategory}...</Text>
            <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 10 }} />
          </View>
        </View>
      )}

      {pretrainingBuffer && (
        <View style={styles.bufferOverlay}>
          <View style={styles.bufferBox}>
            <Text style={{ fontSize: 16 }}>Pre-training model for {pretrainCategory}...</Text>
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
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 },
  categoryButton: { flexBasis: '48%', backgroundColor: '#2E7D32', paddingVertical: 15, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  categoryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  bufferOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  bufferBox: { padding: 20, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center' },
});


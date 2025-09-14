import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image, Dimensions, Alert } from 'react-native';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, addDoc, getDocs, query, where, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { app } from '../../firebaseConfig';

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export default function User_RewardPage() {
  const [points, setPoints] = useState(0);
  const [rewardsState, setRewardsState] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [voucherCode, setVoucherCode] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        fetchUserPoints(user.uid);
        fetchRewards();
      }
    });
    return unsubscribe;
  }, []);

  const fetchUserPoints = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setPoints(userSnap.data().totalPoints || 0);
      } else {
        await setDoc(userRef, { totalPoints: 0, username: auth.currentUser.displayName || auth.currentUser.email });
        setPoints(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addTestPoints = async () => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { totalPoints: increment(100) });
      setPoints(prev => prev + 100);
      Alert.alert('Test Points Added', '+100 points');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add test points.');
    }
  };

  const resolveImageUrl = async (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/150';
    if (imagePath.startsWith('http')) return imagePath;
    try {
      const cleanPath = imagePath.replace(/^gs:\/\/green-lens-47e9b\.appspot\.com\//, '');
      const pathRef = ref(storage, cleanPath);
      const url = await getDownloadURL(pathRef);
      return url;
    } catch {
      return 'https://via.placeholder.com/150';
    }
  };

  const fetchRewards = async () => {
    try {
      const rewardsCollection = await getDocs(collection(db, 'rewards'));
      const rewards = await Promise.all(
        rewardsCollection.docs.map(async docSnap => {
          const data = docSnap.data();
          const imageUrl = await resolveImageUrl(data.image);

          return {
            id: docSnap.id,
            title: data.title,
            cost: data.cost,
            description: data.description,
            quantity: data.quantity,
            image: { uri: imageUrl }
          };
        })
      );
      setRewardsState(rewards);
    } catch (err) {
      console.error('Error fetching rewards:', err);
    }
  };

  const handlePressReward = (reward) => {
    setSelectedReward(reward);
    setVoucherCode(null);
    setModalVisible(true);
  };

  const handleRedeem = async () => {
    if (!currentUser || !selectedReward) return;

    if (points < selectedReward.cost) {
      Alert.alert('Not enough points');
      return;
    }

    if (selectedReward.quantity <= 0) {
      Alert.alert('Out of stock');
      return;
    }

    try {
      const rewardRef = doc(db, 'rewards', selectedReward.id);
      const userRef = doc(db, 'users', currentUser.uid);

      // Fetch one unused voucher
      const vouchersRef = collection(rewardRef, 'vouchers');
      const q = query(vouchersRef, where('redeemed', '==', false), limit(1));
      const voucherSnap = await getDocs(q);

      if (voucherSnap.empty) {
        Alert.alert('No vouchers left for this reward');
        return;
      }

      const voucherDoc = voucherSnap.docs[0];
      const voucherData = voucherDoc.data();

      // Deduct points and update reward quantity
      await updateDoc(userRef, { totalPoints: increment(-selectedReward.cost) });
      await updateDoc(rewardRef, { quantity: increment(-1) });

      // Mark voucher as redeemed
      await updateDoc(voucherDoc.ref, { redeemed: true, redeemedBy: currentUser.uid, redeemedAt: new Date() });

      // Show voucher code
      setVoucherCode(voucherData.code);
      setPoints(prev => prev - selectedReward.cost);

      // Save redemption
      await addDoc(collection(db, 'redemptions'), {
        userId: currentUser.uid,
        rewardId: selectedReward.id,
        rewardTitle: selectedReward.title,
        voucherCode: voucherData.code,
        redeemedAt: new Date()
      });

      // Update state
      const updatedRewards = rewardsState.map(r =>
        r.id === selectedReward.id ? { ...r, quantity: r.quantity - 1 } : r
      );
      setRewardsState(updatedRewards);
      setSelectedReward(updatedRewards.find(r => r.id === selectedReward.id));

      Alert.alert(`You redeemed ${selectedReward.title}!`);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to redeem reward.');
    }
  };

  const renderReward = ({ item }) => (
    <TouchableOpacity style={styles.rewardCard} onPress={() => handlePressReward(item)}>
      <Image source={item.image} style={styles.rewardImage} />
      <Text style={styles.rewardTitle}>{item.title}</Text>
      <Text style={styles.rewardCost}>{item.cost} pt</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topLabel}>Rewards</Text>
        <Text style={styles.points}>{points} pt</Text>
      </View>

      <TouchableOpacity style={styles.testButton} onPress={addTestPoints}>
        <Text style={styles.testButtonText}>+100 pt (Test)</Text>
      </TouchableOpacity>

      <FlatList
        data={rewardsState}
        renderItem={renderReward}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {selectedReward && (
              <>
                <Text style={styles.modalTitle}>{selectedReward.title}</Text>
                <Image source={selectedReward.image} style={styles.modalImage} />
                <Text style={styles.modalDescription}>{selectedReward.description}</Text>
                <Text style={styles.modalCost}>Cost: {selectedReward.cost} pt</Text>
                <Text style={styles.modalQuantity}>Remaining: {selectedReward.quantity}</Text>

                {voucherCode ? (
                  <View style={styles.voucherBox}>
                    <Text style={styles.voucherLabel}>Your Voucher Code:</Text>
                    <Text style={styles.voucherCode}>{voucherCode}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.redeemButton, selectedReward.quantity === 0 && { backgroundColor: '#aaa' }]}
                    onPress={handleRedeem}
                    disabled={selectedReward.quantity === 0}
                  >
                    <Text style={styles.redeemButtonText}>
                      {selectedReward.quantity === 0 ? 'Out of Stock' : 'Redeem Now'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { width } = Dimensions.get('window');
const rewardCardWidth = (width - 60) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  topLabel: { fontSize: 24, fontWeight: 'bold' },
  points: { fontSize: 20, fontWeight: '600', color: '#000' },
  testButton: { backgroundColor: '#4caf50', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  testButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  grid: { justifyContent: 'space-between' },
  rewardCard: { width: rewardCardWidth, height: rewardCardWidth, backgroundColor: '#f2f2f2', margin: 5, borderRadius: 10, alignItems: 'center', justifyContent: 'center', padding: 10 },
  rewardImage: { width: '80%', height: '50%', resizeMode: 'contain', marginBottom: 5 },
  rewardTitle: { fontWeight: '600', fontSize: 16, color: '#333', marginBottom: 5, textAlign: 'center' },
  rewardCost: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  modalImage: { width: 150, height: 150, marginBottom: 10 },
  modalDescription: { fontSize: 16, textAlign: 'center', marginBottom: 10 },
  modalCost: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalQuantity: { fontSize: 16, fontWeight: '600', color: '#e53935', marginBottom: 20 },
  redeemButton: { backgroundColor: '#000', padding: 12, borderRadius: 8, width: '80%', alignItems: 'center', marginBottom: 10 },
  redeemButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  closeButton: { padding: 10 },
  closeButtonText: { color: '#333', fontSize: 16 },
  voucherBox: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#ccc' },
  voucherLabel: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
  voucherCode: { fontSize: 20, fontWeight: 'bold', color: '#000' },
});

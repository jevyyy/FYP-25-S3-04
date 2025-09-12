import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image, Dimensions, Alert } from 'react-native';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebaseConfig';

const db = getFirestore(app);
const auth = getAuth(app);

const rewardsData = [
  { id: '1', title: 'SBG Postcard', cost: 100, description: 'A beautifully designed postcard featuring the iconic scenery of the Singapore Botanic Gardens.', image: require('../../assets/Reward1.png') },
  { id: '2', title: 'SBG Postcard', cost: 200, description: 'A limited-edition postcard showcasing unique flora found in the Singapore Botanic Gardens.', image: require('../../assets/Reward2.png') },
  { id: '3', title: 'Postcard Set', cost: 150, description: 'A curated set of postcards, perfect for collectors or sharing memories of the Gardens.', image: require('../../assets/Reward3.png') },
  { id: '4', title: 'Bookmark', cost: 250, description: 'A stylish and durable bookmark inspired by nature, ideal for your favorite books.', image: require('../../assets/Reward4.png') },
];

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
        // Initialize user doc if not exists
        await setDoc(userRef, { totalPoints: 0, username: auth.currentUser.displayName || auth.currentUser.email });
        setPoints(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRewards = async () => {
    try {
      // For demo, we store initial quantity in Firestore too
      const rewardsWithQuantity = await Promise.all(rewardsData.map(async r => {
        const rewardRef = doc(db, 'rewards', r.id);
        const snap = await getDoc(rewardRef);
        if (snap.exists()) return { ...r, quantity: snap.data().quantity };
        // Initialize in DB if not exists
        await setDoc(rewardRef, { quantity: 5 });
        return { ...r, quantity: 5 };
      }));
      setRewardsState(rewardsWithQuantity);
    } catch (err) {
      console.error(err);
    }
  };

  const generateVoucherCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
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

      // Atomically update points and reward quantity
      await updateDoc(userRef, { totalPoints: increment(-selectedReward.cost) });
      await updateDoc(rewardRef, { quantity: increment(-1) });

      // Generate voucher
      const newCode = generateVoucherCode();
      setVoucherCode(newCode);
      setPoints(prev => prev - selectedReward.cost);

      // Save redemption record
      await addDoc(collection(db, 'redemptions'), {
        userId: currentUser.uid,
        rewardId: selectedReward.id,
        voucherCode: newCode,
        redeemedAt: new Date()
      });

      // Update local state
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
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  topLabel: { fontSize: 24, fontWeight: 'bold' },
  points: { fontSize: 20, fontWeight: '600', color: '#000' },
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

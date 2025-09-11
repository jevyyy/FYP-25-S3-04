// ./screens/User/User_RewardPage.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';

// Original rewardsData (with updated descriptions)
const rewardsData = [
  { 
      id: '1', 
      title: 'SBG Postcard', 
      cost: 100, 
      description: 'A beautifully designed postcard featuring the iconic scenery of the Singapore Botanic Gardens.', 
      image: require('../../assets/Reward1.png') 
  },
  { 
      id: '2', 
      title: 'SBG Postcard', 
      cost: 200, 
      description: 'A limited-edition postcard showcasing unique flora found in the Singapore Botanic Gardens.', 
      image: require('../../assets/Reward2.png') 
  },
  { 
      id: '3', 
      title: 'Postcard Set', 
      cost: 150, 
      description: 'A curated set of postcards, perfect for collectors or sharing memories of the Gardens.', 
      image: require('../../assets/Reward3.png') 
  },
  { 
      id: '4', 
      title: 'Bookmark', 
      cost: 250, 
      description: 'A stylish and durable bookmark inspired by nature, ideal for your favorite books.', 
      image: require('../../assets/Reward4.png') 
  },
];


export default function User_RewardPage() {
  const [points, setPoints] = useState(900);
  const [rewardsState, setRewardsState] = useState(
    rewardsData.map(r => ({ ...r, quantity: 5 }))
  );
  const [selectedReward, setSelectedReward] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [voucherCode, setVoucherCode] = useState(null);

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
    setVoucherCode(null); // reset when opening modal
    setModalVisible(true);
  };

  const handleRedeem = () => {
    if (selectedReward && points >= selectedReward.cost && selectedReward.quantity > 0) {
      setPoints(points - selectedReward.cost);

      const updatedRewards = rewardsState.map((r) =>
        r.id === selectedReward.id ? { ...r, quantity: r.quantity - 1 } : r
      );
      setRewardsState(updatedRewards);

      const updatedSelected = updatedRewards.find(r => r.id === selectedReward.id);
      setSelectedReward(updatedSelected);

      // Generate voucher code
      const newCode = generateVoucherCode();
      setVoucherCode(newCode);

      alert(`You redeemed ${selectedReward.title}!`);
    } else {
      alert('Not enough points');
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
      {/* Top bar: Rewards label and points */}
      <View style={styles.topBar}>
        <Text style={styles.topLabel}>Rewards</Text>
        <Text style={styles.points}>{points} pt</Text>
      </View>

      {/* 2x2 Reward Grid */}
      <FlatList
        data={rewardsState}
        renderItem={renderReward}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />

      {/* Reward Modal */}
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
                <Text style={styles.modalQuantity}>
                  Remaining: {selectedReward.quantity}
                </Text>

                {/* Show voucher code if redeemed */}
                {voucherCode ? (
                  <View style={styles.voucherBox}>
                    <Text style={styles.voucherLabel}>Your Voucher Code:</Text>
                    <Text style={styles.voucherCode}>{voucherCode}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.redeemButton,
                      selectedReward.quantity === 0 && { backgroundColor: '#aaa' }
                    ]}
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
  rewardCard: {
    width: rewardCardWidth,
    height: rewardCardWidth,
    backgroundColor: '#f2f2f2',
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
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

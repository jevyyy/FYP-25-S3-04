// ./screens/User/User_RewardPage.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';

const rewardsData = [
    { 
        id: '1', 
        title: 'SBG Postcard', 
        cost: 100, description: 'Description for Reward 1', 
        image: require('../../assets/Reward1.png') 
    },
    { 
        id: '2', 
        title: 'SBG Postcard', 
        cost: 200, description: 'Description for Reward 2', 
        image: require('../../assets/Reward2.png') 
    },
    { 
        id: '3', 
        title: 'Postcard Set', 
        cost: 150, description: 'Description for Reward 3', 
        image: require('../../assets/Reward3.png') 
    },
    { 
        id: '4', 
        title: 'Bookmark', 
        cost: 250, description: 'Description for Reward 4', 
        image: require('../../assets/Reward4.png') 
    },
];

export default function User_RewardPage() {
  const [points, setPoints] = useState(900);
  const [selectedReward, setSelectedReward] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePressReward = (reward) => {
    setSelectedReward(reward);
    setModalVisible(true);
  };

  const handleRedeem = () => {
    if (selectedReward && points >= selectedReward.cost) {
      setPoints(points - selectedReward.cost);
      alert(`You redeemed ${selectedReward.title}!`);
      setModalVisible(false);
    } else {
      alert('Not enough points to redeem this reward.');
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
        data={rewardsData}
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
                <TouchableOpacity style={styles.redeemButton} onPress={handleRedeem}>
                  <Text style={styles.redeemButtonText}>Redeem Now</Text>
                </TouchableOpacity>
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
const rewardCardWidth = (width - 60) / 2; // spacing for 2 cards per row

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  topLabel: { fontSize: 24, fontWeight: 'bold' },
  points: { fontSize: 20, fontWeight: '600', color: '#4CAF50' },
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
  modalCost: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  redeemButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, width: '80%', alignItems: 'center', marginBottom: 10 },
  redeemButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  closeButton: { padding: 10 },
  closeButtonText: { color: '#333', fontSize: 16 },
});

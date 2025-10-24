// ./screens/Developer/Developer_SettingsPage.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking, Image } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';

import GreenLensLogo from '../../assets/Green_Lens_logo.png'; // adjust path if needed

export default function Developer_SettingsPage() {
  const navigation = useNavigation();
  const [expandedSections, setExpandedSections] = useState({
    preTrainModel: false,
    trainModel: false,
    deployment: false,
    appInfo: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'GuestFlow',
                    state: {
                      routes: [{ name: 'Guest_HomePage' }],
                    },
                  },
                ],
              })
            );
          },
        },
      ]
    );
  };

  const openURL = (url) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Cannot open URL", "Please check your URL or internet connection.");
        }
      })
      .catch((err) => console.error("Error opening URL:", err));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={GreenLensLogo} style={styles.logoImage} />
        </View>

        <View style={styles.settingsContainer}>
          {/* Pre-train Model */}
          <TouchableOpacity style={styles.settingItem} onPress={() => toggleSection('preTrainModel')}>
            <Text style={styles.settingText}>Pre-train Model</Text>
            <Text>{expandedSections.preTrainModel ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {expandedSections.preTrainModel && (
            <View style={styles.expandedContent}>
              <TouchableOpacity style={styles.smallButton} onPress={() => openURL("https://colab.research.google.com/your-pretrain-notebook")}>
                <Text style={styles.buttonText}>Pre-train Model</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Train Model */}
          <TouchableOpacity style={styles.settingItem} onPress={() => toggleSection('trainModel')}>
            <Text style={styles.settingText}>Train Model</Text>
            <Text>{expandedSections.trainModel ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {expandedSections.trainModel && (
            <View style={styles.expandedContent}>
              <TouchableOpacity style={styles.smallButton} onPress={() => openURL("https://colab.research.google.com/your-train-notebook")}>
                <Text style={styles.buttonText}>Train Model</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Deployment */}
          <TouchableOpacity style={styles.settingItem} onPress={() => toggleSection('deployment')}>
            <Text style={styles.settingText}>Deployment</Text>
            <Text>{expandedSections.deployment ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {expandedSections.deployment && (
            <View style={styles.expandedContent}>
              <TouchableOpacity style={styles.smallButton} onPress={() => openURL("https://drive.google.com/your-folder-link")}>
                <Text style={styles.buttonText}>Deploy Model</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Rate Us */}
          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('FeedbackPage')}>
            <Text style={styles.settingText}>Rate Us</Text>
            <Text>▶</Text>
          </TouchableOpacity>

          {/* App Info */}
          <TouchableOpacity style={styles.settingItem} onPress={() => toggleSection('appInfo')}>
            <Text style={styles.settingText}>App Info</Text>
            <Text>{expandedSections.appInfo ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {expandedSections.appInfo && (
            <View style={styles.expandedContent}>
              <Text style={styles.expandedText}>Version: 1.0.0</Text>
              <Text style={styles.expandedText}>Green Lens App</Text>
              <Text style={styles.expandedText}>Developed by: GreenLens Team</Text>
            </View>
          )}

          {/* Logout */}
          <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 20 },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#fff', alignItems: 'flex-start' },
  logoImage: { width: 150, height: 50, resizeMode: 'contain' }, // ✅ bigger size
  settingsContainer: { paddingHorizontal: 20, paddingTop: 10 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  settingText: { fontSize: 16, color: '#333' },
  expandedContent: { backgroundColor: '#f8f8f8', padding: 15, marginTop: -1, marginBottom: 10, borderRadius: 8 },
  expandedText: { fontSize: 14, color: '#555', marginBottom: 8 },

  smallButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
    width: '40%',
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  logoutItem: { marginTop: 20, borderBottomWidth: 0 },
  logoutText: { fontSize: 16, color: '#d32f2f', fontWeight: '600' },
});

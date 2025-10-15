import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function Developer_SettingsPage() {
  const navigation = useNavigation();
  const [expandedSections, setExpandedSections] = useState({
    accountSettings: false,
    preTrainModel: false,
    trainModel: false,
    appInfo: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNavigation = (destination) => {
    switch(destination) {
      case 'Deployment':
        navigation.navigate('Developer_Deployment');
        break;
      case 'RateUs':
        navigation.navigate('Developer_RateUs');
        break;
      default:
        Alert.alert('Coming Soon', `${destination} feature will be available soon.`);
    }
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

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="leaf" size={28} color="#2E7D32" />
            </View>
            <Text style={styles.logoText}>GREEN LENS</Text>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.settingsContainer}>
          {/* Account Settings */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => toggleSection('accountSettings')}
          >
            <Text style={styles.settingText}>Account settings</Text>
            <Ionicons 
              name={expandedSections.accountSettings ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
          {expandedSections.accountSettings && (
            <View style={styles.expandedContent}>
              <Text style={styles.expandedText}>Username: Developer1</Text>
              <Text style={styles.expandedText}>Email: dev@greenlens.com</Text>
              <TouchableOpacity style={styles.subOption}>
                <Text style={styles.subOptionText}>Change Password</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.subOption}>
                <Text style={styles.subOptionText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Pre-train Model */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => toggleSection('preTrainModel')}
          >
            <Text style={styles.settingText}>Pre-train model</Text>
            <Ionicons 
              name={expandedSections.preTrainModel ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
          {expandedSections.preTrainModel && (
            <View style={styles.expandedContent}>
              <Text style={styles.expandedText}>Data Preparation</Text>
              <TouchableOpacity style={styles.subOption}>
                <Text style={styles.subOptionText}>Upload Training Data</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.subOption}>
                <Text style={styles.subOptionText}>Data Augmentation</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.subOption}>
                <Text style={styles.subOptionText}>Validate Dataset</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Train Model */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => toggleSection('trainModel')}
          >
            <Text style={styles.settingText}>Train model</Text>
            <Ionicons 
              name={expandedSections.trainModel ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
          {expandedSections.trainModel && (
            <View style={styles.expandedContent}>
              <Text style={styles.expandedText}>Training Configuration</Text>
              <TouchableOpacity style={styles.subOption}>
                <Text style={styles.subOptionText}>Start Training</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.subOption}>
                <Text style={styles.subOptionText}>View Training Progress</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.subOption}>
                <Text style={styles.subOptionText}>Training History</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Deployment */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleNavigation('Deployment')}
          >
            <Text style={styles.settingText}>Deployment</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {/* Rate Us */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleNavigation('RateUs')}
          >
            <Text style={styles.settingText}>Rate Us</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {/* App Info */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => toggleSection('appInfo')}
          >
            <Text style={styles.settingText}>App Info</Text>
            <Ionicons 
              name={expandedSections.appInfo ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
          {expandedSections.appInfo && (
            <View style={styles.expandedContent}>
              <Text style={styles.expandedText}>Version: 1.0.0</Text>
              <Text style={styles.expandedText}>Green Lens Developer Portal</Text>
              <Text style={styles.expandedText}>Developed by: GreenLens Team</Text>
              <Text style={styles.expandedText}>Last Updated: 8 August 2025</Text>
            </View>
          )}

          {/* Logout */}
          <TouchableOpacity
            style={[styles.settingItem, styles.logoutItem]}
            onPress={handleLogout}
          >
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
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#fff' },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  logoText: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', letterSpacing: 1 },
  settingsContainer: { paddingHorizontal: 20, paddingTop: 10 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  settingText: { fontSize: 16, color: '#333' },
  expandedContent: { backgroundColor: '#f8f8f8', padding: 15, marginTop: -1, marginBottom: 10, borderRadius: 8 },
  expandedText: { fontSize: 14, color: '#555', marginBottom: 8 },
  subOption: { paddingVertical: 8 },
  subOptionText: { fontSize: 14, color: '#2E7D32', fontWeight: '500' },
  logoutItem: { marginTop: 20, borderBottomWidth: 0 },
  logoutText: { fontSize: 16, color: '#d32f2f', fontWeight: '600' },
});

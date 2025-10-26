// ./screens/Admin/SettingsPage.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import GreenLensLogo from '../../assets/Green_Lens_logo.png'; // adjust path if needed

export default function Admin_SettingsPage() {
  const navigation = useNavigation();
  const [showSupportInfo, setShowSupportInfo] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);

  const handleOptionPress = (option) => {
    switch (option) {
      case 'Support':
        setShowSupportInfo(!showSupportInfo);
        break;
      case 'App Info':
        setShowAppInfo(!showAppInfo);
        break;
      case 'Logout':
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Ok',
              onPress: () => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'GuestFlow',
                        state: { routes: [{ name: 'Guest_HomePage' }] },
                      },
                    ],
                  })
                );
              },
            },
          ]
        );
        break;
      default:
        Alert.alert(option, 'Option pressed.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Green Lens Logo */}
      <View style={styles.logoContainer}>
        <Image source={GreenLensLogo} style={styles.logoImage} />
      </View>

      {/* Support Dropdown */}
      <TouchableOpacity
        style={styles.option}
        onPress={() => handleOptionPress('Support')}
      >
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Support</Text>
          <Text style={styles.arrow}>{showSupportInfo ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
      {showSupportInfo && (
        <View style={styles.dropdownInfo}>
          <Text>Email: GreenLens@gov.sg</Text>
          <Text>Hotline: 9000 1075</Text>
          <Text>
            Company Location: 1 Fusionopolis Way, North Tower, #1 Connexis,
            138632
          </Text>
        </View>
      )}

      {/* App Info Dropdown */}
      <TouchableOpacity
        style={styles.option}
        onPress={() => handleOptionPress('App Info')}
      >
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>App Info</Text>
          <Text style={styles.arrow}>{showAppInfo ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
      {showAppInfo && (
        <View style={styles.dropdownInfo}>
          <Text>Version: 1.0.0</Text>
          <Text>Green Lens Admin App</Text>
          <Text>Developed by: GreenLens Team</Text>
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity
        style={styles.option}
        onPress={() => handleOptionPress('Logout')}
      >
        <Text style={[styles.optionText, { color: 'red' }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff', paddingTop: 50 },
  logoContainer: { alignItems: 'flex-start', marginBottom: 20 },
  logoImage: { width: 150, height: 50, resizeMode: 'contain' },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrow: { fontSize: 22, color: '#333' },
  optionText: { fontSize: 18, color: '#333' },
  dropdownInfo: {
    paddingVertical: 10,
    paddingLeft: 15,
    backgroundColor: '#f2f2f2',
    marginBottom: 10,
  },
});

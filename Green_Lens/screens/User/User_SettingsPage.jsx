// ./screens/User/SettingPage.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';

export default function SettingPage() {
  const navigation = useNavigation();
  const [showSupportInfo, setShowSupportInfo] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);

  const handleOptionPress = (option) => {
    switch(option) {
      case 'Change Password':
        // Navigate to User_ChangePasswordPage
        navigation.navigate('User_ChangePasswordPage');
        break;
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
                // Reset navigation stack to Guest_HomePage
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'GuestFlow', // top-level stack in App.js
                        state: {
                          routes: [
                            { name: 'Guest_HomePage' } // navigate directly to guest home
                          ]
                        }
                      }
                    ],
                  })
                );
              }
            }
          ]
        );
        break;
      default:
        Alert.alert(option, 'Option pressed.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* Change Password */}
      <TouchableOpacity style={styles.option} onPress={() => handleOptionPress('Change Password')}>
        <Text style={styles.optionText}>Change Password</Text>
      </TouchableOpacity>

      {/* Support Dropdown */}
      <TouchableOpacity style={styles.option} onPress={() => handleOptionPress('Support')}>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Support</Text>
          <Text style={styles.arrow}>{showSupportInfo ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
      {showSupportInfo && (
        <View style={styles.dropdownInfo}>
          <Text>Email: GreenLens@gov.sg</Text>
          <Text>Hotline: 9000 1075</Text>
          <Text>Company Location: 1 Fusionopolis Way, North Tower, #1 Connexis, 138632</Text>
        </View>
      )}

      {/* App Info Dropdown */}
      <TouchableOpacity style={styles.option} onPress={() => handleOptionPress('App Info')}>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>App Info</Text>
          <Text style={styles.arrow}>{showAppInfo ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
      {showAppInfo && (
        <View style={styles.dropdownInfo}>
          <Text>Version: 1.0.0</Text>
          <Text>Green Lens App</Text>
          <Text>Developed by: GreenLens Team</Text>
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.option} onPress={() => handleOptionPress('Logout')}>
        <Text style={[styles.optionText, { color: 'red' }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, alignSelf: 'flex-start' },
  option: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  arrow: { fontSize: 22, color: '#333' },
  optionText: { fontSize: 18, color: '#333' },
  dropdownInfo: { paddingVertical: 10, paddingLeft: 15, backgroundColor: '#f2f2f2', marginBottom: 10 },
});

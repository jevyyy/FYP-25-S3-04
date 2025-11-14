import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';

export default function SettingPage() {
  const navigation = useNavigation();

  // State to control whether Support and App Info sections are visible
  const [showSupportInfo, setShowSupportInfo] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);

  // Handle what happens when a settings option is pressed
  const handleOptionPress = (option) => {
    switch(option) {
      case 'Change Password':
        // Navigate to the change password screen
        navigation.navigate('User_ChangePasswordPage');
        break;

      case 'Support':
        // Toggle visibility of support info
        setShowSupportInfo(!showSupportInfo);
        break;

      case 'App Info':
        // Toggle visibility of app information
        setShowAppInfo(!showAppInfo);
        break;

      case 'Logout':
        // Confirm logout with an alert
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Ok',
              onPress: () => {
                // Reset the navigation stack and redirect to the Guest Home Page
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'GuestFlow',
                        state: {
                          routes: [
                            { name: 'Guest_HomePage' }
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
        // Default action for any other option
        Alert.alert(option, 'Option pressed.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Option to change password */}
      <TouchableOpacity style={styles.option} onPress={() => handleOptionPress('Change Password')}>
        <Text style={styles.optionText}>Change Password</Text>
      </TouchableOpacity>

      {/* Support option with expandable info */}
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

      {/* App Info option with expandable info */}
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

      {/* Logout option */}
      <TouchableOpacity style={styles.option} onPress={() => handleOptionPress('Logout')}>
        <Text style={[styles.optionText, { color: 'red' }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  option: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  arrow: { fontSize: 22, color: '#333' },
  optionText: { fontSize: 18, color: '#333' },
  dropdownInfo: { paddingVertical: 10, paddingLeft: 15, backgroundColor: '#f2f2f2', marginBottom: 10 },
});

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import GreenLensLogo from '../../assets/Green_Lens_logo.png';

// Main Settings Page component for the admin
export default function Admin_SettingsPage() {
  const navigation = useNavigation(); // Hook to navigate between screens
  const [showSupportInfo, setShowSupportInfo] = useState(false); // Toggle for Support info dropdown
  const [showAppInfo, setShowAppInfo] = useState(false); // Toggle for App Info dropdown

  // Function to handle option selections
  const handleOptionPress = (option) => {
    switch (option) {
      case 'Support':
        // Toggle visibility of support information
        setShowSupportInfo(!showSupportInfo);
        break;
      case 'App Info':
        // Toggle visibility of app information
        setShowAppInfo(!showAppInfo);
        break;
      case 'Logout':
        // Show confirmation alert before logging out
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            { text: 'Cancel', style: 'cancel' }, // Cancel logout
            {
              text: 'Ok',
              onPress: () => {
                // Reset navigation stack to go back to Guest Home Page
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
        // Handle unexpected options
        Alert.alert(option, 'Option pressed.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Display the Green Lens logo */}
      <View style={styles.logoContainer}>
        <Image source={GreenLensLogo} style={styles.logoImage} />
      </View>

      {/* Support option button */}
      <TouchableOpacity
        style={styles.option}
        onPress={() => handleOptionPress('Support')}
      >
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Support</Text>
          {/* Arrow indicates if dropdown is open or closed */}
          <Text style={styles.arrow}>{showSupportInfo ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
      {/* Support info dropdown */}
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

      {/* App Info option button */}
      <TouchableOpacity
        style={styles.option}
        onPress={() => handleOptionPress('App Info')}
      >
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>App Info</Text>
          <Text style={styles.arrow}>{showAppInfo ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
      {/* App Info dropdown */}
      {showAppInfo && (
        <View style={styles.dropdownInfo}>
          <Text>Version: 1.0.0</Text>
          <Text>Green Lens Admin App</Text>
          <Text>Developed by: GreenLens Team</Text>
        </View>
      )}

      {/* Logout button */}
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
  container: { flex: 1, padding: 16, backgroundColor: '#fff', paddingTop: 50 }, // Page container
  logoContainer: { alignItems: 'flex-start', marginBottom: 20 }, // Logo container
  logoImage: { width: 150, height: 50, resizeMode: 'contain' }, // Logo image
  option: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' }, // Option button
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, // Row layout for option and arrow
  arrow: { fontSize: 22, color: '#333' }, // Arrow indicator
  optionText: { fontSize: 18, color: '#333' }, // Text of the option
  dropdownInfo: { paddingVertical: 10, paddingLeft: 15, backgroundColor: '#f2f2f2', marginBottom: 10 }, // Dropdown information styling
});
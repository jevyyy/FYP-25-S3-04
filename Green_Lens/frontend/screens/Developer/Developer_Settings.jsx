// ./screens/Developer/Developer_SettingsPage.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking, Image } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';

import GreenLensLogo from '../../assets/Green_Lens_logo.png'; // adjust path if needed

export default function Developer_SettingsPage() {
  const navigation = useNavigation();
  const [showPretrain, setShowPretrain] = useState(false);
  const [showTrain, setShowTrain] = useState(false);
  const [showDeployment, setShowDeployment] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);

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
                    state: { routes: [{ name: 'Guest_HomePage' }] },
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
      .then((supported) => (supported ? Linking.openURL(url) : Alert.alert("Cannot open URL")))
      .catch((err) => console.error("Error opening URL:", err));
  };

  const renderOption = (title, expanded, toggle, content) => (
    <>
      <TouchableOpacity style={styles.option} onPress={toggle}>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>{title}</Text>
          <Text style={styles.arrow}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
      {expanded && <View style={styles.dropdownInfo}>{content}</View>}
    </>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        
        {/* Logo moved down to match Architecture Page */}
        <View style={styles.logoContainer}>
          <Image source={GreenLensLogo} style={styles.logoImage} />
        </View>


        {/* Pre-train Model */}
        {renderOption(
          'Pre-train Model',
          showPretrain,
          () => setShowPretrain(!showPretrain),
          <TouchableOpacity style={styles.greenButton} onPress={() => openURL("https://colab.research.google.com/your-pretrain-notebook")}>
            <Text style={styles.buttonText}>Pre-Train Model</Text>
          </TouchableOpacity>
        )}

        {/* Train Model */}
        {renderOption(
          'Train Model',
          showTrain,
          () => setShowTrain(!showTrain),
          <TouchableOpacity style={styles.greenButton} onPress={() => openURL("https://colab.research.google.com/your-train-notebook")}>
            <Text style={styles.buttonText}>Train Model</Text>
          </TouchableOpacity>
        )}

        {/* Deployment */}
        {renderOption(
          'Deployment',
          showDeployment,
          () => setShowDeployment(!showDeployment),
          <TouchableOpacity style={styles.greenButton} onPress={() => openURL("https://drive.google.com/your-folder-link")}>
            <Text style={styles.buttonText}>Deploy Model</Text>
          </TouchableOpacity>
        )}

        {/* Rate Us */}
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('FeedbackPage')}>
          <Text style={styles.optionText}>Rate Us</Text>
        </TouchableOpacity>

        {/* App Info */}
        {renderOption(
          'App Info',
          showAppInfo,
          () => setShowAppInfo(!showAppInfo),
          <>
            <Text>Version: 1.0.0</Text>
            <Text>Green Lens Developer App</Text>
            <Text>Developed by: GreenLens Team</Text>
          </>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Text style={[styles.optionText, { color: 'red' }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
// Logo container style
logoContainer: {
  flexDirection: 'row',   // horizontal like PlantsPage
  alignItems: 'center',   // vertically center
  marginBottom: 15,       // spacing below logo
},
logoImage: {
  width: 150,
  height: 50,
  resizeMode: 'contain',
  marginRight: 8,         // spacing to the right if needed
  marginTop: 30,
},
  option: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionText: { fontSize: 18, color: '#333' },
  arrow: { fontSize: 22, color: '#333' },
  dropdownInfo: { paddingVertical: 10, paddingLeft: 15, backgroundColor: '#f2f2f2', marginBottom: 10 },
  greenButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginVertical: 5,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

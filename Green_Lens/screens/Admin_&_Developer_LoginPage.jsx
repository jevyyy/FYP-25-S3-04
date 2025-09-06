// ./screens/User/User_Login.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function User_Login() {
  return (
    <View style={styles.container}>
      <Text>User Login Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
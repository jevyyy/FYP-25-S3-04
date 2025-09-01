import React from 'react';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from './HomePage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomePage}
          options={{
            headerShown: true,
            headerTitle: () => (
              <Image
                source={require('./assets/Green_Lens_logo.png')}
                style={{ width: 120, height: 40 }}
                resizeMode="contain"
              />
            ),
            headerStyle: {
              backgroundColor: '#fff', // optional, adjust header background
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

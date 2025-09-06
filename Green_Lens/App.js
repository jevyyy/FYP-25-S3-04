import React from 'react';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Guest_HomePage from './screens/Guest/Guest_HomePage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Guest_Home">
        <Stack.Screen
          name="Guest_Home"
          component={Guest_HomePage}
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
              backgroundColor: '#fff',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

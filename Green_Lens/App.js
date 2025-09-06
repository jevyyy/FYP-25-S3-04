// App.js
import React from 'react';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import Guest_HomePage from './screens/Guest/Guest_HomePage';
import LoginSelectionPage from './screens/LoginSelectionPage';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Guest_HomePage"
        screenOptions={{
          drawerPosition: 'right', // Menu on right
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
      >
        {/* Screens inside the burger menu */}
        <Drawer.Screen
          name="Guest_HomePage"       // internal route name
          component={Guest_HomePage}
          options={{ drawerLabel: 'Home' }} // 👈 text shown in drawer
        />
        <Drawer.Screen
          name="LoginSelectionPage"
          component={LoginSelectionPage}
          options={{ drawerLabel: 'Login/Register' }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

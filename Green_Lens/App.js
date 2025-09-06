// App.js
import React from 'react';
import { Image, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Guest_HomePage from './screens/Guest/Guest_HomePage';
import LoginSelectionPage from './screens/LoginSelectionPage';
import User_Login from './screens/User/User_Login';
import Admin_Developer_Login from './screens/Admin_&_Developer_LoginPage';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Stack for LoginSelectionPage + hidden login pages
function LoginStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LoginSelectionPage"
        component={LoginSelectionPage}
        options={({ navigation }) => ({
          title: 'Login / Register',
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginRight: 15 }}>
              <Text style={{ fontSize: 24 }}>☰</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="User_Login"
        component={User_Login}
        options={{ title: 'User Login' }}
      />
      <Stack.Screen
        name="Admin_Developer_Login"
        component={Admin_Developer_Login}
        options={{ title: 'Admin / Developer Login' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Guest_HomePage"
        screenOptions={{
          drawerPosition: 'right',
          headerTitle: () => (
            <Image
              source={require('./assets/Green_Lens_logo.png')}
              style={{ width: 120, height: 40 }}
              resizeMode="contain"
            />
          ),
          headerStyle: { backgroundColor: '#fff' },
        }}
      >
        <Drawer.Screen
          name="Guest_HomePage"
          component={Guest_HomePage}
          options={{ drawerLabel: 'Home' }}
        />

        {/* LoginSelectionPage is visible in drawer */}
        <Drawer.Screen
          name="LoginSelection"
          component={LoginStack} // stack containing LoginSelectionPage + hidden login screens
          options={{ drawerLabel: 'Login/Register', headerShown: false }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

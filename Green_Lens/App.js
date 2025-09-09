// App.js
import React from 'react';
import { Image, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Guest_HomePage from './screens/Guest/Guest_HomePage';
import LoginSelectionPage from './screens/LoginSelectionPage';
import User_Login from './screens/User/User_Login';
import User_Register from './screens/User/User_Register';
import Forgot_PasswordPage from './screens/Forgot_PasswordPage';
import Admin_Developer_LoginPage from './screens/Admin_&_Developer_LoginPage';
import User_HomePage from './screens/User/User_HomePage';
import User_Explore from './screens/User/User_Explore';
import User_RankingPage from './screens/User/User_RankingPage';
import User_QuizPage from './screens/User/User_QuizPage';
import Guest_ViewSummaryPage from './screens/Guest/Guest_ViewSummaryPage';
import User_ViewSummaryPage from './screens/User/User_ViewSummaryPage';
import FeedbackPage from './screens/FeedbackPage'; // ✅ Added

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Burger menu button
const BurgerMenu = ({ navigation }) => (
  <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginRight: 15 }}>
    <Text style={{ fontSize: 24 }}>☰</Text>
  </TouchableOpacity>
);

// Guest Drawer
function GuestDrawer() {
  return (
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
        options={({ navigation }) => ({
          drawerLabel: 'Home',
          headerRight: () => <BurgerMenu navigation={navigation} />,
        })}
      />
      <Drawer.Screen
        name="LoginSelection"
        component={LoginStack}
        options={{ drawerLabel: 'Login/Register', headerShown: false }}
      />
      {/* Guest Summary (hidden but still inside drawer) */}
      <Drawer.Screen
        name="Guest_ViewSummary"
        component={Guest_ViewSummaryPage}
        options={({ navigation }) => ({
          drawerLabel: 'Hidden',
          drawerItemStyle: { display: 'none' },
          title: 'Summary',
          headerRight: () => <BurgerMenu navigation={navigation} />,
        })}
      />
    </Drawer.Navigator>
  );
}

// User Drawer
function UserDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="User_HomePage"
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
        name="User_HomePage"
        component={User_HomePage}
        options={({ navigation }) => ({
          drawerLabel: 'Home',
          headerRight: () => <BurgerMenu navigation={navigation} />,
        })}
      />
      <Drawer.Screen
        name="User_Explore"
        component={User_Explore}
        options={({ navigation }) => ({
          drawerLabel: 'Explore',
          headerRight: () => <BurgerMenu navigation={navigation} />,
        })}
      />
      <Drawer.Screen
        name="User_RankingPage"
        component={User_RankingPage}
        options={({ navigation }) => ({
          drawerLabel: 'Ranking',
          headerRight: () => <BurgerMenu navigation={navigation} />,
        })}
      />
      <Drawer.Screen
        name="User_QuizPage"
        component={User_QuizPage}
        options={({ navigation }) => ({
          drawerLabel: 'Quiz',
          headerRight: () => <BurgerMenu navigation={navigation} />,
        })}
      />
      {/* User Summary (hidden but still inside drawer) */}
      <Drawer.Screen
        name="User_ViewSummary"
        component={User_ViewSummaryPage}
        options={({ navigation }) => ({
          drawerLabel: 'Hidden',
          drawerItemStyle: { display: 'none' },
          title: 'Summary',
          headerRight: () => <BurgerMenu navigation={navigation} />,
        })}
      />
      {/* ✅ Feedback page added as "Rate Us" */}
      <Drawer.Screen
        name="FeedbackPage"
        component={FeedbackPage}
        options={({ navigation }) => ({
          drawerLabel: 'Rate Us',
          title: 'Rate Us',
          headerRight: () => <BurgerMenu navigation={navigation} />,
        })}
      />
    </Drawer.Navigator>
  );
}

// Guest Login stack
function LoginStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LoginSelectionPage"
        component={LoginSelectionPage}
        options={({ navigation }) => ({
          title: 'Login / Register',
          headerRight: () => <BurgerMenu navigation={navigation} />,
        })}
      />
      <Stack.Screen name="User_Login" component={User_Login} options={{ title: 'User Login' }} />
      <Stack.Screen name="User_Register" component={User_Register} options={{ title: 'Register' }} />
      <Stack.Screen
        name="Forgot_PasswordPage"
        component={Forgot_PasswordPage}
        options={{ title: 'Forgot Password' }}
      />
      <Stack.Screen
        name="Admin_Developer_Login"
        component={Admin_Developer_LoginPage}
        options={{ title: 'Admin / Developer Login' }}
      />
    </Stack.Navigator>
  );
}

// App
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Guest Drawer flow */}
        <Stack.Screen name="GuestFlow" component={GuestDrawer} />
        {/* User Drawer flow */}
        <Stack.Screen name="UserFlow" component={UserDrawer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

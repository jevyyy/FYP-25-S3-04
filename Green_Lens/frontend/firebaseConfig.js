// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCmkDsnfj2oUaL5Sm4xY4uBvS-mH6flA1g",
  authDomain: "green-lens-47e9b.firebaseapp.com",
  projectId: "green-lens-47e9b",
  storageBucket: "green-lens-47e9b.firebasestorage.app",
  messagingSenderId: "965515353283",
  appId: "1:965515353283:android:5a57cf289d67788cde9676"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Initialize Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, storage, auth };
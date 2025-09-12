// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'; // <-- add this
import { getFirestore } from 'firebase/firestore'; // <-- Import Firestore

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
const auth = getAuth(app); // <-- initialize auth
const db = getFirestore(app); // <-- Initialize Firestore

// export { storage, auth }; // <-- export auth too
export { app, storage, auth, db }; // <-- Export 'app' and 'db'


/* // use it when want to push question into database
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

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
const auth = getAuth(app);

export { app, storage, auth }; // <-- export app too
*/
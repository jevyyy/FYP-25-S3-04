// registerTest.js
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCmkDsnfj2oUaL5Sm4xY4uBvS-mH6flA1g",
  authDomain: "green-lens-47e9b.firebaseapp.com",
  projectId: "green-lens-47e9b",
  storageBucket: "green-lens-47e9b.firebasestorage.app",
  messagingSenderId: "965515353283",
  appId: "1:965515353283:android:5a57cf289d67788cde9676"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function registerTests() {
  let testUser = null;

  try {
    const email = `testuser_${Date.now()}@example.com`;
    const password = "testPassword123";

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    testUser = userCredential.user;

    console.log("✅ Register new user passed:", userCredential.user.email === email);
  } catch (err) {
    console.error("❌ Register new user failed:", err.message);
  }

  if (testUser) {
    await deleteUser(testUser);
    console.log("🧹 Test user deleted");
  }
}

registerTests();

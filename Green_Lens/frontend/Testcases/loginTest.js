// .loginTest.js
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, getAuth, deleteUser } from "firebase/auth";
import { app } from '../firebaseConfig';

const auth = getAuth(app);

async function loginTest() {
  const email = `loginuser_${Date.now()}@example.com`;
  const password = "testPassword123";
  let testUser = null;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    testUser = userCredential.user;
    console.log("✅ Test user created");

    const loginCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Login successful:", loginCredential.user.email === email);

    try {
      await signInWithEmailAndPassword(auth, email, "wrongPassword");
      console.log("❌ Login with wrong password should fail");
    } catch (err) {
      console.log("✅ Login with wrong password failed as expected");
    }

  } catch (err) {
    console.error("❌ Error during login test:", err);
  } finally {
    if (testUser) {
      await deleteUser(testUser);
      console.log("🧹 Test user deleted");
    }
  }
}

loginTest();

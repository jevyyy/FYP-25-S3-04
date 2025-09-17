// seedUsers.js
// Run with: node seedUsers.js

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../firebaseConfig.js"; 

const auth = getAuth(app);
const db = getFirestore(app);

const users = [
  {
    email: "kuanxun4@gmail.com",
    password: "#Redjoker1412",
    name: "Admin1",
    username: "admin1",
    role: "admin",
  },
  {
    email: "killerx246@hotmail.com",
    password: "#Redjoker1412",
    name: "Developer1",
    username: "developer1",
    role: "developer",
  },
];

async function seedUsers() {
  for (const user of users) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const uid = userCredential.user.uid;

      // Firestore document with only the required fields
      await setDoc(doc(db, "users", uid), {
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
      });

      console.log(`✅ Created user: ${user.email} | role: ${user.role}`);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        console.log(`⚠️ User already exists: ${user.email}`);
      } else {
        console.error("❌ Error creating user:", error.message);
      }
    }
  }
}

seedUsers().then(() => {
  console.log("🎉 Seeding complete!");
  process.exit(0);
});

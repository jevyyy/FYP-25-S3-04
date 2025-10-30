// seedUsers.js
// Run with: node seedUsers.js

import admin from 'firebase-admin';
import fs from 'fs';

// Load service account JSON
const serviceAccount = JSON.parse(
  fs.readFileSync('./green-lens-47e9b-firebase-adminsdk-fbsvc-9af6311d8b.json', 'utf8')
);

// Initialize Admin SDK (safe check for re-run)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const users = [
  {
    email: "kuanxun4@gmail.com",
    password: "#Redjoker1412",
    name: "Admin1",
    username: "admin1",
    role: "admin",
    status: "active", // 👈 new field
  },
  {
    email: "killerx246@hotmail.com",
    password: "#Redjoker1412",
    name: "Developer1",
    username: "developer1",
    role: "developer",
    status: "active", // 👈 new field
  },
];

async function seedUsers() {
  for (const user of users) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      const uid = userCredential.user.uid;

      // Firestore document with role + status
      await setDoc(doc(db, "users", uid), {
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        status: user.status, // 👈 saved in Firestore
      });

      console.log(`✅ Created user: ${user.email} | role: ${user.role} | status: ${user.status}`);
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

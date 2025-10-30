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

// Default password for all users
const DEFAULT_PASSWORD = "#Redjoker1412";

const users = [
  {
    email: "kuanxun4@gmail.com",
    name: "Admin1",
    username: "admin1",
    role: "admin",
    status: "active", // 👈 new field
  },
  {
    email: "killerx246@hotmail.com",
    name: "Developer1",
    username: "developer1",
    role: "developer",
    status: "active", // 👈 new field
  },
];

async function seedUsers() {
  for (const user of users) {
    try {
      // Generate random score (0–30)
      const totalPoints = Math.floor(Math.random() * 30);

      // Check if user exists in Firebase Auth
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(user.email);
        console.log(`ℹ️ User already exists in Auth: ${user.email}`);
      } catch {
        // Create user if not found
        userRecord = await admin.auth().createUser({
          email: user.email,
          password: user.password,
          displayName: user.name,
        });
        console.log(`Created new Auth user: ${user.email}`);
      }

      const userRef = db.collection("users").doc(userRecord.uid);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        // Update existing Firestore doc
        await userRef.update({
          score: totalPoints,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Updated score for ${user.email} → ${totalPoints}`);
      } else {
        // Create new Firestore doc
        await userRef.set({
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
          status: user.status,
          score: totalPoints,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✅ Created Firestore doc for ${user.email} with score ${totalPoints}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${user.email}:`, error.message);
    }
  }
}

//Run the seeding process
seedUsers().then(() => {
  console.log("🎉 Seeding complete!");
  process.exit(0);
});
// seedUsers.js
import admin from "firebase-admin";
import fs from "fs";

// Load service account JSON
const serviceAccount = JSON.parse(
  fs.readFileSync("./green-lens-47e9b-firebase-adminsdk-fbsvc-9af6311d8b.json", "utf8")
);

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

//Default password for all users
const DEFAULT_PASSWORD = "#Redjoker1412";

//Generate 10 Admins + 10 Developers
function generateFixedAccounts() {
  const accounts = [];
  for (let i = 1; i <= 20; i++) {
    const suffix = String(i).padStart(3, "0");
    const isAdmin = i <= 10;
    const role = isAdmin ? "admin" : "developer";
    const username = `${role}${suffix}`;
    const email = `${username}@fyp.com`;
    const name = `${isAdmin ? "Admin" : "Developer"} ${suffix}`;

    accounts.push({
      email,
      name,
      username,
      role,
      status: "active",
      includePoints: false, // flag to skip totalPoints
    });
  }
  return accounts;
}

// Generate 10 Random Test Users (Role: user)
function generateRandomUsers(count = 10) {
  const users = [];
  for (let i = 1; i <= count; i++) {
    const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit unique suffix
    users.push({
      email: `testuser${randomNum}@fyp.com`,
      name: `Tester${i}`,
      username: `user${randomNum}`,
      role: "user",
      status: "active",
      includePoints: true, // flag to add totalPoints
    });
  }
  return users;
}

// Combine both sets
const users = [...generateFixedAccounts(), ...generateRandomUsers(10)];

// Seed Users into Firebase Auth + Firestore
async function seedUsers() {
  for (const user of users) {
    try {
      //Generate random totalPoints only if applicable
      const totalPoints = user.includePoints ? Math.floor(Math.random() * 51) : null;

      // Check if user exists in Firebase Auth
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(user.email);
        console.log(`ℹ️ User already exists: ${user.email}`);

        // Reset password + update displayName
        await admin.auth().updateUser(userRecord.uid, {
          password: DEFAULT_PASSWORD,
          displayName: user.name,
        });
        console.log(`🔐 Password reset for existing user: ${user.email}`);
      } catch {
        // Create user if not found
        userRecord = await admin.auth().createUser({
          email: user.email,
          password: DEFAULT_PASSWORD,
          displayName: user.name,
        });
        console.log(`✅ Created new Auth user: ${user.email}`);
      }

      // Prepare Firestore reference
      const userRef = db.collection("users").doc(userRecord.uid);
      const userDoc = await userRef.get();

      // Prepare common Firestore data
      const baseData = {
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        status: user.status,
      };

      if (userDoc.exists) {
        // Update Firestore doc
        await userRef.update({
          ...baseData,
          ...(user.includePoints && { totalPoints }),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(
          `🔁 Updated Firestore doc for ${user.email}${
            user.includePoints ? ` (totalPoints: ${totalPoints})` : ""
          }`
        );
      } else {
        // Create new Firestore doc
        await userRef.set({
          ...baseData,
          ...(user.includePoints && { totalPoints }),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(
          `🆕 Created Firestore doc for ${user.email}${
            user.includePoints ? ` (totalPoints: ${totalPoints})` : ""
          }`
        );
      }
    } catch (error) {
      console.error(`❌ Error processing ${user.email}:`, error.message);
    }
  }

  console.log("\n🎉 Seeding complete!");
  console.log("👥 Created 20 Admin/Developer + 10 Test User accounts");
  console.log("🔑 Default password for all: #Redjoker1412\n");
  process.exit(0);
}

seedUsers();

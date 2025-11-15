import admin from "firebase-admin";
import fs from "fs";

// Load the Firebase service account JSON
const serviceAccount = JSON.parse(
  fs.readFileSync("./green-lens-47e9b-firebase-adminsdk-fbsvc-0ffeb0f206.json", "utf8")
);

// Initialize Firebase Admin SDK only if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Default password used for all seeded users
const DEFAULT_PASSWORD = "#Redjoker1412";

// Generate named Admin accounts with email, username, and role
function generateAdmins() {
  const adminNames = [
    "Rachel Tan",
    "Isaac Lim",
    "Cheryl Ong",
    "Nicholas Lee",
    "Grace Ho",
    "Ryan Koh",
    "Celine Chua",
    "Marcus Goh",
    "Amanda Yeo",
    "Daniel Teo",
    "Aaron Tan",
    "Abigail Lim",
    "Adrian Koh",
    "Aileen Ong",
    "Alexis Chua",
    "Amelia Lau",
    "Andrew Lee",
    "Angela Toh",
    "Anthony Wong",
    "Ariel Low",
    "Ashley Tan",
    "Benjamin Chua",
    "Brandon Ng",
    "Brianna Koh",
    "Bryan Sim",
    "Caleb Goh",
    "Candice Ho",
    "Cheryl Lim",
    "Chris Tan",
    "Clara Ong",
    "Daniel Low",
    "David Ng",
    "Dylan Tay",
    "Elaine Wong",
    "Ethan Chua",
    "Evelyn Koh",
    "Faith Lim",
    "Felicia Tan",
    "Gabriel Lee",
    "Gavin Ho"
  ];

  return adminNames.map((name) => { 
    const username = name.toLowerCase().replace(/\s+/g, "");
    const email = `${username}@greenlens.com`;
    return {
      email,
      name,
      username,
      role: "Admin",
      status: "active",
      includePoints: false,
    };
  });
}

// Generate named Developer accounts with email, username, and role
function generateDevelopers() {
  const devNames = [
    "Lucas Wong",
    "Mei Lin Chen",
    "Benjamin Tan",
    "Irfan Rahim",
    "Natalie Lim",
    "Sean Toh",
    "Clara Ng",
    "Hafiz Abdullah",
    "Sophia Tay",
    "Darren Lau",
    "Grace Toh",
    "Hannah Ong",
    "Isabel Tan",
    "Isaac Sim",
    "Jacob Ng",
    "Jasmine Chua",
    "Jason Low",
    "Jeremy Koh",
    "Joanna Goh",
    "Joel Tan",
    "Joshua Lee",
    "Joyce Lim",
    "Justin Wong",
    "Keith Chua",
    "Kelly Sim",
    "Kenneth Low",
    "Kimberly Ong",
    "Kristen Tan",
    "Leonard Goh",
    "Lucas Koh",
    "Marcus Lee",
    "Megan Tan",
    "Melissa Lim",
    "Natalie Ho",
    "Nathan Chua",
    "Nicole Wong",
    "Oliver Ong",
    "Rachel Sim",
    "Ryan Tay",
    "Samuel Low"
  ];

  return devNames.map((name) => {
    const username = name.toLowerCase().replace(/\s+/g, "");
    const email = `${username}@greenlens.com`;
    return {
      email,
      name,
      username,
      role: "Developer",
      status: "active",
      includePoints: false,
    };
  });
}

// Generate regular User accounts with email, username, role, and points
function generateUsers() {
  const userNames = [
    "Emma Tan",
    "Jason Lim",
    "Nurul Azizah",
    "Benjamin Lee",
    "Sarah Koh",
    "David Ong",
    "Priya Raj",
    "Daniel Wong",
    "Hannah Ng",
    "Ethan Goh",
    "Sarah Tan",
    "Sophia Lim",
    "Theodore Chua",
    "Travis Goh",
    "Vanessa Goh",
    "Victoria Ong",
    "William Tan",
    "Xavier Ho",
    "Zachary Lim",
    "Zoe Lau",
    "Nur Aisyah Binte Rahman",
    "Siti Nurhaliza",
    "Wei Jie Tan",
    "Ahmad Farhan",
    "Rajesh Kumar",
    "Aarav Patel",
    "Liyana Binte Hassan",
    "Chen Wei Ming",
    "Tan Mei Ling",
    "Ng Li Fang",
    "Koh Wei Jie",
    "Priya Devi",
    "Aisyah Hassan",
    "Hafiz Bin Osman",
    "Lim Wei Ting",
    "Nurul Syafiqah",
    "Jason Ong",
    "Ravi Narayan",
    "Amirah Salleh",
    "Chong Jun Hao"
  ];

  return userNames.map((name) => {
    const username = name.toLowerCase().replace(/\s+/g, "");
    const email = `${username}@gmail.com`;
    return {
      email,
      name,
      username,
      role: "User",
      status: "active",
      includePoints: true,
    };
  });
}

// Combine Admins, Developers, and Users into a single array
const users = [...generateAdmins(), ...generateDevelopers(), ...generateUsers()];

// Seed all users into Firebase Auth and Firestore
async function seedUsers() {
  for (const user of users) {
    try {
      // Assign random totalPoints for regular users only
      const totalPoints = user.includePoints ? Math.floor(Math.random() * 5001) : null;

      // Check if user already exists in Firebase Auth
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(user.email);
        console.log(`ℹ️ User already exists: ${user.email}`);

        // Update password and display name if already exists
        await admin.auth().updateUser(userRecord.uid, {
          password: DEFAULT_PASSWORD,
          displayName: user.name,
        });
        console.log(`🔐 Updated existing Auth user: ${user.email}`);
      } catch {
        // Create a new Auth user if not found
        userRecord = await admin.auth().createUser({
          email: user.email,
          password: DEFAULT_PASSWORD,
          displayName: user.name,
        });
        console.log(`✅ Created new Auth user: ${user.email}`);
      }

      // Reference the user's Firestore document
      const userRef = db.collection("users").doc(userRecord.uid);
      const userDoc = await userRef.get();

      const baseData = {
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        status: user.status,
      };

      if (userDoc.exists) {
        // Update Firestore doc if it already exists
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
        // Create new Firestore doc if it doesn't exist
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

  // Log summary
  console.log("\n🎉 Seeding complete!");
  console.log("👩‍💼 10 Admins, 👨‍💻 10 Developers, 👤 10 Users created.");
  console.log("🔑 Default password for all: #Redjoker1412\n");
  process.exit(0);
}

// Run the function to populate Firestore
seedUsers();
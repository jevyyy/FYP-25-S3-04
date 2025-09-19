const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Go to Firebase Console > Project Settings > Service Accounts
// Generate New Private Key
// Save the JSON file locally (not in the repository, this is following security best practices to protect your users and application)
// then in the Green_Lens ForceTouchGestureHandler, create a file call ".env" and add this line: GOOGLE_APPLICATION_CREDENTIALS=C:\Path\To\your-firebase-credentials.json
// this .env file is exclusively yours, you MUST add it to .gitignore, do NOT commit the .env file to version control
// add this to your .gitignore: 
// *yourServiceAccountFileName.json
// .env
// finally run this line in your terminal: npm install dotenv
require('dotenv').config();
try {
  // Try environment variable first, fallback to local file
  const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS 
    ? require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : require('./local-service-account.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://green-lens-47e9b.firebasestorage.app'
  });

} catch (error) {
  console.error('Firebase credentials not found. Please set GOOGLE_APPLICATION_CREDENTIALS environment variable');
  process.exit(1);
}

const bucket = admin.storage().bucket();
const modelDir = path.join(__dirname, '../camera/tfjs_flower_model');


async function uploadModel() {
  const files = fs.readdirSync(modelDir);
  for (const file of files) {
    const filePath = path.join(modelDir, file);
    await bucket.upload(filePath, {
      destination: `tfjs_flower_model/${file}`,
      public: true, // Optional: make public for easy access
    });
    console.log(`Uploaded ${file}`);
  }
}

uploadModel().catch(console.error);
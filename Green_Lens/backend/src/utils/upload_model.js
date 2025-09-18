const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'gs://green-lens-47e9b.firebasestorage.app', 
});

const bucket = admin.storage().bucket();
const modelDir = path.join(__dirname, 'tfjs_flower_model');

async function uploadModel() {
  const files = fs.readdirSync(modelDir);
  for (const file of files) {
    const filePath = path.join(modelDir, file);
    await bucket.upload(filePath, {
      destination: `tfjs_model/${file}`,
      public: true, // Optional: make public for easy access
    });
    console.log(`Uploaded ${file}`);
  }
}

uploadModel().catch(console.error);
// const express = require('express');
// const tf = require('@tensorflow/tfjs-node');
// const admin = require('firebase-admin');
// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');

// const router = express.Router();

// // Initialize Firebase Admin
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
// });
// const db = admin.firestore();

// // Load the model once at startup
// let model;
// (async () => {
//   model = await tf.loadLayersModel('file://path/to/my_model.keras/model.json');
// })();

// // Helper: Download image from URI to local file
// async function downloadImage(uri, dest) {
//   const writer = fs.createWriteStream(dest);
//   const response = await axios({ url: uri, method: 'GET', responseType: 'stream' });
//   response.data.pipe(writer);
//   return new Promise((resolve, reject) => {
//     writer.on('finish', resolve);
//     writer.on('error', reject);
//   });
// }

// // Helper: Preprocess image for model
// async function preprocessImage(imagePath) {
//   const imageBuffer = fs.readFileSync(imagePath);
//   let tensor = tf.node.decodeImage(imageBuffer, 3);
//   tensor = tf.image.resizeBilinear(tensor, [224, 224]); // adjust to your model's input size
//   tensor = tensor.expandDims(0).div(255.0); // normalize if needed
//   return tensor;
// }

// // POST /classify
// router.post('/classify', async (req, res) => {
//   const { photoUri } = req.body;
//   if (!photoUri) return res.status(400).json({ error: 'photoUri required' });

//   const tempPath = path.join(__dirname, 'temp.jpg');
//   try {
//     // Download image
//     await downloadImage(photoUri, tempPath);

//     // Preprocess and predict
//     const inputTensor = await preprocessImage(tempPath);
//     const prediction = model.predict(inputTensor);
//     const predictedIdx = prediction.argMax(-1).dataSync()[0];

//     // Map index to flower ID (must match your model's class order)
//     const classMap = [
//       "blackberry_lily",
//       "morning_glory",
//       "mexican_aster",
//       "marigold",
//       "buttercup",
//       "sunflower",
//       "foxglove",
//       "canna_lily",
//       "hibiscus",
//       "rose"
//     ];
//     const flowerId = classMap[predictedIdx];

//     // Query Firestore for flower info
//     const doc = await db.collection('flowersInfo').doc(flowerId).get();
//     if (!doc.exists) return res.status(404).json({ error: 'Flower info not found' });

//     res.json({ flower: doc.data() });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   } finally {
//     // Clean up temp file
//     if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
//   }
// });

// module.exports = router;





// need to do convert keras to tfjs
// cmd to convert
// tensorflowjs_converter --input_format=keras my_model.keras ./tfjs_model 

// load:
// const model = await tf.loadLayersModel('file://path/to/tfjs_model/model.json');

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: '<YOUR_FIREBASE_STORAGE_BUCKET>', // e.g. 'your-app.appspot.com'
});

const bucket = admin.storage().bucket();
const modelDir = path.join(__dirname, 'tfjs_model');

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

// the one above is another file: upload_model_to_storage.js

// Download model files from Firebase Storage if not present or if a new version is available.
// Load the model from the downloaded files.
// Use the loaded model for prediction.
// Key points:

// Use a local cache directory for the model.
// On server start or when a new version is detected, download from Firebase Storage.
// This prevents model theft from the client, as the model is never sent to the frontend.

const express = require('express');
const tf = require('@tensorflow/tfjs-node');
const admin = require('firebase-admin');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: '<YOUR_FIREBASE_STORAGE_BUCKET>', // e.g. 'your-app.appspot.com'
});
const db = admin.firestore();
const bucket = admin.storage().bucket();

const MODEL_DIR = path.join(__dirname, 'model_cache');
const MODEL_FILES = ['model.json', 'group1-shard1of1.bin']; // Adjust if more shards

// Download model files from Firebase Storage if not present
async function ensureModelFiles() {
  if (!fs.existsSync(MODEL_DIR)) fs.mkdirSync(MODEL_DIR);

  for (const file of MODEL_FILES) {
    const localPath = path.join(MODEL_DIR, file);
    if (!fs.existsSync(localPath)) {
      const remoteFile = bucket.file(`tfjs_model/${file}`);
      await remoteFile.download({ destination: localPath });
      console.log(`Downloaded ${file} from Firebase Storage`);
    }
  }
}

// Load the model (ensure files first)
let model;
async function loadModel() {
  await ensureModelFiles();
  model = await tf.loadLayersModel('file://' + path.join(MODEL_DIR, 'model.json'));
  console.log('Model loaded from cache');
}

// On server start, load the model
loadModel();

// Helper: Download image from URI to local file
async function downloadImage(uri, dest) {
  const writer = fs.createWriteStream(dest);
  const response = await axios({ url: uri, method: 'GET', responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// Helper: Preprocess image for model
async function preprocessImage(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  let tensor = tf.node.decodeImage(imageBuffer, 3);
  tensor = tf.image.resizeBilinear(tensor, [224, 224]); // adjust to your model's input size
  tensor = tensor.expandDims(0).div(255.0); // normalize if needed
  return tensor;
}

// POST /classify
router.post('/classify', async (req, res) => {
  const { photoUri } = req.body;
  if (!photoUri) return res.status(400).json({ error: 'photoUri required' });

  const tempPath = path.join(__dirname, 'temp.jpg');
  try {
    // Download image
    await downloadImage(photoUri, tempPath);

    // Preprocess and predict
    const inputTensor = await preprocessImage(tempPath);
    const prediction = model.predict(inputTensor);
    const predictedIdx = prediction.argMax(-1).dataSync()[0];

    // Map index to flower ID (must match your model's class order)
    const classMap = [
      "blackberry_lily",
      "morning_glory",
      "mexican_aster",
      "marigold",
      "buttercup",
      "sunflower",
      "foxglove",
      "canna_lily",
      "hibiscus",
      "rose"
    ];
    const flowerId = classMap[predictedIdx];

    // Query Firestore for flower info
    const doc = await db.collection('flowersInfo').doc(flowerId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Flower info not found' });

    res.json({ flower: doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
});

module.exports = router;


1. Open your Ubuntu (WSL) terminal.
2. Navigate to your script location
cd ~
3. Create and activate a Python 3.10 virtual environment
python3.10 -m venv py310env
source py310env/bin/activate
4. Upgrade pip
pip install --upgrade pip
5. Install required packages
pip install tensorflow==2.15.0 tensorflow_decision_forests==1.8.1 tensorflowjs numpy==1.23.5
6. Run your conversion script
python keras_converter.py
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







// const admin = require('firebase-admin');
// const fs = require('fs');
// const path = require('path');

// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
//   storageBucket: 'gs://green-lens-47e9b.firebasestorage.app', 
// });

// const bucket = admin.storage().bucket();
// const modelDir = path.join(__dirname, '../camera/tfjs_flower_model');

// async function uploadModel() {
//   const files = fs.readdirSync(modelDir);
//   for (const file of files) {
//     const filePath = path.join(modelDir, file);
//     await bucket.upload(filePath, {
//       destination: `tfjs_flower_model/${file}`,
//       public: true, // Optional: make public for easy access
//     });
//     console.log(`Uploaded ${file}`);
//   }
// }

// uploadModel().catch(console.error);

// the one above is another file: upload_model_to_storage.js

Download model files from Firebase Storage if not present or if a new version is available.
Load the model from the downloaded files.
Use the loaded model for prediction.
Key points:

Use a local cache directory for the model.
On server start or when a new version is detected, download from Firebase Storage.
This prevents model theft from the client, as the model is never sent to the frontend.

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');


const router = express.Router();

// Set up multer for file uploads
// Set up multer for file uploads  
const upload = multer({ 
  dest: './uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads', { recursive: true });
}

// POST /classify - now handles file uploads
router.post('/classify', upload.single('image'), async (req, res) => {
  console.log('Classify endpoint hit!');
  console.log('File received:', req.file ? 'Yes' : 'No');
  
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    // Process the uploaded image
    const imagePath = req.file.path;
    console.log('Processing image:', imagePath);
    
    // Resize image to 224x224 (common ML input size)
    const processedImagePath = `./uploads/processed_${req.file.filename}.jpg`;
    await sharp(imagePath)
      .resize(224, 224)
      .jpeg({ quality: 90 })
      .toFile(processedImagePath);
    
    console.log('Image processed successfully');
    
    // Mock classification result for now
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
    
    // Random result for testing
    const randomIdx = Math.floor(Math.random() * classMap.length);
    const flowerId = classMap[randomIdx];
    
    // Mock flower data - replace this with actual database lookup
    const mockFlowerData = {
      name: flowerId.replace('_', ' ').toUpperCase(),
      description: `This is a ${flowerId.replace('_', ' ')}`,
      confidence: Math.random().toFixed(2)
    };
    
    // Clean up temporary files
    fs.unlinkSync(imagePath);
    fs.unlinkSync(processedImagePath);
    
    res.json({ flower: mockFlowerData });
    
  } catch (err) {
    console.error('Error processing image:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
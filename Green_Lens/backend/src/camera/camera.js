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

// Download model files from Firebase Storage if not present or if a new version is available.
// Load the model from the downloaded files.
// Use the loaded model for prediction.
// Key points:

// Use a local cache directory for the model.
// On server start or when a new version is detected, download from Firebase Storage.
// This prevents model theft from the client, as the model is never sent to the frontend.

// const tf = require('@tensorflow/tfjs-node');
// const admin = require('firebase-admin');
// const path = require('path');

// // Initialize Firebase Admin (if not already done)
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.applicationDefault(),
//     storageBucket: 'green-lens-47e9b.appspot.com'
//   });
// }

// let model = null; // Global model variable

// async function loadModel() {
//   try {
//     // Option 1: Load from local directory
//     // const modelPath = path.join(__dirname, 'tfjs_flower_model', 'model.json');
//     // model = await tf.loadLayersModel(`file://${modelPath}`);
//     // console.log('Model loaded successfully from local path');
    
//     // Option 2: Load from Firebase Storage URL (if you uploaded the model)
//     const modelUrl = 'https://storage.googleapis.com/green-lens-47e9b.appspot.com/tfjs_model/model.json';
//     model = await tf.loadLayersModel(modelUrl);
//     console.log('Model loaded successfully from Firebase');

//     return model;
//   } catch (error) {
//     console.error('Error loading model:', error);
//     throw error;
//   }
// }

// // Load model when server starts
// loadModel().catch(console.error);

const express = require('express');
const tf = require('@tensorflow/tfjs');
const admin = require('firebase-admin');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // storageBucket: 'green-lens-47e9b.appspot.com' // gs://green-lens-47e9b.firebasestorage.app
    // storageBucket: 'green-lens-47e9b.firebasestorage.app' // gs://green-lens-47e9b.firebasestorage.app
    storageBucket: 'green-lens-47e9b.firebasestorage.app'
  });
}

let model = null;

// async function loadModel() {
//   try {
//     // Load from Firebase Storage
//     const bucket = admin.storage().bucket();
//     const modelConfig = await bucket.file('tfjs_flower_model/model.json').download();
//     const modelJson = JSON.parse(modelConfig[0].toString());
    
//     // Get the base URL for the model files
//     // const baseUrl = 'https://storage.googleapis.com/green-lens-47e9b.appspot.com/tfjs_flower_model'; // gs://green-lens-47e9b.firebasestorage.app/tfjs_flower_model
//     // const baseUrl = 'gs://green-lens-47e9b.firebasestorage.app/tfjs_flower_model'; // gs://green-lens-47e9b.firebasestorage.app/tfjs_flower_model
//     const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/green-lens-47e9b.firebasestorage.app/o/tfjs_flower_model';

//     // Create a loader function that loads from Firebase Storage
//     const loadHandler = (path) => {
//       const finalPath = `${baseUrl}/${path}`;
//       return fetch(finalPath).then(response => response.arrayBuffer());
//     };

//     // Load the model with custom handler
//     model = await tf.loadLayersModel(tf.io.browserHTTPRequest(
//       `${baseUrl}/model.json`,
//       { requestInit: { cache: 'no-cache' }, loadHandler }
//     ));
    
//     console.log('Model loaded successfully from Firebase Storage');
//     return model;
//   } catch (error) {
//     console.error('Error loading model:', error);
//     throw error;
//   }
// }

// async function loadModel() {
//   try {
//     // Use HTTPS URL for loading model
//     const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/green-lens-47e9b.firebasestorage.app/o/tfjs_flower_model';
    
//     // Load model directly using HTTPS URL
//     model = await tf.loadLayersModel(`${baseUrl}/model.json`);
    
//     console.log('Model loaded successfully from Firebase Storage');
//     return model;
//   } catch (error) {
//     console.error('Error loading model:', error);
//     throw error;
//   }
// }

// async function loadModel() {
//   try {
//     // Firebase Storage download URL format
//     const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/green-lens-47e9b.firebasestorage.app/o';
    
//     // Load model using the correct URL format with alt=media parameter
//     model = await tf.loadLayersModel(`${baseUrl}/tfjs_flower_model%2Fmodel.json?alt=media`);
    
//     console.log('Model loaded successfully from Firebase Storage');
//     return model;
//   } catch (error) {
//     console.error('Error loading model:', error);
//     throw error;
//   }
// }

// async function loadModel() {
//   try {
//     const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/green-lens-47e9b.firebasestorage.app/o';
    
//     // Specify input shape when loading model
//     model = await tf.loadLayersModel(`${baseUrl}/tfjs_flower_model%2Fmodel.json?alt=media`, {
//       strict: false,
//       batchInputShape: [null, 224, 224, 3] // [batch_size, height, width, channels]
//     });
    
//     console.log('Model loaded successfully from Firebase Storage');
//     return model;
//   } catch (error) {
//     console.error('Error loading model:', error);
//     throw error;
//   }
// }

// async function loadModel() {
//   try {
//     const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/green-lens-47e9b.firebasestorage.app/o';
    
//     // Create a model first with input shape defined
//     const inputShape = [224, 224, 3]; // height, width, channels
//     const input = tf.input({shape: inputShape});
    
//     // Load weights from the model JSON
//     model = await tf.loadLayersModel(`${baseUrl}/tfjs_flower_model%2Fmodel.json?alt=media`, {
//       strict: false
//     });
    
//     console.log('Model loaded successfully from Firebase Storage');
//     return model;
//   } catch (error) {
//     console.error('Error loading model:', error);
    
//     // Try loading from local path as fallback
//     try {
//       console.log('Attempting to load model from local path...');
//       const modelPath = path.join(__dirname, 'tfjs_flower_model', 'model.json');
//       model = await tf.loadLayersModel(`file://${modelPath}`);
//       console.log('Model loaded successfully from local path');
//       return model;
//     } catch (localError) {
//       console.error('Error loading local model:', localError);
//       throw error; // Throw the original error
//     }
//   }
// }

// async function loadModel() {
//   try {
//     const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/green-lens-47e9b.firebasestorage.app/o';
    
//     // Pass the input shape directly to the loading function
//     model = await tf.loadLayersModel(`${baseUrl}/tfjs_flower_model%2Fmodel.json?alt=media`, {
//       inputShapes: [[null, 224, 224, 3]]  // [batch_size, height, width, channels]
//     });
    
//     console.log('Model loaded successfully from Firebase Storage');
//     return model;
//   } catch (error) {
//     console.error('Error loading model:', error);
//     throw error;
//   }
// }

async function loadModel() {
  try {
    // Load from local path
    const modelPath = path.join(__dirname, 'tfjs_flower_model', 'model.json');
    model = await tf.loadLayersModel(`file://${modelPath}`);
    console.log('Model loaded successfully from local path');
    return model;
  } catch (error) {
    console.error('Error loading model:', error);
    throw error;
  }
}

// Load model when server starts
loadModel().catch(console.error);

// ...existing code for image processing and classification...

router.get('/test', async (req, res) => {
  if (!model) {
    return res.status(500).json({ error: 'Model not loaded yet' });
  }
  res.json({ status: 'Model loaded and ready' });
});

module.exports = router;






// const express = require('express');
// const multer = require('multer');
// const sharp = require('sharp');
// const path = require('path');
// const fs = require('fs');
// const tf = require('@tensorflow/tfjs-node');

// // Load model from Firebase Storage
// async function loadModel() {
//   const modelPath = 'tfjs_model/model.json';
//   model = await tf.loadLayersModel(`https://storage.googleapis.com/green-lens-47e9b.firebasestorage.app/${modelPath}`);
//   return model;
// }

// const router = express.Router();  

// // Set up multer for file uploads
// // Set up multer for file uploads  
// const upload = multer({ 
//   dest: './uploads/',
//   limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
// });

// // Create uploads directory if it doesn't exist
// if (!fs.existsSync('./uploads')) {
//   fs.mkdirSync('./uploads', { recursive: true });
// }

// // POST /classify - now handles file uploads
// router.post('/classify', upload.single('image'), async (req, res) => {
//   console.log('Classify endpoint hit!');
//   console.log('File received:', req.file ? 'Yes' : 'No');
  
//   if (!req.file) {
//     return res.status(400).json({ error: 'No image file provided' });
//   }

//   try {
//     // Process the uploaded image
//     const imagePath = req.file.path;
//     console.log('Processing image:', imagePath);
    
//     // Resize image to 224x224 (common ML input size)
//     const processedImagePath = `./uploads/processed_${req.file.filename}.jpg`;
//     await sharp(imagePath)
//       .resize(224, 224)
//       .jpeg({ quality: 90 })
//       .toFile(processedImagePath);
    
//     console.log('Image processed successfully');
    
//     // Mock classification result for now
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
    
//     // Random result for testing
//     const randomIdx = Math.floor(Math.random() * classMap.length);
//     const flowerId = classMap[randomIdx];
    
//     // Mock flower data - replace this with actual database lookup
//     const mockFlowerData = {
//       name: flowerId.replace('_', ' ').toUpperCase(),
//       description: `This is a ${flowerId.replace('_', ' ')}`,
//       confidence: Math.random().toFixed(2)
//     };
    
//     // Clean up temporary files
//     fs.unlinkSync(imagePath);
//     fs.unlinkSync(processedImagePath);
    
//     res.json({ flower: mockFlowerData });
    
//   } catch (err) {
//     console.error('Error processing image:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
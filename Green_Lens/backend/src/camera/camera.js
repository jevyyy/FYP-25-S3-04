// // const express = require('express');
// // const tf = require('@tensorflow/tfjs-node');
// // const admin = require('firebase-admin');
// // const axios = require('axios');
// // const fs = require('fs');
// // const path = require('path');

// // const router = express.Router();

// // // Initialize Firebase Admin
// // admin.initializeApp({
// //   credential: admin.credential.applicationDefault(),
// // });
// // const db = admin.firestore();

// // // Load the model once at startup
// // let model;
// // (async () => {
// //   model = await tf.loadLayersModel('file://path/to/my_model.keras/model.json');
// // })();

// // // Helper: Download image from URI to local file
// // async function downloadImage(uri, dest) {
// //   const writer = fs.createWriteStream(dest);
// //   const response = await axios({ url: uri, method: 'GET', responseType: 'stream' });
// //   response.data.pipe(writer);
// //   return new Promise((resolve, reject) => {
// //     writer.on('finish', resolve);
// //     writer.on('error', reject);
// //   });
// // }

// // // Helper: Preprocess image for model
// // async function preprocessImage(imagePath) {
// //   const imageBuffer = fs.readFileSync(imagePath);
// //   let tensor = tf.node.decodeImage(imageBuffer, 3);
// //   tensor = tf.image.resizeBilinear(tensor, [224, 224]); // adjust to your model's input size
// //   tensor = tensor.expandDims(0).div(255.0); // normalize if needed
// //   return tensor;
// // }

// // // POST /classify
// // router.post('/classify', async (req, res) => {
// //   const { photoUri } = req.body;
// //   if (!photoUri) return res.status(400).json({ error: 'photoUri required' });

// //   const tempPath = path.join(__dirname, 'temp.jpg');
// //   try {
// //     // Download image
// //     await downloadImage(photoUri, tempPath);

// //     // Preprocess and predict
// //     const inputTensor = await preprocessImage(tempPath);
// //     const prediction = model.predict(inputTensor);
// //     const predictedIdx = prediction.argMax(-1).dataSync()[0];

// //     // Map index to flower ID (must match your model's class order)
// //     const classMap = [
// //       "blackberry_lily",
// //       "morning_glory",
// //       "mexican_aster",
// //       "marigold",
// //       "buttercup",
// //       "sunflower",
// //       "foxglove",
// //       "canna_lily",
// //       "hibiscus",
// //       "rose"
// //     ];
// //     const flowerId = classMap[predictedIdx];

// //     // Query Firestore for flower info
// //     const doc = await db.collection('flowersInfo').doc(flowerId).get();
// //     if (!doc.exists) return res.status(404).json({ error: 'Flower info not found' });

// //     res.json({ flower: doc.data() });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   } finally {
// //     // Clean up temp file
// //     if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
// //   }
// // });

// // module.exports = router;







// // const admin = require('firebase-admin');
// // const fs = require('fs');
// // const path = require('path');

// // admin.initializeApp({
// //   credential: admin.credential.applicationDefault(),
// //   storageBucket: 'gs://green-lens-47e9b.firebasestorage.app', 
// // });

// // const bucket = admin.storage().bucket();
// // const modelDir = path.join(__dirname, '../camera/tfjs_flower_model');

// // async function uploadModel() {
// //   const files = fs.readdirSync(modelDir);
// //   for (const file of files) {
// //     const filePath = path.join(modelDir, file);
// //     await bucket.upload(filePath, {
// //       destination: `tfjs_flower_model/${file}`,
// //       public: true, // Optional: make public for easy access
// //     });
// //     console.log(`Uploaded ${file}`);
// //   }
// // }

// // uploadModel().catch(console.error);

// // the one above is another file: upload_model_to_storage.js

// // Download model files from Firebase Storage if not present or if a new version is available.
// // Load the model from the downloaded files.
// // Use the loaded model for prediction.
// // Key points:

// // Use a local cache directory for the model.
// // On server start or when a new version is detected, download from Firebase Storage.
// // This prevents model theft from the client, as the model is never sent to the frontend.

// // const tf = require('@tensorflow/tfjs-node');
// // const admin = require('firebase-admin');
// // const path = require('path');

// // // Initialize Firebase Admin (if not already done)
// // if (!admin.apps.length) {
// //   admin.initializeApp({
// //     credential: admin.credential.applicationDefault(),
// //     storageBucket: 'green-lens-47e9b.appspot.com'
// //   });
// // }

// // let model = null; // Global model variable

// // async function loadModel() {
// //   try {
// //     // Option 1: Load from local directory
// //     // const modelPath = path.join(__dirname, 'tfjs_flower_model', 'model.json');
// //     // model = await tf.loadLayersModel(`file://${modelPath}`);
// //     // console.log('Model loaded successfully from local path');
    
// //     // Option 2: Load from Firebase Storage URL (if you uploaded the model)
// //     const modelUrl = 'https://storage.googleapis.com/green-lens-47e9b.appspot.com/tfjs_model/model.json';
// //     model = await tf.loadLayersModel(modelUrl);
// //     console.log('Model loaded successfully from Firebase');

// //     return model;
// //   } catch (error) {
// //     console.error('Error loading model:', error);
// //     throw error;
// //   }
// // }

// // // Load model when server starts
// // loadModel().catch(console.error);



// // Initialize Firebase Admin if not already initialized
// // if (!admin.apps.length) {
// //   admin.initializeApp({
// //     credential: admin.credential.applicationDefault(),
// //     // storageBucket: 'green-lens-47e9b.appspot.com' // gs://green-lens-47e9b.firebasestorage.app
// //     // storageBucket: 'green-lens-47e9b.firebasestorage.app' // gs://green-lens-47e9b.firebasestorage.app
// //     storageBucket: 'green-lens-47e9b.firebasestorage.app'
// //   });
// // }

// // Initialize Firebase Admin SDK with your service account
// // if (!admin.apps.length) {
// //   const serviceAccount = require(path.join(__dirname, '../..', 'service-account.json'));
// //   admin.initializeApp({
// //     credential: admin.credential.cert(serviceAccount),
// //     storageBucket: 'green-lens-47e9b.firebasestorage.app'
// //   });
// // }

// // const express = require('express');
// // const tf = require('@tensorflow/tfjs');
// // const admin = require('firebase-admin');
// // const multer = require('multer');
// // const sharp = require('sharp');
// // const path = require('path');
// // const fs = require('fs');
// // const tfnode = require('@tensorflow/tfjs-node');
// // // const tf = require('@tensorflow/tfjs-node');
// // const axios = require('axios');
// // const cors = require('cors');

// // const router = express.Router();
// // router.use(cors());
// // let model = null;

// // // Initialize Firebase Admin SDK
// // if (!admin.apps.length) {
// //   try {
// //     // Check for existing config in firebaseConfig.js
// //     const firebaseConfigPath = path.join(__dirname, '../../../firebaseConfig.js');
// //     const firebaseConfig = require(firebaseConfigPath);
    
// //     admin.initializeApp({
// //       credential: admin.credential.cert(firebaseConfig.serviceAccount || {
// //         projectId: "green-lens-47e9b",
// //         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
// //         privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
// //       }),
// //       storageBucket: "green-lens-47e9b.firebasestorage.app"
// //     });
// //   } catch (error) {
// //     console.error("Firebase admin initialization error:", error);
    
// //     // Fallback to applicationDefault if available
// //     admin.initializeApp({
// //       credential: admin.credential.applicationDefault(),
// //       storageBucket: "green-lens-47e9b.firebasestorage.app"
// //     });
// //   }
// // }

// // async function getSignedUrls() {
// //   try {
// //     const bucket = admin.storage().bucket();
    
// //     // Get model.json file
// //     const modelJsonFile = bucket.file('tfjs_flower_model/model.json');
// //     const [modelJsonUrl] = await modelJsonFile.getSignedUrl({
// //       action: 'read',
// //       expires: Date.now() + 1000 * 60 * 60, // 1 hour
// //     });
    
// //     console.log("Model JSON URL:", modelJsonUrl);
    
// //     // Get model.json content to find weight files
// //     const modelJsonResponse = await axios.get(modelJsonUrl);
// //     const modelJson = modelJsonResponse.data;
    
// //     // Create a modified model.json with signed URLs for each weight file
// //     const weightFilePromises = [];
    
// //     for (const group of modelJson.weightsManifest) {
// //       const newPaths = [];
// //       for (const weightPath of group.paths) {
// //         const weightFile = bucket.file(`tfjs_flower_model/${weightPath}`);
// //         const [weightUrl] = await weightFile.getSignedUrl({
// //           action: 'read',
// //           expires: Date.now() + 1000 * 60 * 60, // 1 hour
// //         });
        
// //         console.log(`Weight file ${weightPath} URL:`, weightUrl);
// //         newPaths.push(weightUrl);
// //       }
// //       group.paths = newPaths;
// //     }
    
// //     return { modelJson, modelJsonUrl };
// //   } catch (error) {
// //     console.error("Error getting signed URLs:", error);
// //     throw error;
// //   }
// // }

// // async function loadModel() {
// //   try {
// //     // Load from Firebase Storage
// //     const bucket = admin.storage().bucket();
// //     const modelConfig = await bucket.file('tfjs_flower_model/model.json').download();
// //     const modelJson = JSON.parse(modelConfig[0].toString());
    
// //     // Get the base URL for the model files
// //     // const baseUrl = 'https://storage.googleapis.com/green-lens-47e9b.appspot.com/tfjs_flower_model'; // gs://green-lens-47e9b.firebasestorage.app/tfjs_flower_model
// //     // const baseUrl = 'gs://green-lens-47e9b.firebasestorage.app/tfjs_flower_model'; // gs://green-lens-47e9b.firebasestorage.app/tfjs_flower_model
// //     const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/green-lens-47e9b.firebasestorage.app/o/tfjs_flower_model';

// //     // Create a loader function that loads from Firebase Storage
// //     const loadHandler = (path) => {
// //       const finalPath = `${baseUrl}/${path}`;
// //       return fetch(finalPath).then(response => response.arrayBuffer());
// //     };

// //     // Load the model with custom handler
// //     model = await tf.loadLayersModel(tf.io.browserHTTPRequest(
// //       `${baseUrl}/model.json`,
// //       { requestInit: { cache: 'no-cache' }, loadHandler }
// //     ));
    
// //     console.log('Model loaded successfully from Firebase Storage');
// //     return model;
// //   } catch (error) {
// //     console.error('Error loading model:', error);
// //     throw error;
// //   }
// // }

// // async function loadModel() {
// //   try {
// //     // Use HTTPS URL for loading model
// //     const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/green-lens-47e9b.firebasestorage.app/o/tfjs_flower_model';
    
// //     // Load model directly using HTTPS URL
// //     model = await tf.loadLayersModel(`${baseUrl}/model.json`);
    
// //     console.log('Model loaded successfully from Firebase Storage');
// //     return model;
// //   } catch (error) {
// //     console.error('Error loading model:', error);
// //     throw error;
// //   }
// // }

// // async function loadModel() {
// //   try {
// //     // Firebase Storage download URL format
// //     const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/green-lens-47e9b.firebasestorage.app/o';
    
// //     // Load model using the correct URL format with alt=media parameter
// //     model = await tf.loadLayersModel(`${baseUrl}/tfjs_flower_model%2Fmodel.json?alt=media`);
    
// //     console.log('Model loaded successfully from Firebase Storage');
// //     return model;
// //   } catch (error) {
// //     console.error('Error loading model:', error);
// //     throw error;
// //   }
// // }

// // async function loadModel() {
// //   try {
// //     const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/green-lens-47e9b.firebasestorage.app/o';
    
// //     // Specify input shape when loading model
// //     model = await tf.loadLayersModel(`${baseUrl}/tfjs_flower_model%2Fmodel.json?alt=media`, {
// //       strict: false,
// //       batchInputShape: [null, 224, 224, 3] // [batch_size, height, width, channels]
// //     });
    
// //     console.log('Model loaded successfully from Firebase Storage');
// //     return model;
// //   } catch (error) {
// //     console.error('Error loading model:', error);
// //     throw error;
// //   }
// // }

// // async function loadModel() {
// //   try {
// //     const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/green-lens-47e9b.firebasestorage.app/o';
    
// //     // Create a model first with input shape defined
// //     const inputShape = [224, 224, 3]; // height, width, channels
// //     const input = tf.input({shape: inputShape});
    
// //     // Load weights from the model JSON
// //     model = await tf.loadLayersModel(`${baseUrl}/tfjs_flower_model%2Fmodel.json?alt=media`, {
// //       strict: false
// //     });
    
// //     console.log('Model loaded successfully from Firebase Storage');
// //     return model;
// //   } catch (error) {
// //     console.error('Error loading model:', error);
    
// //     // Try loading from local path as fallback
// //     try {
// //       console.log('Attempting to load model from local path...');
// //       const modelPath = path.join(__dirname, 'tfjs_flower_model', 'model.json');
// //       model = await tf.loadLayersModel(`file://${modelPath}`);
// //       console.log('Model loaded successfully from local path');
// //       return model;
// //     } catch (localError) {
// //       console.error('Error loading local model:', localError);
// //       throw error; // Throw the original error
// //     }
// //   }
// // }

// // async function loadModel() {
// //   try {
// //     const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/green-lens-47e9b.firebasestorage.app/o';
    
// //     // Pass the input shape directly to the loading function
// //     model = await tf.loadLayersModel(`${baseUrl}/tfjs_flower_model%2Fmodel.json?alt=media`, {
// //       inputShapes: [[null, 224, 224, 3]]  // [batch_size, height, width, channels]
// //     });
    
// //     console.log('Model loaded successfully from Firebase Storage');
// //     return model;
// //   } catch (error) {
// //     console.error('Error loading model:', error);
// //     throw error;
// //   }
// // }

// // async function loadModel() {
// //   try {
// //     // Load from local path
// //     const modelPath = path.join(__dirname, 'tfjs_flower_model', 'model.json');
// //     model = await tf.loadLayersModel(`file://${modelPath}`);
// //     console.log('Model loaded successfully from local path');
// //     return model;
// //   } catch (error) {
// //     console.error('Error loading model:', error);
// //     throw error;
// //   }
// // }

// // // Load model when server starts
// // loadModel().catch(console.error);

// // // ...existing code for image processing and classification...

// // router.get('/test', async (req, res) => {
// //   if (!model) {
// //     return res.status(500).json({ error: 'Model not loaded yet' });
// //   }
// //   res.json({ status: 'Model loaded and ready' });
// // });

// // const path = require('path');








// // option 1 server can run but model just not loaded somehow, idek how its not loading everything is seemingly correct

// // async function loadModel() {
// //   const modelPath = path.join(__dirname, 'models', 'tfjs_flower_model', 'model.json');
// //   model = await tf.loadLayersModel(`file://${modelPath}`);
// //   return model;
// // }

// // const express = require('express');
// // const tf = require('@tensorflow/tfjs');
// // const path = require('path');

// // const router = express.Router();
// // let model = null;




// // option 2 but will have fetch error just from running server, idk how to fix

// // async function loadModel() {
// //   try {
// //     const modelPath = path.join(__dirname, 'tfjs_flower_model', 'model.json');
// //     console.log('Attempting to load model from:', modelPath);
    
// //     model = await tf.loadLayersModel(`file://${modelPath}`);
// //     console.log('Model loaded successfully from local path');
// //     return model;
// //   } catch (error) {
// //     console.error('Detailed error:', error);
// //     throw error;
// //   }
// // }

// // // Load model immediately when this file is required
// // (async () => {
// //   try {
// //     await loadModel();
// //     console.log('Model initialization complete');
// //   } catch (error) {
// //     console.error('Model initialization failed:', error);
// //   }
// // })();

// // option 3 havent test yet but its after c++ development build
// // npm install @tensorflow/tfjs-node

// // async function loadModel() {
// //   try {
// //     console.log("Getting signed URLs from Firebase Storage...");
// //     const { modelJson, modelJsonUrl } = await getSignedUrls();
    
// //     // Create a custom IOHandler to load the model
// //     const modelArtifacts = {
// //       modelTopology: modelJson.modelTopology,
// //       weightsManifest: modelJson.weightsManifest,
// //     };
    
// //     // Load model from the signed URL
// //     console.log("Loading model from Firebase Storage...");
// //     model = await tf.loadLayersModel(modelJsonUrl);
// //     console.log("Model loaded successfully!");
    
// //     return model;
// //   } catch (error) {
// //     console.error("Error loading model from Firebase Storage:", error);
// //     throw error;
// //   }
// // }

// // // Load the model when this module is loaded
// // (async () => {
// //   try {
// //     await loadModel();
// //     console.log("Model initialization complete");
// //   } catch (error) {
// //     console.error("Model initialization failed:", error);
// //   }
// // })();

// // router.get('/test', async (req, res) => {
// //   if (!model) {
// //     return res.status(500).json({ 
// //       error: 'Model not loaded yet',
// //       message: 'The model is still loading from Firebase Storage. Please try again in a moment.'
// //     });
// //   }

// // // // Add test endpoint
// // // router.get('/test', async (req, res) => {
// // //   if (!model) {
// // //     return res.status(500).json({ error: 'Model not loaded yet' });
// // //   }
// // //   res.json({ status: 'Model loaded and ready' });
// // // });

// //   res.json({ 
// //     status: 'Model loaded and ready from Firebase Storage',
// //     modelInfo: {
// //       inputShape: model.inputs[0].shape,
// //       outputShape: model.outputs[0].shape,
// //       layerCount: model.layers.length
// //     }
// //   });
// // });

// // module.exports = router;






// // const express = require('express');
// // const multer = require('multer');
// // const sharp = require('sharp');
// // const path = require('path');
// // const fs = require('fs');
// // const tf = require('@tensorflow/tfjs-node');

// // // Load model from Firebase Storage
// // async function loadModel() {
// //   const modelPath = 'tfjs_model/model.json';
// //   model = await tf.loadLayersModel(`https://storage.googleapis.com/green-lens-47e9b.firebasestorage.app/${modelPath}`);
// //   return model;
// // }

// // const router = express.Router();  

// // // Set up multer for file uploads
// // // Set up multer for file uploads  
// // const upload = multer({ 
// //   dest: './uploads/',
// //   limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
// // });

// // // Create uploads directory if it doesn't exist
// // if (!fs.existsSync('./uploads')) {
// //   fs.mkdirSync('./uploads', { recursive: true });
// // }

// // // POST /classify - now handles file uploads
// // router.post('/classify', upload.single('image'), async (req, res) => {
// //   console.log('Classify endpoint hit!');
// //   console.log('File received:', req.file ? 'Yes' : 'No');
  
// //   if (!req.file) {
// //     return res.status(400).json({ error: 'No image file provided' });
// //   }

// //   try {
// //     // Process the uploaded image
// //     const imagePath = req.file.path;
// //     console.log('Processing image:', imagePath);
    
// //     // Resize image to 224x224 (common ML input size)
// //     const processedImagePath = `./uploads/processed_${req.file.filename}.jpg`;
// //     await sharp(imagePath)
// //       .resize(224, 224)
// //       .jpeg({ quality: 90 })
// //       .toFile(processedImagePath);
    
// //     console.log('Image processed successfully');
    
// //     // Mock classification result for now
// //     const classMap = [
// //       "blackberry_lily",
// //       "morning_glory", 
// //       "mexican_aster",
// //       "marigold",
// //       "buttercup",
// //       "sunflower",
// //       "foxglove",
// //       "canna_lily",
// //       "hibiscus",
// //       "rose"
// //     ];
    
// //     // Random result for testing
// //     const randomIdx = Math.floor(Math.random() * classMap.length);
// //     const flowerId = classMap[randomIdx];
    
// //     // Mock flower data - replace this with actual database lookup
// //     const mockFlowerData = {
// //       name: flowerId.replace('_', ' ').toUpperCase(),
// //       description: `This is a ${flowerId.replace('_', ' ')}`,
// //       confidence: Math.random().toFixed(2)
// //     };
    
// //     // Clean up temporary files
// //     fs.unlinkSync(imagePath);
// //     fs.unlinkSync(processedImagePath);
    
// //     res.json({ flower: mockFlowerData });
    
// //   } catch (err) {
// //     console.error('Error processing image:', err);
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // module.exports = router;




// // const express = require('express');
// // const tf = require('@tensorflow/tfjs-node'); // Using the C++ accelerated version
// // const admin = require('firebase-admin');
// // const axios = require('axios');
// // const path = require('path');
// // const fs = require('fs');

// // const router = express.Router();
// // let model = null;

// // // --- 1. SECURELY INITIALIZE FIREBASE ADMIN ---
// // try {
// //     const serviceAccountPath = path.join(__dirname, '..', '..', 'service-account.json');
// //     if (!fs.existsSync(serviceAccountPath)) {
// //         throw new Error(`'service-account.json' not found in the 'backend' folder. Please download it from your Firebase project settings.`);
// //     }
// //     const serviceAccount = require(serviceAccountPath);
// //     admin.initializeApp({
// //         credential: admin.credential.cert(serviceAccount),
// //         storageBucket: 'green-lens-47e9b.firebasestorage.app'
// //     });
// // } catch (e) {
// //     console.error("FATAL: Firebase Admin SDK initialization failed.", e.message);
// // }

// // // --- 2. SECURELY LOAD THE MODEL ON THE SERVER AT STARTUP ---
// // async function loadModelFromServer() {
// //     if (!admin.apps.length) {
// //         console.error("Cannot load model, Firebase Admin is not initialized.");
// //         return;
// //     }
// //     try {
// //         console.log('Loading model from Firebase Storage into server memory...');
// //         const bucket = admin.storage().bucket();
        
// //         // Download model files into memory buffers
// //         const modelJsonPromise = bucket.file('tfjs_flower_model/model.json').download();
// //         const weights1Promise = bucket.file('tfjs_flower_model/group1-shard1of3.bin').download();
// //         const weights2Promise = bucket.file('tfjs_flower_model/group1-shard2of3.bin').download();
// //         const weights3Promise = bucket.file('tfjs_flower_model/group1-shard3of3.bin').download();

// //         const [
// //             modelJsonBuffer,
// //             weights1Buffer,
// //             weights2Buffer,
// //             weights3Buffer
// //         ] = await Promise.all([modelJsonPromise, weights1Promise, weights2Promise, weights3Promise]);

// //         // Create an in-memory IO handler for TensorFlow.js
// //         const modelJson = JSON.parse(modelJsonBuffer[0].toString());
// //         const weights = [
// //             weights1Buffer[0].buffer,
// //             weights2Buffer[0].buffer,
// //             weights3Buffer[0].buffer
// //         ];
// //         const memoryHandler = tf.io.fromMemory(modelJson, weights);
        
// //         // Load the model from the in-memory handler
// //         model = await tf.loadLayersModel(memoryHandler);
// //         console.log('Model loaded successfully and is ready for predictions.');

// //     } catch (error) {
// //         console.error('CRITICAL: Failed to load model from Firebase Storage.', error);
// //     }
// // }

// // // --- 3. PREPROCESS THE USER'S IMAGE ---
// // async function preprocessImage(imageBuffer) {
// //     const tensor = tf.node.decodeImage(imageBuffer, 3) // Decode image to a tensor
// //         .resizeNearestNeighbor([224, 224]) // Resize to model's expected input size
// //         .toFloat()
// //         .div(tf.scalar(255.0)) // Normalize pixel values to [0, 1]
// //         .expandDims(); // Add a batch dimension
// //     return tensor;
// // }

// // // --- 4. THE CLASSIFICATION API ENDPOINT ---
// // router.post('/classify', async (req, res) => {
// //     if (!model) {
// //         return res.status(503).json({ error: 'Model is not ready, please try again later.' });
// //     }
// //     const { imageUri } = req.body;
// //     if (!imageUri) {
// //         return res.status(400).json({ error: 'Missing "imageUri" in request body.' });
// //     }

// //     try {
// //         // Download the user's image from the provided URI
// //         const imageResponse = await axios.get(imageUri, { responseType: 'arraybuffer' });
// //         const imageBuffer = Buffer.from(imageResponse.data, 'binary');

// //         // Preprocess the image
// //         const inputTensor = await preprocessImage(imageBuffer);

// //         // Make a prediction
// //         const prediction = model.predict(inputTensor);
        
// //         // Get the result
// //         const scores = await prediction.data();
// //         const predictedIndex = prediction.argMax(-1).dataSync()[0];
// //         const confidence = scores[predictedIndex];

// //         // Map the index to your flower names
// //         const classMap = [
// //             "blackberry_lily", "morning_glory", "mexican_aster", "marigold",
// //             "buttercup", "sunflower", "foxglove", "canna_lily", "hibiscus", "rose"
// //         ];
// //         const flowerName = classMap[predictedIndex];

// //         // Clean up tensors
// //         inputTensor.dispose();
// //         prediction.dispose();

// //         // Send the response
// //         res.json({
// //             flowerName: flowerName,
// //             confidence: confidence
// //         });

// //     } catch (err) {
// //         console.error("Error during classification:", err);
// //         res.status(500).json({ error: 'Failed to classify image.', details: err.message });
// //     }
// // });

// // // Start loading the model as soon as the server starts
// // loadModelFromServer();

// // module.exports = router;




// const express = require('express');
// const tf = require('@tensorflow/tfjs');
// const admin = require('firebase-admin');
// const axios = require('axios');
// const path = require('path');
// const fs = require('fs');
// const sharp = require('sharp');

// let model = null;

// // --- 1. SECURELY INITIALIZE FIREBASE ADMIN ---
// try {
//     const serviceAccountPath = path.join(__dirname, '..', '..', 'service-account.json');
//     if (!fs.existsSync(serviceAccountPath)) {
//         throw new Error(`'service-account.json' not found in the 'backend' folder.`);
//     }
//     const serviceAccount = require(serviceAccountPath);
//     admin.initializeApp({
//         credential: admin.credential.cert(serviceAccount),
//         storageBucket: 'green-lens-47e9b.firebasestorage.app'
//     });
// } catch (e) {
//     console.error("FATAL: Firebase Admin SDK initialization failed.", e.message);
// }

// // --- 2. FUNCTION TO LOAD THE MODEL ---
// // This will be called from server.js AFTER the server has started.
// async function initializeModel() {
//     if (model) return model; // If already loaded, do nothing.
//     if (!admin.apps.length) return null;

//     const tempDir = path.join(__dirname, 'temp_model_storage');
//     const modelJsonPath = path.join(tempDir, 'model.json');

//     try {
//         if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

//         console.log('Downloading model files from Firebase to server...');
//         const bucket = admin.storage().bucket();
        
//         await bucket.file('tfjs_flower_model/model.json').download({ destination: modelJsonPath });
//         const modelJson = JSON.parse(fs.readFileSync(modelJsonPath, 'utf8'));

//         for (const manifest of modelJson.weightsManifest) {
//             for (const weightPath of manifest.paths) {
//                 const localWeightPath = path.join(tempDir, weightPath);
//                 if (!fs.existsSync(localWeightPath)) { // Download only if it doesn't exist
//                     await bucket.file(`tfjs_flower_model/${weightPath}`).download({ destination: localWeightPath });
//                 }
//             }
//         }

//         console.log('Files downloaded. Loading model from local HTTP endpoint...');
//         // THIS IS THE FIX: Load from the URL that server.js will create.
//         model = await tf.loadLayersModel('http://localhost:3000/model-files/model.json');
        
//         console.log('SUCCESS: Model is loaded and ready for predictions.');
//         return model;

//     } catch (error) {
//         console.error('CRITICAL: Failed to load model.', error);
//         return null;
//     }
// }

// // --- 3. PREPROCESS THE USER'S IMAGE ---
// async function preprocessImage(imageBuffer) {
//     const { data, info } = await sharp(imageBuffer).raw().toBuffer({ resolveWithObject: true });
//     const tensor = tf.tensor3d(data, [info.height, info.width, info.channels])
//         .resizeNearestNeighbor([224, 224])
//         .toFloat()
//         .div(tf.scalar(255.0))
//         .expandDims();
//     return tensor;
// }

// // --- 4. CREATE THE ROUTER ---
// const router = express.Router();

// router.post('/classify', async (req, res) => {
//     if (!model) {
//         return res.status(503).json({ error: 'Model is not ready, please try again later.' });
//     }
//     const { imageUri } = req.body;
//     if (!imageUri) {
//         return res.status(400).json({ error: 'Missing "imageUri" in request body.' });
//     }

//     try {
//         const imageResponse = await axios.get(imageUri, { responseType: 'arraybuffer' });
//         const imageBuffer = Buffer.from(imageResponse.data, 'binary');

//         const inputTensor = await preprocessImage(imageBuffer);
//         const prediction = model.predict(inputTensor);
//         const scores = await prediction.data();
//         const predictedIndex = prediction.argMax(-1).dataSync()[0];
        
//         const classMap = ["blackberry_lily", "morning_glory", "mexican_aster", "marigold", "buttercup", "sunflower", "foxglove", "canna_lily", "hibiscus", "rose"];
        
//         res.json({
//             flowerName: classMap[predictedIndex],
//             confidence: scores[predictedIndex]
//         });

//         tf.dispose([inputTensor, prediction]);

//     } catch (err) {
//         console.error("Error during classification:", err);
//         res.status(500).json({ error: 'Failed to classify image.', details: err.message });
//     }
// });

// // Export both the function to load the model and the router itself
// module.exports = { initializeModel, cameraRoutes: router };

const express = require('express');
const tf = require('@tensorflow/tfjs');
const admin = require('firebase-admin');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: os.tmpdir() });

let model;
let classNamesMap; // Will hold {'0': '1', '1': '10', ...}
let flowerNamesDict; // Will hold {'1': 'pink primrose', '10': 'globe thistle', ...}

const BUCKET_NAME = 'green-lens-47e9b.firebasestorage.app';
const MODEL_REMOTE_PATH = 'tfjs_flower_model/model.json';
const LOCAL_MODEL_DIR = path.join(os.tmpdir(), 'tfjs_model');
const LOCAL_MODEL_PATH = path.join(LOCAL_MODEL_DIR, 'model.json');

// Function to load JSON files ---
function loadDictionaries() {
  try {
    const classNamesPath = path.join(__dirname, 'class_names.json');
    const flowerNamesPath = path.join(__dirname, 'classes_to_name_dictionary.json');

    const classNamesRaw = fs.readFileSync(classNamesPath);
    classNamesMap = JSON.parse(classNamesRaw);

    const flowerNamesRaw = fs.readFileSync(flowerNamesPath);
    flowerNamesDict = JSON.parse(flowerNamesRaw);

    console.log('SUCCESS: Decoders loaded. Class mapping and flower names are ready.');
  } catch (error) {
    console.error('CRITICAL: Failed to load JSON dictionaries.', error);
    process.exit(1); // Exit if we can't decode predictions
  }
}

async function downloadFile(bucket, srcFilename, destFilename) {
  const options = { destination: destFilename };
  await bucket.file(srcFilename).download(options);
}

async function loadModel() {
  console.log('Downloading model files from Firebase to server...');
  if (!fs.existsSync(LOCAL_MODEL_DIR)) {
    fs.mkdirSync(LOCAL_MODEL_DIR, { recursive: true });
  }

  try {
    const bucket = admin.storage().bucket(BUCKET_NAME);
    const [files] = await bucket.getFiles({ prefix: 'tfjs_flower_model/' });

    for (const file of files) {
      const destPath = path.join(LOCAL_MODEL_DIR, path.basename(file.name));
      await downloadFile(bucket, file.name, destPath);
    }

    console.log('Files downloaded. Loading model from local file system...');
    model = await tf.loadLayersModel(`file://${LOCAL_MODEL_PATH}`);
    console.log('SUCCESS: Model is loaded and ready for predictions.');
  } catch (error) {
    console.error('CRITICAL: Failed to load model.', error);
  }
}

// --- Load everything on startup ---
loadDictionaries();
loadModel();

router.post('/classify', upload.single('image'), async (req, res) => {
  if (!model) {
    return res.status(503).send({ error: 'Model is not loaded yet.' });
  }
  if (!req.file) {
    return res.status(400).send({ error: 'No image file uploaded.' });
  }

  try {
    const imageBuffer = fs.readFileSync(req.file.path);
    const tensor = tf.node.decodeImage(imageBuffer, 3)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .expandDims();

    // The model expects input to be preprocessed using preprocess_input logic
    // which scales pixels between -1 and 1.
    const preprocessedTensor = tensor.div(127.5).sub(1);

    const predictions = model.predict(preprocessedTensor);
    const predictedIndex = predictions.as1D().argMax().dataSync()[0];

    // Two-Step Lookup to get the final flower name ---
    // Step 1: Use the model's output index to get the folder name (e.g., 1 -> "10")
    const folderName = classNamesMap[predictedIndex];

    // Step 2: Use the folder name to get the human-readable flower name (e.g., "10" -> "globe thistle")
    const flowerName = flowerNamesDict[folderName];

    console.log(`Prediction: Index=${predictedIndex}, Folder=${folderName}, Name=${flowerName}`);

    res.status(200).send({
      predictedClassName: flowerName,
      predictedFolder: folderName,
      predictedIndex: predictedIndex,
    });

  } catch (error) {
    console.error('Error during classification:', error);
    res.status(500).send({ error: 'Failed to classify image.' });
  } finally {
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);
  }
});

module.exports = router;
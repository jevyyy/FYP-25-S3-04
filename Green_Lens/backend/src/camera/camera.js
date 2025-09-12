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
});
const db = admin.firestore();

// Load the model once at startup
let model;
(async () => {
  model = await tf.loadLayersModel('file://path/to/my_model.keras/model.json');
})();

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





// need to do convert keras to tfjs
// cmd to convert
// tensorflowjs_converter --input_format=keras my_model.keras ./tfjs_model 

// load:
// const model = await tf.loadLayersModel('file://path/to/tfjs_model/model.json');
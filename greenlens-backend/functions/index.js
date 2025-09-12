// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const FormData = require('form-data');
const Busboy = require('busboy');

admin.initializeApp();
const db = admin.firestore();

// Main identification endpoint
exports.identifyImage = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const { imageBase64, type } = await parseRequest(req);
    
    if (!imageBase64 || !type) {
      res.status(400).json({ error: 'Missing imageBase64 or type (plant/architecture)' });
      return;
    }

    let result;
    if (type === 'plant') {
      result = await identifyPlant(imageBase64);
    } else if (type === 'architecture') {
      result = await identifyArchitecture(imageBase64);
    } else {
      res.status(400).json({ error: 'Type must be "plant" or "architecture"' });
      return;
    }

    // Save to Firestore
    const docRef = await db.collection('identifications').add({
      type,
      result,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      confidence: result.confidence || 0
    });

    res.json({
      success: true,
      id: docRef.id,
      result: result,
      type: type
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Identification failed',
      details: error.message 
    });
  }
});

// Plant identification using PlantNet API
async function identifyPlant(imageBase64) {
  try {
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    
    const formData = new FormData();
    formData.append('images', imageBuffer, { filename: 'plant.jpg' });
    formData.append('modifiers', '["crops","flowering","leaf","fruit","bark"]');
    formData.append('project', 'all');
    formData.append('api-key', 'YOUR_PLANTNET_API_KEY'); // Get free key from plantnet.org

    const response = await axios.post(
      'https://my-api.plantnet.org/v1/identify/all',
      formData,
      { headers: formData.getHeaders() }
    );

    if (response.data.results && response.data.results.length > 0) {
      const topResult = response.data.results[0];
      return {
        name: topResult.species.scientificNameWithoutAuthor,
        commonNames: topResult.species.commonNames || [],
        confidence: Math.round(topResult.score * 100),
        family: topResult.species.family?.scientificNameWithoutAuthor,
        source: 'PlantNet'
      };
    }

    return { name: 'Unknown plant', confidence: 0, source: 'PlantNet' };
  } catch (error) {
    console.error('PlantNet API error:', error.message);
    // Fallback to mock result for prototype
    return {
      name: 'Sample Plant Species',
      commonNames: ['Common Plant'],
      confidence: 75,
      family: 'Plantaceae',
      source: 'Mock (PlantNet unavailable)'
    };
  }
}

// Architecture identification using Google Vision AI
async function identifyArchitecture(imageBase64) {
  try {
    // For prototype, we'll use a simple approach with landmark detection
    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient();

    const request = {
      image: { content: imageBase64 },
      features: [
        { type: 'LANDMARK_DETECTION', maxResults: 3 },
        { type: 'LABEL_DETECTION', maxResults: 10 }
      ]
    };

    const [result] = await client.annotateImage(request);
    
    // Check for landmarks first
    const landmarks = result.landmarkAnnotations || [];
    if (landmarks.length > 0) {
      const topLandmark = landmarks[0];
      return {
        name: topLandmark.description,
        type: 'landmark',
        confidence: Math.round(topLandmark.score * 100),
        location: topLandmark.locations?.[0]?.latLng,
        source: 'Google Vision'
      };
    }

    // Fall back to label detection for architectural features
    const labels = result.labelAnnotations || [];
    const architectureLabels = labels.filter(label => 
      ['building', 'architecture', 'landmark', 'monument', 'structure', 
       'church', 'house', 'bridge', 'tower', 'castle'].some(keyword => 
        label.description.toLowerCase().includes(keyword)
      )
    );

    if (architectureLabels.length > 0) {
      const topLabel = architectureLabels[0];
      return {
        name: topLabel.description,
        type: 'building',
        confidence: Math.round(topLabel.score * 100),
        source: 'Google Vision'
      };
    }

    return { name: 'Unknown architecture', confidence: 0, source: 'Google Vision' };

  } catch (error) {
    console.error('Vision API error:', error.message);
    // Fallback to mock result for prototype
    return {
      name: 'Sample Building',
      type: 'building',
      confidence: 80,
      source: 'Mock (Vision API unavailable)'
    };
  }
}

// Helper function to parse multipart request
function parseRequest(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    let imageBase64 = '';
    let type = '';

    busboy.on('field', (fieldname, val) => {
      if (fieldname === 'type') {
        type = val;
      }
    });

    busboy.on('file', (fieldname, file) => {
      if (fieldname === 'image') {
        const chunks = [];
        file.on('data', (chunk) => chunks.push(chunk));
        file.on('end', () => {
          imageBase64 = Buffer.concat(chunks).toString('base64');
        });
      }
    });

    busboy.on('finish', () => {
      resolve({ imageBase64, type });
    });

    busboy.on('error', reject);
    req.pipe(busboy);
  });
}

// Simple test endpoint
exports.test = functions.https.onRequest((req, res) => {
  res.json({ message: 'GreenLens backend is running!', timestamp: new Date() });
});
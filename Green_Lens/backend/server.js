// const express = require('express');
// const cameraRoutes = require('./src/camera/camera.js');

// const app = express();
// const port = 3000;

// // Add middleware for JSON parsing
// app.use(express.json());

// // Mount the camera routes
// app.use('/camera', cameraRoutes);

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
//   console.log(`Test endpoint available at http://localhost:${port}/camera/test`);
// });




// const express = require('express');
// const path = require('path');
// const { initializeModel, cameraRoutes } = require('./src/camera/camera.js');

// const app = express();
// const port = 3000;

// // Middleware to parse JSON bodies
// app.use(express.json());

// // THIS IS THE FIX: Create a static route to serve the downloaded model files
// const modelDir = path.join(__dirname, 'src', 'camera', 'temp_model_storage');
// app.use('/model-files', express.static(modelDir));

// // Mount the camera routes
// app.use('/camera', cameraRoutes);

// // Start the server and then load the model
// app.listen(port, async () => {
//   console.log(`Server running at http://localhost:${port}`);
//   console.log(`Test classification at POST http://localhost:${port}/camera/classify`);
  
//   // Now that the server is running, we can load the model from its URL
//   await initializeModel();
// });



const express = require('express');
const admin = require('firebase-admin');

// --- This is the only change needed for Firebase initialization ---
// Load the service account key from the file system.
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'green-lens-47e9b.firebasestorage.app' // Make sure this is your bucket name
});

console.log('Firebase Admin initialized.');
// --- End Firebase initialization ---


// Now that Firebase is initialized, we can load the camera module
// which depends on it.
const cameraRoutes = require('./src/camera/camera.js');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Mount the camera routes. The camera.js file handles its own model loading.
app.use('/camera', cameraRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Test classification at POST http://localhost:${port}/camera/classify`);
});
// Listens for request that comes to this port then handle them accordingly, the server also have admin rights to bypass all security rules

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
// telling the server where to load the module from
const cameraRoutes = require('./src/camera/camera.js');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Mount the camera routes. The camera.js file handles its own model loading.
// Send the request to camera
// Directs traffic, directs all request starting with /camera to camera.js
app.use('/camera', cameraRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Test classification at POST http://localhost:${port}/camera/classify`);
});
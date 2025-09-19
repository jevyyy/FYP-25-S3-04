const express = require('express');
const cameraRoutes = require('./src/camera/camera.js');

const app = express();
const port = 3000;

// Add middleware for JSON parsing
app.use(express.json());

// Mount the camera routes
app.use('/camera', cameraRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Test endpoint available at http://localhost:${port}/camera/test`);
});
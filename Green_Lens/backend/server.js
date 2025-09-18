const express = require('express');
const cors = require('cors');
const path = require('path');
const cameraRouter = require('./src/camera/camera');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Add this line after your other middleware
app.use('/models', express.static(path.join(__dirname, 'src/camera')));

// Routes
app.use('/', cameraRouter);

// Basic test route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
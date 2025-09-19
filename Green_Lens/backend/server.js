import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import your camera router - make sure camera.js uses ES modules too
import cameraRouter from './src/camera/camera.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Add this line after your other middleware
app.use('/models', express.static(path.join(__dirname, 'src/camera')));

// Add this health check endpoint before your routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'Server is running',
    modelLoaded: false // Set to false if you haven't loaded your ML model yet
  });
});

// Routes
app.use('/', cameraRouter);

// Basic test route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
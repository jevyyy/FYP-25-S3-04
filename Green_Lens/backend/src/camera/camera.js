import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export default router;

// need to do convert keras to tfjs
// cmd to convert
// tensorflowjs_converter --input_format=keras my_model.keras ./tfjs_model 

// load:
// const model = await tf.loadLayersModel('file://path/to/tfjs_model/model.json');
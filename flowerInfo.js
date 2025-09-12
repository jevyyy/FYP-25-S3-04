import { app, db } from './firebaseConfig.js';
import { getFirestore, collection, addDoc, setDoc } from 'firebase/firestore';

// const db = getFirestore(app);

const flowersInfo =[
  {
    "id": "blackberry_lily",
    "name": "Blackberry Lily",
    "description": "A perennial flowering plant known for its unique spotted flowers and seed pods that resemble blackberries.",
    "characteristics": "Spotted orange flowers, grass-like foliage, blackberry-like seed clusters, drought-tolerant"
  },
  {
    "id": "morning_glory",
    "name": "Morning Glory",
    "description": "A fast-growing climbing vine famous for its trumpet-shaped flowers that open in the morning and close in the afternoon.",
    "characteristics": "Trumpet-shaped flowers, heart-shaped leaves, climbing vine, daily blooming cycle"
  },
  {
    "id": "mexican_aster",
    "name": "Mexican Aster",
    "description": "A vibrant flowering plant that produces daisy-like flowers in various colors, native to Mexico and Central America.",
    "characteristics": "Daisy-like flowers, long blooming period, attracts butterflies, drought-resistant"
  },
  {
    "id": "marigold",
    "name": "Marigold",
    "description": "A popular garden flower known for its bright orange and yellow blooms and distinctive pungent aroma.",
    "characteristics": "Bright orange/yellow flowers, pungent scent, pest-repellent properties, easy to grow"
  },
  {
    "id": "buttercup",
    "name": "Buttercup",
    "description": "A cheerful wildflower with glossy yellow petals that appear to glow due to their unique light-reflecting properties.",
    "characteristics": "Glossy yellow petals, cup-shaped flowers, toxic to animals, moist soil preference"
  },
  {
    "id": "sunflower",
    "name": "Sunflower",
    "description": "A tall, iconic flower known for its large brown center surrounded by bright yellow petals that track the sun's movement.",
    "characteristics": "Large flower heads, sun-tracking behavior, edible seeds, tall growth habit"
  },
  {
    "id": "foxglove",
    "name": "Foxglove",
    "description": "A tall, elegant plant with tubular flowers that grow on spikes, known for its medicinal properties and toxicity.",
    "characteristics": "Tubular bell-shaped flowers, tall flower spikes, digitalis source, biennial growth cycle"
  },
  {
    "id": "canna_lily",
    "name": "Canna Lily",
    "description": "A tropical-looking plant with large, banana-like leaves and showy flowers in vibrant colors.",
    "characteristics": "Large tropical leaves, showy iris-like flowers, rhizomatous roots, heat-loving"
  },
  {
    "id": "hibiscus",
    "name": "Hibiscus",
    "description": "A tropical shrub known for its large, colorful, trumpet-shaped flowers with prominent stamens.",
    "characteristics": "Large trumpet-shaped flowers, prominent central stamens, glossy leaves, tropical origin"
  },
  {
    "id": "rose",
    "name": "Rose",
    "description": "A classic flowering shrub renowned for its beautiful, fragrant flowers and thorny stems.",
    "characteristics": "Fragrant layered petals, thorny stems, various colors, symbolic meaning"
  }
]

// async function loadFlowerIntoDB() {
//   const collectionRef = db.collection('flowersInfo');
  
//   for (const flower of flowersInfo) {
//     await collectionRef.doc(flower.id).set(flower);
//     console.log(`Added ${flower.name} to Firestore`);
//   }
  
//   console.log('All flowers uploaded successfully!');
// }

// loadFlowerIntoDB().catch(console.error);

async function loadFlowerIntoDB() {
  try {
    for (const flower of flowersInfo) {
      // Create a reference to the document with the custom ID
      const docRef = doc(db, 'flowersInfo', flower.id);
      // Set the document data
      await setDoc(docRef, flower);
      console.log(`Added ${flower.name} to Firestore`);
    }
    console.log('🎉 All flowers uploaded successfully!');
  } catch (error) {
    console.error('❌ Error uploading flowers:', error);
  }
}

loadFlowerIntoDB();
// seedQuestions.js
import admin from 'firebase-admin';
import fs from 'fs';

// Load service account JSON
const serviceAccount = JSON.parse(
  fs.readFileSync('./green-lens-47e9b-firebase-adminsdk-fbsvc-9af6311d8b.json', 'utf8')
);

// Initialize Admin SDK (safe check for re-run)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Sample questions
const questions = [
  // Flower
  {
    category: 'Flower',
    question: "What flower is red and often given on Valentine's Day?",
    options: ['Rose', 'Marigold', 'Sunflower', 'Tulip'],
    correctAnswer: 'Rose',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/flower/rose.jpg',
  },
  {
    category: 'Flower',
    question: 'Which flower is yellow and commonly associated with friendship?',
    options: ['Rose', 'Marigold', 'Sunflower', 'Tulip'],
    correctAnswer: 'Sunflower',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/flower/sunflower.jpg',
  },
  {
    category: 'Flower',
    question: 'Which flower is often seen during spring and comes in multiple colors?',
    options: ['Rose', 'Marigold', 'Sunflower', 'Tulip'],
    correctAnswer: 'Tulip',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/flower/tulip.jpg',
  },

  // Plant
  {
    category: 'Plant',
    question: 'Which plant is known for storing water in its leaves?',
    options: ['Cactus', 'Fern', 'Bamboo', 'Pine'],
    correctAnswer: 'Cactus',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/plant/cactus.jpg',
  },
  {
    category: 'Plant',
    question: 'Which plant has feathery leaves and grows in shaded areas?',
    options: ['Cactus', 'Fern', 'Bamboo', 'Pine'],
    correctAnswer: 'Fern',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/plant/fern.jpg',
  },
  {
    category: 'Plant',
    question: 'Which plant is tall, hollow, and used in construction or decoration?',
    options: ['Cactus', 'Fern', 'Bamboo', 'Pine'],
    correctAnswer: 'Bamboo',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/plant/bamboo.jpg',
  },

  // Architecture
  {
    category: 'Architecture',
    question: 'Which building is in Paris?',
    options: ['Eiffel Tower', 'Colosseum', 'Big Ben', 'Statue of Liberty'],
    correctAnswer: 'Eiffel Tower',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/architecture/eiffel.jpg',
  },
  {
    category: 'Architecture',
    question: 'Which building is a famous Roman amphitheater?',
    options: ['Eiffel Tower', 'Colosseum', 'Big Ben', 'Statue of Liberty'],
    correctAnswer: 'Colosseum',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/architecture/colosseum.jpg',
  },
  {
    category: 'Architecture',
    question: 'Which clock tower is located in London?',
    options: ['Eiffel Tower', 'Colosseum', 'Big Ben', 'Statue of Liberty'],
    correctAnswer: 'Big Ben',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/architecture/bigben.jpg',
  },
];

async function seedQuestions() {
  try {
    const batch = db.batch();
    const collectionRef = db.collection('quizQuestions');

    for (const q of questions) {
      const docRef = collectionRef.doc(); // auto ID
      batch.set(docRef, q);
      console.log('Queued:', q.question);
    }

    await batch.commit();
    console.log('✅ All questions added successfully!');
  } catch (err) {
    console.error('❌ Error adding questions:', err);
  }
}

seedQuestions();


// populateObjectInfo.js
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
    question: 'Which flower is Singapore national flower?',
    options: ['Vanda Miss Joaquim', 'Buttercup', 'Sunflower', 'Tulip'],
    correctAnswer: 'Vanda Miss Joaquim',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/flower/vandamissjoaquim.jpg',
  },
  {
    category: 'Flower',
    question: 'Which small white flower is also called the “Singapore Kopsia”?',
    options: ['Rose', 'Marigold', 'Kopsia Singapurensis', 'Blackberry Lily'],
    correctAnswer: 'Kopsia Singapurensis',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/flower/kopsia_singapurensis.jpg',
  },
  {
    category: 'Flower',
    question: 'Which flower has bright yellow petals and symbolizes cheerfulness?',
    options: ['Canna Lily', 'Marigold', 'Foxglove', 'Buttercup'],
    correctAnswer: 'Buttercup',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/flower/buttercup.jpg',
  },
  {
    category: 'Flower',
    question: 'Which plant produces trumpet-shaped flowers often used in tropical landscaping',
    options: ['Canna Lily', 'Marigold', 'Foxglove', 'Angsana'],
    correctAnswer: 'Canna Lily',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/flower/canna lily.jpg',
  },
  {
    category: 'Flower',
    question: 'Which flower is commonly known for its speckled orange petals?',
    options: ['Canna Lily', 'Blackberry Lily', 'Foxglove', 'Hoya'],
    correctAnswer: 'Blackberry Lily',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/flower/blackberry lily.jpg',
  },
  {
    category: 'Flower',
    question: 'Which purple wildflower is native to Mexico?',
    options: ['Mexican Aster', 'Orchid', 'Foxglove', 'Hoya'],
    correctAnswer: 'Mexican Aster',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/flower/mexican aster.JPG',
  },
  {
    category: 'Flower',
    question: 'Which flower is known for its bell-shaped blooms that hang gracefully?',
    options: ['Kopsia Singapurensis', 'Orchid', 'Foxglove', 'Hoya'],
    correctAnswer: 'Foxglove',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/flower/foxglove.jpg',
  },

  // Plant
  {
    category: 'Plant',
    question: 'Which tree is known for its bright red seeds often used in traditional games?',
    options: ['Saga', 'Fern', 'Foxtail Palm', 'Pine'],
    correctAnswer: 'Saga',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/plant/saga.jpg',
  },
  {
    category: 'Plant',
    question: 'Which tree has long feather-like fronds and is commonly found in tropical gardens?',
    options: ['Lobster Claw', 'Foxtail Palm', 'Saga', 'Mexican Aster'],
    correctAnswer: 'Foxtail Palm',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/plant/foxtail palm.jpg',
  },
  {
    category: 'Plant',
    question: 'Which flowering tree is native to Southeast Asia and provides great shade in parks?',
    options: ['Coconut Palm', 'Bamboo', 'Angsana', 'Kapok Tree'],
    correctAnswer: 'Angsana',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/plant/angsana.jpg',
  },

  // Architecture
  {
    category: 'Architecture',
    question: 'Where can visitors find nature-inspired artwork and exhibitions?',
    options: ['Hoya House', 'Botanic Art Gallery', 'Bandstand', 'Statue of Liberty'],
    correctAnswer: 'Botanic Art Gallery',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/architecture/botanic_art_gallery.jpg',
  },
  {
    category: 'Architecture',
    question: 'Which iconic spot in the Botanic Gardens features a white gazebo on a hill?',
    options: ['Bandstand', 'Burkill Hall', 'Botanic Art Gallery', 'Forest Discovery Centre'],
    correctAnswer: 'Bandstand',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/architecture/bandstand.jpg',
  },
  {
    category: 'Architecture',
    question: 'Which attraction helps visitors learn about Singapore native rainforest ecosystem?',
    options: ['Botanic Art Gallery', 'Burkill Hall', 'Bandstand', 'Forest Discovery Centre'],
    correctAnswer: 'Forest Discovery Centre',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/architecture/forest_discovery_centre.jpg',
  },
  {
    category: 'Architecture',
    question: 'Which attraction helps visitors learn about Singapore native rainforest ecosystem?',
    options: ['Botanic Art Gallery', 'Burkill Hall', 'Jacob Ballas Children Garden', 'Forest Discovery Centre'],
    correctAnswer: 'Forest Discovery Centre',
    imageUrl: 'gs://green-lens-47e9b.firebasestorage.app/quizPhotos/architecture/jacob_ballas_children_garden.jpeg',
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

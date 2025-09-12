// populateRewards.js
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig.js'; // import the initialized app

const db = getFirestore(app);

const rewardsData = [
  { 
    reward_id: '1', 
    title: 'SBG Postcard', 
    cost: 100, 
    description: 'A beautifully designed postcard featuring the iconic scenery of the Singapore Botanic Gardens.', 
    quantity: 5,
    image: 'gs://green-lens-47e9b.firebasestorage.app/reawardPhotos/sbgpostcard1.jpg'
  },
  { 
    reward_id: '2', 
    title: 'SBG Postcard', 
    cost: 200, 
    description: 'A limited-edition postcard showcasing unique flora found in the Singapore Botanic Gardens.', 
    quantity: 5,
    image: 'gs://green-lens-47e9b.firebasestorage.app/reawardPhotos/sbgpostcard2.jpg'
  },
  { 
    reward_id: '3', 
    title: 'Postcard Set', 
    cost: 150, 
    description: 'A curated set of postcards, perfect for collectors or sharing memories of the Gardens.', 
    quantity: 5,
    image: 'gs://green-lens-47e9b.firebasestorage.app/reawardPhotos/postcardset.jpg'
  },
  { 
    reward_id: '4', 
    title: 'Bookmark', 
    cost: 250, 
    description: 'A stylish and durable bookmark inspired by nature, ideal for your favorite books.', 
    quantity: 5,
    image: 'gs://green-lens-47e9b.firebasestorage.app/reawardPhotos/bookmark.jpg'
  },
];

async function populateRewards() {
  try {
    for (const reward of rewardsData) {
      const rewardRef = doc(db, 'rewards', reward.reward_id); // ✅ use reward_id
      await setDoc(rewardRef, reward);
      console.log(`Reward ${reward.title} added/updated successfully`);
    }
    console.log('All rewards have been populated.');
  } catch (err) {
    console.error('Error populating rewards:', err);
  }
}

populateRewards();


/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if false;
    }

    match /votes/{voteId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }

    match /feedback/{feedbackId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if false;
    }

    match /quizQuestions/{questionId} {
      allow read: if true;
      allow write: if false;
    }

    match /quizResults/{resultId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if false;
    }

    // Rewards - TEMPORARILY allow writes for seeding
    match /rewards/{rewardId} {
      allow read: if true;
      allow write: if true;  // TEMPORARY: allow create/update for populateRewards.js
    }

    // Redemptions
    match /redemptions/{redemptionId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }

    // Flowers info
    match /flowersInfo/{flowerId} {
      allow read: if true;
      allow write: if true;  // TEMPORARY: allow writes for seeding
    }
  }
}
*/
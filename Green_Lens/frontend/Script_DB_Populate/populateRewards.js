import admin from 'firebase-admin';
import fs from 'fs';

// Load Firebase service account credentials from JSON file
const serviceAccount = JSON.parse(
  fs.readFileSync('./green-lens-47e9b-firebase-adminsdk-fbsvc-9af6311d8b.json', 'utf8')
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// List of rewards to populate
const rewardsData = [
  { 
    reward_id: '1', 
    title: 'SBG Postcard', 
    cost: 100, 
    description: 'A beautifully designed postcard featuring the iconic scenery of the Singapore Botanic Gardens.', 
    quantity: 5,
    image: 'gs://green-lens-47e9b.firebasestorage.app/rewardPhotos/sbgpostcard1.jpg'
  },
  { 
    reward_id: '2', 
    title: 'SBG Postcard', 
    cost: 200, 
    description: 'A limited-edition postcard showcasing unique flora found in the Singapore Botanic Gardens.', 
    quantity: 5,
    image: 'gs://green-lens-47e9b.firebasestorage.app/rewardPhotos/sbgpostcard2.jpg'
  },
  { 
    reward_id: '3', 
    title: 'Postcard Set', 
    cost: 150, 
    description: 'A curated set of postcards, perfect for collectors or sharing memories of the Gardens.', 
    quantity: 5,
    image: 'gs://green-lens-47e9b.firebasestorage.app/rewardPhotos/postcardset.jpg'
  },
  { 
    reward_id: '4', 
    title: 'Bookmark', 
    cost: 250, 
    description: 'A stylish and durable bookmark inspired by nature, ideal for your favorite books.', 
    quantity: 5,
    image: 'gs://green-lens-47e9b.firebasestorage.app/rewardPhotos/bookmark.jpg'
  },
];

// Generate a random voucher code
function generateVoucherCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Main function to populate rewards and vouchers
async function populateRewards() {
  try {
    for (const reward of rewardsData) {
      // Save or update reward in Firestore
      const rewardRef = db.collection('rewards').doc(reward.reward_id);
      await rewardRef.set(reward);
      console.log(`✅ Reward ${reward.title} added/updated.`);

      // Create vouchers in a subcollection for each reward
      for (let i = 0; i < reward.quantity; i++) {
        const code = generateVoucherCode();
        await rewardRef.collection('vouchers').add({
          code,
          rewardId: reward.reward_id,
          rewardTitle: reward.title,
          redeemed: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`   🎟️ Voucher ${code} created for ${reward.title}`);
      }
    }
    console.log('🎉 All rewards and vouchers have been populated.');
  } catch (err) {
    console.error('❌ Error populating rewards:', err);
  }
}

// Run the function to populate Firestore
populateRewards();
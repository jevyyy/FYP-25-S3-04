// populateObjectInfo.js
import admin from 'firebase-admin';
import fs from 'fs';

// Load service account JSON
const serviceAccount = JSON.parse(
  fs.readFileSync('./green-lens-47e9b-firebase-adminsdk-fbsvc-9af6311d8b.json', 'utf8')
);

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 🌸 Flowers
const flowerData = [
  {
    id: "blackberry_lily",
    name: "Blackberry Lily",
    description:
      "A vibrant flower with orange petals and red spots, known for its unique seed pods resembling blackberries.",
    characteristics: "Dotted orange petals, sturdy stems, and black seed clusters.",
    healthTip:
      "Grows best in full sun with moderate watering. Yellowing leaves may indicate overwatering.",
    funFact: "Traditionally used in herbal medicine for sore throats.",
  },
  {
    id: "buttercup",
    name: "Buttercup",
    description:
      "A small, bright yellow flower commonly found in meadows and gardens.",
    characteristics: "Glossy petals, short stems, thrives in cool climates.",
    healthTip:
      "Healthy buttercups have shiny petals; drooping ones often signal waterlogging.",
    funFact: "Buttercups are mildly toxic but famous for their glossy petal shine used in optical studies.",
  },
  {
    id: "canna_lily",
    name: "Canna Lily",
    description:
      "A tropical flower with large colorful blooms and broad green or purple leaves.",
    characteristics: "Fast-growing, moisture-loving, blooms in summer.",
    healthTip:
      "Requires regular sunlight and moist soil; pale leaves may suggest nutrient deficiency.",
    funFact: "Canna roots are edible when cooked and are used in some Asian cuisines.",
  },
  {
    id: "foxglove",
    name: "Foxglove",
    description:
      "A tall flowering plant with bell-shaped blossoms that range from purple to white.",
    characteristics: "Towering stalks, tubular flowers, attractive to bees.",
    healthTip:
      "Healthy foxgloves stand upright; wilting indicates heat stress or root rot.",
    funFact: "Contains compounds used in heart medicine — handle with care as it's toxic when raw.",
  },
  {
    id: "hibiscus",
    name: "Hibiscus",
    description:
      "A tropical shrub producing large, colorful flowers that attract pollinators.",
    characteristics: "Five broad petals, long stamens, thrives in humid climates.",
    healthTip:
      "Healthy hibiscus has firm green leaves and frequent blooms; leaf yellowing can indicate nutrient loss.",
    funFact: "Used for hibiscus tea and skincare; rich in antioxidants and vitamin C.",
  },
  {
    id: "marigold",
    name: "Marigold",
    description:
      "A hardy, bright orange or yellow flower used in festivals and companion planting.",
    characteristics: "Strong scent, pest-repellent, fast-growing annual.",
    healthTip:
      "Blooms fade early when overwatered; prune old flowers to encourage new growth.",
    funFact: "Petals are edible and used in salads and as a natural dye.",
  },
  {
    id: "mexican_aster",
    name: "Mexican Aster",
    description:
      "Also known as cosmos, these flowers have daisy-like petals in pink, white, and purple.",
    characteristics: "Light stems, delicate petals, grows in poor soil.",
    healthTip:
      "Tall and vibrant stems mean good sunlight; drooping signals excessive watering.",
    funFact: "Attracts bees and butterflies, making it a pollinator’s favorite.",
  },
  {
    id: "morning_glory",
    name: "Morning Glory",
    description:
      "A climbing vine producing trumpet-shaped flowers that bloom in the morning.",
    characteristics: "Fast-growing, heart-shaped leaves, blooms early.",
    healthTip:
      "Healthy vines climb rapidly; yellowing indicates root-bound or dry soil.",
    funFact: "Flowers bloom in the morning and close by noon — a natural clock for gardeners.",
  },
  {
    id: "rose",
    name: "Rose",
    description:
      "A classic flowering shrub renowned for its beautiful, fragrant flowers and thorny stems.",
    characteristics:
      "Fragrant layered petals, thorny stems, various colors, symbolic meaning.",
    healthTip:
      "New buds and green stems indicate good health; black spots often mean fungal infection.",
    funFact: "Rose petals are edible and often used in desserts and perfumes.",
  },
  {
    id: "sunflower",
    name: "Sunflower",
    description:
      "A tall, bright yellow flower that follows the sun across the sky.",
    characteristics:
      "Large circular blooms, edible seeds, and thick stalks.",
    healthTip:
      "Healthy sunflowers stand tall and follow sunlight; drooping heads may suggest dehydration.",
    funFact: "Sunflowers turn to face the sun — a behavior called heliotropism.",
  },
];

// 🌿 Placeholder plant
const plantData = {
  id: "fern",
  name: "Fern",
  description: "A non-flowering plant with feather-like fronds found in shaded, humid areas.",
  characteristics: "Reproduces via spores, loves humidity and indirect light.",
  healthTip: "Healthy ferns have lush green fronds; dryness signals low humidity.",
  funFact: "Commonly used as indoor decoration and natural air purifier.",
  createdAt: new Date(),
};

// 🏛️ Placeholder architecture
const architectureData = {
  id: "gazebo",
  name: "Gazebo",
  description: "A small open structure commonly found in gardens, offering shade and rest.",
  characteristics: "Circular design, often made of wood or metal, aesthetic garden feature.",
  funFact: "Often used for gatherings and photography within botanical gardens.",
  createdAt: new Date(),
};

async function populateObjectInfo() {
  try {
    console.log("🌿 Starting Firestore population...");

    // Flowers
    for (const flower of flowerData) {
      const flowerRef = db.doc(`objectInfo/flower/${flower.id}/info`);
      const docSnap = await flowerRef.get();
      if (!docSnap.exists) {
        await flowerRef.set({ ...flower, createdAt: new Date() });
        console.log(`✅ Added flower: ${flower.name}`);
      } else {
        console.log(`⚠️ Skipped existing flower: ${flower.name}`);
      }
    }

    // Plant
    const plantRef = db.doc(`objectInfo/plant/${plantData.id}/info`);
    const plantSnap = await plantRef.get();
    if (!plantSnap.exists) {
      await plantRef.set(plantData);
      console.log(`🌱 Added plant: ${plantData.name}`);
    } else {
      console.log(`⚠️ Skipped existing plant: ${plantData.name}`);
    }

    // Architecture
    const archRef = db.doc(`objectInfo/architecture/${architectureData.id}/info`);
    const archSnap = await archRef.get();
    if (!archSnap.exists) {
      await archRef.set(architectureData);
      console.log(`🏛️ Added architecture: ${architectureData.name}`);
    } else {
      console.log(`⚠️ Skipped existing architecture: ${architectureData.name}`);
    }

    console.log("🎉 All object data populated successfully!");
  } catch (error) {
    console.error("❌ Error populating Firestore:", error);
  }
}

populateObjectInfo();

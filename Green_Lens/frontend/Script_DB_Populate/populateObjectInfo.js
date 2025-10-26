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
    id: "blackberry lily",
    name: "Blackberry Lily",
    description:
      "A vibrant flower with orange petals and red spots, known for its unique seed pods resembling blackberries.",
    characteristics: "Dotted orange petals, sturdy stems, and black seed clusters.",
    healthTip: "Grows best in full sun with moderate watering. Yellowing leaves may indicate overwatering.",
    funFact: "Traditionally used in herbal medicine for sore throats.",
  },
  {
    id: "buttercup",
    name: "Buttercup",
    description:
      "A small, bright yellow flower commonly found in meadows and gardens.",
    characteristics: "Glossy petals, short stems, thrives in cool climates.",
    healthTip: "Healthy buttercups have shiny petals; drooping ones often signal waterlogging.",
    funFact: "Buttercups are mildly toxic but famous for their glossy petal shine used in optical studies.",
  },
  {
    id: "canna lily",
    name: "Canna Lily",
    description:
      "A tropical flower with large colorful blooms and broad green or purple leaves.",
    characteristics: "Fast-growing, moisture-loving, blooms in summer.",
    healthTip: "Requires regular sunlight and moist soil; pale leaves may suggest nutrient deficiency.",
    funFact: "Canna roots are edible when cooked and are used in some Asian cuisines.",
  },
  {
    id: "foxglove",
    name: "Foxglove",
    description:
      "A tall flowering plant with bell-shaped blossoms that range from purple to white.",
    characteristics: "Towering stalks, tubular flowers, attractive to bees.",
    healthTip: "Healthy foxgloves stand upright; wilting indicates heat stress or root rot.",
    funFact: "Contains compounds used in heart medicine — handle with care as it's toxic when raw.",
  },
  {
    id: "hibiscus",
    name: "Hibiscus",
    description:
      "A tropical shrub producing large, colorful flowers that attract pollinators.",
    characteristics: "Five broad petals, long stamens, thrives in humid climates.",
    healthTip: "Healthy hibiscus has firm green leaves and frequent blooms; leaf yellowing can indicate nutrient loss.",
    funFact: "Used for hibiscus tea and skincare; rich in antioxidants and vitamin C.",
  },
  {
    id: "marigold",
    name: "Marigold",
    description:
      "A hardy, bright orange or yellow flower used in festivals and companion planting.",
    characteristics: "Strong scent, pest-repellent, fast-growing annual.",
    healthTip: "Blooms fade early when overwatered; prune old flowers to encourage new growth.",
    funFact: "Petals are edible and used in salads and as a natural dye.",
  },
  {
    id: "mexican aster",
    name: "Mexican Aster",
    description:
      "Also known as cosmos, these flowers have daisy-like petals in pink, white, and purple.",
    characteristics: "Light stems, delicate petals, grows in poor soil.",
    healthTip: "Tall and vibrant stems mean good sunlight; drooping signals excessive watering.",
    funFact: "Attracts bees and butterflies, making it a pollinator’s favorite.",
  },
  {
    id: "morning glory",
    name: "Morning Glory",
    description:
      "A climbing vine producing trumpet-shaped flowers that bloom in the morning.",
    characteristics: "Fast-growing, heart-shaped leaves, blooms early.",
    healthTip: "Healthy vines climb rapidly; yellowing indicates root-bound or dry soil.",
    funFact: "Flowers bloom in the morning and close by noon — a natural clock for gardeners.",
  },
  {
    id: "rose",
    name: "Rose",
    description:
      "A classic flowering shrub renowned for its beautiful, fragrant flowers and thorny stems.",
    characteristics: "Fragrant layered petals, thorny stems, various colors, symbolic meaning",
    healthTip: "New buds and green stems indicate good health; black spots often mean fungal infection.",
    funFact: "Rose petals are edible and often used in desserts and perfumes.",
  },
  {
    id: "sunflower",
    name: "Sunflower",
    description:
      "A tall, bright yellow flower that follows the sun across the sky.",
    characteristics: "Large circular blooms, edible seeds, and thick stalks.",
    healthTip: "Healthy sunflowers stand tall and follow sunlight; drooping heads may suggest dehydration.",
    funFact: "Sunflowers turn to face the sun — a behavior called heliotropism.",
  },

  { id: "fire lily", name: "Fire Lily", description: "Bright orange-red flowers with fiery tones.", characteristics: "Tall stems, trumpet-shaped flowers, thrives in tropical climates.", healthTip: "Needs full sun and well-drained soil.", funFact: "Also known as Crinum Lily, often used in landscaping." },
  { id: "canterbury bells", name: "Canterbury Bells", description: "Bell-shaped blooms in pastel shades.", characteristics: "Biennial, prefers cool summers, upright stems.", healthTip: "Water regularly and support stems to prevent bending.", funFact: "Traditionally used in cottage gardens." },
  { id: "bolero deep blue", name: "Bolero Deep Blue", description: "Vivid deep blue flowers forming dense clusters.", characteristics: "Compact, hardy, blooms in summer.", healthTip: "Prefers well-drained soil and full sunlight.", funFact: "Popular in ornamental beds for color contrast." },
  { id: "pink primrose", name: "Pink Primrose", description: "Delicate pink flowers with bright yellow centers.", characteristics: "Low-growing, thrives in partial shade.", healthTip: "Keep soil moist; avoid waterlogging.", funFact: "Symbolizes youth and renewal in flower language." },
  { id: "prince of wales feathers", name: "Prince of Wales Feathers", description: "Unique foliage resembling feathers with subtle flowers.", characteristics: "Climbing plant, ornamental foliage.", healthTip: "Needs support and moderate watering.", funFact: "Named for its feathery leaf pattern." },
  { id: "moon orchid", name: "Moon Orchid", description: "Elegant white orchids with yellow centers.", characteristics: "Epiphytic, thrives in humid environments.", healthTip: "Keep in indirect light; water weekly.", funFact: "Popular as a decorative orchid in homes." },
  { id: "globe-flower", name: "Globe-Flower", description: "Spherical yellow flowers on tall stems.", characteristics: "Moisture-loving, attracts pollinators.", healthTip: "Prefers wet soil and full sun.", funFact: "Commonly found in alpine meadows." },
  { id: "grape hyacinth", name: "Grape Hyacinth", description: "Small, bell-shaped blue flowers resembling grapes.", characteristics: "Bulbous perennial, blooms in spring.", healthTip: "Plant bulbs in autumn; water moderately.", funFact: "Often used in spring borders for color." },
  { id: "corn poppy", name: "Corn Poppy", description: "Bright red flowers with black centers.", characteristics: "Annual, grows quickly in fields.", healthTip: "Full sun and moderate watering.", funFact: "Symbol of remembrance in many countries." },
  { id: "toad lily", name: "Toad Lily", description: "Spotted, orchid-like flowers in fall.", characteristics: "Shade-loving, blooms in late season.", healthTip: "Keep soil moist; avoid direct sunlight.", funFact: "Named for its unusual spotted flowers." },
  { id: "siam tulip", name: "Siam Tulip", description: "Tropical pink and purple cone-shaped flowers.", characteristics: "Perennial, grows in tropical conditions.", healthTip: "Requires warmth, humidity, and partial shade.", funFact: "Native to Thailand; also called Curcuma." },
  { id: "red ginger", name: "Red Ginger", description: "Vibrant red flower spikes with lush green foliage.", characteristics: "Tropical, grows in partial shade.", healthTip: "Moist soil and high humidity required.", funFact: "Used in tropical floral arrangements." },
  { id: "spring crocus", name: "Spring Crocus", description: "Early blooming small purple or white flowers.", characteristics: "Bulbous, emerges in late winter to spring.", healthTip: "Plant bulbs in autumn; ensure well-drained soil.", funFact: "Symbolizes new beginnings in spring." },
  { id: "alpine sea holly", name: "Alpine Sea Holly", description: "Spiky blue flowers with silvery foliage.", characteristics: "Drought-tolerant, attracts pollinators.", healthTip: "Full sun; avoid waterlogging.", funFact: "Used in rock gardens for texture." },
  { id: "garden phlox", name: "Garden Phlox", description: "Clusters of colorful flowers with sweet fragrance.", characteristics: "Perennial, upright growth.", healthTip: "Water at the base; trim dead blooms.", funFact: "Attracts butterflies and hummingbirds." },
  { id: "globe thistle", name: "Globe Thistle", description: "Round, spiky blue flowers on tall stems.", characteristics: "Drought-tolerant perennial.", healthTip: "Prefers full sun; minimal watering needed.", funFact: "Popular in dried flower arrangements." },
  { id: "tiger lily", name: "Tiger Lily", description: "Orange, spotted, trumpet-shaped flowers.", characteristics: "Perennial, grows from bulbs.", healthTip: "Plant in full sun; water moderately.", funFact: "Named for its tiger-like spots." },
  { id: "ball moss", name: "Ball Moss", description: "Small spherical mosses growing on tree branches.", characteristics: "Non-parasitic epiphyte, thrives in humidity.", healthTip: "Does not harm host plants; monitor growth.", funFact: "Often found in Southern US trees." },
  { id: "love in the mist", name: "Love In The Mist", description: "Delicate flowers surrounded by feathery foliage.", characteristics: "Annual, grows in sun or partial shade.", healthTip: "Water moderately; avoid wet foliage.", funFact: "Produces decorative seed pods." },
  { id: "monkshood", name: "Monkshood", description: "Blue hooded flowers, tall spikes.", characteristics: "Perennial, poisonous if ingested.", healthTip: "Grow in cool climates; handle with gloves.", funFact: "Also called Aconitum; used in traditional medicine." },
  { id: "blanket flower", name: "Blanket Flower", description: "Red and yellow daisy-like flowers.", characteristics: "Drought-tolerant perennial.", healthTip: "Full sun and well-drained soil.", funFact: "Popular in pollinator gardens." },
  { id: "king protea", name: "King Protea", description: "Large, dramatic flowers with central dome.", characteristics: "Evergreen shrub, slow-growing.", healthTip: "Requires well-drained acidic soil.", funFact: "National flower of South Africa." },
  { id: "oxeye daisy", name: "Oxeye Daisy", description: "White petals with yellow centers.", characteristics: "Perennial, spreads easily.", healthTip: "Full sun and moderate watering.", funFact: "Common in wildflower meadows." },
  { id: "yellow iris", name: "Yellow Iris", description: "Tall perennials with bright yellow flowers.", characteristics: "Moisture-loving, prefers full sun.", healthTip: "Keep soil damp; fertilize lightly.", funFact: "Often grows near ponds and wetlands." },
  { id: "cautleya spicata", name: "Cautleya Spicata", description: "Exotic yellow-orange flowers on tall spikes.", characteristics: "Tropical perennial, prefers shade and moist soil.", healthTip: "Keep soil consistently moist and avoid direct sun.", funFact: "Related to the ginger family, native to Asia." },
  { id: "carnation", name: "Carnation", description: "Fragrant flowers in pink, red, white, and striped varieties.", characteristics: "Perennial, bushy growth.", healthTip: "Water regularly and remove dead blooms.", funFact: "Often used in bouquets and corsages." },
  { id: "silverbush", name: "Silverbush", description: "Silver-grey foliage with small colorful flowers.", characteristics: "Drought-tolerant, prefers full sun.", healthTip: "Avoid overwatering; well-drained soil is essential.", funFact: "Used as an ornamental plant in gardens." },
  { id: "bearded iris", name: "Bearded Iris", description: "Tall irises with intricate, ruffled petals.", characteristics: "Perennial, prefers sunny locations.", healthTip: "Plant rhizomes in well-drained soil; water moderately.", funFact: "The 'beard' refers to fuzzy hairs on the petals." },
  { id: "black-eyed susan", name: "Black-Eyed Susan", description: "Bright yellow petals with a dark brown center.", characteristics: "Annual or perennial, drought-tolerant.", healthTip: "Full sun; water during dry periods.", funFact: "Symbol of encouragement and motivation." },
  { id: "windflower", name: "Windflower", description: "Delicate cup-shaped flowers in white, pink, or blue.", characteristics: "Perennial, thrives in cool, shaded areas.", healthTip: "Keep soil moist but well-drained.", funFact: "Also known as Anemone, often blooms in early spring." },
  { id: "japanese anemone", name: "Japanese Anemone", description: "Graceful pink or white flowers on tall stems.", characteristics: "Perennial, blooms late summer to fall.", healthTip: "Partial shade; water during dry spells.", funFact: "Commonly planted in woodland gardens." },
  { id: "giant white arum lily", name: "Giant White Arum Lily", description: "Large white trumpet-shaped flowers.", characteristics: "Perennial, prefers moist, fertile soil.", healthTip: "Water regularly; remove faded blooms.", funFact: "Symbolizes purity and rebirth." },
  { id: "great masterwort", name: "Great Masterwort", description: "Clusters of small white or pale flowers.", characteristics: "Perennial, thrives in sun or partial shade.", healthTip: "Water moderately; prune after flowering.", funFact: "Used historically as an herbal remedy." },
  { id: "sweet pea", name: "Sweet Pea", description: "Climbing vines with fragrant colorful flowers.", characteristics: "Annual, needs support to climb.", healthTip: "Water regularly; deadhead for continuous blooms.", funFact: "Symbolizes delicate pleasure in flower language." },
  { id: "tree mallow", name: "Tree Mallow", description: "Pink to purple flowers resembling hibiscus.", characteristics: "Shrub, blooms in summer.", healthTip: "Full sun; prune to maintain shape.", funFact: "Attracts bees and butterflies." },
  { id: "trumpet creeper", name: "Trumpet Creeper", description: "Orange-red trumpet-shaped flowers on climbing vines.", characteristics: "Fast-growing, attracts hummingbirds.", healthTip: "Needs support and full sun.", funFact: "Also known as Campsis, used in gardens for vertical coverage." },
  { id: "daffodil", name: "Daffodil", description: "Bright yellow trumpet-shaped flowers.", characteristics: "Bulbous perennial, blooms in spring.", healthTip: "Plant bulbs in autumn; water moderately.", funFact: "Symbol of renewal and spring." },
  { id: "pincushion flower", name: "Pincushion Flower", description: "Round, spiky flowers with vibrant colors.", characteristics: "Perennial, drought-tolerant.", healthTip: "Full sun; avoid overwatering.", funFact: "Attracts butterflies and bees." },
  { id: "hard-leaved pocket orchid", name: "Hard-Leaved Pocket Orchid", description: "Exotic orchid with tough leaves and delicate flowers.", characteristics: "Epiphytic perennial, prefers humidity.", healthTip: "Keep in indirect light; water moderately.", funFact: "Native to Australia and Asia." },
  { id: "osteospermum", name: "Osteospermum", description: "Daisy-like flowers in vibrant colors.", characteristics: "Annual or perennial, heat-tolerant.", healthTip: "Full sun; water during dry spells.", funFact: "Also called African Daisy, popular in borders." },
  { id: "tree poppy", name: "Tree Poppy", description: "Tall shrub with large, vibrant flowers.", characteristics: "Perennial, prefers sunny locations.", healthTip: "Water moderately; protect from frost.", funFact: "Native to Asia, used ornamentally." },
  { id: "desert-rose", name: "Desert Rose", description: "Succulent shrub with striking pink flowers.", characteristics: "Drought-tolerant, thrives in well-drained soil.", healthTip: "Minimal watering; protect from cold.", funFact: "Also called Adenium, popular as a bonsai plant." },
  { id: "bromelia", name: "Bromelia", description: "Tropical plant with colorful central flowers.", characteristics: "Evergreen, prefers humidity.", healthTip: "Indirect light; water into central cup.", funFact: "Often used as indoor ornamental plant." },
  { id: "magnolia", name: "Magnolia", description: "Large, fragrant flowers, white or pink.", characteristics: "Shrub or small tree; blooms in spring.", healthTip: "Full sun to partial shade; water moderately.", funFact: "Symbolizes dignity and perseverance." },
  { id: "english marigold", name: "English Marigold", description: "Bright yellow or orange flowers, aromatic foliage.", characteristics: "Annual, pest-repellent.", healthTip: "Full sun; deadhead for continued blooms.", funFact: "Used in companion planting to repel insects." },
  { id: "bee balm", name: "Bee Balm", description: "Red, pink, or purple tubular flowers.", characteristics: "Perennial, attracts pollinators.", healthTip: "Moist soil; full sun to partial shade.", funFact: "Popular with hummingbirds and bees." },
  { id: "stemless gentian", name: "Stemless Gentian", description: "Deep blue, cup-shaped flowers close to the ground.", characteristics: "Perennial, alpine plant.", healthTip: "Cool temperatures; well-drained soil.", funFact: "Blooms late summer, often in meadows." },
  { id: "mallow", name: "Mallow", description: "Pink to purple flowers, often with veined petals.", characteristics: "Perennial or annual, sun-loving.", healthTip: "Water moderately; remove dead flowers.", funFact: "Used historically for herbal remedies." },
  { id: "gaura", name: "Gaura", description: "Delicate white or pink flowers on thin stems.", characteristics: "Perennial, drought-tolerant.", healthTip: "Full sun; water moderately.", funFact: "Sometimes called Wand Flower due to its thin stems." },
  { id: "lenten rose", name: "Lenten Rose", description: "Evergreen perennial with dark foliage and nodding flowers.", characteristics: "Shade-loving, blooms in winter/spring.", healthTip: "Moist, well-drained soil.", funFact: "Often used in shaded gardens." },
  { id: "orange dahlia", name: "Orange Dahlia", description: "Large orange blooms with layered petals.", characteristics: "Perennial tuber, blooms summer to autumn.", healthTip: "Water regularly; deadhead for new blooms.", funFact: "Popular in cut flower arrangements." },
  { id: "pelargonium", name: "Pelargonium", description: "Clustered bright flowers with aromatic leaves.", characteristics: "Perennial, thrives in containers.", healthTip: "Full sun; water moderately.", funFact: "Often called geraniums in gardening." },
  { id: "ruby-lipped cattleya", name: "Ruby-Lipped Cattleya", description: "Orchid with vibrant pink lips and delicate petals.", characteristics: "Epiphytic orchid, humid environment.", healthTip: "Indirect light; water weekly.", funFact: "Highly prized in orchid collections." },
  { id: "hippeastrum", name: "Hippeastrum", description: "Large trumpet-shaped flowers, usually red or white.", characteristics: "Bulbous perennial, blooms indoors or outdoors.", healthTip: "Water sparingly before blooming; keep warm.", funFact: "Often sold as holiday bulbs indoors." },
  { id: "artichoke", name: "Artichoke", description: "Large thistle-like flower buds, edible.", characteristics: "Perennial, grows tall, requires full sun.", healthTip: "Water deeply; protect young plants.", funFact: "Cultivated for its edible flower buds." },
  { id: "gazania", name: "Gazania", description: "Bright daisy-like flowers in bold colors.", characteristics: "Low-growing, sun-loving perennial.", healthTip: "Full sun; drought-tolerant.", funFact: "Often used in rock gardens or borders." },
  { id: "peruvian lily", name: "Peruvian Lily", description: "Tubular, often spotted flowers in multiple colors.", characteristics: "Bulbous perennial, blooms in summer.", healthTip: "Water moderately; well-drained soil.", funFact: "Also called Alstroemeria, popular in bouquets." },
  { id: "mexican petunia", name: "Mexican Petunia", description: "Tall stems with purple or pink trumpet-shaped flowers.", characteristics: "Perennial, hardy, blooms summer to fall.", healthTip: "Full sun; water moderately.", funFact: "Can naturalize easily in gardens." },
  { id: "bird of paradise", name: "Bird of Paradise", description: "Exotic orange and blue flowers resembling a bird.", characteristics: "Tropical perennial, large leaves.", healthTip: "Full sun; regular watering and humidity.", funFact: "Symbol of paradise and freedom." },
  { id: "sweet william", name: "Sweet William", description: "Clusters of small colorful flowers, fragrant.", characteristics: "Biennial, sun-loving.", healthTip: "Water moderately; remove spent flowers.", funFact: "Popular in traditional English gardens." },
  { id: "purple coneflower", name: "Purple Coneflower", description: "Purple petals surrounding a spiky central cone.", characteristics: "Perennial, attracts pollinators.", healthTip: "Full sun; drought-tolerant.", funFact: "Used in herbal remedies for immune support." },
  { id: "wild pansy", name: "Wild Pansy", description: "Small, delicate flowers in mixed colors.", characteristics: "Perennial, grows in meadows and gardens.", healthTip: "Moist soil, partial sun.", funFact: "Edible flowers, used in salads and decorations." },
  { id: "columbine", name: "Columbine", description: "Unique spurred flowers in various colors.", characteristics: "Perennial, attracts hummingbirds.", healthTip: "Partial shade; water moderately.", funFact: "Often symbolizes wisdom and strength." },
  { id: "colt's foot", name: "Colt's Foot", description: "Bright yellow flowers that appear early in spring.", characteristics: "Perennial, low-growing, spreads quickly.", healthTip: "Moist soil; tolerate cold.", funFact: "Historically used for cough remedies." },
  { id: "snapdragon", name: "Snapdragon", description: "Colorful tubular flowers that 'snap' open when squeezed.", characteristics: "Annual or perennial, upright growth.", healthTip: "Full sun; water at base.", funFact: "Named for its jaw-like flower shape." },
  { id: "camellia", name: "Camellia", description: "Evergreen shrub with large, rose-like flowers.", characteristics: "Partial shade, acidic soil.", healthTip: "Water consistently; mulch to retain moisture.", funFact: "Symbol of love and admiration." },
  { id: "fritillary", name: "Fritillary", description: "Bell-shaped purple or checkered flowers.", characteristics: "Perennial bulb, prefers sun or partial shade.", healthTip: "Plant bulbs in autumn; water moderately.", funFact: "Often found in woodland meadows." },
  { id: "common dandelion", name: "Common Dandelion", description: "Bright yellow flowers, edible leaves and roots.", characteristics: "Perennial, resilient.", healthTip: "Full sun; low maintenance.", funFact: "Used in salads and herbal teas." },
  { id: "poinsettia", name: "Poinsettia", description: "Red and green foliage, commonly used during holidays.", characteristics: "Shrub, tropical, indoor plant.", healthTip: "Indirect light; water moderately.", funFact: "Symbol of Christmas worldwide." },
  { id: "primula", name: "Primula", description: "Clustered spring flowers in bright colors.", characteristics: "Perennial, prefers partial shade.", healthTip: "Keep soil moist; avoid waterlogging.", funFact: "Symbolizes youth and renewal." },
  { id: "azalea", name: "Azalea", description: "Showy clusters of flowers in pink, red, or white.", characteristics: "Shrub, acid soil loving.", healthTip: "Partial shade; water regularly.", funFact: "Popular in Asian gardens." },
  { id: "californian poppy", name: "Californian Poppy", description: "Bright orange cup-shaped flowers.", characteristics: "Annual or perennial; drought-tolerant.", healthTip: "Full sun; minimal watering.", funFact: "State flower of California." },
  { id: "anthurium", name: "Anthurium", description: "Glossy, heart-shaped flowers, often red.", characteristics: "Tropical perennial, indoor plant.", healthTip: "Indirect light; high humidity.", funFact: "Also called Flamingo Flower." },
  { id: "clematis", name: "Clematis", description: "Climbing vine with large, colorful flowers.", characteristics: "Perennial; requires support.", healthTip: "Full sun with some shade; prune appropriately.", funFact: "Popular for garden trellises and arbors." },
  { id: "geranium", name: "Geranium", description: "Bright flowers, often pink or red, aromatic leaves.", characteristics: "Perennial, sun-loving.", healthTip: "Water at base; deadhead to prolong blooms.", funFact: "Popular in containers and window boxes." },
  { id: "thorn apple", name: "Thorn Apple", description: "Spiky seed pods with fragrant flowers.", characteristics: "Perennial; toxic if ingested.", healthTip: "Wear gloves when handling.", funFact: "Also called Datura; used historically in medicine." },
  { id: "barbeton daisy", name: "Barbeton Daisy", description: "Vibrant daisy-like flowers in pink and yellow.", characteristics: "Perennial, drought-tolerant.", healthTip: "Full sun; water moderately.", funFact: "Native to South Africa." },
  { id: "bougainvillea", name: "Bougainvillea", description: "Colorful bracts surrounding tiny white flowers.", characteristics: "Climbing vine, drought-tolerant.", healthTip: "Full sun; prune to control growth.", funFact: "Popular in tropical and subtropical gardens." },
  { id: "sword lily", name: "Sword Lily", description: "Tall stems with trumpet-shaped flowers.", characteristics: "Perennial; prefers sunny locations.", healthTip: "Water moderately; stake for support.", funFact: "Also known as Gladiolus." },
  { id: "hibiscus", name: "Hibiscus", description: "Tropical shrub producing large, colorful flowers.", characteristics: "Five broad petals, long stamens, thrives in humid climates.", healthTip: "Healthy hibiscus has firm green leaves and frequent blooms; leaf yellowing can indicate nutrient loss.", funFact: "Used for hibiscus tea and skincare; rich in antioxidants and vitamin C." },
  { id: "lotus lotus", name: "Lotus Lotus", description: "Aquatic flower with broad petals and a central seed pod.", characteristics: "Grows in ponds or shallow water.", healthTip: "Requires full sun and warm water.", funFact: "Symbol of purity and enlightenment in many cultures." },
  { id: "cyclamen", name: "Cyclamen", description: "Heart-shaped leaves and delicate upswept flowers.", characteristics: "Perennial, prefers shade and cool conditions.", healthTip: "Keep soil moist but well-drained.", funFact: "Blooms in autumn and winter indoors." },
  { id: "foxglove", name: "Foxglove", description: "Tall flowering plant with bell-shaped blossoms.", characteristics: "Towering stalks, tubular flowers, attractive to bees.", healthTip: "Healthy foxgloves stand upright; wilting indicates heat stress or root rot.", funFact: "Contains compounds used in heart medicine — handle with care as it's toxic when raw." },
  { id: "frangipani", name: "Frangipani", description: "Fragrant tropical flowers, often white or pink.", characteristics: "Small tree or shrub, thrives in warm climates.", healthTip: "Full sun; moderate watering.", funFact: "Flowers often used in leis and perfumes." },
  { id: "rose", name: "Rose", description: "Classic flowering shrub with fragrant flowers.", characteristics: "Fragrant layered petals, thorny stems, various colors, symbolic meaning", healthTip: "New buds and green stems indicate good health; black spots often mean fungal infection.", funFact: "Rose petals are edible and often used in desserts and perfumes." },
  { id: "watercress", name: "Watercress", description: "Aquatic plant with small green leaves and white flowers.", characteristics: "Fast-growing; grows in shallow water.", healthTip: "Keep in fresh water; harvest regularly.", funFact: "Edible, high in vitamins, often used in salads." },
  { id: "water lily", name: "Water Lily", description: "Floating aquatic flower with broad leaves and showy blooms.", characteristics: "Requires pond or water garden.", healthTip: "Full sun; water temperature warm.", funFact: "Flowers open in the morning and close at night." },
  { id: "wallflower", name: "Wallflower", description: "Clusters of fragrant flowers in bright colors.", characteristics: "Perennial, tolerates poor soil.", healthTip: "Full sun; remove spent blooms.", funFact: "Used traditionally in cottage gardens." },
  { id: "passion flower", name: "Passion Flower", description: "Exotic, intricate flowers with vibrant colors.", characteristics: "Climbing vine, tropical.", healthTip: "Full sun; water moderately.", funFact: "Symbolic in Christian art; attracts pollinators." },
  { id: "petunia", name: "Petunia", description: "Brightly colored, trumpet-shaped flowers.", characteristics: "Annual, bushy growth.", healthTip: "Full sun; deadhead to prolong blooms.", funFact: "Popular in hanging baskets and garden beds." }
];

// 🌿 Plants
const plantData = [
  {
    id: "fern",
    name: "Fern",
    description: "A non-flowering plant with feather-like fronds found in shaded, humid areas.",
    characteristics: "Reproduces via spores, loves humidity and indirect light.",
    healthTip: "Healthy ferns have lush green fronds; dryness signals low humidity.",
    funFact: "Commonly used as indoor decoration and natural air purifier.",
  },
];

// 🏛️ Architecture
const architectureData = [
  {
    id: "gazebo",
    name: "Gazebo",
    description: "A small open structure commonly found in gardens, offering shade and rest.",
    characteristics: "Circular design, often made of wood or metal, aesthetic garden feature.",
    healthTip: "Provides shade and comfort for visitors.",
    funFact: "Often used for gatherings and photography within botanical gardens.",
  },
];

async function populateObjectInfo() {
  try {
    console.log("🌿 Starting Firestore population...");

    const allObjects = [...flowerData, ...plantData, ...architectureData];

    for (const obj of allObjects) {
      const docRef = db.doc(`objectInfo/${obj.id}`);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        await docRef.set({ ...obj, createdAt: new Date() });
        console.log(`✅ Added object: ${obj.name}`);
      } else {
        console.log(`⚠️ Skipped existing object: ${obj.name}`);
      }
    }

    console.log("🎉 All object data populated successfully!");
  } catch (error) {
    console.error("❌ Error populating Firestore:", error);
  }
}

populateObjectInfo();

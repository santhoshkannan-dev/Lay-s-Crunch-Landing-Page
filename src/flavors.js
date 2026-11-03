/**
 * Lay's Flavors Master Data
 */
export const FLAVORS = [
  {
    id: "classic",
    number: "01",
    name: "Classic",
    title: "CLASSIC",
    tagline: "Pure Golden Perfection",
    desc: "Crispy, golden, salted potato chips. America's favorite snack made from farm-grown potatoes cooked to crunchy perfection.",
    color: "#F5B800",
    deep: "#8C6A00",
    glow: "#FFE873",
    ink: "#1A1400",
    spiceColor: "#E5A823",
    pack: "/packs/classic.png",
    art: "/packs/classic_art.jpg",
    price: 2.49,
    weight: "8.0 oz (226.8g)",
    ingredients: "Farm-fresh potatoes, vegetable oil, sea salt",
    hotspots: [
      { x: 50, y: 15, label: "HEAT-SEALED CRIMP", desc: "Locks the freshness in" },
      { x: 35, y: 45, label: "FOIL-LINED FILM", desc: "Blocks light & moisture" },
      { x: 65, y: 70, label: "AIR CUSHION", desc: "Keeps every chip whole" }
    ]
  },
  {
    id: "sour-cream",
    number: "02",
    name: "Sour Cream & Onion",
    title: "SOUR CREAM & ONION",
    tagline: "Zesty & Creamy Crunch",
    desc: "Tangy sour cream meets garden-fresh green onions in harmony across every ridged and golden slice.",
    color: "#1E824C",
    deep: "#0B4726",
    glow: "#5EEB9E",
    ink: "#062413",
    spiceColor: "#27AE60",
    pack: "/packs/sour-cream.png",
    art: "/packs/sour-cream_art.jpg",
    price: 2.49,
    weight: "7.75 oz (219.7g)",
    ingredients: "Potatoes, vegetable oil, skim milk, onion powder, sour cream, parsley",
    hotspots: [
      { x: 50, y: 15, label: "HEAT-SEALED CRIMP", desc: "Nitrogen flushed seal" },
      { x: 35, y: 50, label: "HERB DUSTING", desc: "Fine-ground garden chives" },
      { x: 65, y: 75, label: "TANGY FINISH", desc: "Cultured cream balance" }
    ]
  },
  {
    id: "barbecue",
    number: "03",
    name: "Barbecue",
    title: "BARBECUE",
    tagline: "Smoky Sweet Heat",
    desc: "Rich molasses, brown sugar, and applewood smokiness glazed over farm-grown potatoes for an unmistakable southern flair.",
    color: "#2B1F1D",
    deep: "#9E3811",
    glow: "#FB923C",
    ink: "#120B09",
    spiceColor: "#D9480F",
    pack: "/packs/barbecue.png",
    art: "/packs/barbecue_art.jpg",
    price: 2.49,
    weight: "7.75 oz (219.7g)",
    ingredients: "Potatoes, brown sugar, salt, tomato powder, smoked paprika, garlic powder",
    hotspots: [
      { x: 50, y: 15, label: "AIR-CUSHIONED PACK", desc: "Pressure calibrated" },
      { x: 30, y: 45, label: "SMOKED GLAZE", desc: "Slow hickory infusion" },
      { x: 65, y: 70, label: "MOLASSES CRUST", desc: "Caramelized crunch" }
    ]
  },
  {
    id: "salt-vinegar",
    number: "04",
    name: "Salt & Vinegar",
    title: "SALT & VINEGAR",
    tagline: "Pucker-Up Crunch",
    desc: "A punchy splash of sharp vinegar balanced by sea salt crystals on crispy golden potato chips that excite every tastebud.",
    color: "#007CB9",
    deep: "#004770",
    glow: "#67D7FF",
    ink: "#011C2B",
    spiceColor: "#22B8CF",
    pack: "/packs/salt-vinegar.png",
    art: "/packs/salt-vinegar_art.jpg",
    price: 2.49,
    weight: "7.75 oz (219.7g)",
    ingredients: "Potatoes, vegetable oil, maltodextrin, sea salt, malic acid, vinegar powder",
    hotspots: [
      { x: 50, y: 15, label: "HERMETIC SEAL", desc: "100% moisture barrier" },
      { x: 35, y: 50, label: "ACIDITY SPIKE", desc: "Aged apple cider essence" },
      { x: 65, y: 72, label: "MINERAL SALT", desc: "Coarse crystalline grain" }
    ]
  },
  {
    id: "flamin-hot",
    number: "05",
    name: "Flamin' Hot",
    title: "FLAMIN' HOT",
    tagline: "Intense Spicy Kick",
    desc: "Fiery chili pepper punch with the iconic crunch that keeps flavor explorers coming back for the addictive burn.",
    color: "#9E1B22",
    deep: "#520A0E",
    glow: "#FF453A",
    ink: "#210305",
    spiceColor: "#E03131",
    pack: "/packs/flamin-hot.png",
    art: "/packs/flamin-hot_art.jpg",
    price: 2.49,
    weight: "7.75 oz (219.7g)",
    ingredients: "Potatoes, vegetable oil, Flamin' Hot seasoning, cheddar cheese, cayenne pepper",
    hotspots: [
      { x: 50, y: 15, label: "HEAT-SEALED CRIMP", desc: "Locks the freshness in" },
      { x: 35, y: 45, label: "FOIL-LINED FILM", desc: "Blocks light & moisture" },
      { x: 65, y: 70, label: "AIR CUSHION", desc: "Keeps every chip whole" }
    ]
  },
  {
    id: "cheddar-sour-cream",
    number: "06",
    name: "Cheddar & Sour Cream",
    title: "CHEDDAR & SOUR CREAM",
    tagline: "Velvety Sharp Cheese",
    desc: "Rich sharp Wisconsin cheddar blended with smooth sour cream for an indulgent melt-in-your-mouth crunch.",
    color: "#E06D14",
    deep: "#873E00",
    glow: "#FFA048",
    ink: "#2E1500",
    spiceColor: "#F76707",
    pack: "/packs/cheddar-sour-cream.png",
    art: "/packs/cheddar-sour-cream_art.jpg",
    price: 2.49,
    weight: "7.75 oz (219.7g)",
    ingredients: "Potatoes, whey, cheddar cheese, cream, onion powder, buttermilk, butter",
    hotspots: [
      { x: 50, y: 15, label: "LOCK-CRIMP", desc: "Zero aroma escape" },
      { x: 35, y: 48, label: "AGED CHEDDAR", desc: "12-month sharp curd" },
      { x: 65, y: 72, label: "VELVET BODY", desc: "Ultra-fine milk solids" }
    ]
  },
  {
    id: "all-dressed",
    number: "07",
    name: "All Dressed",
    title: "ALL DRESSED",
    tagline: "The Canadian Medley",
    desc: "A savory sensation combining barbecue, sour cream & onion, ketchup, and salt & vinegar in one glorious bite.",
    color: "#4E2161",
    deep: "#290D36",
    glow: "#B366FF",
    ink: "#15041C",
    spiceColor: "#9C36B5",
    pack: "/packs/all-dressed.png",
    art: "/packs/all-dressed_art.jpg",
    price: 2.49,
    weight: "7.75 oz (219.7g)",
    ingredients: "Potatoes, onion, garlic, tomato, paprika, Worcestershire spices, vinegar",
    hotspots: [
      { x: 50, y: 15, label: "FOIL BARRIER", desc: "Light impermeable" },
      { x: 35, y: 50, label: "4-WAY FUSION", desc: "Sweet, salty, sour, savory" },
      { x: 65, y: 75, label: "SIGNATURE BLEND", desc: "Canadian cult classic" }
    ]
  },
  {
    id: "sweet-southern-heat",
    number: "08",
    name: "Sweet Southern Heat Barbecue",
    title: "SWEET SOUTHERN HEAT",
    tagline: "Slow-Burn Southern Soul",
    desc: "A sweet honey glaze with a lingering southern cayenne kick that elevates barbecue to an artform.",
    color: "#7A1C2B",
    deep: "#420A13",
    glow: "#FF5975",
    ink: "#1C0206",
    spiceColor: "#C92A2A",
    pack: "/packs/sweet-southern-heat.png",
    art: "/packs/sweet-southern-heat_art.jpg",
    price: 2.49,
    weight: "7.75 oz (219.7g)",
    ingredients: "Potatoes, sugar, brown sugar, molasses, honey, cayenne pepper, paprika",
    hotspots: [
      { x: 50, y: 15, label: "PRESERVE SEAL", desc: "O2 barrier film" },
      { x: 35, y: 48, label: "WILD HONEY", desc: "Subtle floral nectar" },
      { x: 65, y: 70, label: "SLOW HEAT", desc: "Cayenne crescendo" }
    ]
  },
  {
    id: "bacon-grilled-cheese",
    number: "09",
    name: "Bacon Grilled Cheese",
    title: "BACON GRILLED CHEESE",
    tagline: "Comfort Food Reimagined",
    desc: "Toasted buttery sourdough, melty cheddar, and smoky hardwood bacon in a craveable golden chip.",
    color: "#AF8552",
    deep: "#694924",
    glow: "#DFBE93",
    ink: "#24180A",
    spiceColor: "#D97706",
    pack: "/packs/bacon-grilled-cheese.png",
    art: "/packs/bacon-grilled-cheese_art.jpg",
    price: 2.49,
    weight: "7.75 oz (219.7g)",
    ingredients: "Potatoes, vegetable oil, smoked bacon flavor, toasted sourdough essence, cheddar",
    hotspots: [
      { x: 50, y: 15, label: "FRESHNESS PACK", desc: "Zero moisture creep" },
      { x: 35, y: 50, label: "HARDWOOD SMOKE", desc: "Hickory cured bacon" },
      { x: 65, y: 72, label: "TOASTED CRUST", desc: "Buttery pan-fried warmth" }
    ]
  }
];

export const CHAPTERS = [
  {
    index: "01",
    tag: "CHAPTER 01 — THE BAG",
    title: "BUILT TO PROTECT",
    body: "A pillow of air cushions every chip, while a foil-lined film keeps out light and moisture until the moment you tear it open.",
    badge: "Air-cushioned pack",
    rotation: { x: 0.1, y: -0.4, z: 0.05 },
    cameraDolly: { x: 0.4, y: 0.1, z: 4.8 }
  },
  {
    index: "02",
    tag: "CHAPTER 02 — THE CRUNCH",
    title: "63 DECIBELS OF JOY",
    body: "That signature acoustic crunch isn't accidental. It's calibrated through high-frequency moisture control to release a crisp shockwave on the very first bite.",
    badge: "Acoustic resonance",
    rotation: { x: -0.15, y: 0.35, z: -0.1 },
    cameraDolly: { x: 0.6, y: -0.2, z: 4.4 }
  },
  {
    index: "03",
    tag: "CHAPTER 03 — THE SEASONING",
    title: "ELECTROSTATIC COATING",
    body: "Every micron of spice is charged before airborne tumbling, ensuring an evenly balanced dusting across every ridge and curve without clumping.",
    badge: "Even micro-dusting",
    rotation: { x: 0.25, y: 0.1, z: 0.15 },
    cameraDolly: { x: 0.3, y: 0.2, z: 4.2 }
  },
  {
    index: "04",
    tag: "CHAPTER 04 — THE POTATO",
    title: "100% FARM GROWN",
    body: "Sourced directly from generational American potato farms, carefully sliced to microscopic tolerance and kettle-crisped within 24 hours of harvest.",
    badge: "Farm to chip in 24h",
    rotation: { x: 0.0, y: -0.15, z: 0.0 },
    cameraDolly: { x: 0.5, y: 0.0, z: 4.6 }
  }
];


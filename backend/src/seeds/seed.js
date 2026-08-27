import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

// Load environment variables
dotenv.config();

// ============================================================================
// Demo Users Dataset
// ============================================================================
const usersData = [
  {
    name: "Admin User",
    email: "admin@ezzyshop.com",
    plainPassword: "Admin@12345",
    role: "admin",
    isActive: true,
  },
  {
    name: "Demo Customer",
    email: "demo@ezzyshop.com",
    plainPassword: "Demo@12345",
    role: "user",
    isActive: true,
  },
];

// ============================================================================
// Categories Dataset (8 Categories)
// ============================================================================
const categoriesData = [
  {
    name: "Electronics",
    slug: "electronics",
    isActive: true,
  },
  {
    name: "Fashion",
    slug: "fashion",
    isActive: true,
  },
  {
    name: "Footwear",
    slug: "footwear",
    isActive: true,
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    isActive: true,
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    isActive: true,
  },
  {
    name: "Sports & Fitness",
    slug: "sports-fitness",
    isActive: true,
  },
  {
    name: "Accessories",
    slug: "accessories",
    isActive: true,
  },
  {
    name: "Grocery & Essentials",
    slug: "grocery-essentials",
    isActive: true,
  },
];

// ============================================================================
// Products Dataset (40 Products, 5 per Category)
// ============================================================================
const productsData = [
  // --------------------------------------------------------------------------
  // 1. Electronics (5 Products)
  // --------------------------------------------------------------------------
  {
    title: "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
    slug: "sony-wh-1000xm5-wireless-noise-canceling-headphones",
    description:
      "Industry-leading noise cancellation with two processors and 8 microphones. Enjoy crystal-clear hands-free calling, up to 30 hours of battery life, and ultra-comfortable lightweight design.",
    price: 399.99,
    discountPrice: 349.99,
    categorySlug: "electronics",
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Apple Watch Series 9 GPS 45mm Midnight",
    slug: "apple-watch-series-9-gps-45mm-midnight",
    description:
      "Powerful S9 SiP chip with a magical double tap gesture, brighter display, faster on-device Siri, and precision finding for iPhone. Comprehensive health and workout tracking.",
    price: 429.0,
    discountPrice: 389.0,
    categorySlug: "electronics",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Logitech MX Master 3S Wireless Performance Mouse",
    slug: "logitech-mx-master-3s-wireless-performance-mouse",
    description:
      "Ergonomic wireless mouse with Quiet Click switches, 8K DPI any-surface sensor, and MagSpeed electromagnetic scrolling for ultimate precision and speed.",
    price: 99.99,
    discountPrice: 89.99,
    categorySlug: "electronics",
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Dell UltraSharp 27-inch 4K USB-C Hub Monitor",
    slug: "dell-ultrasharp-27-inch-4k-usb-c-hub-monitor",
    description:
      "Brilliant 4K UHD IPS Black technology display with 100% sRGB and 98% DCI-P3 color coverage. Single-cable 90W USB-C connectivity with RJ45 Ethernet hub.",
    price: 579.99,
    discountPrice: 529.99,
    categorySlug: "electronics",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Anker 737 Power Bank (PowerCore 24K) 140W",
    slug: "anker-737-power-bank-powercore-24k-140w",
    description:
      "Ultra-powerful 24,000mAh capacity portable charger equipped with Power Delivery 3.1 and bi-directional 140W fast charging. Smart digital display shows power output and recharge time.",
    price: 149.99,
    discountPrice: 119.99,
    categorySlug: "electronics",
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1609592424364-77732d8479e0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },

  // --------------------------------------------------------------------------
  // 2. Fashion (5 Products)
  // --------------------------------------------------------------------------
  {
    title: "Classic Tailored Wool Blend Overcoat",
    slug: "classic-tailored-wool-blend-overcoat",
    description:
      "Sophisticated single-breasted wool-blend overcoat with notched lapels and satin lining. Perfect for formal and smart-casual layering in colder weather.",
    price: 189.99,
    discountPrice: 149.99,
    categorySlug: "fashion",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Premium Organic Cotton Crewneck T-Shirt",
    slug: "premium-organic-cotton-crewneck-t-shirt",
    description:
      "Heavyweight 220 GSM combed organic cotton t-shirt with reinforced ribbed collar. Pre-shrunk fabric ensures enduring shape and ultra-soft everyday comfort.",
    price: 34.99,
    discountPrice: 28.0,
    categorySlug: "fashion",
    stock: 120,
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Slim-Fit Selvedge Denim Jeans",
    slug: "slim-fit-selvedge-denim-jeans",
    description:
      "Authentic 13.5 oz Japanese selvedge denim with natural indigo dye. Features durable copper rivets, button fly, and tailored modern slim fit.",
    price: 89.99,
    discountPrice: 74.99,
    categorySlug: "fashion",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Women's Ribbed Knit Cashmere Sweater",
    slug: "womens-ribbed-knit-cashmere-sweater",
    description:
      "Luxuriously soft 100% Grade-A Mongolian cashmere sweater with ribbed cuffs and hem. Lightweight yet exceptionally warm with a relaxed silhouette.",
    price: 129.99,
    discountPrice: 109.99,
    categorySlug: "fashion",
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Waterproof Lightweight Packable Windbreaker",
    slug: "waterproof-lightweight-packable-windbreaker",
    description:
      "Breathable ripstop nylon hooded windbreaker with water-repellent DWR coating. Packs into its own chest pocket for effortless travel and outdoor protection.",
    price: 79.99,
    discountPrice: 59.99,
    categorySlug: "fashion",
    stock: 55,
    images: [
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },

  // --------------------------------------------------------------------------
  // 3. Footwear (5 Products)
  // --------------------------------------------------------------------------
  {
    title: "Nike Air Zoom Pegasus 40 Running Shoes",
    slug: "nike-air-zoom-pegasus-40-running-shoes",
    description:
      "Responsive React foam cushioning paired with dual Zoom Air units for a smooth, springy ride. Engineered mesh upper provides optimal breathability and comfort.",
    price: 139.99,
    discountPrice: 119.99,
    categorySlug: "footwear",
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Adidas Ultraboost Light Performance Sneakers",
    slug: "adidas-ultraboost-light-performance-sneakers",
    description:
      "Epic energy return with Light BOOST midsole material and Linear Energy Push system. PRIMEKNIT+ upper hugs the foot with precision support.",
    price: 189.99,
    discountPrice: 159.99,
    categorySlug: "footwear",
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Classic Goodyear Welted Leather Chelsea Boots",
    slug: "classic-goodyear-welted-leather-chelsea-boots",
    description:
      "Full-grain oiled calfskin leather boots with durable elastic side gussets and resoleable Goodyear welt construction. Handcrafted for timeless style and longevity.",
    price: 199.99,
    discountPrice: 169.99,
    categorySlug: "footwear",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Vans Old Skool Canvas Low-Top Sneakers",
    slug: "vans-old-skool-canvas-low-top-sneakers",
    description:
      "Iconic skate shoes featuring sturdy canvas and suede uppers, re-enforced toe caps, supportive padded collars, and signature rubber waffle outsoles.",
    price: 69.99,
    discountPrice: null,
    categorySlug: "footwear",
    stock: 80,
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Birkenstock Arizona Birko-Flor Sandals",
    slug: "birkenstock-arizona-birko-flor-sandals",
    description:
      "Two-strap classic sandals featuring anatomically shaped cork-latex footbed lined with suede. Skin-friendly, durable Birko-Flor synthetic upper with adjustable metal buckles.",
    price: 110.0,
    discountPrice: 95.0,
    categorySlug: "footwear",
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },

  // --------------------------------------------------------------------------
  // 4. Home & Kitchen (5 Products)
  // --------------------------------------------------------------------------
  {
    title: "Nespresso VertuoPlus Coffee and Espresso Machine",
    slug: "nespresso-vertuoplus-coffee-and-espresso-machine",
    description:
      "Centrifusion technology reads barcode on capsules to automatically adjust brewing parameters. Creates 5 cup sizes of rich, crema-topped coffee and authentic espresso.",
    price: 169.99,
    discountPrice: 139.99,
    categorySlug: "home-kitchen",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Ninja Foodi 6-in-1 DualZone 8-Qt Air Fryer",
    slug: "ninja-foodi-6-in-1-dualzone-8-qt-air-fryer",
    description:
      "DualZone technology features 2 independent 4-quart baskets that let you cook 2 foods in 2 ways and finish at the exact same time with Smart Finish.",
    price: 199.99,
    discountPrice: 169.99,
    categorySlug: "home-kitchen",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Le Creuset Enameled Cast Iron Signature Round Dutch Oven (5.5 Qt)",
    slug: "le-creuset-enameled-cast-iron-signature-round-dutch-oven-5-5-qt",
    description:
      "Iconic enameled cast iron culinary centerpiece delivering superior heat distribution and retention. Resistant to chipping, cracking, and staining with tight-fitting lid.",
    price: 419.95,
    discountPrice: 359.95,
    categorySlug: "home-kitchen",
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1584990347449-a29d5b40cfb6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Dyson V12 Detect Slim Cordless Vacuum Cleaner",
    slug: "dyson-v12-detect-slim-cordless-vacuum-cleaner",
    description:
      "Intelligent lightweight cordless vacuum with laser illumination that reveals invisible dust on hard floors. Piezo sensor automatically optimizes power and run time.",
    price: 649.99,
    discountPrice: 549.99,
    categorySlug: "home-kitchen",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "KitchenAid Artisan Series 5-Quart Stand Mixer",
    slug: "kitchenaid-artisan-series-5-quart-stand-mixer",
    description:
      "Durable tilt-head metal stand mixer with 10 speeds and planetary mixing action. Includes 5-quart stainless steel bowl, flat beater, dough hook, and wire whip.",
    price: 449.99,
    discountPrice: 379.99,
    categorySlug: "home-kitchen",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },

  // --------------------------------------------------------------------------
  // 5. Beauty & Personal Care (5 Products)
  // --------------------------------------------------------------------------
  {
    title: "CeraVe Hydrating Facial Cleanser for Normal to Dry Skin",
    slug: "cerave-hydrating-facial-cleanser-normal-dry-skin",
    description:
      "Non-foaming lotion cleanser formulated with hyaluronic acid and 3 essential ceramides. Gently cleanses and refreshes without stripping moisture or disrupting the skin barrier.",
    price: 18.99,
    discountPrice: 14.99,
    categorySlug: "beauty-personal-care",
    stock: 150,
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "The Ordinary Niacinamide 10% + Zinc 1% High-Strength Serum",
    slug: "the-ordinary-niacinamide-10-zinc-1-high-strength-serum",
    description:
      "Water-based vitamin and mineral formula that targets blemish-prone skin, refines pores, and balances visible sebum activity for a smoother, brighter complexion.",
    price: 12.5,
    discountPrice: 9.99,
    categorySlug: "beauty-personal-care",
    stock: 200,
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608248597359-0a671f653457?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Philips Sonicare DiamondClean 9000 Electric Toothbrush",
    slug: "philips-sonicare-diamondclean-9000-electric-toothbrush",
    description:
      "Advanced sonic technology delivering up to 62,000 brush movements per minute. Includes smart pressure sensor, 4 brushing modes, 3 intensities, and glass charging cup.",
    price: 199.99,
    discountPrice: 159.99,
    categorySlug: "beauty-personal-care",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1559591937-e1032d847120?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Dior Sauvage Eau de Parfum for Men 100ml",
    slug: "dior-sauvage-eau-de-parfum-for-men-100ml",
    description:
      "Sensual fragrance blending radiant Calabrian bergamot, spicy Sichuan pepper, and smoky Papua New Guinean vanilla absolute for a bold, noble olfactory signature.",
    price: 145.0,
    discountPrice: 125.0,
    categorySlug: "beauty-personal-care",
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Dyson Supersonic Hair Dryer with Magnetic Styling Attachments",
    slug: "dyson-supersonic-hair-dryer-magnetic-styling-attachments",
    description:
      "Engineered for different hair types with intelligent heat control to prevent extreme heat damage. Fast drying with concentrated Air Multiplier airflow.",
    price: 429.99,
    discountPrice: 389.99,
    categorySlug: "beauty-personal-care",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },

  // --------------------------------------------------------------------------
  // 6. Sports & Fitness (5 Products)
  // --------------------------------------------------------------------------
  {
    title: "Manduka PRO Yoga and Pilates Mat (6mm Standard)",
    slug: "manduka-pro-yoga-pilates-mat-6mm-standard",
    description:
      "High-density 6mm cushion provides unmatched joint protection and longevity. Closed-cell surface seals out moisture and bacteria, backed by a lifetime guarantee.",
    price: 128.0,
    discountPrice: 108.0,
    categorySlug: "sports-fitness",
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Bowflex SelectTech 552 Adjustable Dumbbells Pair",
    slug: "bowflex-selecttech-552-adjustable-dumbbells-pair",
    description:
      "Replaces 15 sets of weights with an intuitive dial adjustment system from 5 to 52.5 lbs per dumbbell. Durable molding around metal plates creates quiet workouts.",
    price: 429.0,
    discountPrice: 379.0,
    categorySlug: "sports-fitness",
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Theragun Prime Quiet Deep Tissue Massage Gun",
    slug: "theragun-prime-quiet-deep-tissue-massage-gun",
    description:
      "Percussive therapy device with 16mm amplitude reaching 60% deeper into muscles. QuietForce technology motor, ergonomic multi-grip handle, and smart Bluetooth app integration.",
    price: 299.0,
    discountPrice: 249.0,
    categorySlug: "sports-fitness",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Hydro Flask 32 oz Wide Mouth Insulated Water Bottle",
    slug: "hydro-flask-32-oz-wide-mouth-insulated-water-bottle",
    description:
      "TempShield double-wall vacuum insulation keeps beverages ice-cold for up to 24 hours or piping hot for 12. Constructed with pro-grade 18/8 stainless steel.",
    price: 44.95,
    discountPrice: 37.95,
    categorySlug: "sports-fitness",
    stock: 90,
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Garmin Forerunner 265 GPS Running Smartwatch",
    slug: "garmin-forerunner-265-gps-running-smartwatch",
    description:
      "Vibrant AMOLED touchscreen display with training readiness score, morning report, wrist-based running dynamics, multi-band GNSS, and up to 13 days of battery life.",
    price: 449.99,
    discountPrice: 399.99,
    categorySlug: "sports-fitness",
    stock: 22,
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },

  // --------------------------------------------------------------------------
  // 7. Accessories (5 Products)
  // --------------------------------------------------------------------------
  {
    title: "Ray-Ban Classic Polarized Wayfarer Sunglasses",
    slug: "ray-ban-classic-polarized-wayfarer-sunglasses",
    description:
      "Timeless acetate frames with green classic G-15 polarized crystal lenses. Provides 100% UV protection and eliminates glare for superior visual clarity.",
    price: 163.0,
    discountPrice: 138.0,
    categorySlug: "accessories",
    stock: 55,
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Bellroy Hide & Seek Premium RFID Leather Wallet",
    slug: "bellroy-hide-and-seek-premium-rfid-leather-wallet",
    description:
      "Slim bi-fold wallet crafted from environmentally certified full-grain leather. Features hidden coin/bill compartment and RFID blocking security.",
    price: 89.0,
    discountPrice: 75.0,
    categorySlug: "accessories",
    stock: 70,
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Fossil Neutra Minimalist Chronograph Brown Leather Watch",
    slug: "fossil-neutra-minimalist-chronograph-brown-leather-watch",
    description:
      "Mid-century inspired 44mm stainless steel watch with amber dial and genuine brown leather strap with buckle closure. Water resistant up to 50 meters.",
    price: 160.0,
    discountPrice: 128.0,
    categorySlug: "accessories",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Peak Design Everyday Backpack 20L V2 Charcoal",
    slug: "peak-design-everyday-backpack-20l-v2-charcoal",
    description:
      "Award-winning weatherproof 400D recycled nylon canvas daypack. Features MagLatch hardware, dual side access, dedicated 15-inch laptop sleeve, and FlexFold dividers.",
    price: 279.95,
    discountPrice: 239.95,
    categorySlug: "accessories",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Handcrafted Full-Grain Italian Leather Belt",
    slug: "handcrafted-full-grain-italian-leather-belt",
    description:
      "Durable 35mm wide full-grain Italian vegetable-tanned leather belt with brushed solid brass buckle. Designed to develop a rich, lustrous patina over time.",
    price: 59.0,
    discountPrice: 48.0,
    categorySlug: "accessories",
    stock: 65,
    images: [
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },

  // --------------------------------------------------------------------------
  // 8. Grocery & Essentials (5 Products)
  // --------------------------------------------------------------------------
  {
    title: "Lavazza Super Crema Whole Bean Coffee Blend (2.2 lb)",
    slug: "lavazza-super-crema-whole-bean-coffee-blend-2-2-lb",
    description:
      "Medium roast Italian espresso coffee beans blending natural Arabica and Robusta. Delivers velvety crema with aromatic notes of roasted hazelnut and brown sugar.",
    price: 24.99,
    discountPrice: 19.99,
    categorySlug: "grocery-essentials",
    stock: 110,
    images: [
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "California Estate Extra Virgin Cold Pressed Olive Oil (750ml)",
    slug: "california-estate-extra-virgin-cold-pressed-olive-oil-750ml",
    description:
      "Single-estate extra virgin olive oil harvested and first cold-pressed within hours. Rich in polyphenols with fresh grassy notes and a peppery finish.",
    price: 29.99,
    discountPrice: 24.5,
    categorySlug: "grocery-essentials",
    stock: 85,
    images: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Raw Organic Wildflower Honey Jar (32 oz)",
    slug: "raw-organic-wildflower-honey-jar-32-oz",
    description:
      "100% pure unfiltered raw honey harvested from sustainable bee apiaries. Preserves natural pollen, enzymes, and antioxidants with a delicate floral taste.",
    price: 21.99,
    discountPrice: 17.99,
    categorySlug: "grocery-essentials",
    stock: 95,
    images: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Twinings Earl Grey Loose Leaf Black Tea Tin (100g)",
    slug: "twinings-earl-grey-loose-leaf-black-tea-tin-100g",
    description:
      "Classic British black tea delicately infused with aromatic citrus notes of natural bergamot. Packaged in an airtight collectible keepsake tin.",
    price: 14.99,
    discountPrice: 11.99,
    categorySlug: "grocery-essentials",
    stock: 120,
    images: [
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
  {
    title: "Artisanal 72% Dark Chocolate Single-Origin Bar Pack (3-pack)",
    slug: "artisanal-72-dark-chocolate-single-origin-bar-pack-3-pack",
    description:
      "Bean-to-bar organic single-origin dark chocolate handcrafted with organic cane sugar and fair-trade Ecuadorian cocoa. Notes of deep cherry and toasted vanilla.",
    price: 18.5,
    discountPrice: 15.0,
    categorySlug: "grocery-essentials",
    stock: 75,
    images: [
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80",
    ],
    isActive: true,
  },
];

// ============================================================================
// Seeding Functions
// ============================================================================

/**
 * Seed or update demo users safely without creating duplicates or deleting user data
 */
const seedUsers = async () => {
  const seededUsers = [];

  for (const userItem of usersData) {
    const normalizedEmail = userItem.email.toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });

    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userItem.plainPassword, salt);

    if (user) {
      // Update existing seed user
      user.name = userItem.name;
      user.password = hashedPassword;
      user.role = userItem.role;
      user.isActive = userItem.isActive;
      await user.save();
    } else {
      // Create new seed user
      user = await User.create({
        name: userItem.name,
        email: normalizedEmail,
        password: hashedPassword,
        role: userItem.role,
        isActive: userItem.isActive,
      });
    }

    seededUsers.push(user);
  }

  return seededUsers;
};

/**
 * Seed or update categories safely using slug as stable identifier
 */
const seedCategories = async () => {
  const categoryMap = {}; // slug -> Category ObjectId
  let count = 0;

  for (const cat of categoriesData) {
    let category = await Category.findOne({ slug: cat.slug });

    if (category) {
      category.name = cat.name;
      category.isActive = cat.isActive;
      await category.save();
    } else {
      category = await Category.create({
        name: cat.name,
        slug: cat.slug,
        isActive: cat.isActive,
      });
    }

    categoryMap[cat.slug] = category._id;
    count++;
  }

  return { categoryMap, count };
};

/**
 * Seed or update products safely using slug as stable identifier
 */
const seedProducts = async (categoryMap) => {
  let count = 0;

  for (const prod of productsData) {
    const categoryId = categoryMap[prod.categorySlug];
    if (!categoryId) {
      throw new Error(
        `Category with slug '${prod.categorySlug}' not found for product '${prod.title}'`
      );
    }

    let product = await Product.findOne({ slug: prod.slug });

    const productPayload = {
      title: prod.title,
      slug: prod.slug,
      description: prod.description,
      price: prod.price,
      discountPrice: prod.discountPrice,
      category: categoryId,
      images: prod.images,
      stock: prod.stock,
      isActive: prod.isActive,
    };

    if (product) {
      Object.assign(product, productPayload);
      await product.save();
    } else {
      product = await Product.create(productPayload);
    }

    count++;
  }

  return count;
};

// ============================================================================
// Main Execution Runner
// ============================================================================
const runSeed = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error(
      "Error: Database connection URI (MONGO_URI or MONGODB_URI) is not defined in environment variables."
    );
    process.exit(1);
  }

  console.log("\n====================================");
  console.log("EzzyShop Database Seed");
  console.log("====================================\n");

  try {
    // 1. Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("MongoDB connection established.\n");

    // 2. Seed Users
    await seedUsers();
    console.log("✓ Admin user created/found");
    console.log("✓ Demo user created/found");

    // 3. Seed Categories
    const { categoryMap, count: categoriesCount } = await seedCategories();
    console.log(`✓ ${categoriesCount} categories created/updated`);

    // 4. Seed Products
    const productsCount = await seedProducts(categoryMap);
    console.log(`✓ ${productsCount} products created/updated`);

    // 5. Success Output
    console.log("\n====================================");
    console.log("Seed completed successfully!");
    console.log("====================================\n");

    console.log("Demo Admin:");
    console.log("Email: admin@ezzyshop.com");
    console.log("Password: Admin@12345\n");

    console.log("Demo User:");
    console.log("Email: demo@ezzyshop.com");
    console.log("Password: Demo@12345\n");
  } catch (error) {
    console.error("\n❌ Database Seeding Failed!");
    console.error(error);
    process.exitCode = 1;
  } finally {
    // 6. Close MongoDB connection gracefully
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
    } catch (closeErr) {
      console.error("Error closing MongoDB connection:", closeErr.message);
    }
  }
};

// Execute if run directly
runSeed();

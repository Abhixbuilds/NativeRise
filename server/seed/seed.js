require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const DeliveryPartnerProfile = require('../models/DeliveryPartnerProfile');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Dispute = require('../models/Dispute');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Wishlist = require('../models/Wishlist');
const { calculateProfitBreakdown } = require('../services/profit-calculator');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nativerise';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB database.');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      SellerProfile.deleteMany({}),
      DeliveryPartnerProfile.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Payment.deleteMany({}),
      Order.deleteMany({}),
      Dispute.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
      Wishlist.deleteMany({})
    ]);
    console.log('[Seed] Cleared existing data.');

    // Passwords
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const defaultPasswordHash = await bcrypt.hash('Pass@123', 10);

    // 1. Seed Admin
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@nativerise.test',
      phone: '9900000001',
      passwordHash: adminPasswordHash,
      role: 'admin',
      preferredLanguage: 'en',
      address: { line1: 'Administrative HQ', city: 'Mumbai', state: 'Maharashtra', pinCode: '400001' }
    });

    // 2. Seed 6 Sellers (4 approved, 2 pending)
    const sellerUserData = [
      {
        name: 'Ramesh Narayan Kumar',
        email: 'ramesh@nativerise.test',
        phone: '9820000001',
        role: 'seller',
        preferredLanguage: 'mr',
        address: { line1: '14 Bamboo Crafts Lane', city: 'Nashik', state: 'Maharashtra', pinCode: '422001' },
        business: {
          businessName: 'Ramesh Bamboo & Cane Crafts',
          businessDescription: 'Third-generation bamboo artisan cooperative crafting sustainable home decor and storage baskets.',
          category: 'Handicrafts',
          verificationStatus: 'approved',
          trustCircleVouchedBy: 'Sarpanch Anandrao Patil (Gram Panchayat Nashik Rural)',
          rating: 4.8,
          totalOrders: 48,
          vault: { balancePercentSetting: 15, lockedAmount: 3450, unlockHistory: [{ amount: 1000, reason: 'Raw Material', date: new Date('2026-08-10') }] },
          walletBalance: 12800
        }
      },
      {
        name: 'Kaveri Amma',
        email: 'kaveri@nativerise.test',
        phone: '9820000002',
        role: 'seller',
        preferredLanguage: 'ml',
        address: { line1: 'Spice Valley Organic Estate', city: 'Wayanad', state: 'Kerala', pinCode: '673121' },
        business: {
          businessName: 'Wayanad Pure Organic Spices',
          businessDescription: 'Farmer-owned single-origin wild forest spices grown through chemical-free permaculture.',
          category: 'Food',
          verificationStatus: 'approved',
          trustCircleVouchedBy: 'Dr. V. Menon (Wayanad Agri Society)',
          rating: 4.9,
          totalOrders: 64,
          vault: { balancePercentSetting: 10, lockedAmount: 4200, unlockHistory: [] },
          walletBalance: 18400
        }
      },
      {
        name: 'Shanti Devi',
        email: 'shanti@nativerise.test',
        phone: '9820000003',
        role: 'seller',
        preferredLanguage: 'hi',
        address: { line1: 'Weavers Colony, Chunar', city: 'Varanasi', state: 'Uttar Pradesh', pinCode: '221001' },
        business: {
          businessName: 'Shanti Handloom & Khadi Weaves',
          businessDescription: 'Traditional pit-loom woven pure cotton Khadi fabrics and natural-dyed daily wear.',
          category: 'Clothing',
          verificationStatus: 'approved',
          trustCircleVouchedBy: 'Master Weaver Ramkinkar',
          rating: 4.7,
          totalOrders: 32,
          vault: { balancePercentSetting: 12, lockedAmount: 2100, unlockHistory: [] },
          walletBalance: 9600
        }
      },
      {
        name: 'Bheemaiah Muria',
        email: 'bheema@nativerise.test',
        phone: '9820000004',
        role: 'seller',
        preferredLanguage: 'hi',
        address: { line1: 'Kondagaon Tribal Cluster', city: 'Bastar', state: 'Chhattisgarh', pinCode: '494226' },
        business: {
          businessName: 'Bastar Dhokra & Bell Metal Arts',
          businessDescription: 'Ancient lost-wax bell metal casting representing tribal folk motifs and heritage icons.',
          category: 'Handicrafts',
          verificationStatus: 'approved',
          trustCircleVouchedBy: '',
          rating: 4.6,
          totalOrders: 24,
          vault: { balancePercentSetting: 10, lockedAmount: 1800, unlockHistory: [] },
          walletBalance: 8200
        }
      },
      {
        name: 'Subrata Mondal',
        email: 'subrata@nativerise.test',
        phone: '9820000005',
        role: 'seller',
        preferredLanguage: 'bn',
        address: { line1: 'Canning Forest Edge', city: 'South 24 Parganas', state: 'West Bengal', pinCode: '743329' },
        business: {
          businessName: 'Sundarban Pure Wild Honey Harvest',
          businessDescription: 'Mangrove raw wild honey gathered by traditional Mouli honey collectors.',
          category: 'Food',
          verificationStatus: 'pending',
          trustCircleVouchedBy: 'Forest Fringe Community Union',
          rating: 0,
          totalOrders: 0,
          vault: { balancePercentSetting: 10, lockedAmount: 0, unlockHistory: [] },
          walletBalance: 0
        }
      },
      {
        name: 'Gopal Kumbhakar',
        email: 'gopal@nativerise.test',
        phone: '9820000006',
        role: 'seller',
        preferredLanguage: 'bn',
        address: { line1: 'Panchmura Terracotta Village', city: 'Bankura', state: 'West Bengal', pinCode: '722156' },
        business: {
          businessName: 'Panchmura Terracotta Pottery',
          businessDescription: 'Iconic Bankura terracotta horses and natural clay culinary drinkware.',
          category: 'Handicrafts',
          verificationStatus: 'pending',
          trustCircleVouchedBy: '',
          rating: 0,
          totalOrders: 0,
          vault: { balancePercentSetting: 10, lockedAmount: 0, unlockHistory: [] },
          walletBalance: 0
        }
      }
    ];

    const createdSellers = [];
    for (const s of sellerUserData) {
      const u = await User.create({
        name: s.name,
        email: s.email,
        phone: s.phone,
        passwordHash: defaultPasswordHash,
        role: 'seller',
        preferredLanguage: s.preferredLanguage,
        address: s.address
      });

      const sp = await SellerProfile.create({
        userId: u._id,
        businessName: s.business.businessName,
        businessDescription: s.business.businessDescription,
        category: s.business.category,
        verificationStatus: s.business.verificationStatus,
        trustCircleVouchedBy: s.business.trustCircleVouchedBy,
        rating: s.business.rating,
        totalOrders: s.business.totalOrders,
        vault: s.business.vault,
        walletBalance: s.business.walletBalance
      });

      createdSellers.push({ user: u, profile: sp });
    }

    // 3. Seed 4 Customers
    const customerUserData = [
      { name: 'Priya Sharma', email: 'customer1@nativerise.test', phone: '9810000001', lang: 'hi', address: { line1: '402 Sunrise Heights, Bandra West', city: 'Mumbai', state: 'Maharashtra', pinCode: '400050' } },
      { name: 'Ananya Rao', email: 'customer2@nativerise.test', phone: '9810000002', lang: 'kn', address: { line1: '88 Indiranagar 100ft Road', city: 'Bengaluru', state: 'Karnataka', pinCode: '560038' } },
      { name: 'Arjun Verma', email: 'customer3@nativerise.test', phone: '9810000003', lang: 'en', address: { line1: '12 Greater Kailash 1', city: 'New Delhi', state: 'Delhi', pinCode: '110048' } },
      { name: 'Debashis Roy', email: 'customer4@nativerise.test', phone: '9810000004', lang: 'bn', address: { line1: '45 Salt Lake Sector 2', city: 'Kolkata', state: 'West Bengal', pinCode: '700091' } }
    ];

    const createdCustomers = [];
    for (const c of customerUserData) {
      const u = await User.create({
        name: c.name,
        email: c.email,
        phone: c.phone,
        passwordHash: defaultPasswordHash,
        role: 'customer',
        preferredLanguage: c.lang,
        address: c.address
      });
      createdCustomers.push(u);
    }

    // 4. Seed 3 Delivery Partners
    const deliveryUserData = [
      { name: 'Sanjay Shinde', email: 'delivery1@nativerise.test', phone: '9830000001', zone: 'Western Maharashtra Hub', vehicle: 'Mahindra Bolero Pickup Cargo', hub: 'Nashik Central Hub', codFloat: 2450 },
      { name: 'Manu Varghese', email: 'delivery2@nativerise.test', phone: '9830000002', zone: 'Malabar Highland Zone', vehicle: 'Piaggio Ape Cargo 3-Wheeler', hub: 'Kalpetta Wayanad Hub', codFloat: 1200 },
      { name: 'Ravi Teja', email: 'delivery3@nativerise.test', phone: '9830000003', zone: 'Deccan Regional Hub', vehicle: 'Electric 2-Wheeler Cargo', hub: 'Bengaluru Rural Transit Point', codFloat: 3500 }
    ];

    const createdDeliveryPartners = [];
    for (const d of deliveryUserData) {
      const u = await User.create({
        name: d.name,
        email: d.email,
        phone: d.phone,
        passwordHash: defaultPasswordHash,
        role: 'delivery',
        preferredLanguage: 'en',
        address: { line1: 'Delivery Hub St', city: 'Hub Station', state: 'Maharashtra', pinCode: '422002' }
      });

      const dp = await DeliveryPartnerProfile.create({
        userId: u._id,
        serviceZone: d.zone,
        vehicleType: d.vehicle,
        rating: 4.8,
        activeHubLocation: d.hub,
        codFloatBalance: d.codFloat
      });

      createdDeliveryPartners.push({ user: u, profile: dp });
    }

    // 5. Seed 20+ Products
    const productsData = [
      // Seller 0: Ramesh Handicrafts
      {
        sellerIndex: 0,
        name: 'Handwoven Bamboo Fruit & Storage Basket',
        descriptionOriginal: 'Traditional handmade bamboo basket crafted using natural seasoned bamboo splints for eco-friendly storage.',
        originalLanguage: 'mr',
        category: 'Handicrafts',
        price: 540,
        productCost: 210,
        packagingCost: 35,
        stock: 24,
        images: ['https://images.unsplash.com/photo-1595079672139-545c600f56e9?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 450,
        dimensions: { length: 30, width: 30, height: 18 },
        provenanceCard: {
          artisanStory: 'Crafted by Master Artisan Ramesh Kumar who has preserved bamboo weaving techniques for over 32 years.',
          region: 'Nashik Valley, Maharashtra',
          processNote: 'Bamboo is harvested during full moon, naturally smoked for termite resistance, and split into ultra-fine flexible fibers.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Ramesh-001'
        },
        rating: 4.8
      },
      {
        sellerIndex: 0,
        name: 'Handmade Cane Laundry & Planter Basket',
        descriptionOriginal: 'Heavy-duty natural cane cylindrical basket ideal for indoor plants or artisanal laundry organization.',
        originalLanguage: 'mr',
        category: 'Handicrafts',
        price: 890,
        productCost: 380,
        packagingCost: 45,
        stock: 15,
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 850,
        dimensions: { length: 38, width: 38, height: 45 },
        provenanceCard: {
          artisanStory: 'Woven by the women artisan self-help collective of Dindori, Nashik.',
          region: 'Dindori, Maharashtra',
          processNote: 'Treated cane soaked in herbal bath and coiled by hand using cotton thread binding.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Ramesh-002'
        },
        rating: 4.9
      },
      {
        sellerIndex: 0,
        name: 'Bamboo Desktop Organizer & Pen Stand Set',
        descriptionOriginal: 'Polished natural bamboo multi-slot desk organizer set for sustainable home offices.',
        originalLanguage: 'mr',
        category: 'Handicrafts',
        price: 360,
        productCost: 140,
        packagingCost: 25,
        stock: 40,
        images: ['https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 300,
        dimensions: { length: 20, width: 10, height: 12 },
        provenanceCard: {
          artisanStory: 'Carved by young rural apprentices learning sustainable crafts under Rameshji.',
          region: 'Nashik, Maharashtra',
          processNote: 'Smooth sand-finished bamboo nodes sealed with natural linseed wax.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Ramesh-003'
        },
        rating: 4.7
      },
      {
        sellerIndex: 0,
        name: 'Handcrafted Bamboo Wind Chime (Natural Tune)',
        descriptionOriginal: 'Deep melodic resonance outdoor and balcony bamboo chime handcrafted from mountain culms.',
        originalLanguage: 'mr',
        category: 'Handicrafts',
        price: 480,
        productCost: 180,
        packagingCost: 30,
        stock: 18,
        images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 520,
        dimensions: { length: 15, width: 15, height: 60 },
        provenanceCard: {
          artisanStory: 'Tuned by ear using folk pitch intervals by the tribal elders of Trimbak.',
          region: 'Trimbakeshwar, Western Ghats',
          processNote: 'Cut with precision angle bevels to catch gentle breezes and create calming overtone tones.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Ramesh-004'
        },
        rating: 4.6
      },

      // Seller 1: Kaveri Organic Spices (Wayanad)
      {
        sellerIndex: 1,
        name: 'Single-Origin Wayanad Tellicherry Black Pepper (500g)',
        descriptionOriginal: 'Sun-dried extra bold grade TGSEB black peppercorns from high elevation rain-fed shade canopies.',
        originalLanguage: 'ml',
        category: 'Food',
        price: 620,
        productCost: 280,
        packagingCost: 40,
        stock: 50,
        images: ['https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 520,
        dimensions: { length: 18, width: 12, height: 6 },
        provenanceCard: {
          artisanStory: 'Cultivated by Kaveri Amma and 14 indigenous tribal grower families on Wayanad hill slopes.',
          region: 'Wayanad, Kerala',
          processNote: 'Hand-harvested only when berries turn ruby red, fermented 2 days and sun-dried on coir mats.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Kaveri-001'
        },
        rating: 4.9
      },
      {
        sellerIndex: 1,
        name: 'Wild Forest Raw Cardamom Pods (Green Gold - 250g)',
        descriptionOriginal: 'Aromatic 8mm jumbo green cardamom pods grown under natural canopy shade in Western Ghats.',
        originalLanguage: 'ml',
        category: 'Food',
        price: 850,
        productCost: 420,
        packagingCost: 40,
        stock: 35,
        images: ['https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 280,
        dimensions: { length: 15, width: 10, height: 5 },
        provenanceCard: {
          artisanStory: 'Grown naturally without synthetic fertilizers by smallholder families in Meppadi valley.',
          region: 'Meppadi, Wayanad',
          processNote: 'Slowly wood-cured in traditional green curing chambers preserving high volatile essential oils.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Kaveri-002'
        },
        rating: 5.0
      },
      {
        sellerIndex: 1,
        name: 'Stone-Milled Lakadong Turmeric Powder (8% Curcumin - 400g)',
        descriptionOriginal: 'High-potency organic turmeric root hand ground in water-cooled stone mills to lock in medicinal aromatics.',
        originalLanguage: 'ml',
        category: 'Agriculture',
        price: 340,
        productCost: 130,
        packagingCost: 30,
        stock: 60,
        images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 420,
        dimensions: { length: 16, width: 12, height: 6 },
        provenanceCard: {
          artisanStory: 'Heritage root crop cultivated in bio-diverse forest clearings.',
          region: 'Wayanad, Kerala',
          processNote: 'Boiled in copper vessels, sun-cured for 15 days, and stone ground slowly without heat buildup.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Kaveri-003'
        },
        rating: 4.8
      },
      {
        sellerIndex: 1,
        name: 'Virgin Cold-Pressed Coconut Oil (Wood-Pressed 1 Litre)',
        descriptionOriginal: 'Raw cold wood-churned (Marachekku) unrefined virgin coconut oil from mature sulfur-free copra.',
        originalLanguage: 'ml',
        category: 'Food',
        price: 490,
        productCost: 220,
        packagingCost: 45,
        stock: 45,
        images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 1050,
        dimensions: { length: 10, width: 10, height: 26 },
        provenanceCard: {
          artisanStory: 'Produced in village wood churns operated by farmer cooperative.',
          region: 'Mananthavady, Kerala',
          processNote: 'Extracted slowly at room temperature without chemicals or refining agents.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Kaveri-004'
        },
        rating: 4.9
      },

      // Seller 2: Shanti Handloom & Khadi (Varanasi)
      {
        sellerIndex: 2,
        name: 'Pure Handspun Khadi Cotton Men Kurta (Indigo Dyed)',
        descriptionOriginal: 'Breathable, featherlight artisan Khadi kurta naturally dyed with organic indigo and madder root.',
        originalLanguage: 'hi',
        category: 'Clothing',
        price: 1250,
        productCost: 550,
        packagingCost: 45,
        stock: 20,
        images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 350,
        dimensions: { length: 32, width: 25, height: 4 },
        provenanceCard: {
          artisanStory: 'Spun on traditional Ambar Charkha and hand-tailored by Shanti Devi in Varanasi.',
          region: 'Varanasi, Uttar Pradesh',
          processNote: 'Yarn dipped 8 times into natural indigo vats with wooden block-printed seam accents.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Shanti-001'
        },
        rating: 4.7
      },
      {
        sellerIndex: 2,
        name: 'Handwoven Khadi Cotton Saree with Zari Border',
        descriptionOriginal: 'Elegant handloom cotton saree with subtle unpolished golden zari temple border.',
        originalLanguage: 'hi',
        category: 'Clothing',
        price: 2450,
        productCost: 1100,
        packagingCost: 60,
        stock: 12,
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 650,
        dimensions: { length: 35, width: 28, height: 5 },
        provenanceCard: {
          artisanStory: 'Woven over 7 continuous days by Master Weaver Shanti Devi and her daughter.',
          region: 'Chunar Weaver Cluster, UP',
          processNote: 'Traditional wooden throw-shuttle loom using 100 count combed cotton warp.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Shanti-002'
        },
        rating: 4.9
      },
      {
        sellerIndex: 2,
        name: 'Organic Cotton Block-Printed Table Runner & Mats Set',
        descriptionOriginal: '6-seater artisan table runner with matching dining mats made of handloom cotton with Mughal floral motifs.',
        originalLanguage: 'hi',
        category: 'Handicrafts',
        price: 780,
        productCost: 320,
        packagingCost: 35,
        stock: 25,
        images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 500,
        dimensions: { length: 30, width: 20, height: 4 },
        provenanceCard: {
          artisanStory: 'Stamped by hand using hand-carved teakwood blocks.',
          region: 'Varanasi, UP',
          processNote: 'Vegetable dye fixation in sun-baked river clay tanks.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Shanti-003'
        },
        rating: 4.6
      },

      // Seller 3: Bastar Dhokra Art (Chhattisgarh)
      {
        sellerIndex: 3,
        name: 'Tribal Dhokra Brass Deer Figurine (Lost-Wax Cast)',
        descriptionOriginal: 'Intricately textured non-ferrous bell metal deer sculpture handcrafted using the 4000-year-old lost wax technique.',
        originalLanguage: 'hi',
        category: 'Handicrafts',
        price: 1450,
        productCost: 650,
        packagingCost: 50,
        stock: 14,
        images: ['https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 950,
        dimensions: { length: 18, width: 10, height: 22 },
        provenanceCard: {
          artisanStory: 'Cast by Bheemaiah Muria, an indigenous Gond-Dhokra master caster from Bastar.',
          region: 'Kondagaon, Bastar, Chhattisgarh',
          processNote: 'Beeswax threads wrapped around clay core, fired in open charcoal kiln; every piece is an unrepeatable one-of-a-kind original.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Bheema-001'
        },
        rating: 4.8
      },
      {
        sellerIndex: 3,
        name: 'Bastar Bell Metal Oil Diya / Candle Stand (Tribal Tree of Life)',
        descriptionOriginal: 'Traditional brass oil lamp featuring folk bird perches and dancing figures around the sacred tree motif.',
        originalLanguage: 'hi',
        category: 'Handicrafts',
        price: 1180,
        productCost: 500,
        packagingCost: 45,
        stock: 16,
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 800,
        dimensions: { length: 15, width: 15, height: 25 },
        provenanceCard: {
          artisanStory: 'Folk heirloom craftsmanship celebrating tribal folklore and forest spirits.',
          region: 'Bastar, Chhattisgarh',
          processNote: 'Recycled brass metal melted in earthen crucibles and poured into red clay molds.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Bheema-002'
        },
        rating: 4.7
      },
      {
        sellerIndex: 3,
        name: 'Tribal Wall Hanging Bell Metal Music Troupe Plaque',
        descriptionOriginal: 'Mounted wall art panel depicting village drummers and horn players in traditional Bastar attire.',
        originalLanguage: 'hi',
        category: 'Handicrafts',
        price: 1850,
        productCost: 800,
        packagingCost: 60,
        stock: 8,
        images: ['https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 1200,
        dimensions: { length: 30, width: 5, height: 20 },
        provenanceCard: {
          artisanStory: 'Created by the tribal artisan guild of Kondagaon.',
          region: 'Bastar, Chhattisgarh',
          processNote: 'Natural oxidized antique patina finish with raw beeswax buffing.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Bheema-003'
        },
        rating: 4.9
      },

      // Seller 4: Sundarban Honey (Pending)
      {
        sellerIndex: 4,
        name: 'Wild Sundarban Mangrove Blossom Honey (500g Glass Jar)',
        descriptionOriginal: 'Unpasteurized dark amber wild forest honey collected from Khalisha and Goran mangrove blooms.',
        originalLanguage: 'bn',
        category: 'Food',
        price: 580,
        productCost: 260,
        packagingCost: 40,
        stock: 40,
        images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 850,
        dimensions: { length: 10, width: 10, height: 16 },
        provenanceCard: {
          artisanStory: 'Harvested deep inside the delta mangrove forests by licensed traditional honey collectors.',
          region: 'Sundarbans Delta, West Bengal',
          processNote: 'Coarse gravity-filtered through fine organic muslin without heating, retaining all active enzymes and pollen.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Subrata-001'
        },
        rating: 0
      },

      // Seller 5: Bankura Pottery (Pending)
      {
        sellerIndex: 5,
        name: 'Panchmura Long-Eared Terracotta Heritage Horse (10 inch)',
        descriptionOriginal: 'Iconic world-renowned Bankura terracotta horse crafted with symmetrical hollow clay throwing technique.',
        originalLanguage: 'bn',
        category: 'Handicrafts',
        price: 750,
        productCost: 280,
        packagingCost: 50,
        stock: 20,
        images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 1100,
        dimensions: { length: 15, width: 10, height: 26 },
        provenanceCard: {
          artisanStory: 'Wheel thrown by Gopal Kumbhakar using alluvial clay from the Dwarkeswar river bank.',
          region: 'Panchmura, Bankura, West Bengal',
          processNote: 'Parts thrown separately on potters wheel, joined by hand, and pit-fired with dried tamarind wood.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Gopal-001'
        },
        rating: 0
      },
      {
        sellerIndex: 5,
        name: 'Handcrafted Terracotta Clay Tea Kettle & 4 Kulhad Set',
        descriptionOriginal: 'Natural porous clay teapot and earthen cups imparting the earthy "Sondhi Khushboo" to brewed chai.',
        originalLanguage: 'bn',
        category: 'Handicrafts',
        price: 640,
        productCost: 240,
        packagingCost: 45,
        stock: 30,
        images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80'],
        weightGrams: 1300,
        dimensions: { length: 22, width: 18, height: 16 },
        provenanceCard: {
          artisanStory: 'Hand-shaped from lead-free natural clay by artisan potters of Bankura.',
          region: 'Bankura, West Bengal',
          processNote: 'Burnished with river pebbles and fired in reduction kilns.',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-Artisan-Gopal-002'
        },
        rating: 0
      }
    ];

    const createdProducts = [];
    for (const p of productsData) {
      const seller = createdSellers[p.sellerIndex];
      const prod = await Product.create({
        sellerId: seller.profile._id,
        name: p.name,
        descriptionOriginal: p.descriptionOriginal,
        originalLanguage: p.originalLanguage,
        category: p.category,
        price: p.price,
        productCost: p.productCost,
        packagingCost: p.packagingCost,
        stock: p.stock,
        images: p.images,
        weightGrams: p.weightGrams,
        dimensions: p.dimensions,
        provenanceCard: p.provenanceCard,
        isActive: true,
        rating: p.rating
      });
      createdProducts.push(prod);
    }

    // 6. Seed 15+ Orders in various states (placed, accepted, ready_for_pickup, in_transit, delivered, cancelled)
    const orderScenarios = [
      {
        custIndex: 0,
        sellerIndex: 0,
        prodIndexes: [0, 2],
        quantities: [2, 1],
        status: 'placed',
        mode: 'online',
        dpIndex: null
      },
      {
        custIndex: 1,
        sellerIndex: 1,
        prodIndexes: [4, 5],
        quantities: [1, 2],
        status: 'accepted',
        mode: 'online',
        dpIndex: null
      },
      {
        custIndex: 2,
        sellerIndex: 0,
        prodIndexes: [1],
        quantities: [1],
        status: 'ready_for_pickup',
        mode: 'cod',
        dpIndex: 0
      },
      {
        custIndex: 3,
        sellerIndex: 2,
        prodIndexes: [8],
        quantities: [1],
        status: 'in_transit',
        mode: 'online',
        dpIndex: 0
      },
      {
        custIndex: 0,
        sellerIndex: 1,
        prodIndexes: [6, 7],
        quantities: [2, 1],
        status: 'delivered',
        mode: 'online',
        dpIndex: 1
      },
      {
        custIndex: 1,
        sellerIndex: 0,
        prodIndexes: [0],
        quantities: [1],
        status: 'delivered',
        mode: 'cod',
        dpIndex: 0
      },
      {
        custIndex: 2,
        sellerIndex: 3,
        prodIndexes: [11],
        quantities: [1],
        status: 'delivered',
        mode: 'online',
        dpIndex: 2
      },
      {
        custIndex: 3,
        sellerIndex: 1,
        prodIndexes: [4],
        quantities: [1],
        status: 'delivered',
        mode: 'online',
        dpIndex: 1
      },
      {
        custIndex: 0,
        sellerIndex: 2,
        prodIndexes: [9],
        quantities: [1],
        status: 'cancelled',
        mode: 'online',
        dpIndex: null
      },
      {
        custIndex: 1,
        sellerIndex: 3,
        prodIndexes: [12],
        quantities: [1],
        status: 'in_transit',
        mode: 'cod',
        dpIndex: 2
      },
      {
        custIndex: 2,
        sellerIndex: 0,
        prodIndexes: [3],
        quantities: [2],
        status: 'ready_for_pickup',
        mode: 'online',
        dpIndex: 0
      },
      {
        custIndex: 3,
        sellerIndex: 2,
        prodIndexes: [10],
        quantities: [1],
        status: 'placed',
        mode: 'online',
        dpIndex: null
      },
      {
        custIndex: 0,
        sellerIndex: 1,
        prodIndexes: [5],
        quantities: [1],
        status: 'delivered',
        mode: 'online',
        dpIndex: 1
      },
      {
        custIndex: 1,
        sellerIndex: 0,
        prodIndexes: [1],
        quantities: [1],
        status: 'accepted',
        mode: 'online',
        dpIndex: null
      },
      {
        custIndex: 2,
        sellerIndex: 1,
        prodIndexes: [7],
        quantities: [2],
        status: 'delivered',
        mode: 'cod',
        dpIndex: 1
      }
    ];

    const createdOrders = [];
    for (let i = 0; i < orderScenarios.length; i++) {
      const sc = orderScenarios[i];
      const customer = createdCustomers[sc.custIndex];
      const seller = createdSellers[sc.sellerIndex];
      const dp = sc.dpIndex !== null ? createdDeliveryPartners[sc.dpIndex] : null;

      const items = sc.prodIndexes.map((pIdx, idx) => {
        const p = createdProducts[pIdx];
        return {
          productId: p._id,
          name: p.name,
          price: p.price,
          quantity: sc.quantities[idx]
        };
      });

      const totalItemsPrice = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
      const totalProdCost = items.reduce((sum, it, idx) => sum + (createdProducts[sc.prodIndexes[idx]].productCost || 0) * it.quantity, 0);
      const totalPkgCost = items.reduce((sum, it, idx) => sum + (createdProducts[sc.prodIndexes[idx]].packagingCost || 0) * it.quantity, 0);
      const deliveryCost = 90;

      const profitBreakdown = calculateProfitBreakdown({
        sellingPrice: totalItemsPrice,
        productCost: totalProdCost,
        packagingCost: totalPkgCost,
        deliveryCost
      });

      const totalAmount = totalItemsPrice + deliveryCost;

      const payment = await Payment.create({
        razorpayOrderId: `rzp_order_seed_${i + 1}`,
        razorpayPaymentId: `rzp_pay_seed_${i + 1}`,
        amount: totalAmount,
        status: sc.status === 'delivered' ? 'received' : (sc.mode === 'online' ? 'received' : 'pending'),
        paymentMode: sc.mode,
        reconciledBy: sc.status === 'delivered' && sc.mode === 'cod' && dp ? dp.profile._id : null,
        reconciledAt: sc.status === 'delivered' && sc.mode === 'cod' ? new Date() : null,
        linkedOrders: []
      });

      const checkpoints = [
        { location: 'Customer App', status: 'ORDER_PLACED', timestamp: new Date(Date.now() - (15 - i) * 3600 * 1000), updatedBy: customer._id }
      ];

      if (['accepted', 'ready_for_pickup', 'in_transit', 'delivered'].includes(sc.status)) {
        checkpoints.push({ location: seller.profile.businessName, status: 'ORDER_ACCEPTED', timestamp: new Date(Date.now() - (12 - i) * 3600 * 1000), updatedBy: seller.user._id });
      }
      if (['ready_for_pickup', 'in_transit', 'delivered'].includes(sc.status)) {
        checkpoints.push({ location: seller.profile.businessName, status: 'READY_FOR_PICKUP', timestamp: new Date(Date.now() - (8 - i) * 3600 * 1000), updatedBy: seller.user._id });
      }
      if (['in_transit', 'delivered'].includes(sc.status) && dp) {
        checkpoints.push({ location: dp.profile.serviceZone, status: 'IN_TRANSIT_TO_HUB', timestamp: new Date(Date.now() - (4 - i) * 3600 * 1000), updatedBy: dp.user._id });
      }
      if (sc.status === 'delivered' && dp) {
        checkpoints.push({ location: 'Customer Doorstep', status: 'DELIVERED', timestamp: new Date(), updatedBy: dp.user._id });
      }

      const order = await Order.create({
        customerId: customer._id,
        sellerId: seller.profile._id,
        items,
        paymentId: payment._id,
        status: sc.status,
        deliveryPartnerId: dp ? dp.profile._id : null,
        deliveryCost,
        checkpoints,
        etaEstimate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
        weatherAdjustedDelay: i % 3 === 0,
        profitBreakdown
      });

      payment.linkedOrders = [order._id];
      await payment.save();
      createdOrders.push(order);
    }

    // 7. Seed Sample Disputes
    await Dispute.create({
      orderId: createdOrders[3]._id, // in_transit
      raisedBy: createdCustomers[3]._id,
      category: 'delivery',
      description: 'Package has been delayed past original transit window.',
      status: 'under_admin_review'
    });

    await Dispute.create({
      orderId: createdOrders[2]._id, // ready_for_pickup (Ramesh, has trust circle)
      raisedBy: createdCustomers[2]._id,
      category: 'order',
      description: 'Requested customization verification before dispatch.',
      voiceNoteUrl: '/uploads/sample-voice-note.webm',
      status: 'under_trust_circle_review',
      mediatedBy: 'Sarpanch Anandrao Patil (Gram Panchayat Nashik Rural)'
    });

    await Dispute.create({
      orderId: createdOrders[4]._id, // delivered
      raisedBy: createdCustomers[0]._id,
      category: 'product',
      description: 'Minor damage to outer packaging seal during highland transit.',
      status: 'resolved',
      resolvedBy: adminUser._id,
      resolutionNote: 'Verified product integrity intact, 10% courtesy coupon provided to customer.'
    });

    // 8. Seed Sample Reviews
    await Review.create({
      orderId: createdOrders[4]._id,
      customerId: createdCustomers[0]._id,
      targetType: 'product',
      targetId: createdProducts[6]._id, // Turmeric
      rating: 5,
      comment: 'Exceptional aroma and rich vibrant color! True single-origin quality from Wayanad.'
    });

    await Review.create({
      orderId: createdOrders[5]._id,
      customerId: createdCustomers[1]._id,
      targetType: 'seller',
      targetId: createdSellers[0].profile._id, // Ramesh
      rating: 5,
      comment: 'Superb craftsmanship. The bamboo fruit basket is sturdy and beautifully finished.'
    });

    await Review.create({
      orderId: createdOrders[6]._id,
      customerId: createdCustomers[2]._id,
      targetType: 'delivery',
      targetId: createdDeliveryPartners[2].profile._id,
      rating: 5,
      comment: 'Prompt delivery and very polite hub delivery agent.'
    });

    // 9. Seed Sample Notifications
    await Notification.create({
      userId: createdSellers[0].user._id,
      title: 'Order Ready for Dispatch',
      message: 'Order #00234 is ready for hub pickup assignment.',
      read: false
    });

    await Notification.create({
      userId: createdCustomers[0]._id,
      title: 'Order Shipped',
      message: 'Your artisanal spice order is currently in transit.',
      read: false
    });

    // 10. Seed Wishlist
    await Wishlist.create({
      customerId: createdCustomers[0]._id,
      products: [createdProducts[0]._id, createdProducts[4]._id, createdProducts[8]._id]
    });

    console.log('----------------------------------------------------');
    console.log('[Seed] Database successfully populated with demo data!');
    console.log('Demo Login Credentials:');
    console.log('1. Admin: admin@nativerise.test / Admin@123');
    console.log('2. Seller (Approved & Vouched): ramesh@nativerise.test / Pass@123');
    console.log('3. Seller (Pending Approval): subrata@nativerise.test / Pass@123');
    console.log('4. Customer: customer1@nativerise.test / Pass@123');
    console.log('5. Delivery Partner: delivery1@nativerise.test / Pass@123');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();

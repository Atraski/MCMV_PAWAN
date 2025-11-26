const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('../models/Event');

// Sample events data
const sampleEvents = [
  {
    title: 'Gen WHY: A Millennial Spiral by Swati Sachdeva',
    description: 'This show is a bit like life right now — funny, messy & a little too real. It\'s about growing up, figuring things out, falling in love, missing the moment, and laughing through it all. If you\'ve ever felt like you\'re spiraling, but also somehow surviving — come through. Let\'s share a laugh. Or three.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    date: new Date('2025-11-29'),
    time: '18:00',
    location: {
      venue: 'Ambedkar International Convention Centre',
      address: 'Nagpur, Maharashtra',
      city: 'Nagpur',
    },
    category: 'entertainment',
    price: 599,
    currency: 'INR',
    interestedCount: 843,
    organizer: {
      name: 'Comedy Club Nagpur',
      email: 'info@comedyclub.com',
    },
    tags: ['comedy', 'stand-up', 'entertainment'],
  },
  {
    title: 'INDOMACH NAGPUR 2025 - B2B INDUSTRIAL MACHINERY AND ENGINEERING EXPO',
    description: 'Central India\'s Largest B2B Industrial Machinery & Engineering Expo. A Big Business Opportunity for manufacturers, suppliers, and industry professionals.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
    date: new Date('2025-12-05'),
    time: '10:00',
    location: {
      venue: 'Rashtrasant Tukadoji Maharaj Nagpur University Ground',
      address: 'Nagpur, Maharashtra',
      city: 'Nagpur',
    },
    category: 'business',
    price: 0,
    currency: 'INR',
    interestedCount: 121,
    organizer: {
      name: 'IndoMach Events',
      email: 'info@indomach.com',
    },
    tags: ['business', 'expo', 'industrial'],
  },
  {
    title: 'Classical Conclave Sawani Shende',
    description: 'Live Concert with Sawani Shende Sathaye (Indian Classical Vocalist). Experience the beauty of Indian classical music in this mesmerizing performance.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    date: new Date('2025-11-22'),
    time: '19:00',
    location: {
      venue: 'Chitnavis Centre',
      address: 'Nagpur, Maharashtra',
      city: 'Nagpur',
    },
    category: 'music',
    price: 500,
    currency: 'INR',
    interestedCount: 4,
    organizer: {
      name: 'Classical Music Society',
      email: 'info@classicalmusic.com',
    },
    tags: ['music', 'classical', 'concert'],
  },
  {
    title: 'Pool Party Fest, Belly Dance, Ramp Show, Games, Buffet Dinner',
    description: 'Join us for an amazing pool party with live entertainment, delicious buffet dinner, and fun games. Perfect for a weekend getaway!',
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
    date: new Date('2025-11-30'),
    time: '18:30',
    location: {
      venue: 'Resort Paradise',
      address: 'Nagpur, Maharashtra',
      city: 'Nagpur',
    },
    category: 'entertainment',
    price: 0,
    currency: 'INR',
    interestedCount: 250,
    organizer: {
      name: 'Party Organizers',
      email: 'info@party.com',
    },
    tags: ['party', 'entertainment', 'food'],
  },
  {
    title: 'OCLF 7th Edition - Orange City Literature Festival',
    description: 'Join us for the 7th edition of Orange City Literature Festival featuring 650+ Speakers, 550+ Sessions, and 50+ Workshops. A celebration of literature, ideas, and culture.',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    date: new Date('2025-11-21'),
    time: '16:00',
    location: {
      venue: 'Chitnavis Centre',
      address: 'Nagpur, Maharashtra',
      city: 'Nagpur',
    },
    category: 'festivals',
    price: 300,
    currency: 'INR',
    interestedCount: 191,
    organizer: {
      name: 'Raisoni Foundation',
      email: 'info@oclf.com',
    },
    tags: ['literature', 'festival', 'culture'],
  },
  {
    title: 'Upcoming Dubai Real Estate Expo in Nagpur 2025',
    description: 'Meet top industry experts and explore investment opportunities in Dubai real estate. Free entry for all visitors.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    date: new Date('2025-11-22'),
    time: '10:00',
    location: {
      venue: 'Radisson Blu Hotel, Nagpur',
      address: 'Nagpur, Maharashtra',
      city: 'Nagpur',
    },
    category: 'business',
    price: 0,
    currency: 'INR',
    interestedCount: 89,
    organizer: {
      name: 'Dubai Real Estate Group',
      email: 'info@dubaiexpo.com',
    },
    tags: ['real estate', 'expo', 'business'],
  },
];

const seedEvents = async () => {
  try {
    // Connect to MongoDB
    let mongoURI = process.env.MONGO_URI.trim();
    mongoURI = mongoURI.replace(/^["']|["']$/g, '');
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing events (optional - comment out if you want to keep existing)
    // await Event.deleteMany({});
    // console.log('🗑️  Cleared existing events');

    // Insert sample events
    const events = await Event.insertMany(sampleEvents);
    console.log(`✅ Seeded ${events.length} events`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    process.exit(1);
  }
};

seedEvents();













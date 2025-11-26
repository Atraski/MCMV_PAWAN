const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('../models/Event');

async function deleteTestEvent() {
  try {
    // Connect to MongoDB
    let mongoURI = process.env.MONGO_URI.trim();
    mongoURI = mongoURI.replace(/^["']|["']$/g, '');
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Delete test event
    const result = await Event.deleteMany({ 
      title: { $regex: /Test Event/i } 
    });

    console.log(`✅ Deleted ${result.deletedCount} test event(s)`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting test event:', error);
    process.exit(1);
  }
}

deleteTestEvent();




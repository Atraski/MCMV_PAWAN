const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('../models/Event');

const createTestEvent = async () => {
  try {
    // Connect to MongoDB
    let mongoURI = process.env.MONGO_URI.trim();
    mongoURI = mongoURI.replace(/^["']|["']$/g, '');
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Create a test event for booking/payment testing
    const testEvent = {
      title: 'Test Event - Booking & Payment Check',
      description: 'This is a test event created to verify booking and payment functionality. Please use this event to test the complete booking flow including payment gateway integration.',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      time: '18:00',
      endTime: '21:00',
      location: {
        venue: 'Test Venue - MCMV',
        address: 'Test Address, Nagpur',
        city: 'Nagpur',
      },
      category: 'entertainment',
      price: 100, // ₹100 for easy testing
      currency: 'INR',
      maxCapacity: 100,
      organizer: {
        name: 'MCMV Test Organizer',
        email: 'test@mcmv.com',
        phone: '+91 9876543210',
      },
      tags: ['test', 'booking', 'payment'],
      isActive: true,
    };

    // Check if test event already exists
    const existingEvent = await Event.findOne({ title: testEvent.title });
    if (existingEvent) {
      console.log('⚠️  Test event already exists with ID:', existingEvent._id);
      console.log('📝 You can use this event to test booking and payment');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Insert test event
    const event = await Event.create(testEvent);
    console.log('✅ Test event created successfully!');
    console.log('📋 Event Details:');
    console.log('   ID:', event._id);
    console.log('   Title:', event.title);
    console.log('   Date:', event.date.toLocaleDateString('en-IN'));
    console.log('   Time:', event.time);
    console.log('   Price: ₹', event.price);
    console.log('   Venue:', event.location.venue);
    console.log('\n💡 You can now test booking and payment with this event');
    console.log('🔗 Event URL: /events/' + event._id);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test event:', error);
    process.exit(1);
  }
};

createTestEvent();









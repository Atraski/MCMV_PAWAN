const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    image: {
      type: String,
      required: [true, 'Event image is required'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    endTime: {
      type: String,
      default: null, // Optional end time (e.g., "5:00 PM")
    },
    endDate: {
      type: Date,
      default: null, // Optional end date (if event spans multiple days)
    },
    location: {
      venue: {
        type: String,
        required: [true, 'Venue name is required'],
      },
      address: {
        type: String,
        required: [true, 'Address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        default: 'Nagpur',
      },
    },
    category: {
      type: String,
      enum: ['entertainment', 'art-theatre', 'food-drinks', 'business', 'festivals', 'sports', 'music', 'comedy', 'other'],
      default: 'entertainment',
    },
    price: {
      type: Number,
      default: 0, // 0 means free
    },
    currency: {
      type: String,
      default: 'INR',
    },
    interestedCount: {
      type: Number,
      default: 0,
    },
    bookedCount: {
      type: Number,
      default: 0,
    },
    maxCapacity: {
      type: Number,
      default: null, // null means unlimited
    },
    organizer: {
      name: {
        type: String,
        required: [true, 'Organizer name is required'],
      },
      email: String,
      phone: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
eventSchema.index({ date: 1, city: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ isActive: 1 });

module.exports = mongoose.model('Event', eventSchema);





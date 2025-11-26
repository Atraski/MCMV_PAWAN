const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event is required'],
    },
    tickets: {
      type: Number,
      required: [true, 'Number of tickets is required'],
      min: [1, 'At least 1 ticket is required'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online', 'card', 'upi', 'free', 'cashfree'],
    },
    cashfreeOrderId: {
      type: String,
    },
    cashfreeSessionId: {
      type: String,
    },
    cashfreePaymentId: {
      type: String,
    },
    bookingReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    attendeeDetails: {
      name: String,
      email: String,
      phone: String,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
bookingSchema.index({ user: 1, event: 1 });
bookingSchema.index({ event: 1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ status: 1 });

// Generate unique booking reference
bookingSchema.pre('save', async function (next) {
  if (!this.bookingReference) {
    const crypto = require('crypto');
    this.bookingReference = `MCMV-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);




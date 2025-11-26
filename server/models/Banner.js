const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['hero', 'banner', 'event', 'section'],
      default: 'hero',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    link: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
bannerSchema.index({ type: 1, isActive: 1 });
bannerSchema.index({ order: 1 });

module.exports = mongoose.model('Banner', bannerSchema);













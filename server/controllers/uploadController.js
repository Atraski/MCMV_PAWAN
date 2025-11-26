const cloudinary = require('../config/cloudinary');
const Banner = require('../models/Banner');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// @route   POST /api/upload/banner
// @desc    Upload banner/hero image to Cloudinary
// @access  Private (Admin only - you can change this)
const uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { title, alt, type = 'hero', order = 0, link, description } = req.body;

    // Upload to Cloudinary with optimizations
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'mcmv/banners',
      transformation: [
        { width: 1920, height: 1080, crop: 'limit' }, // Limit size for hero banners
        { quality: 'auto' }, // Auto quality optimization
        { format: 'auto' }, // Auto format (WebP, AVIF when supported)
      ],
      resource_type: 'image',
    });

    // Delete temporary file
    fs.unlinkSync(req.file.path);

    // Save to database
    const banner = new Banner({
      title: title || 'Banner',
      imageUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      alt: alt || title || 'Banner image',
      type,
      order: parseInt(order),
      link: link || '',
      description: description || '',
    });

    await banner.save();

    res.status(201).json({
      success: true,
      message: 'Banner uploaded successfully',
      banner,
    });
  } catch (error) {
    // Delete temporary file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Upload banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading banner',
      error: error.message,
    });
  }
};

// @route   GET /api/banners
// @desc    Get all banners (filtered by type)
// @access  Public
const getBanners = async (req, res) => {
  try {
    const { type, active } = req.query;

    const query = {};
    if (type) {
      query.type = type;
    }
    if (active !== undefined) {
      query.isActive = active === 'true';
    } else {
      query.isActive = true; // Default to active only
    }

    const banners = await Banner.find(query)
      .sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      banners,
      count: banners.length,
    });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching banners',
      error: error.message,
    });
  }
};

// @route   DELETE /api/banners/:id
// @desc    Delete banner (and remove from Cloudinary)
// @access  Private (Admin only)
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(banner.cloudinaryPublicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary delete error:', cloudinaryError);
      // Continue even if Cloudinary delete fails
    }

    // Delete from database
    await Banner.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting banner',
      error: error.message,
    });
  }
};

// @route   PUT /api/banners/:id
// @desc    Update banner (order, active status, etc.)
// @access  Private (Admin only)
const updateBanner = async (req, res) => {
  try {
    const { title, alt, order, isActive, link, description } = req.body;

    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    if (title !== undefined) banner.title = title;
    if (alt !== undefined) banner.alt = alt;
    if (order !== undefined) banner.order = parseInt(order);
    if (isActive !== undefined) banner.isActive = isActive;
    if (link !== undefined) banner.link = link;
    if (description !== undefined) banner.description = description;

    await banner.save();

    res.json({
      success: true,
      message: 'Banner updated successfully',
      banner,
    });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating banner',
      error: error.message,
    });
  }
};

module.exports = {
  upload,
  uploadBanner,
  getBanners,
  deleteBanner,
  updateBanner,
};













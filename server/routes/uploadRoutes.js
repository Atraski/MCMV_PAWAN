const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  upload,
  uploadBanner,
  getBanners,
  deleteBanner,
  updateBanner,
} = require('../controllers/uploadController');

// Public routes
router.get('/banners', getBanners);

// Protected routes (Admin only - you can add admin check later)
router.post('/banner', authenticate, upload.single('image'), uploadBanner);
router.put('/banners/:id', authenticate, updateBanner);
router.delete('/banners/:id', authenticate, deleteBanner);

module.exports = router;













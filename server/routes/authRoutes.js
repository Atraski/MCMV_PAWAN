const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const {
  registerWithEmail,
  loginWithEmail,
  sendMobileOTP,
  verifyMobileOTP,
  googleAuth,
  googleAuthCallback,
  getCurrentUser,
  updateCurrentUser,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Email/Password Authentication
router.post('/register', registerWithEmail);
router.post('/login', loginWithEmail);

// Mobile OTP Authentication
router.post('/mobile/send-otp', sendMobileOTP);
router.post('/mobile/verify-otp', verifyMobileOTP);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  googleAuthCallback
);

// Get current user (protected route)
router.get('/me', authenticate, getCurrentUser);
router.put('/me', authenticate, updateCurrentUser);

module.exports = router;


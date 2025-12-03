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
  sendEmailVerification,
  verifyEmail,
  sendMobileVerification,
  verifyMobile,
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

// Email Verification (protected routes)
router.post('/email/send-verification', authenticate, sendEmailVerification);
router.post('/email/verify', authenticate, verifyEmail);

// Mobile Verification (protected routes)
router.post('/mobile/send-verification', authenticate, sendMobileVerification);
router.post('/mobile/verify-verification', authenticate, verifyMobile);

module.exports = router;


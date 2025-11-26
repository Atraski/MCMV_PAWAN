const express = require('express');
const router = express.Router();
const { createPaymentSession, verifyPayment, handleWebhook } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// @route   POST /api/payments/create-session
// @desc    Create Cashfree payment session
// @access  Private
router.post('/create-session', authenticate, createPaymentSession);

// @route   GET /api/payments/verify/:orderId
// @desc    Verify Cashfree payment
// @access  Private
router.get('/verify/:orderId', authenticate, verifyPayment);

// @route   POST /api/payments/webhook
// @desc    Cashfree webhook handler
// @access  Public (Cashfree will call this)
router.post('/webhook', handleWebhook);

module.exports = router;











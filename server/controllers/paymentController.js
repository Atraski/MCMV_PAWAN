const { cashfreeConfig, getApiUrl } = require('../config/cashfree');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { isBookingAllowed } = require('../utils/eventHelpers');
const https = require('https');
const crypto = require('crypto');

// Helper function to make Cashfree API requests
const makeCashfreeRequest = (method, endpoint, data = null) => {
  return new Promise((resolve, reject) => {
    // Validate credentials before making request
    if (!cashfreeConfig.clientId || !cashfreeConfig.clientSecret) {
      const error = new Error('Cashfree credentials not configured. Please check CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET in .env file');
      console.error('❌ Cashfree credentials missing:', {
        hasClientId: !!cashfreeConfig.clientId,
        hasClientSecret: !!cashfreeConfig.clientSecret,
        environment: cashfreeConfig.environment
      });
      reject(error);
      return;
    }

    const url = getApiUrl(endpoint);
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': cashfreeConfig.clientId,
        'x-client-secret': cashfreeConfig.clientSecret,
        'x-api-version': cashfreeConfig.apiVersion,
        'Accept': 'application/json',
      },
    };

    // Log request details (without exposing secrets)
    console.log('📤 Cashfree API Request:', {
      method,
      endpoint,
      url,
      environment: cashfreeConfig.environment,
      hasClientId: !!cashfreeConfig.clientId,
      hasClientSecret: !!cashfreeConfig.clientSecret,
      clientIdPrefix: cashfreeConfig.clientId ? cashfreeConfig.clientId.substring(0, 8) + '...' : 'MISSING',
    });

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            // Log full error for debugging
            console.error('Cashfree API Error:', {
              statusCode: res.statusCode,
              response: parsed,
              endpoint: url
            });
            reject(new Error(parsed.message || parsed.error?.message || `Cashfree API error: ${res.statusCode} - ${JSON.stringify(parsed)}`));
          }
        } catch (error) {
          console.error('Parse Error:', responseData);
          reject(new Error(`Failed to parse response: ${error.message}. Response: ${responseData.substring(0, 200)}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

// @route   POST /api/payments/create-session
// @desc    Create Cashfree payment session
// @access  Private
const createPaymentSession = async (req, res) => {
  try {
    const { eventId, tickets } = req.body;
    const userId = req.userId;

    if (!eventId || !tickets || tickets < 1) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and number of tickets are required',
      });
    }

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (!event.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Event is not available for booking',
      });
    }

    // Check if booking is allowed (30 minutes before start time)
    const bookingCheck = isBookingAllowed(event);
    if (!bookingCheck.allowed) {
      return res.status(400).json({
        success: false,
        message: bookingCheck.message,
      });
    }

    // Check capacity
    if (event.maxCapacity && event.bookedCount + tickets > event.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough tickets available',
      });
    }

    // Calculate total amount (Cashfree accepts amount in rupees, not paise)
    const totalAmount = event.price * tickets;
    
    // If event is free, create booking directly
    if (totalAmount === 0) {
      const booking = new Booking({
        user: userId,
        event: eventId,
        tickets,
        totalAmount: 0,
        paymentMethod: 'free',
        status: 'confirmed',
        paymentStatus: 'paid',
      });

      await booking.save();

      // Update event booked count
      event.bookedCount += tickets;
      await event.save();

      return res.json({
        success: true,
        message: 'Booking confirmed (Free event)',
        booking,
        isFree: true,
      });
    }

    // Get user details for payment
    const User = require('../models/User');
    const user = await User.findById(userId);

    // Create payment session
    const orderId = `MCMV_${Date.now()}_${userId}`;
    const customerDetails = {
      customer_id: userId.toString(),
      customer_email: user.email || 'customer@example.com',
      customer_phone: user.mobile || '9999999999',
      customer_name: user.name || 'Customer',
    };

    // Build return and notify URLs
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    
    // Production mode me HTTPS required hai
    if (cashfreeConfig.environment === 'production') {
      if (!clientUrl.startsWith('https://') || !serverUrl.startsWith('https://')) {
        console.warn('⚠️  Production mode me HTTPS URLs required hain. Current URLs:');
        console.warn(`   CLIENT_URL: ${clientUrl}`);
        console.warn(`   SERVER_URL: ${serverUrl}`);
        console.warn('💡 Locally test karne ke liye ngrok ya similar tunneling service use karein.');
        console.warn('📖 Guide: server/PRODUCTION_LOCAL_SETUP.md');
      }
    }

    const orderMeta = {
      return_url: `${clientUrl}/payment/callback?order_id=${orderId}`,
      notify_url: `${serverUrl}/api/payments/webhook`,
    };

    // Validate Cashfree credentials
    if (!cashfreeConfig.clientId || !cashfreeConfig.clientSecret) {
      console.error('❌ Cashfree credentials validation failed:', {
        hasClientId: !!cashfreeConfig.clientId,
        hasClientSecret: !!cashfreeConfig.clientSecret,
        environment: cashfreeConfig.environment,
      });
      return res.status(500).json({
        success: false,
        message: 'Cashfree credentials not configured. Please check CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET in .env file',
      });
    }

    // Cashfree API expects order_amount in smallest currency unit (paise for INR)
    // But based on Cashfree docs, they accept amount in rupees for INR
    const sessionData = {
      order_id: orderId,
      order_amount: totalAmount, // Amount in rupees for INR
      order_currency: event.currency || 'INR',
      order_note: `Booking for ${event.title} - ${tickets} ticket(s)`,
      customer_details: customerDetails,
      order_meta: orderMeta,
    };

    console.log('Creating Cashfree order:', {
      orderId,
      amount: totalAmount,
      currency: event.currency || 'INR',
      environment: cashfreeConfig.environment,
      endpoint: getApiUrl('/orders')
    });

    try {
      // Step 1: Create order
      const orderResponse = await makeCashfreeRequest('POST', '/orders', sessionData);
      
      console.log('Cashfree order response:', JSON.stringify(orderResponse, null, 2));

      if (!orderResponse || !orderResponse.order_id) {
        console.error('Invalid Cashfree order response:', orderResponse);
        throw new Error(orderResponse?.message || orderResponse?.error?.message || 'Failed to create order. Invalid response from Cashfree.');
      }

      // Step 2: Create payment session for the order
      // For Cashfree v3, session creation might return payment_session_id directly
      // If order response already has payment_session_id, use it; otherwise create session
      let paymentSessionId = orderResponse.payment_session_id;
      
      if (!paymentSessionId) {
        // Create payment session separately
        const sessionRequestData = {
          order_id: orderResponse.order_id,
          order_amount: totalAmount,
          order_currency: event.currency || 'INR',
          customer_details: customerDetails,
          order_meta: orderMeta,
        };

        const sessionResponse = await makeCashfreeRequest('POST', `/orders/${orderResponse.order_id}/sessions`, sessionRequestData);
        paymentSessionId = sessionResponse?.payment_session_id;
      }
      
      if (paymentSessionId) {
        // Create pending booking
        const booking = new Booking({
          user: userId,
          event: eventId,
          tickets,
          totalAmount,
          paymentMethod: 'cashfree',
          status: 'pending',
          paymentStatus: 'pending',
          bookingReference: orderResponse.order_id,
          cashfreeOrderId: orderResponse.order_id,
          cashfreeSessionId: paymentSessionId,
        });

        await booking.save();

        res.json({
          success: true,
          paymentSessionId: paymentSessionId,
          orderId: orderResponse.order_id,
          bookingId: booking._id,
          amount: totalAmount,
          currency: event.currency || 'INR',
        });
      } else {
        console.error('Failed to get payment_session_id. Order response:', orderResponse);
        throw new Error('Failed to create payment session. Payment session ID not received from Cashfree.');
      }
    } catch (apiError) {
      console.error('Cashfree API call failed:', apiError);
      throw apiError;
    }
  } catch (error) {
    console.error('Create payment session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment session',
      error: error.message,
    });
  }
};

// @route   GET /api/payments/verify/:orderId
// @desc    Verify Cashfree payment
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    // Get booking by order ID
    const booking = await Booking.findOne({
      cashfreeOrderId: orderId,
      user: userId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Verify payment with Cashfree
    const cashfreeResponse = await makeCashfreeRequest('GET', `/orders/${orderId}`);

    if (cashfreeResponse && cashfreeResponse.order_status === 'PAID') {
      // Update booking
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.cashfreePaymentId = cashfreeResponse.payment_id || null;
      await booking.save();

      // Update event booked count
      const event = await Event.findById(booking.event);
      if (event) {
        event.bookedCount += booking.tickets;
        await event.save();
      }

      // Populate booking details
      await booking.populate('event', 'title date time location image');

      res.json({
        success: true,
        message: 'Payment verified and booking confirmed',
        booking,
      });
    } else {
      res.json({
        success: false,
        message: 'Payment not completed',
        orderStatus: cashfreeResponse?.order_status || 'UNKNOWN',
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
    });
  }
};

// @route   POST /api/payments/webhook
// @desc    Cashfree webhook handler
// @access  Public (Cashfree will call this)
const handleWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    const signature = req.headers['x-cashfree-signature'];
    const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;

    // Verify webhook signature (Production me important for security)
    if (webhookSecret && signature && cashfreeConfig.environment === 'production') {
      try {
        // Cashfree uses HMAC SHA256 for signature verification
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(JSON.stringify(webhookData))
          .digest('hex');
        
        if (signature !== expectedSignature) {
          console.error('⚠️  Invalid webhook signature - Potential security threat');
          return res.status(401).json({ 
            success: false, 
            error: 'Invalid webhook signature' 
          });
        }
        console.log('✅ Webhook signature verified');
      } catch (sigError) {
        console.error('Error verifying webhook signature:', sigError);
        // In production, reject if signature verification fails
        if (cashfreeConfig.environment === 'production') {
          return res.status(401).json({ 
            success: false, 
            error: 'Signature verification failed' 
          });
        }
      }
    } else if (cashfreeConfig.environment === 'production' && !webhookSecret) {
      console.warn('⚠️  Production mode: Webhook secret not configured. Please add CASHFREE_WEBHOOK_SECRET to .env');
    }

    const { orderId, orderAmount, orderStatus, paymentStatus } = webhookData;

    if (orderStatus === 'PAID' && paymentStatus === 'SUCCESS') {
      // Find booking by order ID
      const booking = await Booking.findOne({ cashfreeOrderId: orderId });

      if (booking && booking.paymentStatus === 'pending') {
        // Update booking
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        booking.cashfreePaymentId = webhookData.paymentId || null;
        await booking.save();

        // Update event booked count
        const event = await Event.findById(booking.event);
        if (event) {
          event.bookedCount += booking.tickets;
          await event.save();
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createPaymentSession,
  verifyPayment,
  handleWebhook,
};


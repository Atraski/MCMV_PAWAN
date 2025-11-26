const User = require('../models/User');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const nodemailer = require('nodemailer');

// Initialize Twilio client (if credentials are provided)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Initialize Nodemailer transporter
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Generate JWT Token
const generateToken = (userId, email, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Please set JWT_SECRET in your .env file.');
  }
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Send OTP via SMS
const sendOTPviaSMS = async (mobile, otpCode) => {
  try {
    if (!twilioClient) {
      console.log('\n📱 ============================================');
      console.log('📱 Twilio not configured. OTP for testing:');
      console.log(`📱 Mobile: ${mobile}`);
      console.log(`📱 OTP Code: ${otpCode}`);
      console.log('📱 ============================================\n');
      return { success: true, message: 'OTP generated (Twilio not configured)' };
    }

    const message = await twilioClient.messages.create({
      body: `Your MyCityMyVoice verification code is: ${otpCode}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${mobile}`,
    });

    console.log('\n✅ SMS sent successfully via Twilio');
    console.log(`📱 Message SID: ${message.sid}\n`);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('\n❌ Error sending SMS via Twilio:', error.message);
    console.log('\n📱 ============================================');
    console.log('📱 OTP for testing (SMS failed):');
    console.log(`📱 Mobile: ${mobile}`);
    console.log(`📱 OTP Code: ${otpCode}`);
    console.log('📱 ============================================\n');
    
    // In development mode, still return success so OTP can be used
    if (process.env.NODE_ENV === 'development') {
      return { success: true, message: 'OTP generated (SMS failed, but OTP available for testing)' };
    }
    
    return { success: false, error: error.message };
  }
};

// Send OTP via Email
const sendOTPviaEmail = async (email, otpCode) => {
  try {
    if (!transporter) {
      console.log('Email not configured. OTP:', otpCode);
      return { success: true, message: 'OTP generated (Email not configured)' };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'MyCityMyVoice - Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FFD700;">MyCityMyVoice</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #FFD700; font-size: 32px; letter-spacing: 5px;">${otpCode}</h1>
          <p>This code is valid for 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// @route   POST /api/auth/register
// @desc    Register user with email and password
// @access  Public
const registerWithEmail = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    const trimmedName = name ? name.trim() : '';
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    const sanitizedMobile = mobile ? String(mobile).replace(/\D/g, '') : '';

    // Validation
    if (!trimmedName || !normalizedEmail || !password || !sanitizedMobile) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and mobile number',
      });
    }

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    if (!/^\d{10}$/.test(sanitizedMobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if user already exists by email or mobile
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { mobile: sanitizedMobile }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or mobile already exists',
      });
    }

    // Create user
    const user = new User({
      name: trimmedName,
      email: normalizedEmail,
      mobile: sanitizedMobile,
      password,
      isEmailVerified: false,
      isMobileVerified: false,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login user with email and password
// @access  Public
const loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// @route   POST /api/auth/mobile/send-otp
// @desc    Send OTP to mobile number
// @access  Public
const sendMobileOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    // Validation
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number',
      });
    }

    // Generate 6-digit OTP
    const otpCode = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Set expiration (10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Find or create user
    let user = await User.findOne({ mobile });
    let isNewUser = false;
    
    if (user) {
      user.otp = { code: otpCode, expiresAt };
      await user.save();
    } else {
      isNewUser = true;
      user = new User({
        mobile,
        otp: { code: otpCode, expiresAt },
        isMobileVerified: false,
      });
      await user.save();
    }

    // Send OTP via SMS
    const smsResult = await sendOTPviaSMS(mobile, otpCode);

    // Always show OTP in console for development/testing
    console.log('\n🔐 ============================================');
    console.log('🔐 OTP Generated:');
    console.log(`🔐 Mobile: ${mobile}`);
    console.log(`🔐 OTP Code: ${otpCode}`);
    console.log(`🔐 Valid for: 10 minutes`);
    console.log('🔐 ============================================\n');

    res.json({
      success: true,
      message: isNewUser ? 'OTP sent successfully. We will create your account after verification.' : 'OTP sent successfully',
      mobile: mobile,
      isNewUser: isNewUser,
      // In development, always return OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp: otpCode }),
      // Also return OTP if SMS failed (for testing)
      ...(smsResult && !smsResult.success && { otp: otpCode }),
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message,
    });
  }
};

// @route   POST /api/auth/mobile/verify-otp
// @desc    Verify OTP and login/register user
// @access  Public
const verifyMobileOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    // Validation
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number',
      });
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit OTP',
      });
    }

    // Find user
    const user = await User.findOne({ mobile });
    if (!user || !user.otp || !user.otp.code) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new OTP',
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP',
      });
    }

    // Verify OTP
    if (user.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Check if this is a new user (no name means new sign up)
    const isNewUser = !user.name;

    // OTP verified - update user
    user.isMobileVerified = true;
    user.otp = undefined; // Clear OTP after verification
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.mobile, user.role);

    res.json({
      success: true,
      message: isNewUser ? 'Account created and verified successfully!' : 'Mobile number verified successfully',
      token,
      isNewUser: isNewUser,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        isMobileVerified: user.isMobileVerified,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    });
  }
};

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
const googleAuth = async (req, res) => {
  // This will be handled by Passport strategy
  // Redirect to Google OAuth
  res.json({
    success: true,
    message: 'Redirect to Google OAuth',
    url: '/api/auth/google/callback',
  });
};

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
const googleAuthCallback = async (req, res) => {
  try {
    // User data is attached by Passport strategy
    const passportData = req.user;
    
    if (!passportData || !passportData.user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_auth_failed`);
    }

    const user = passportData.user;

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    // Redirect to frontend with token
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google auth callback error:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/login?error=google_auth_error`);
  }
};

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -otp');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
        profilePicture: user.profilePicture,
        membershipStatus: user.membershipStatus,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

// @route   PUT /api/auth/me
// @desc    Update current user
// @access  Private
const updateCurrentUser = async (req, res) => {
  try {
    const { name, mobile, profilePicture } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (mobile !== undefined) user.mobile = mobile;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
        profilePicture: user.profilePicture,
        membershipStatus: user.membershipStatus,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

module.exports = {
  registerWithEmail,
  loginWithEmail,
  sendMobileOTP,
  verifyMobileOTP,
  googleAuth,
  googleAuthCallback,
  getCurrentUser,
  updateCurrentUser,
};


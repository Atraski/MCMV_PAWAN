const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error('❌ Error: MONGO_URI is not set in .env file');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ Error: JWT_SECRET is not set in .env file');
  console.error('💡 Tip: Generate one using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Import passport config
require('./config/passport');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// MongoDB Connection
const connectDB = async () => {
  try {
    // Clean the connection string - remove any whitespace and quotes
    let mongoURI = process.env.MONGO_URI.trim();
    
    // Remove quotes if present
    mongoURI = mongoURI.replace(/^["']|["']$/g, '');
    
    // Validate connection string format
    if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
      console.error('❌ Invalid MONGO_URI format. Must start with mongodb:// or mongodb+srv://');
      process.exit(1);
    }
    
    // Connection options for newer MongoDB driver (no deprecated options)
    const options = {
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    console.log('🔄 Attempting to connect to MongoDB...');
    await mongoose.connect(mongoURI, options);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    
    // Provide helpful error messages
    if (err.message.includes('Server record does not share hostname')) {
      console.error('\n💡 Tip: This error usually occurs with MongoDB Atlas SRV connections.');
      console.error('   Common fixes:');
      console.error('   1. Ensure your MONGO_URI starts with: mongodb+srv://');
      console.error('   2. URL-encode special characters in your password (@ → %40, # → %23, etc.)');
      console.error('   3. Verify the connection string has no extra spaces or quotes');
      console.error('   4. Check that your MongoDB Atlas cluster is accessible');
      console.error('   Example format: mongodb+srv://username:encoded-password@cluster.mongodb.net/dbname');
      console.error('\n   Alternative: Try using the non-SRV connection string from Atlas');
    } else if (err.message.includes('authentication failed')) {
      console.error('\n💡 Tip: Authentication failed. Please check:');
      console.error('   - Your MongoDB username and password');
      console.error('   - Special characters in password are URL-encoded');
      console.error('   - Your database user has proper permissions');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.error('\n💡 Tip: Cannot resolve MongoDB hostname.');
      console.error('   - Check your internet connection');
      console.error('   - Verify your MongoDB Atlas cluster is running');
      console.error('   - Check if your IP is whitelisted in MongoDB Atlas');
    } else if (err.message.includes('timed out')) {
      console.error('\n💡 Tip: Connection timed out.');
      console.error('   - Check your internet connection');
      console.error('   - Verify your MongoDB Atlas cluster is accessible');
      console.error('   - Check firewall settings');
    }
    
    // Exit process with failure
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Connect to database
connectDB();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MyCityMyVoice API is running' });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Event Routes
app.use('/api/events', eventRoutes);

// Upload Routes
app.use('/api/upload', uploadRoutes);

// Payment Routes
app.use('/api/payments', paymentRoutes);

// 404 Handler
app.use((req, res) => {
  console.log(`⚠️  404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});


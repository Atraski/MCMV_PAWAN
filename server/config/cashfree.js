// Cashfree Configuration
const cashfreeConfig = {
  clientId: process.env.CASHFREE_CLIENT_ID?.trim(),
  clientSecret: process.env.CASHFREE_CLIENT_SECRET?.trim(),
  environment: (process.env.CASHFREE_ENVIRONMENT || 'sandbox').trim().toLowerCase(), // 'sandbox' or 'production'
  apiVersion: '2023-08-01',
};

// Validate configuration
if (!cashfreeConfig.clientId || !cashfreeConfig.clientSecret) {
  console.warn('⚠️  Cashfree credentials not found in environment variables');
}

// Get base URL based on environment
const getBaseUrl = () => {
  return cashfreeConfig.environment === 'production'
    ? 'https://api.cashfree.com'
    : 'https://sandbox.cashfree.com';
};

// Get API endpoint
const getApiUrl = (endpoint) => {
  const baseUrl = getBaseUrl();
  // Cashfree API v3 uses /pg/orders endpoint
  return `${baseUrl}/pg${endpoint}`;
};

module.exports = {
  cashfreeConfig,
  getApiUrl,
};


require('dotenv').config();
const { cashfreeConfig, getApiUrl } = require('../config/cashfree');

console.log('🔍 Cashfree Configuration Check:');
console.log('================================');
console.log('Environment:', cashfreeConfig.environment);
console.log('Client ID:', cashfreeConfig.clientId ? `${cashfreeConfig.clientId.substring(0, 10)}...` : '❌ NOT SET');
console.log('Client Secret:', cashfreeConfig.clientSecret ? '✅ SET' : '❌ NOT SET');
console.log('API Version:', cashfreeConfig.apiVersion);
console.log('Base URL:', cashfreeConfig.environment === 'production' ? 'https://api.cashfree.com' : 'https://sandbox.cashfree.com');
console.log('Test Endpoint:', getApiUrl('/orders'));
console.log('================================');

if (!cashfreeConfig.clientId || !cashfreeConfig.clientSecret) {
  console.error('\n❌ ERROR: Cashfree credentials are missing!');
  console.error('Please add these to your .env file:');
  console.error('CASHFREE_CLIENT_ID=your_client_id');
  console.error('CASHFREE_CLIENT_SECRET=your_client_secret');
  console.error('CASHFREE_ENVIRONMENT=sandbox');
  process.exit(1);
} else {
  console.log('\n✅ Cashfree credentials are configured!');
}











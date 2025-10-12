// İkas App Configuration
export const config = {
  // App credentials (from İkas Partners dashboard)
  appId: process.env.IKAS_CLIENT_ID || 'your_client_id_here',
  appSecret: process.env.IKAS_CLIENT_SECRET || 'your_client_secret_here',
  
  // OAuth URLs
  callbackUrl: process.env.IKAS_CALLBACK_URL || 'http://localhost:3000/api/oauth/callback/ikas',
  deployUrl: process.env.DEPLOY_URL || 'http://localhost:3000',
  
  // App scopes (permissions)
  scope: [
    'orders:read',
    'orders:write', 
    'products:read',
    'products:write',
    'customers:read',
    'customers:write',
    'webhooks:read',
    'webhooks:write'
  ].join(' '),
  
  // Session configuration
  sessionSecret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
  cookiePassword: process.env.SESSION_SECRET || 'your-super-secret-session-key',
  
  // Demo mode
  demoMode: process.env.DEMO_MODE === 'true',
  
  // Redis configuration
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Base URL
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  
  // Webhook endpoints
  webhookEndpoints: [
    {
      topic: 'order.completed',
      address: '/api/webhook/ikas/order-completed'
    },
    {
      topic: 'order.paid', 
      address: '/api/webhook/ikas/order-paid'
    },
    {
      topic: 'order.cancelled',
      address: '/api/webhook/ikas/order-cancelled'
    }
  ]
};

// Environment validation
export function validateConfig() {
  const required = ['appId', 'appSecret', 'sessionSecret'];
  const missing = required.filter(key => !config[key as keyof typeof config]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return true;
}
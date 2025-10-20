const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate random secret key
function generateSecretKey(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

// Environment variables template
const envTemplate = `# Environment Variables - Generated on ${new Date().toISOString()}
# Copy this file to .env.local and fill in your actual values

# ===========================================
# REQUIRED VARIABLES
# ===========================================

# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# Session Security (Generated)
SESSION_SECRET="${generateSecretKey()}"

# Application Mode
DEMO_MODE="false"

# Base URL
NEXT_PUBLIC_BASE_URL="https://your-domain.com"

# ===========================================
# EMAIL CONFIGURATION
# ===========================================

# SMTP Settings
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_SECURE="false"

# Email Templates
EMAIL_FROM_NAME="Affiliate Platform"
EMAIL_FROM_ADDRESS="noreply@your-domain.com"

# ===========================================
# PAYMENT CONFIGURATION
# ===========================================

# Stripe Settings
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Payment Settings
DEFAULT_CURRENCY="TRY"
PAYMENT_METHODS="bank_transfer,stripe,paypal"

# ===========================================
# CACHE & PERFORMANCE
# ===========================================

# Redis Configuration (Optional)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""
REDIS_DB="0"

# Cache Settings
CACHE_TTL="300"
CACHE_MAX_SIZE="100"

# ===========================================
# ANALYTICS & MONITORING
# ===========================================

# Google Analytics
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
GOOGLE_TAG_MANAGER_ID="GTM-XXXXXXX"

# Sentry Error Tracking
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
SENTRY_ENVIRONMENT="production"

# Logging
LOG_LEVEL="info"
LOG_FORMAT="json"

# ===========================================
# SECURITY CONFIGURATION
# ===========================================

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"

# CORS Settings
CORS_ORIGIN="https://your-domain.com"
CORS_CREDENTIALS="true"

# Security Headers
SECURITY_HEADERS="true"
CONTENT_SECURITY_POLICY="default-src 'self'"

# ===========================================
# THIRD-PARTY INTEGRATIONS
# ===========================================

# Ikas Integration
IKAS_API_KEY="your-ikas-api-key"
IKAS_API_URL="https://api.ikas.com"

# Social Media APIs
INSTAGRAM_API_KEY=""
TIKTOK_API_KEY=""
YOUTUBE_API_KEY=""

# ===========================================
# DEVELOPMENT SETTINGS
# ===========================================

# Debug Mode
NODE_ENV="production"
DEBUG="false"

# API Settings
API_TIMEOUT="10000"
API_RETRY_ATTEMPTS="3"

# File Upload
MAX_FILE_SIZE="10485760"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif"

# ===========================================
# NOTIFICATION SETTINGS
# ===========================================

# Push Notifications
FCM_SERVER_KEY=""
FCM_PROJECT_ID=""

# Webhook URLs
WEBHOOK_URL="https://your-domain.com/api/webhooks"
WEBHOOK_SECRET="your-webhook-secret"

# ===========================================
# BACKUP & MAINTENANCE
# ===========================================

# Backup Settings
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS="30"
BACKUP_STORAGE="s3"

# Maintenance Mode
MAINTENANCE_MODE="false"
MAINTENANCE_MESSAGE="System is under maintenance"
`;

// Vercel environment variables template
const vercelEnvTemplate = `# Vercel Environment Variables
# Add these to your Vercel project settings

# Required
DATABASE_URL=postgresql://username:password@host:port/database?schema=public
SESSION_SECRET=${generateSecretKey()}
DEMO_MODE=false
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false

STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

REDIS_URL=redis://localhost:6379
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production

LOG_LEVEL=info
LOG_FORMAT=json

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

CORS_ORIGIN=https://your-domain.com
CORS_CREDENTIALS=true

SECURITY_HEADERS=true
CONTENT_SECURITY_POLICY=default-src 'self'

IKAS_API_KEY=your-ikas-api-key
IKAS_API_URL=https://api.ikas.com

NODE_ENV=production
DEBUG=false

API_TIMEOUT=10000
API_RETRY_ATTEMPTS=3

MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

FCM_SERVER_KEY=
FCM_PROJECT_ID=

WEBHOOK_URL=https://your-domain.com/api/webhooks
WEBHOOK_SECRET=your-webhook-secret

BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_STORAGE=s3

MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE=System is under maintenance
`;

function setupEnvironment() {
  try {
    console.log('🔧 Setting up environment variables...');

    // Create .env.local file
    const envLocalPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envLocalPath)) {
      fs.writeFileSync(envLocalPath, envTemplate);
      console.log('✅ Created .env.local file');
    } else {
      console.log('⚠️  .env.local already exists, skipping...');
    }

    // Create vercel-env.txt file
    const vercelEnvPath = path.join(process.cwd(), 'vercel-env.txt');
    fs.writeFileSync(vercelEnvPath, vercelEnvTemplate);
    console.log('✅ Created vercel-env.txt file');

    // Create .env.example file
    const envExamplePath = path.join(process.cwd(), '.env.example');
    fs.writeFileSync(envExamplePath, envTemplate);
    console.log('✅ Created .env.example file');

    console.log('\n📋 Next steps:');
    console.log('1. Edit .env.local with your actual values');
    console.log('2. Copy values from vercel-env.txt to Vercel dashboard');
    console.log('3. Run: pnpm run dev');
    console.log('4. Test: curl http://localhost:3000/api/health');

  } catch (error) {
    console.error('❌ Error setting up environment:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupEnvironment();
}

module.exports = { setupEnvironment, generateSecretKey };


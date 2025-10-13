import { NextRequest, NextResponse } from 'next/server';
import { validateEnv } from '@/lib/env-validation';

// GET /api/health - Health check endpoint
export async function GET(request: NextRequest) {
  try {
    const envValidation = validateEnv();
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      demoMode: process.env.DEMO_MODE === 'true',
      database: {
        connected: !!process.env.DATABASE_URL,
        url: process.env.DATABASE_URL ? 'configured' : 'missing'
      },
      email: {
        configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
        host: process.env.SMTP_HOST || 'not configured'
      },
      stripe: {
        configured: !!process.env.STRIPE_SECRET_KEY,
        key: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing'
      },
      redis: {
        configured: !!process.env.REDIS_URL,
        url: process.env.REDIS_URL || 'not configured'
      },
      analytics: {
        googleAnalytics: !!process.env.GOOGLE_ANALYTICS_ID,
        sentry: !!process.env.SENTRY_DSN
      },
      security: {
        sessionSecret: !!process.env.SESSION_SECRET,
        corsOrigin: process.env.CORS_ORIGIN || 'not configured',
        rateLimit: !!process.env.RATE_LIMIT_MAX_REQUESTS
      },
      validation: envValidation
    };

    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { validateEnv } from '@/lib/env-validation';

// GET /api/health - Health check endpoint
export async function GET(request: NextRequest) {
  try {
    // Test database connection safely
    let databaseStatus = 'not_configured';
    let databaseError = null;
    
    if (process.env.DATABASE_URL) {
      try {
        // Dynamically import Prisma to avoid errors if not initialized
        const { prisma, isPrismaAvailable } = await import('@/lib/prisma');
        
        // Check if Prisma is available (not in demo mode without DATABASE_URL)
        if (isPrismaAvailable()) {
          // Set timeout for database connection (10 seconds)
          const connectionPromise = prisma.$queryRaw`SELECT 1`;
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database connection timeout')), 10000)
          );
          
          await Promise.race([connectionPromise, timeoutPromise]);
          databaseStatus = 'connected';
        } else {
          databaseStatus = 'demo_mode';
          databaseError = 'Prisma not initialized in demo mode without DATABASE_URL';
        }
      } catch (error) {
        databaseStatus = 'error';
        databaseError = error instanceof Error ? error.message : 'Unknown database error';
        // Log error safely
        console.error('Database connection failed:', databaseError);
      }
    }
    
    const health = {
      status: databaseStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      demoMode: process.env.DEMO_MODE === 'true',
      database: {
        status: databaseStatus,
        connected: databaseStatus === 'connected',
        url: process.env.DATABASE_URL ? 'configured' : 'missing',
        error: databaseError
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
        googleAnalytics: !!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
        sentry: !!process.env.SENTRY_DSN
      },
      monitoring: {
        logging: {
          level: process.env.LOG_LEVEL || 'info',
          format: process.env.LOG_FORMAT || 'json'
        },
        sentry: {
          configured: !!process.env.SENTRY_DSN,
          environment: process.env.SENTRY_ENVIRONMENT || 'production'
        }
      },
      security: {
        sessionSecret: !!process.env.SESSION_SECRET,
        corsOrigin: process.env.CORS_ORIGIN || 'not configured',
        rateLimit: !!process.env.RATE_LIMIT_MAX_REQUESTS
      },
      validation: (() => {
        try {
          return validateEnv();
        } catch (error) {
          return {
            success: false,
            error: 'Validation check failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })()
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

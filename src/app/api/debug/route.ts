import { NextRequest, NextResponse } from 'next/server';

// GET /api/debug - Debug endpoint for troubleshooting
export async function GET(request: NextRequest) {
  try {
    const debug: {
      timestamp: string;
      environment: string;
      envVars: {
        DATABASE_URL: string;
        DEMO_MODE: string;
        NEXT_PUBLIC_BASE_URL: string;
        SESSION_SECRET: string;
      };
      prisma: {
        status: string;
        error?: string;
      };
    } = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      envVars: {
        DATABASE_URL: process.env.DATABASE_URL ? '***configured***' : 'missing',
        DEMO_MODE: process.env.DEMO_MODE || 'not set',
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'not set',
        SESSION_SECRET: process.env.SESSION_SECRET ? '***configured***' : 'missing',
      },
      prisma: {
        status: 'checking...'
      }
    };

    // Try to import Prisma
    try {
      const { prisma } = await import('@/lib/prisma');
      debug.prisma = { status: 'imported' };
      
      // Try connection
      try {
        await Promise.race([
          prisma.$queryRaw`SELECT 1`,
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]);
        debug.prisma = { status: 'connected' };
      } catch (connError) {
        debug.prisma = { 
          status: 'connection_failed',
          error: connError instanceof Error ? connError.message : 'Unknown error'
        };
      }
    } catch (importError) {
      debug.prisma = { 
        status: 'import_failed',
        error: importError instanceof Error ? importError.message : 'Unknown error'
      };
    }

    return NextResponse.json(debug);
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Session configuration
export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
  cookieName: 'ikas-affiliate-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

// Session type definition
export interface SessionData {
  merchantId?: string;
  accessToken?: string;
  refreshToken?: string;
  isAuthenticated?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Get session helper - Demo mode
export async function getSession(request: NextRequest) {
  // Demo mode - return mock session
  return {
    isAuthenticated: true,
    merchantId: 'demo-merchant-123',
    user: {
      id: 'demo-user-123',
      name: 'Demo User',
      email: 'demo@example.com'
    },
    accessToken: 'demo-access-token',
    refreshToken: 'demo-refresh-token'
  } as SessionData;
}

// Authentication middleware - Demo mode
export function withAuth(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  options: { requireAuth?: boolean } = { requireAuth: true }
) {
  return async (request: NextRequest, context: any) => {
    try {
      // Demo mode - always authenticated
      return await handler(request, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

// Check if user has access to merchant data
export async function checkMerchantAccess(
  session: SessionData,
  merchantId: string
): Promise<boolean> {
  if (!session.isAuthenticated || !session.merchantId) {
    return false;
  }

  // In a real app, you might want to check if the user has access to this specific merchant
  // For now, we'll just check if they have a valid session
  return session.merchantId === merchantId;
}

// Get current user from session
export async function getCurrentUser(session: SessionData) {
  if (!session.isAuthenticated) {
    return null;
  }

  return session.user || null;
}

// Validate access token with İkas API
export async function validateAccessToken(accessToken: string): Promise<boolean> {
  try {
    // In a real implementation, you would validate the token with İkas API
    // For now, we'll just check if it exists and has a valid format
    if (!accessToken || accessToken.length < 10) {
      return false;
    }

    // You could make a request to İkas API to validate the token
    // const response = await fetch('https://api.ikas.com/v1/me', {
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`
    //   }
    // });
    // return response.ok;

    return true; // For demo purposes
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    // In a real implementation, you would call İkas API to refresh the token
    // For now, we'll just return the existing token
    return refreshToken;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

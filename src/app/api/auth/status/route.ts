import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-middleware';

// GET /api/auth/status - Authentication durumunu kontrol et
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session.isAuthenticated) {
      return NextResponse.json({
        authenticated: false,
        message: 'Not authenticated'
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
      merchantId: session.merchantId
    });
  } catch (error) {
    console.error('Auth status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check authentication status' },
      { status: 500 }
    );
  }
}




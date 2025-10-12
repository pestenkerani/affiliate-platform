import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-middleware';

// POST /api/auth/logout - Çıkış yap
export async function POST(request: NextRequest) {
  try {
    // Demo mode - always successful logout
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}



import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-middleware';

// POST /api/demo/auth - Demo yetkilendirme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeName } = body;

    if (!storeName) {
      return NextResponse.json(
        { error: 'Store name is required' },
        { status: 400 }
      );
    }

    // Demo mode - no session saving needed

    return NextResponse.json({
      success: true,
      message: 'Demo authentication successful',
      data: {
        merchantId: storeName,
        authorizedAppId: `demo-${storeName}`
      }
    });
  } catch (error) {
    console.error('Demo auth error:', error);
    return NextResponse.json(
      { error: 'Demo authentication failed' },
      { status: 500 }
    );
  }
}

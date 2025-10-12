import { NextRequest, NextResponse } from 'next/server';

// POST /api/demo/simple-auth - Basit demo yetkilendirme
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

    // Basit demo token oluştur
    const demoToken = Buffer.from(JSON.stringify({
      storeName,
      timestamp: Date.now(),
      demo: true
    })).toString('base64');

    // Cookie olarak kaydet
    const response = NextResponse.json({
      success: true,
      message: 'Demo authentication successful',
      data: {
        storeName,
        demoToken
      }
    });

    // Demo session cookie'si set et
    response.cookies.set('demo-session', demoToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 gün
    });

    return response;
  } catch (error) {
    console.error('Demo auth error:', error);
    return NextResponse.json(
      { error: 'Demo authentication failed' },
      { status: 500 }
    );
  }
}





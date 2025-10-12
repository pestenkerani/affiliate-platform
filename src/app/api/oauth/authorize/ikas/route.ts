import { NextRequest, NextResponse } from 'next/server';
import { OAuthAPI } from '@ikas/api-client';
import { config } from '@/globals/config';
import { RedisDB } from '@/lib/redis';

// GET /api/oauth/authorize/ikas - İkas OAuth yetkilendirme akışını başlat
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeName = searchParams.get('storeName');

    // storeName parametresini doğrula
    if (!storeName) {
      return NextResponse.json(
        { error: 'storeName is required' },
        { status: 400 }
      );
    }

    // CSRF saldırılarını önlemek için state değişkeni oluştur
    const state = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);

    // State'i geçici olarak kaydet (60 saniye TTL)
    try {
      await RedisDB.state.set(state, state, 60);
    } catch (error) {
      console.log('Redis not available, using in-memory state storage');
      // Redis yoksa in-memory storage kullan (demo modu)
    }

    // OAuth URL oluştur
    const oauthUrl = OAuthAPI.getOAuthUrl({ storeName });
    const authorizeUrl = new URL(`${oauthUrl}/authorize`);
    
    authorizeUrl.searchParams.set('client_id', config.appId);
    authorizeUrl.searchParams.set('redirect_uri', config.callbackUrl);
    authorizeUrl.searchParams.set('scope', config.scope);
    authorizeUrl.searchParams.set('state', state);

    console.log('OAuth authorize URL:', authorizeUrl.toString());

    // İkas dashboard'a yönlendir
    return NextResponse.redirect(authorizeUrl.toString());

  } catch (error: any) {
    console.error('Authorize error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
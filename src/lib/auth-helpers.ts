import { NextRequest } from 'next/server';
import { getSession } from './auth-middleware';
import { AuthToken, RedisDB } from './redis';

/**
 * Request'ten kullanıcı bilgisi al
 */
export async function getUserFromRequest(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session.isAuthenticated || !session.merchantId) {
      return null;
    }
    
    return {
      merchantId: session.merchantId,
      authorizedAppId: session.user?.id || ''
    };
  } catch (error) {
    console.error('Get user from request error:', error);
    return null;
  }
}

/**
 * Kullanıcı bilgisi ile token al
 */
export async function getTokenFromUser(merchantId: string, authorizedAppId: string): Promise<AuthToken | null> {
  try {
    return await RedisDB.token.get(authorizedAppId);
  } catch (error) {
    console.error('Get token from user error:', error);
    return null;
  }
}

/**
 * Authorization header'dan token al
 */
export function getTokenFromHeader(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    return authHeader.substring(7);
  } catch (error) {
    console.error('Get token from header error:', error);
    return null;
  }
}

/**
 * Session'dan kullanıcı bilgisi al
 */
export async function getUserFromSession(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session.isAuthenticated) {
      return null;
    }
    
    return {
      merchantId: session.merchantId,
      authorizedAppId: session.user?.id || '',
      user: session.user
    };
  } catch (error) {
    console.error('Get user from session error:', error);
    return null;
  }
}
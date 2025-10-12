import { ikas, OAuthAPI, OnCheckTokenCallback } from '@ikas/api-client';
import moment from 'moment';
import { AuthToken, RedisDB } from './redis';
import { config } from '@/globals/config';

/**
 * ikas API çağrısı yapmadan önce yeni bir `ikas` objesi oluşturan helper fonksiyon
 */
export function getIkas(token: AuthToken): ikas<AuthToken> {
  return new ikas({
    clientId: config.appId,
    clientSecret: config.appSecret,
    accessToken: token.access_token,
    tokenData: token,
    onCheckToken,
  });
}

/**
 * Token süre kontrolü ve refresh işlemi için callback fonksiyon
 */
const onCheckToken: OnCheckTokenCallback<AuthToken> = async (token) => {
  if (token) {
    const now = new Date();
    const expireDate = new Date(token.expireDate);
    
    // Token süresi dolmuşsa refresh et
    if (now.getTime() >= expireDate.getTime()) {
      try {
        const response = await OAuthAPI.refreshToken(
          {
            refresh_token: token.refresh_token,
            client_id: config.appId,
            client_secret: config.appSecret,
          },
          { storeName: 'api' }
        );
        
        if (response.data) {
          const newExpireDate = moment().add(response.data.expires_in, 'seconds').toDate().toISOString();
          
          // Token'ı güncelle
          token.access_token = response.data.access_token;
          token.refresh_token = response.data.refresh_token;
          token.token_type = response.data.token_type;
          token.expires_in = response.data.expires_in;
          token.expireDate = newExpireDate;
          
          // Redis'e kaydet
          await RedisDB.token.set(token.authorizedAppId, token);
          
          return { accessToken: token.access_token, tokenData: token };
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        // Token refresh başarısız olursa null döndür
        return { accessToken: undefined };
      }
    }
    
    // Token hala geçerli
    return { accessToken: token.access_token, tokenData: token };
  }
  
  return { accessToken: undefined };
};

/**
 * İkas API client'ını authorizedAppId ile oluştur
 */
export async function getIkasClient(authorizedAppId: string): Promise<ikas<AuthToken> | null> {
  try {
    const token = await RedisDB.token.get(authorizedAppId);
    if (!token) {
      console.error('Token not found for authorizedAppId:', authorizedAppId);
      return null;
    }
    
    return getIkas(token);
  } catch (error) {
    console.error('Error creating ikas client:', error);
    return null;
  }
}

/**
 * Token'ın geçerliliğini kontrol et
 */
export async function validateToken(authorizedAppId: string): Promise<boolean> {
  try {
    const token = await RedisDB.token.get(authorizedAppId);
    if (!token) {
      return false;
    }
    
    const now = new Date();
    const expireDate = new Date(token.expireDate);
    
    return now.getTime() < expireDate.getTime();
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/**
 * Merchant bilgilerini al
 */
export async function getMerchantInfo(authorizedAppId: string) {
  try {
    const ikasClient = await getIkasClient(authorizedAppId);
    if (!ikasClient) {
      throw new Error('İkas client could not be created');
    }
    
    const response = await ikasClient.adminApi.queries.me({});
    
    if (response.isSuccess && response.data) {
      return response.data;
    } else {
      throw new Error('Failed to get merchant info');
    }
  } catch (error) {
    console.error('Get merchant info error:', error);
    throw error;
  }
}




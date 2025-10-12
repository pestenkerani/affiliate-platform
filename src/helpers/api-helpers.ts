import { ikasAdminGraphQLAPIClient } from '@/lib/ikas-client/generated/graphql';
import { AuthToken, RedisDB } from '@/lib/redis';
import { OAuthAPI } from '@ikas/api-client';
import moment from 'moment';
import { config } from '@/globals/config';

/**
 * İkas API client'ını token ile oluştur
 */
export function getIkas(token: AuthToken): ikasAdminGraphQLAPIClient<AuthToken> {
  return new ikasAdminGraphQLAPIClient<AuthToken>({
    graphApiUrl: 'https://api.myikas.com/api/v2/admin/graphql',
    accessToken: token.access_token,
    tokenData: token,
    onCheckToken: () => onCheckToken(token),
  });
}

/**
 * Token süre kontrolü ve refresh işlemi
 */
export async function onCheckToken(token?: AuthToken): Promise<{ accessToken: string | undefined; tokenData?: AuthToken }> {
  try {
    if (!token) {
      return { accessToken: undefined };
    }

    const now = new Date();
    const expireDate = new Date(token.expireDate);

    // Token süresi dolmuşsa refresh et
    if (now.getTime() >= expireDate.getTime()) {
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
    }

    // Token hala geçerli
    return { accessToken: token.access_token, tokenData: token };
  } catch (error) {
    console.error('Token refresh error:', error);
    return { accessToken: undefined };
  }
}

/**
 * İkas API client'ını authorizedAppId ile oluştur
 */
export async function getIkasClient(authorizedAppId: string): Promise<ikasAdminGraphQLAPIClient<AuthToken> | null> {
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
 * Merchant bilgilerini al
 */
export async function getMerchantInfo(authorizedAppId: string) {
  try {
    const ikasClient = await getIkasClient(authorizedAppId);
    if (!ikasClient) {
      throw new Error('İkas client could not be created');
    }

    const response = await ikasClient.query({
      query: `
        query GetMerchantInfo {
          me {
            id
            name
            email
          }
        }
      `,
      variables: {}
    });

    if (response.data && response.data.me) {
      return response.data.me;
    } else {
      throw new Error('Failed to get merchant info');
    }
  } catch (error) {
    console.error('Get merchant info error:', error);
    throw error;
  }
}

/**
 * Ürün listesini al
 */
export async function getProducts(authorizedAppId: string, pagination: { limit: number; page: number }) {
  try {
    const ikasClient = await getIkasClient(authorizedAppId);
    if (!ikasClient) {
      throw new Error('İkas client could not be created');
    }

    const response = await ikasClient.query({
      query: `
        query ListProducts($pagination: PaginationInput) {
          listProduct(pagination: $pagination) {
            count
            data {
              id
              name
              description
              totalStock
              type
              brand {
                name
              }
              categories {
                id
                name
              }
            }
          }
        }
      `,
      variables: { pagination }
    });

    if (response.data && response.data.listProduct) {
      return response.data.listProduct;
    } else {
      throw new Error('Failed to get products');
    }
  } catch (error) {
    console.error('Get products error:', error);
    throw error;
  }
}

/**
 * Sipariş listesini al
 */
export async function getOrders(authorizedAppId: string, pagination: { limit: number; page: number }) {
  try {
    const ikasClient = await getIkasClient(authorizedAppId);
    if (!ikasClient) {
      throw new Error('İkas client could not be created');
    }

    const response = await ikasClient.query({
      query: `
        query ListOrders($pagination: PaginationInput) {
          listOrder(pagination: $pagination) {
            count
            data {
              id
              orderNumber
              status
              totalPrice
              currencyCode
              createdAt
              customer {
                id
                firstName
                lastName
                email
              }
            }
          }
        }
      `,
      variables: { pagination }
    });

    if (response.data && response.data.listOrder) {
      return response.data.listOrder;
    } else {
      throw new Error('Failed to get orders');
    }
  } catch (error) {
    console.error('Get orders error:', error);
    throw error;
  }
}
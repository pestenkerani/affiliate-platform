import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { getUserFromSession } from '@/lib/auth-helpers';
import { getMerchantInfo, getProducts, getOrders } from '@/helpers/api-helpers';

// GET /api/test/ikas - İkas API bağlantısını test et
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const user = await getUserFromSession(request);
    if (!user || !user.authorizedAppId) {
      return NextResponse.json(
        { error: 'User not authenticated or authorizedAppId missing' },
        { status: 401 }
      );
    }

    const results = {
      merchant: null as any,
      products: null as any,
      orders: null as any,
      errors: [] as string[]
    };

    // Merchant bilgilerini test et
    try {
      results.merchant = await getMerchantInfo(user.authorizedAppId);
    } catch (error) {
      results.errors.push(`Merchant info error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Ürün listesini test et
    try {
      results.products = await getProducts(user.authorizedAppId, { page: 1, limit: 5 });
    } catch (error) {
      results.errors.push(`Products error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Sipariş listesini test et
    try {
      results.orders = await getOrders(user.authorizedAppId, { page: 1, limit: 5 });
    } catch (error) {
      results.errors.push(`Orders error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return NextResponse.json({
      success: true,
      message: 'İkas API test completed',
      data: results,
      summary: {
        merchantConnected: !!results.merchant,
        productsCount: results.products?.count || 0,
        ordersCount: results.orders?.count || 0,
        errorsCount: results.errors.length
      }
    });
  } catch (error) {
    console.error('İkas API test error:', error);
    return NextResponse.json(
      { error: 'Failed to test İkas API' },
      { status: 500 }
    );
  }
}, { requireAuth: true });




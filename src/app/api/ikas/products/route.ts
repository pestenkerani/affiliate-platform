import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { getUserFromSession } from '@/lib/auth-helpers';
import { getProducts } from '@/helpers/api-helpers';

// GET /api/ikas/products - İkas'tan ürün listesi al
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const user = await getUserFromSession(request);
    if (!user || !user.authorizedAppId) {
      return NextResponse.json(
        { error: 'User not authenticated or authorizedAppId missing' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const pagination = {
      page,
      limit
    };

    const products = await getProducts(user.authorizedAppId, pagination);

    return NextResponse.json({
      success: true,
      data: products.data,
      pagination: {
        current: page,
        total: products.count,
        pages: Math.ceil(products.count / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}, { requireAuth: true });




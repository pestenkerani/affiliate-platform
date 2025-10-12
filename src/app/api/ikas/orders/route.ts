import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { getUserFromSession } from '@/lib/auth-helpers';
import { getOrders } from '@/helpers/api-helpers';

// GET /api/ikas/orders - İkas'tan sipariş listesi al
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

    const orders = await getOrders(user.authorizedAppId, pagination);

    return NextResponse.json({
      success: true,
      data: orders.data,
      pagination: {
        current: page,
        total: orders.count,
        pages: Math.ceil(orders.count / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}, { requireAuth: true });





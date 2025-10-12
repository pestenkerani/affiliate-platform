import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { getUserFromSession } from '@/lib/auth-helpers';
import { getMerchantInfo } from '@/helpers/api-helpers';

// GET /api/ikas/merchant - Merchant bilgilerini al
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const user = await getUserFromSession(request);
    if (!user || !user.authorizedAppId) {
      return NextResponse.json(
        { error: 'User not authenticated or authorizedAppId missing' },
        { status: 401 }
      );
    }

    const merchantInfo = await getMerchantInfo(user.authorizedAppId);

    return NextResponse.json({
      success: true,
      data: merchantInfo
    });
  } catch (error) {
    console.error('Get merchant info error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch merchant info' },
      { status: 500 }
    );
  }
}, { requireAuth: true });




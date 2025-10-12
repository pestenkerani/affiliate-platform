import { NextRequest, NextResponse } from 'next/server';
import { CacheService, generateCacheKey } from '@/lib/cache-service';
import { QueryOptimizer, ApiResponse, RequestValidator, CacheInvalidator, PerformanceMonitor } from '@/lib/api-optimization';

// GET /api/commissions - Komisyon listesi
export async function GET(request: NextRequest): Promise<NextResponse> {
  const stopTimer = PerformanceMonitor.startTimer('commissions:get');
  
  try {
    // Demo mode - return mock data
    const demoCommissions = [
      {
        id: 'demo-comm-1',
        amount: 25.50,
        status: 'pending',
        influencerId: 'demo-1',
        linkId: 'demo-link-1',
        createdAt: new Date().toISOString(),
        influencer: {
          id: 'demo-1',
          name: 'Demo Influencer',
          email: 'demo@influencer.com'
        },
        link: {
          id: 'demo-link-1',
          shortCode: 'demo123',
          campaignName: 'Demo Campaign'
        }
      },
      {
        id: 'demo-comm-2',
        amount: 15.75,
        status: 'completed',
        influencerId: 'demo-2',
        linkId: 'demo-link-2',
        createdAt: new Date().toISOString(),
        influencer: {
          id: 'demo-2',
          name: 'Test Influencer',
          email: 'test@influencer.com'
        },
        link: {
          id: 'demo-link-2',
          shortCode: 'test456',
          campaignName: 'Test Campaign'
        }
      }
    ];

    const response = NextResponse.json({
      success: true,
      data: demoCommissions,
      pagination: {
        current: 1,
        pages: 1,
        total: demoCommissions.length,
        limit: 20
      }
    });
    
    stopTimer();
    return response;
  } catch (error) {
    stopTimer();
    console.error('Commissions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commissions' },
      { status: 500 }
    );
  }
}
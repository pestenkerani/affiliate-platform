import { NextRequest, NextResponse } from 'next/server';
import { CacheService, generateCacheKey } from '@/lib/cache-service';
import { QueryOptimizer, ApiResponse, RequestValidator, CacheInvalidator, PerformanceMonitor } from '@/lib/api-optimization';

// GET /api/influencers - Tüm influencer'ları listele
export async function GET(request: NextRequest): Promise<NextResponse> {
  const stopTimer = PerformanceMonitor.startTimer('influencers:get');
  
  try {
    // Demo mode - return mock data
    const demoInfluencers = [
      {
        id: 'demo-1',
        name: 'Demo Influencer',
        email: 'demo@influencer.com',
        phone: '+90 555 123 4567',
        instagram: '@demo_influencer',
        commissionRate: 10,
        status: 'active',
        createdAt: new Date().toISOString(),
        _count: {
          links: 5,
          clicks: 150,
          commissions: 8
        }
      },
      {
        id: 'demo-2',
        name: 'Test Influencer',
        email: 'test@influencer.com',
        phone: '+90 555 987 6543',
        instagram: '@test_influencer',
        commissionRate: 8,
        status: 'active',
        createdAt: new Date().toISOString(),
        _count: {
          links: 3,
          clicks: 89,
          commissions: 4
        }
      }
    ];

    const response = NextResponse.json({
      success: true,
      data: demoInfluencers,
      pagination: {
        current: 1,
        pages: 1,
        total: demoInfluencers.length,
        limit: 20
      }
    });
    
    stopTimer();
    return response;
  } catch (error) {
    stopTimer();
    console.error('Influencers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch influencers' },
      { status: 500 }
    );
  }
}

// POST /api/influencers - Yeni influencer oluştur
export async function POST(request: NextRequest): Promise<NextResponse> {
  const stopTimer = PerformanceMonitor.startTimer('influencers:post');
  
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      instagram,
      tiktok,
      youtube,
      twitter,
      commissionRate = 5,
      bankName,
      accountNumber,
      iban,
      accountHolder
    } = body;

    // Demo mode - return mock created influencer
    const mockInfluencer = {
      id: `demo-${Date.now()}`,
      name,
      email,
      phone,
      instagram,
      tiktok,
      youtube,
      twitter,
      commissionRate,
      bankName,
      accountNumber,
      iban,
      accountHolder,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const response = NextResponse.json({
      success: true,
      data: mockInfluencer,
      message: 'Demo mode: Influencer created successfully'
    });
    stopTimer();
    return response;
  } catch (error) {
    stopTimer();
    console.error('Influencer creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create influencer' },
      { status: 500 }
    );
  }
}


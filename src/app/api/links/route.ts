import { NextRequest, NextResponse } from 'next/server';
import { generateShortCode, addUtmParams } from '@/lib/utils';
import { CacheService, generateCacheKey } from '@/lib/cache-service';
import { QueryOptimizer, ApiResponse, RequestValidator, CacheInvalidator, PerformanceMonitor } from '@/lib/api-optimization';

// GET /api/links - Tüm linkleri getir
export async function GET(request: NextRequest): Promise<NextResponse> {
  const stopTimer = PerformanceMonitor.startTimer('links:get');
  
  try {
    // Demo mode - return mock data
    const demoLinks = [
      {
        id: 'demo-link-1',
        shortCode: 'demo123',
        originalUrl: 'https://example.com/product',
        campaignName: 'Demo Campaign',
        influencerId: 'demo-1',
        createdAt: new Date().toISOString(),
        influencer: {
          id: 'demo-1',
          name: 'Demo Influencer',
          email: 'demo@influencer.com',
          commissionRate: 10
        },
        _count: {
          clicks: 150,
          commissions: 5
        }
      },
      {
        id: 'demo-link-2',
        shortCode: 'test456',
        originalUrl: 'https://example.com/product2',
        campaignName: 'Test Campaign',
        influencerId: 'demo-2',
        createdAt: new Date().toISOString(),
        influencer: {
          id: 'demo-2',
          name: 'Test Influencer',
          email: 'test@influencer.com',
          commissionRate: 8
        },
        _count: {
          clicks: 89,
          commissions: 3
        }
      }
    ];

    const response = NextResponse.json({
      success: true,
      data: demoLinks,
      pagination: {
        current: 1,
        pages: 1,
        total: demoLinks.length,
        limit: 20
      }
    });
    
    stopTimer();
    return response;
  } catch (error) {
    stopTimer();
    console.error('Links fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// POST /api/links - Yeni affiliate link oluştur
export async function POST(request: NextRequest): Promise<NextResponse> {
  const stopTimer = PerformanceMonitor.startTimer('links:post');
  
  try {
    const body = await request.json();
    const {
      originalUrl,
      influencerId,
      campaignName,
      utmSource = 'affiliate',
      utmMedium = 'social',
      utmCampaign,
      utmContent,
      utmTerm,
      expiresAt,
      productId,
      category,
      tags = []
    } = body;

    // Demo mode - return mock created link
    const mockLink = {
      id: `demo-link-${Date.now()}`,
      shortCode: generateShortCode(),
      originalUrl: addUtmParams(originalUrl, {
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        utm_term: utmTerm
      }),
      influencerId,
      campaignName,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      productId,
      category,
      tags,
      createdAt: new Date().toISOString(),
      influencer: {
        id: influencerId,
        name: 'Demo Influencer',
        email: 'demo@influencer.com'
      }
    };

    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/s/${mockLink.shortCode}`;

    const response = NextResponse.json({
      success: true,
      data: {
        ...mockLink,
        shortUrl
      },
      message: 'Demo mode: Link created successfully'
    });
    
    stopTimer();
    return response;
  } catch (error) {
    stopTimer();
    console.error('Link creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}
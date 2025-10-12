import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateShortCode, addUtmParams } from '@/lib/utils';
import { CacheService, generateCacheKey } from '@/lib/cache-service';
import { QueryOptimizer, ApiResponse, RequestValidator, CacheInvalidator, PerformanceMonitor } from '@/lib/api-optimization';

const prisma = new PrismaClient();

// GET /api/links - Tüm linkleri getir
export async function GET(request: NextRequest): Promise<NextResponse> {
  const stopTimer = PerformanceMonitor.startTimer('links:get');
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Request validation
    const { page, limit } = RequestValidator.validatePagination(searchParams);
    const influencerId = searchParams.get('influencerId');
    
    // Cache key oluştur
    const cacheKey = generateCacheKey('links:list', {
      page, limit, influencerId
    });
    
    // Cache'den kontrol et
    const cached = CacheService.get<NextResponse>(cacheKey);
    if (cached) {
      stopTimer();
      return cached;
    }

    // Query optimization
    const query = QueryOptimizer.optimizeFilterQuery({ influencerId });
    const optimizedQuery = QueryOptimizer.optimizePaginationQuery(
      { where: query, orderBy: { createdAt: 'desc' } },
      page,
      limit
    );

    const [links, total] = await Promise.all([
      prisma.link.findMany({
        ...optimizedQuery,
        include: {
          influencer: {
            select: {
              id: true,
              name: true,
              email: true,
              commissionRate: true
            }
          },
          _count: {
            select: {
              clicks: true,
              commissions: true
            }
          }
        }
      }),
      prisma.link.count({ where: query })
    ]);

    const response = NextResponse.json({
      success: true,
      data: links,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
    
    // Cache'e kaydet (5 dakika)
    CacheService.set(cacheKey, response, 300);
    
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

    // Influencer'ın var olup olmadığını kontrol et
    const influencer = await prisma.influencer.findUnique({
      where: { id: influencerId }
    });
    
    if (!influencer) {
      stopTimer();
      return NextResponse.json(
        { error: 'Influencer not found' },
        { status: 404 }
      );
    }

    // UTM parametrelerini hazırla
    const utmParams = {
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      utm_term: utmTerm
    };

    // Orijinal URL'ye UTM parametrelerini ekle
    const urlWithUtm = addUtmParams(originalUrl, utmParams);

    // Kısa kod oluştur
    const shortCode = generateShortCode();

    // Link oluştur
    const link = await prisma.link.create({
      data: {
        shortCode,
        originalUrl: urlWithUtm,
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
        tags
      },
      include: {
        influencer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/s/${link.shortCode}`;

    // Cache'i temizle
    CacheInvalidator.invalidateLinkCache(link.id, influencerId);

    const response = NextResponse.json({
      success: true,
      data: {
        id: link.id,
        shortCode: link.shortCode,
        shortUrl,
        originalUrl: link.originalUrl,
        campaignName: link.campaignName,
        influencer: link.influencer,
        createdAt: link.createdAt
      }
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


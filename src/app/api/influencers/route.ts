import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CacheService, generateCacheKey } from '@/lib/cache-service';
import { QueryOptimizer, ApiResponse, RequestValidator, CacheInvalidator, PerformanceMonitor } from '@/lib/api-optimization';

const prisma = new PrismaClient();

// GET /api/influencers - Tüm influencer'ları listele
export async function GET(request: NextRequest): Promise<NextResponse> {
  const stopTimer = PerformanceMonitor.startTimer('influencers:get');
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Request validation
    const { page, limit } = RequestValidator.validatePagination(searchParams);
    const { search, status, sortBy, sortOrder } = RequestValidator.validateSearch(searchParams);
    
    // Cache key oluştur
    const cacheKey = generateCacheKey('influencers:list', {
      page, limit, search, status, sortBy, sortOrder
    });
    
    // Cache'den kontrol et
    const cached = CacheService.get<NextResponse>(cacheKey);
    if (cached) {
      stopTimer();
      return cached;
    }
    
    // Query optimization
    const baseQuery = QueryOptimizer.optimizeFilterQuery({ status });
    const searchQuery = QueryOptimizer.optimizeSearchQuery(search || '', ['name', 'email']);
    const query = { ...baseQuery, ...searchQuery };
    
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;
    
    const optimizedQuery = QueryOptimizer.optimizePaginationQuery(
      { where: query, orderBy },
      page,
      limit
    );

    const [influencers, total] = await Promise.all([
      prisma.influencer.findMany({
        ...optimizedQuery,
        include: {
          _count: {
            select: {
              links: true,
              clicks: true,
              commissions: true
            }
          }
        }
      }),
      prisma.influencer.count({ where: query })
    ]);

    const response = NextResponse.json({
      success: true,
      data: influencers,
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

    // Email benzersizliği kontrol et
    const existingInfluencer = await prisma.influencer.findUnique({
      where: { email }
    });
    
    if (existingInfluencer) {
      stopTimer();
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    const influencer = await prisma.influencer.create({
      data: {
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
        accountHolder
      }
    });

    // Cache'i temizle
    CacheInvalidator.invalidateInfluencerCache();

    const response = NextResponse.json({
      success: true,
      data: influencer
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


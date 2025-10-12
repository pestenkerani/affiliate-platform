import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CacheService, generateCacheKey } from '@/lib/cache-service';
import { QueryOptimizer, ApiResponse, RequestValidator, CacheInvalidator, PerformanceMonitor } from '@/lib/api-optimization';

const prisma = new PrismaClient();

// GET /api/commissions - Komisyon listesi
export async function GET(request: NextRequest): Promise<NextResponse> {
  const stopTimer = PerformanceMonitor.startTimer('commissions:get');
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Request validation
    const { page, limit } = RequestValidator.validatePagination(searchParams);
    const status = searchParams.get('status');
    const influencerId = searchParams.get('influencerId');
    
    // Cache key oluştur
    const cacheKey = generateCacheKey('commissions:list', {
      page, limit, status, influencerId
    });
    
    // Cache'den kontrol et
    const cached = CacheService.get<NextResponse>(cacheKey);
    if (cached) {
      stopTimer();
      return cached;
    }

    // Query optimization
    const query = QueryOptimizer.optimizeFilterQuery({ status, influencerId });
    const optimizedQuery = QueryOptimizer.optimizePaginationQuery(
      { where: query, orderBy: { createdAt: 'desc' } },
      page,
      limit
    );

    const [commissions, total] = await Promise.all([
      prisma.commission.findMany({
        ...optimizedQuery,
        include: {
          influencer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          link: {
            select: {
              id: true,
              shortCode: true,
              campaignName: true
            }
          }
        }
      }),
      prisma.commission.count({ where: query })
    ]);

    const response = NextResponse.json({
      success: true,
      data: commissions,
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
    console.error('Commissions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commissions' },
      { status: 500 }
    );
  }
}



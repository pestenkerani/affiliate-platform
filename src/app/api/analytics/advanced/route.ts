import { NextRequest, NextResponse } from 'next/server';
import { advancedAnalyticsService, TimePeriod } from '@/lib/advanced-analytics-service';
import { CacheService, generateCacheKey } from '@/lib/cache-service';
import { ApiResponse, PerformanceMonitor } from '@/lib/api-optimization';

// GET /api/analytics/advanced - Get advanced analytics metrics
export async function GET(request: NextRequest): Promise<NextResponse> {
  const stopTimer = PerformanceMonitor.startTimer('analytics:advanced:get');
  
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as TimePeriod || TimePeriod.LAST_30_DAYS;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Cache key oluştur
    const cacheKey = generateCacheKey('analytics:advanced', {
      period, startDate, endDate
    });
    
    // Cache'den kontrol et
    const cached = CacheService.get<NextResponse>(cacheKey);
    if (cached) {
      stopTimer();
      return cached;
    }

    // Validate period
    if (!Object.values(TimePeriod).includes(period)) {
      stopTimer();
      return NextResponse.json(
        { error: 'Invalid period. Must be one of: today, yesterday, last_7_days, last_30_days, last_90_days, this_month, last_month, this_year, last_year, custom' },
        { status: 400 }
      );
    }

    // Parse dates if provided
    let start: Date | undefined;
    let end: Date | undefined;
    
    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        stopTimer();
        return NextResponse.json(
          { error: 'Invalid startDate format' },
          { status: 400 }
        );
      }
    }
    
    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        stopTimer();
        return NextResponse.json(
          { error: 'Invalid endDate format' },
          { status: 400 }
        );
      }
    }

    // Get analytics metrics
    const metrics = await advancedAnalyticsService.getMetrics(period, start, end);

    const response = NextResponse.json({
      success: true,
      data: {
        period,
        dateRange: {
          start: start || null,
          end: end || null,
        },
        metrics,
      },
    });
    
    // Cache'e kaydet (10 dakika - analytics daha uzun süre cache'lenebilir)
    CacheService.set(cacheKey, response, 600);
    
    stopTimer();
    return response;
  } catch (error) {
    stopTimer();
    console.error('Error fetching advanced analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advanced analytics' },
      { status: 500 }
    );
  }
}

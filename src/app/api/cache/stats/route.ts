import { NextRequest, NextResponse } from 'next/server';
import { CacheService } from '@/lib/cache-service';
import { PerformanceMonitor } from '@/lib/api-optimization';
import { ApiResponse } from '@/lib/api-optimization';

// GET /api/cache/stats - Cache ve performans istatistikleri
export async function GET(request: NextRequest) {
  try {
    const cacheStats = CacheService.getStats();
    const performanceMetrics = PerformanceMonitor.getMetrics();
    
    const stats = {
      cache: {
        keys: cacheStats.keys,
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        hitRate: cacheStats.hits + cacheStats.misses > 0 
          ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(2) + '%'
          : '0%',
        memoryUsage: {
          keys: cacheStats.ksize,
          values: cacheStats.vsize
        }
      },
      performance: performanceMetrics,
      timestamp: new Date().toISOString()
    };
    
    return ApiResponse.success(stats);
  } catch (error) {
    console.error('Cache stats error:', error);
    return ApiResponse.error('Failed to fetch cache stats', 500);
  }
}




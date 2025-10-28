import { NextRequest, NextResponse } from 'next/server';
import { CacheService } from '@/lib/cache-service';
import { PerformanceMonitor } from '@/lib/api-optimization';
import { ApiResponse } from '@/lib/api-optimization';

// POST /api/cache/clear - Cache'i temizle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pattern, resetMetrics } = body;
    
    let clearedKeys = 0;
    
    if (pattern) {
      // Pattern ile temizle
      clearedKeys = CacheService.delPattern(pattern);
    } else {
      // Tüm cache'i temizle
      CacheService.flush();
      clearedKeys = -1; // -1 means all keys cleared
    }
    
    // Performans metriklerini sıfırla
    if (resetMetrics) {
      PerformanceMonitor.resetMetrics();
    }
    
    return ApiResponse.success({
      message: pattern 
        ? `Cleared ${clearedKeys} keys matching pattern: ${pattern}`
        : 'All cache cleared',
      clearedKeys,
      resetMetrics: !!resetMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    return ApiResponse.error('Failed to clear cache', 500);
  }
}








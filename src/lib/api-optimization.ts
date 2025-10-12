import { NextRequest, NextResponse } from 'next/server';
import { CacheService, generateCacheKey } from './cache-service';

// Response compression
export function compressResponse(response: NextResponse): NextResponse {
  // Next.js 15'te compression otomatik olarak yapılır
  // Bu fonksiyon gelecekteki özelleştirmeler için hazır
  return response;
}

// Database query optimization
export class QueryOptimizer {
  // Pagination için optimize edilmiş query
  static optimizePaginationQuery(query: any, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Maksimum 100 item
    
    return {
      ...query,
      skip,
      take,
      orderBy: query.orderBy || { createdAt: 'desc' }
    };
  }

  // Search query optimization
  static optimizeSearchQuery(searchTerm: string, fields: string[]) {
    if (!searchTerm) return {};
    
    return {
      OR: fields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive' as const
        }
      }))
    };
  }

  // Filter query optimization
  static optimizeFilterQuery(filters: Record<string, any>) {
    const query: any = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && value.includes(',')) {
          // Array değerler için
          query[key] = {
            in: value.split(',').map(v => v.trim())
          };
        } else {
          query[key] = value;
        }
      }
    });
    
    return query;
  }
}

// API Response wrapper
export class ApiResponse {
  static success(data: any, meta?: any) {
    return NextResponse.json({
      success: true,
      data,
      ...(meta && { meta })
    });
  }

  static error(message: string, status: number = 500, details?: any) {
    return NextResponse.json({
      success: false,
      error: message,
      ...(details && { details })
    }, { status });
  }

  static paginated(data: any[], pagination: any) {
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        current: pagination.page || 1,
        pages: Math.ceil(pagination.total / pagination.limit),
        total: pagination.total,
        limit: pagination.limit
      }
    });
  }
}

// Rate limiting
export class RateLimiter {
  private static limits = new Map<string, { count: number; resetTime: number }>();
  
  static checkLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = identifier;
    
    const current = this.limits.get(key);
    
    if (!current || now > current.resetTime) {
      // Yeni window başlat
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }
    
    if (current.count >= maxRequests) {
      return false; // Limit aşıldı
    }
    
    // Count'u artır
    current.count++;
    this.limits.set(key, current);
    
    return true;
  }
  
  static getRemainingRequests(identifier: string, maxRequests: number = 100): number {
    const current = this.limits.get(identifier);
    if (!current) return maxRequests;
    
    return Math.max(0, maxRequests - current.count);
  }
}

// Request validation
export class RequestValidator {
  static validatePagination(searchParams: URLSearchParams) {
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    
    return { page, limit };
  }
  
  static validateSearch(searchParams: URLSearchParams) {
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    return {
      search: search || undefined,
      status: status || undefined,
      sortBy,
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc'
    };
  }
  
  static validateFilters(searchParams: URLSearchParams, allowedFilters: string[]) {
    const filters: Record<string, any> = {};
    
    allowedFilters.forEach(filter => {
      const value = searchParams.get(filter);
      if (value) {
        filters[filter] = value;
      }
    });
    
    return filters;
  }
}

// Cache invalidation
export class CacheInvalidator {
  static invalidateInfluencerCache(influencerId?: string) {
    if (influencerId) {
      CacheService.delPattern(`influencer:${influencerId}`);
    }
    CacheService.delPattern('influencers:list');
    CacheService.delPattern('api:influencers');
  }
  
  static invalidateLinkCache(linkId?: string, influencerId?: string) {
    if (linkId) {
      CacheService.delPattern(`link:${linkId}`);
    }
    if (influencerId) {
      CacheService.delPattern(`links:influencer:${influencerId}`);
    }
    CacheService.delPattern('links:list');
    CacheService.delPattern('api:links');
  }
  
  static invalidateCommissionCache(commissionId?: string, influencerId?: string) {
    if (commissionId) {
      CacheService.delPattern(`commission:${commissionId}`);
    }
    if (influencerId) {
      CacheService.delPattern(`commissions:influencer:${influencerId}`);
    }
    CacheService.delPattern('commissions:list');
    CacheService.delPattern('api:commissions');
  }
  
  static invalidateAnalyticsCache() {
    CacheService.delPattern('analytics');
    CacheService.delPattern('api:analytics');
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics = new Map<string, { count: number; totalTime: number; avgTime: number }>();
  
  static startTimer(operation: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(operation, duration);
    };
  }
  
  private static recordMetric(operation: string, duration: number) {
    const current = this.metrics.get(operation) || { count: 0, totalTime: 0, avgTime: 0 };
    
    current.count++;
    current.totalTime += duration;
    current.avgTime = current.totalTime / current.count;
    
    this.metrics.set(operation, current);
    
    // Yavaş operasyonları logla
    if (duration > 1000) {
      console.warn(`Slow operation: ${operation} took ${duration}ms`);
    }
  }
  
  static getMetrics() {
    return Object.fromEntries(this.metrics);
  }
  
  static resetMetrics() {
    this.metrics.clear();
  }
}

const apiOptimization = {
  QueryOptimizer,
  ApiResponse,
  RateLimiter,
  RequestValidator,
  CacheInvalidator,
  PerformanceMonitor
};

export default apiOptimization;

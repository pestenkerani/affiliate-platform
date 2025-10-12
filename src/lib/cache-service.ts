import NodeCache from 'node-cache';

// Cache konfigürasyonu
const cacheConfig = {
  stdTTL: 300, // 5 dakika default TTL
  checkperiod: 60, // 1 dakikada bir kontrol et
  useClones: false,
  deleteOnExpire: true,
  maxKeys: 1000 // Maksimum 1000 key
};

// Cache instance
const cache = new NodeCache(cacheConfig);

// Cache key generator
export function generateCacheKey(prefix: string, ...params: any[]): string {
  const paramString = params.map(p => 
    typeof p === 'object' ? JSON.stringify(p) : String(p)
  ).join(':');
  return `${prefix}:${paramString}`;
}

// Cache service
export class CacheService {
  // Cache'e veri ekle
  static set(key: string, value: any, ttl?: number): boolean {
    try {
      return cache.set(key, value, ttl || cacheConfig.stdTTL);
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Cache'den veri al
  static get<T>(key: string): T | undefined {
    try {
      return cache.get<T>(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return undefined;
    }
  }

  // Cache'den veri sil
  static del(key: string): number {
    try {
      return cache.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
      return 0;
    }
  }

  // Cache'i temizle
  static flush(): void {
    try {
      cache.flushAll();
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }

  // Cache istatistikleri
  static getStats() {
    return {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses,
      ksize: cache.getStats().ksize,
      vsize: cache.getStats().vsize
    };
  }

  // Pattern ile cache temizle
  static delPattern(pattern: string): number {
    try {
      const keys = cache.keys().filter(key => key.includes(pattern));
      return cache.del(keys);
    } catch (error) {
      console.error('Cache pattern delete error:', error);
      return 0;
    }
  }

  // Cache'de var mı kontrol et
  static has(key: string): boolean {
    try {
      return cache.has(key);
    } catch (error) {
      console.error('Cache has error:', error);
      return false;
    }
  }

  // TTL'yi güncelle
  static ttl(key: string, ttl: number): boolean {
    try {
      return cache.ttl(key, ttl);
    } catch (error) {
      console.error('Cache TTL error:', error);
      return false;
    }
  }
}

// Cache middleware
export function withCache(ttl: number = 300) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const cacheKey = generateCacheKey(`${target.constructor.name}:${propertyName}`, ...args);
      
      // Cache'den kontrol et
      const cached = CacheService.get(cacheKey);
      if (cached) {
        console.log(`Cache hit: ${cacheKey}`);
        return cached;
      }

      // Cache'de yoksa method'u çalıştır
      console.log(`Cache miss: ${cacheKey}`);
      const result = await method.apply(this, args);
      
      // Sonucu cache'e kaydet
      CacheService.set(cacheKey, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}

// API response cache wrapper
export function cacheApiResponse(ttl: number = 300) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(request: any, ...args: any[]) {
      const url = new URL(request.url);
      const cacheKey = generateCacheKey(
        `api:${propertyName}`,
        url.pathname,
        url.searchParams.toString()
      );
      
      // Cache'den kontrol et
      const cached = CacheService.get(cacheKey);
      if (cached) {
        console.log(`API Cache hit: ${cacheKey}`);
        return cached;
      }

      // Cache'de yoksa method'u çalıştır
      console.log(`API Cache miss: ${cacheKey}`);
      const result = await method.apply(this, [request, ...args]);
      
      // Sonucu cache'e kaydet
      CacheService.set(cacheKey, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}

export default CacheService;

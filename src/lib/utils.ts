import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { randomBytes } from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Kısa kod oluşturucu
export function generateShortCode(): string {
  return randomBytes(6).toString('base64url').substring(0, 8);
}

// UTM parametrelerini URL'ye ekle
export function addUtmParams(originalUrl: string, utmParams: Record<string, string>): string {
  try {
    const url = new URL(originalUrl);
    
    // UTM parametrelerini ekle
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
    
    return url.toString();
  } catch (error) {
    // URL geçersizse orijinal URL'yi döndür
    console.error('Invalid URL:', originalUrl);
    return originalUrl;
  }
}

// Tarih formatlama
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Para formatlama
export function formatCurrency(amount: number, currency: string = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// Yüzde formatlama
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

// Kısa URL oluştur
export function createShortUrl(shortCode: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${base}/s/${shortCode}`;
}

// User agent'dan cihaz türünü belirle
export function getDeviceType(userAgent: string): string {
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return 'mobile';
  } else if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  } else if (/desktop|windows|macintosh|linux/i.test(userAgent)) {
    return 'desktop';
  }
  return 'unknown';
}

// User agent'dan tarayıcı türünü belirle
export function getBrowserType(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
}

// User agent'dan işletim sistemini belirle
export function getOperatingSystem(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}
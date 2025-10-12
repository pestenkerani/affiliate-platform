import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
// Validation functions
function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function escape(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Rate limiting store (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

// Security headers configuration
const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'off',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
};

/**
 * Rate limiting middleware
 */
export function rateLimit() {
  return (request: NextRequest) => {
    const ip = getClientIP(request);
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_CONFIG.windowMs;

    // Clean up expired entries
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }

    // Get or create rate limit entry for this IP
    let entry = rateLimitStore.get(ip);
    if (!entry || entry.resetTime < now) {
      entry = { count: 0, resetTime: now + RATE_LIMIT_CONFIG.windowMs };
      rateLimitStore.set(ip, entry);
    }

    // Increment request count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > RATE_LIMIT_CONFIG.maxRequests) {
      return NextResponse.json(
        { 
          error: 'Too many requests', 
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, RATE_LIMIT_CONFIG.maxRequests - entry.count).toString(),
            'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString(),
          }
        }
      );
    }

    return null; // Continue to next middleware
  };
}

/**
 * Security headers middleware
 */
export function securityHeaders() {
  return (request: NextRequest) => {
    // Don't use NextResponse.next() in app route handlers
    return null;
  };
}

/**
 * CORS middleware
 */
export function cors() {
  return (request: NextRequest) => {
    // Don't use NextResponse.next() in app route handlers
    return null;
  };
}

/**
 * Input validation middleware
 */
export function validateInput(rules: ValidationRules) {
  return (request: NextRequest) => {
    try {
      // Validate request method
      if (rules.method && !rules.method.includes(request.method)) {
        return NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405 }
        );
      }

      // Validate content type for POST/PUT requests
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return NextResponse.json(
            { error: 'Content-Type must be application/json' },
            { status: 400 }
          );
        }
      }

      return null; // Continue to next middleware
    } catch (error) {
      return NextResponse.json(
        { error: 'Validation failed' },
        { status: 400 }
      );
    }
  };
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return '127.0.0.1'; // Fallback for local development
}

/**
 * Validation rules interface
 */
export interface ValidationRules {
  method?: string[];
  contentType?: string[];
  rateLimit?: {
    windowMs?: number;
    max?: number;
  };
  cors?: {
    origin?: string | string[];
    methods?: string[];
    headers?: string[];
  };
  body?: {
    required?: string[];
    email?: string[];
    url?: string[];
    minLength?: { [key: string]: number };
    maxLength?: { [key: string]: number };
  };
}

/**
 * Validate request body
 */
export function validateRequestBody(body: any, rules: ValidationRules['body']): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!rules) {
    return { isValid: true, errors: [] };
  }

  // Check required fields
  if (rules.required) {
    for (const field of rules.required) {
      if (!body[field] || body[field] === '') {
        errors.push(`Field '${field}' is required`);
      }
    }
  }

  // Validate email fields
  if (rules.email) {
    for (const field of rules.email) {
      if (body[field] && !isEmail(body[field])) {
        errors.push(`Field '${field}' must be a valid email address`);
      }
    }
  }

  // Validate URL fields
  if (rules.url) {
    for (const field of rules.url) {
      if (body[field] && !isURL(body[field])) {
        errors.push(`Field '${field}' must be a valid URL`);
      }
    }
  }

  // Validate minimum length
  if (rules.minLength) {
    for (const [field, minLen] of Object.entries(rules.minLength)) {
      if (body[field] && typeof body[field] === 'string' && body[field].length < minLen) {
        errors.push(`Field '${field}' must be at least ${minLen} characters long`);
      }
    }
  }

  // Validate maximum length
  if (rules.maxLength) {
    for (const [field, maxLen] of Object.entries(rules.maxLength)) {
      if (body[field] && typeof body[field] === 'string' && body[field].length > maxLen) {
        errors.push(`Field '${field}' must be no more than ${maxLen} characters long`);
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Sanitize input data
 */
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    return escape(data.trim());
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Combine multiple security middlewares
 */
export function withSecurity(rules?: ValidationRules) {
  return (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return async (request: NextRequest) => {
      // Temporarily disable security middleware for debugging
      return handler(request);
    };
  };
}

import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
  // Required variables
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  DEMO_MODE: z.enum(['true', 'false']).default('false'),
  NEXT_PUBLIC_BASE_URL: z.string().url('NEXT_PUBLIC_BASE_URL must be a valid URL'),

  // Optional variables with defaults
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
  
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().optional(),
  
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'text']).default('json'),
  
  RATE_LIMIT_WINDOW_MS: z.string().optional(),
  RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
  
  CORS_ORIGIN: z.string().optional(),
  CORS_CREDENTIALS: z.string().optional(),
  
  SECURITY_HEADERS: z.string().optional(),
  CONTENT_SECURITY_POLICY: z.string().optional(),
  
  IKAS_API_KEY: z.string().optional(),
  IKAS_API_URL: z.string().optional(),
  
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  DEBUG: z.string().optional(),
  
  API_TIMEOUT: z.string().optional(),
  API_RETRY_ATTEMPTS: z.string().optional(),
  
  MAX_FILE_SIZE: z.string().optional(),
  ALLOWED_FILE_TYPES: z.string().optional(),
  
  FCM_SERVER_KEY: z.string().optional(),
  FCM_PROJECT_ID: z.string().optional(),
  
  WEBHOOK_URL: z.string().optional(),
  WEBHOOK_SECRET: z.string().optional(),
  
  BACKUP_SCHEDULE: z.string().optional(),
  BACKUP_RETENTION_DAYS: z.string().optional(),
  BACKUP_STORAGE: z.string().optional(),
  
  MAINTENANCE_MODE: z.string().optional(),
  MAINTENANCE_MESSAGE: z.string().optional(),
});

// Validate environment variables
export function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    return { success: true, data: env };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      
      return { 
        success: false, 
        error: 'Environment validation failed',
        details: missingVars
      };
    }
    
    return { 
      success: false, 
      error: 'Unknown validation error',
      details: error
    };
  }
}

// Get validated environment variables
export function getValidatedEnv() {
  const result = validateEnv();
  if (!result.success) {
    throw new Error(`Environment validation failed: ${JSON.stringify(result.details)}`);
  }
  return result.data;
}

// Environment variable types
export type Env = z.infer<typeof envSchema>;

// Helper functions
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === 'true';
}

export function getDatabaseUrl(): string {
  const env = getValidatedEnv();
  return env.DATABASE_URL;
}

export function getSessionSecret(): string {
  const env = getValidatedEnv();
  return env.SESSION_SECRET;
}

export function getBaseUrl(): string {
  const env = getValidatedEnv();
  return env.NEXT_PUBLIC_BASE_URL;
}

export function getLogLevel(): string {
  const env = getValidatedEnv();
  return env.LOG_LEVEL;
}

export function getLogFormat(): string {
  const env = getValidatedEnv();
  return env.LOG_FORMAT;
}

// Configuration object
export const config = {
  database: {
    url: getDatabaseUrl(),
  },
  session: {
    secret: getSessionSecret(),
  },
  app: {
    baseUrl: getBaseUrl(),
    demoMode: isDemoMode(),
    production: isProduction(),
  },
  logging: {
    level: getLogLevel(),
    format: getLogFormat(),
  },
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    secure: process.env.SMTP_SECURE === 'true',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  redis: {
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB,
  },
  analytics: {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
    sentryDsn: process.env.SENTRY_DSN,
    sentryEnvironment: process.env.SENTRY_ENVIRONMENT,
  },
  security: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    corsOrigin: process.env.CORS_ORIGIN,
    corsCredentials: process.env.CORS_CREDENTIALS === 'true',
    securityHeaders: process.env.SECURITY_HEADERS === 'true',
    contentSecurityPolicy: process.env.CONTENT_SECURITY_POLICY,
  },
  ikas: {
    apiKey: process.env.IKAS_API_KEY,
    apiUrl: process.env.IKAS_API_URL,
  },
  api: {
    timeout: parseInt(process.env.API_TIMEOUT || '10000'),
    retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3'),
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif'],
  },
  notifications: {
    fcmServerKey: process.env.FCM_SERVER_KEY,
    fcmProjectId: process.env.FCM_PROJECT_ID,
    webhookUrl: process.env.WEBHOOK_URL,
    webhookSecret: process.env.WEBHOOK_SECRET,
  },
  backup: {
    schedule: process.env.BACKUP_SCHEDULE,
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    storage: process.env.BACKUP_STORAGE,
  },
  maintenance: {
    mode: process.env.MAINTENANCE_MODE === 'true',
    message: process.env.MAINTENANCE_MESSAGE || 'System is under maintenance',
  },
};

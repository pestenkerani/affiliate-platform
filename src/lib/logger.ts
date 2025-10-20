import winston from 'winston';
import * as Sentry from '@sentry/nextjs';

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// Log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'affiliate-platform',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development' ? consoleFormat : logFormat,
    }),
  ],
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
  
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Enhanced logger with Sentry integration
class EnhancedLogger {
  private logger: winston.Logger;

  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  error(message: string, meta?: any) {
    this.logger.error(message, meta);
    
    // Send to Sentry
    if (process.env.SENTRY_DSN && process.env.DEMO_MODE !== 'true') {
      Sentry.captureException(new Error(message), {
        tags: {
          level: 'error',
          ...meta,
        },
        extra: meta,
      });
    }
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
    
    // Send to Sentry
    if (process.env.SENTRY_DSN && process.env.DEMO_MODE !== 'true') {
      Sentry.captureMessage(message, {
        level: 'warning',
        tags: {
          level: 'warn',
          ...meta,
        },
        extra: meta,
      });
    }
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  // Specialized logging methods
  apiRequest(method: string, url: string, statusCode: number, duration: number, meta?: any) {
    this.info('API Request', {
      method,
      url,
      statusCode,
      duration,
      ...meta,
    });
  }

  apiError(method: string, url: string, error: string, meta?: any) {
    this.error('API Error', {
      method,
      url,
      error,
      ...meta,
    });
  }

  databaseQuery(query: string, duration: number, meta?: any) {
    this.debug('Database Query', {
      query,
      duration,
      ...meta,
    });
  }

  databaseError(query: string, error: string, meta?: any) {
    this.error('Database Error', {
      query,
      error,
      ...meta,
    });
  }

  userAction(userId: string, action: string, meta?: any) {
    this.info('User Action', {
      userId,
      action,
      ...meta,
    });
  }

  securityEvent(event: string, meta?: any) {
    this.warn('Security Event', {
      event,
      ...meta,
    });
  }

  performanceMetric(metric: string, value: number, meta?: any) {
    this.info('Performance Metric', {
      metric,
      value,
      ...meta,
    });
  }
}

// Export enhanced logger
export const log = new EnhancedLogger(logger);

// Export winston logger for direct use
export { logger };

// Utility functions
export function createChildLogger(service: string) {
  return logger.child({ service });
}

export function setLogLevel(level: LogLevel) {
  logger.level = level;
}

export function getLogLevel(): string {
  return logger.level;
}


import { PrismaClient } from '@prisma/client';

// Avoid creating multiple PrismaClient instances in development (Next.js hot reload)
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// Check if we should initialize Prisma
const shouldInitializePrisma = (): boolean => {
  // Don't initialize if DEMO_MODE is true and DATABASE_URL is missing
  if (process.env.DEMO_MODE === 'true' && !process.env.DATABASE_URL) {
    return false;
  }
  
  // Always initialize if DATABASE_URL is present
  if (process.env.DATABASE_URL) {
    return true;
  }
  
  // In production, DATABASE_URL should be present
  if (process.env.NODE_ENV === 'production') {
    return true; // Will fail with proper error if DATABASE_URL is missing
  }
  
  // In development, initialize if DATABASE_URL exists
  return !!process.env.DATABASE_URL;
};

// Create Prisma client with connection configuration (only if DATABASE_URL exists)
let prismaInstance: PrismaClient | null = null;

if (shouldInitializePrisma()) {
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'minimal',
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }

  // Gracefully handle Prisma disconnect on shutdown
  if (typeof process !== 'undefined') {
    process.on('beforeExit', async () => {
      if (prismaInstance) {
        await prismaInstance.$disconnect();
      }
    });
  }
}

// Export prisma with type safety
export const prisma = prismaInstance as PrismaClient;

// Helper function to check if Prisma is available
export function isPrismaAvailable(): boolean {
  return prismaInstance !== null;
}

// Helper function to get Prisma with error handling
export async function getPrisma(): Promise<PrismaClient> {
  if (!prismaInstance) {
    if (process.env.DEMO_MODE === 'true') {
      throw new Error('Prisma is not available in demo mode without DATABASE_URL');
    }
    throw new Error('Prisma client is not initialized. DATABASE_URL is required.');
  }
  return prismaInstance;
}



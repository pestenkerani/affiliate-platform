import { PrismaClient } from '@prisma/client';

// Avoid creating multiple PrismaClient instances in development (Next.js hot reload)
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// Create Prisma client with connection configuration
export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'minimal',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Gracefully handle Prisma disconnect on shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}



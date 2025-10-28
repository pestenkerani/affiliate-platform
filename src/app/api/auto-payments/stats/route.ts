import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withSecurity } from '@/lib/security-middleware';

const prisma = new PrismaClient();

// GET /api/auto-payments/stats - Get auto payment statistics
export const GET = withSecurity({
  method: ['GET'],
  rateLimit: { windowMs: 60 * 1000, max: 30 },
  cors: { origin: '*', methods: ['GET'], headers: ['Content-Type'] },
})(async (request: NextRequest) => {
  try {
    // Get overall stats
    const [
      totalPaid,
      totalPending,
      totalFailed,
      totalProcessing,
      monthlyStats,
      methodStats,
      statusStats,
    ] = await Promise.all([
      // Total paid amount
      prisma.autoPayment.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Total pending amount
      prisma.autoPayment.aggregate({
        where: { status: 'pending' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Total failed amount
      prisma.autoPayment.aggregate({
        where: { status: 'failed' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Total processing amount
      prisma.autoPayment.aggregate({
        where: { status: 'processing' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Monthly stats (last 12 months)
      prisma.$queryRaw`
        SELECT 
          strftime('%Y-%m', processedDate) as month,
          SUM(amount) as totalPaid,
          COUNT(*) as totalCount
        FROM auto_payments 
        WHERE status = 'completed' 
          AND processedDate >= datetime('now', '-12 months')
        GROUP BY month
        ORDER BY month DESC
      `,
      // Payment method stats
      prisma.autoPayment.groupBy({
        by: ['method'],
        _sum: { amount: true },
        _count: { id: true },
        where: { status: 'completed' },
      }),
      // Status stats
      prisma.autoPayment.groupBy({
        by: ['status'],
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    // Get recent payments (last 10)
    const recentPayments = await prisma.autoPayment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        influencer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate success rate
    const totalAttempts = statusStats.reduce((sum, stat) => sum + stat._count.id, 0);
    const successfulPayments = statusStats.find(s => s.status === 'completed')?._count.id || 0;
    const successRate = totalAttempts > 0 ? (successfulPayments / totalAttempts) * 100 : 0;

    // Calculate average payment amount
    const avgPaymentAmount = totalPaid._count.id > 0 
      ? (totalPaid._sum.amount || 0) / totalPaid._count.id 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalPaid: totalPaid._sum.amount || 0,
          totalPending: totalPending._sum.amount || 0,
          totalFailed: totalFailed._sum.amount || 0,
          totalProcessing: totalProcessing._sum.amount || 0,
          totalCount: totalPaid._count.id + totalPending._count.id + totalFailed._count.id + totalProcessing._count.id,
          successRate: Math.round(successRate * 100) / 100,
          avgPaymentAmount: Math.round(avgPaymentAmount * 100) / 100,
        },
        monthlyStats,
        methodStats: methodStats.map(stat => ({
          method: stat.method,
          totalAmount: stat._sum.amount || 0,
          count: stat._count.id,
        })),
        statusStats: statusStats.map(stat => ({
          status: stat.status,
          totalAmount: stat._sum.amount || 0,
          count: stat._count.id,
        })),
        recentPayments,
      },
    });
  } catch (error) {
    console.error('Error fetching auto payment stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auto payment statistics' },
      { status: 500 }
    );
  }
});










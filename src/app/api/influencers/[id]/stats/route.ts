import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/influencers/[id]/stats - Influencer istatistiklerini getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Link istatistikleri
    const linkStats = await prisma.link.aggregate({
      where: { influencerId: id },
      _count: { id: true },
      _sum: {
        clickCount: true,
        uniqueClickCount: true,
        conversionCount: true,
        totalRevenue: true
      }
    });

    const activeLinksCount = await prisma.link.count({
      where: {
        influencerId: id,
        status: 'active'
      }
    });

    // Komisyon istatistikleri
    const commissionStats = await prisma.commission.groupBy({
      by: ['status'],
      where: {
        influencerId: id,
        createdAt: { gte: startDate }
      },
      _count: { id: true },
      _sum: { commissionAmount: true }
    });

    // Günlük performans
    const dailyStats = await prisma.commission.groupBy({
      by: ['createdAt'],
      where: {
        influencerId: id,
        createdAt: { gte: startDate }
      },
      _count: { id: true },
      _sum: {
        orderValue: true,
        commissionAmount: true
      }
    });

    // En iyi performans gösteren linkler
    const topLinks = await prisma.link.findMany({
      where: { influencerId: id },
      orderBy: { totalRevenue: 'desc' },
      take: 5,
      select: {
        id: true,
        shortCode: true,
        campaignName: true,
        clickCount: true,
        conversionCount: true,
        totalRevenue: true
      }
    });

    // Komisyon istatistiklerini formatla
    const formattedCommissionStats = commissionStats.reduce((acc, item) => {
      acc[item.status] = {
        count: item._count.id,
        totalAmount: item._sum.commissionAmount || 0
      };
      return acc;
    }, {} as any);

    // Günlük istatistikleri formatla
    const formattedDailyStats = dailyStats.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      orders: item._count.id,
      revenue: item._sum.orderValue || 0,
      commission: item._sum.commissionAmount || 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        linkStats: {
          totalLinks: linkStats._count.id,
          activeLinks: activeLinksCount,
          totalClicks: linkStats._sum.clickCount || 0,
          totalUniqueClicks: linkStats._sum.uniqueClickCount || 0,
          totalConversions: linkStats._sum.conversionCount || 0,
          totalRevenue: linkStats._sum.totalRevenue || 0
        },
        commissionStats: formattedCommissionStats,
        dailyStats: formattedDailyStats,
        topLinks
      }
    });
  } catch (error) {
    console.error('Influencer stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch influencer stats' },
      { status: 500 }
    );
  }
}


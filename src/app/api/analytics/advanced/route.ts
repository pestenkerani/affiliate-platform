import { NextRequest, NextResponse } from 'next/server';

// GET /api/analytics/advanced - Gelişmiş analitik verileri
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    // Demo mode - return mock analytics data with correct structure
    const dailyStats = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clicks: Math.floor(Math.random() * 200) + 50,
      conversions: Math.floor(Math.random() * 10) + 2,
      revenue: Math.floor(Math.random() * 500) + 100
    }));

    const hourlyStats = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      clicks: Math.floor(Math.random() * 50) + 10,
      conversions: Math.floor(Math.random() * 5) + 1
    }));

    const deviceStats = [
      { device: 'mobile', clicks: 812, conversions: 35, conversionRate: 4.3 },
      { device: 'desktop', clicks: 375, conversions: 15, conversionRate: 4.0 },
      { device: 'tablet', clicks: 63, conversions: 2, conversionRate: 3.2 }
    ];

    const topCountries = [
      { country: 'Türkiye', clicks: 650, conversions: 28, revenue: 1400 },
      { country: 'Almanya', clicks: 320, conversions: 12, revenue: 600 },
      { country: 'İngiltere', clicks: 180, conversions: 7, revenue: 350 }
    ];

    const mockAnalytics = {
      totalClicks: 1250,
      uniqueClicks: 980,
      clickGrowth: 15.5,
      clickGrowthPercentage: 12.3,
      totalConversions: 45,
      conversionRate: 4.6,
      conversionGrowth: 8.2,
      conversionGrowthPercentage: 8.2,
      totalRevenue: 2250.75,
      totalCommissions: 1125.38,
      revenueGrowth: 18.7,
      revenueGrowthPercentage: 18.7,
      avgOrderValue: 50.02,
      activeInfluencers: 3,
      topInfluencer: {
        id: 'demo-1',
        name: 'Demo Influencer',
        clicks: 450,
        conversions: 18,
        revenue: 900
      },
      activeLinks: 5,
      topLink: {
        id: 'link-1',
        shortCode: 'demo-001',
        clicks: 450,
        conversions: 18,
        revenue: 900
      },
      topCountries,
      deviceStats,
      hourlyStats,
      dailyStats
    };

    return NextResponse.json({
      success: true,
      data: {
        metrics: mockAnalytics
      },
      period,
      message: 'Demo mode: Advanced analytics data loaded'
    });
  } catch (error) {
    console.error('Advanced analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advanced analytics' },
      { status: 500 }
    );
  }
}
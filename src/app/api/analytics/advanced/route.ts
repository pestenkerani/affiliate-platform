import { NextRequest, NextResponse } from 'next/server';

// GET /api/analytics/advanced - Gelişmiş analitik verileri
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    // Demo mode - return mock analytics data
    const mockAnalytics = {
      totalClicks: 1250,
      uniqueClicks: 980,
      clickGrowth: 15.5,
      clickGrowthPercentage: 12.3,
      totalConversions: 45,
      conversionRate: 4.6,
      conversionGrowth: 8.2,
      totalRevenue: 2250.75,
      revenueGrowth: 18.7,
      averageOrderValue: 50.02,
      topInfluencers: [
        { id: 'demo-1', name: 'Demo Influencer', clicks: 450, conversions: 18, revenue: 900 },
        { id: 'demo-2', name: 'Test Influencer', clicks: 320, conversions: 12, revenue: 600 },
        { id: 'demo-3', name: 'Sample Influencer', clicks: 280, conversions: 8, revenue: 400 }
      ],
      topCampaigns: [
        { id: 'camp-1', name: 'Demo Campaign', clicks: 450, conversions: 18, revenue: 900 },
        { id: 'camp-2', name: 'Test Campaign', clicks: 320, conversions: 12, revenue: 600 },
        { id: 'camp-3', name: 'Sample Campaign', clicks: 280, conversions: 8, revenue: 400 }
      ],
      deviceBreakdown: [
        { device: 'Mobile', percentage: 65, clicks: 812 },
        { device: 'Desktop', percentage: 30, clicks: 375 },
        { device: 'Tablet', percentage: 5, clicks: 63 }
      ],
      trafficSources: [
        { source: 'Instagram', percentage: 45, clicks: 562 },
        { source: 'TikTok', percentage: 25, clicks: 312 },
        { source: 'YouTube', percentage: 20, clicks: 250 },
        { source: 'Direct', percentage: 10, clicks: 126 }
      ],
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        clicks: Math.floor(Math.random() * 50) + 10,
        conversions: Math.floor(Math.random() * 5) + 1
      })),
      dailyData: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        clicks: Math.floor(Math.random() * 200) + 50,
        conversions: Math.floor(Math.random() * 10) + 2,
        revenue: Math.floor(Math.random() * 500) + 100
      }))
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
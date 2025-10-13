import { NextRequest, NextResponse } from 'next/server';

// GET /api/analytics/realtime - Gerçek zamanlı metrikler
export async function GET(request: NextRequest) {
  try {
    // Demo mode - return mock realtime data
    const mockRealtimeMetrics = {
      activeUsers: Math.floor(Math.random() * 50) + 10,
      currentClicks: Math.floor(Math.random() * 20) + 5,
      currentConversions: Math.floor(Math.random() * 3) + 1,
      currentRevenue: Math.floor(Math.random() * 100) + 20,
      topPages: [
        { page: '/product/demo-1', views: 45, conversions: 3 },
        { page: '/product/demo-2', views: 32, conversions: 2 },
        { page: '/product/demo-3', views: 28, conversions: 1 }
      ],
      recentActivity: [
        {
          id: '1',
          type: 'click',
          influencer: 'Demo Influencer',
          page: '/product/demo-1',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'conversion',
          influencer: 'Test Influencer',
          page: '/product/demo-2',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'click',
          influencer: 'Sample Influencer',
          page: '/product/demo-3',
          timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString()
        }
      ],
      performanceMetrics: {
        averageLoadTime: 1.2,
        bounceRate: 35.5,
        sessionDuration: 4.5,
        pagesPerSession: 3.2
      }
    };

    return NextResponse.json({
      success: true,
      data: mockRealtimeMetrics,
      timestamp: new Date().toISOString(),
      message: 'Demo mode: Realtime metrics loaded'
    });
  } catch (error) {
    console.error('Realtime analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch realtime metrics' },
      { status: 500 }
    );
  }
}
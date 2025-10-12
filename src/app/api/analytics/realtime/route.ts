import { NextRequest, NextResponse } from 'next/server';
import { advancedAnalyticsService } from '@/lib/advanced-analytics-service';
import { withSecurity } from '@/lib/security-middleware';

// GET /api/analytics/realtime - Get real-time analytics metrics
export const GET = withSecurity({
  method: ['GET'],
  rateLimit: { windowMs: 60 * 1000, max: 60 }, // Higher limit for real-time data
  cors: { origin: '*', methods: ['GET'], headers: ['Content-Type'] },
})(async (request: NextRequest) => {
  try {
    // Get real-time metrics
    const metrics = await advancedAnalyticsService.getRealTimeMetrics();

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        metrics,
      },
    });
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch real-time analytics' },
      { status: 500 }
    );
  }
});


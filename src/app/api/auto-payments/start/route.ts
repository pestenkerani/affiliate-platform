import { NextRequest, NextResponse } from 'next/server';
import { autoPaymentService } from '@/lib/auto-payment-service';
import { withSecurity } from '@/lib/security-middleware';

// POST /api/auto-payments/start - Start auto payment scheduler
export const POST = withSecurity({
  method: ['POST'],
  rateLimit: { windowMs: 60 * 1000, max: 5 },
  cors: { origin: '*', methods: ['POST'], headers: ['Content-Type'] },
})(async (request: NextRequest) => {
  try {
    // Start the auto payment scheduler
    autoPaymentService.startScheduler();

    return NextResponse.json({
      success: true,
      message: 'Auto payment scheduler started successfully',
    });
  } catch (error) {
    console.error('Error starting auto payment scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to start auto payment scheduler' },
      { status: 500 }
    );
  }
});




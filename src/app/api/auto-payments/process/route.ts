import { NextRequest, NextResponse } from 'next/server';
import { autoPaymentService } from '@/lib/auto-payment-service';
import { withSecurity } from '@/lib/security-middleware';

// POST /api/auto-payments/process - Manually trigger payment processing
export const POST = withSecurity({
  method: ['POST'],
  rateLimit: { windowMs: 60 * 1000, max: 5 },
  cors: { origin: '*', methods: ['POST'], headers: ['Content-Type'] },
})(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action || !['monthly', 'pending', 'retry'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: monthly, pending, or retry' },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'monthly':
        await autoPaymentService.processMonthlyPayments();
        result = { message: 'Monthly payment processing completed' };
        break;
      case 'pending':
        await autoPaymentService.checkPendingPayments();
        result = { message: 'Pending payment check completed' };
        break;
      case 'retry':
        await autoPaymentService.checkPendingPayments();
        result = { message: 'Failed payment retry completed' };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error processing auto payments:', error);
    return NextResponse.json(
      { error: 'Failed to process auto payments' },
      { status: 500 }
    );
  }
});










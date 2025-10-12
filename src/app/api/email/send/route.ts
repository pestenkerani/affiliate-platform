import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { withSecurity, validateRequestBody, sanitizeInput } from '@/lib/security-middleware';

// POST /api/email/send - Email gönder
export const POST = withSecurity({
  method: ['POST'],
  body: {
    required: ['type', 'influencerEmail'],
    email: ['influencerEmail'],
    minLength: { type: 3 },
    maxLength: { type: 50, influencerEmail: 100 }
  }
})(async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = validateRequestBody(body, {
      required: ['type', 'influencerEmail'],
      email: ['influencerEmail'],
      minLength: { type: 3 },
      maxLength: { type: 50, influencerEmail: 100 }
    });
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }
    
    // Sanitize input
    const sanitizedBody = sanitizeInput(body);
    const { type, influencerEmail, data } = sanitizedBody;

    let result;

    switch (type) {
      case 'commission':
        result = await emailService.sendCommissionNotification(
          influencerEmail,
          data.commissionAmount,
          data.orderId
        );
        break;
      
      case 'payment':
        result = await emailService.sendPaymentNotification(
          influencerEmail,
          data.paymentAmount,
          data.paymentDate
        );
        break;
      
      case 'performance':
        result = await emailService.sendPerformanceNotification(
          influencerEmail,
          data.clicks,
          data.conversions
        );
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
});



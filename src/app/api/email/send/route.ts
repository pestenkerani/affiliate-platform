import { NextRequest, NextResponse } from 'next/server';

// POST /api/email/send - Email gönder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, influencerEmail, ...emailData } = body;

    // Demo mode - just log the email
    console.log('Demo mode: Email would be sent:', {
      type,
      influencerEmail,
      ...emailData
    });

    return NextResponse.json({
      success: true,
      message: 'Demo mode: Email sent successfully',
      data: {
        type,
        recipient: influencerEmail,
        sentAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
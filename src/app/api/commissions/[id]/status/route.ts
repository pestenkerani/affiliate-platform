import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/commissions/[id]/status - Komisyon durumunu güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, notes } = await request.json();

    // Demo mode - return mock updated commission
    const mockCommission = {
      id,
      status,
      notes: notes || null,
      paymentDate: status === 'paid' ? new Date().toISOString() : null,
      influencer: {
        id: 'demo-1',
        name: 'Demo Influencer',
        email: 'demo@influencer.com'
      },
      link: {
        id: 'demo-link-1',
        shortCode: 'demo123',
        campaignName: 'Demo Campaign'
      },
      amount: 25.50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockCommission,
      message: 'Demo mode: Commission status updated successfully'
    });
  } catch (error) {
    console.error('Commission status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update commission status' },
      { status: 500 }
    );
  }
}



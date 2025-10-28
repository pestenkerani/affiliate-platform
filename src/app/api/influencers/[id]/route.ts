import { NextRequest, NextResponse } from 'next/server';

// GET /api/influencers/[id] - Influencer detaylarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Demo mode - return mock data
    const mockInfluencer = {
      id: id,
      name: 'Demo Influencer',
      email: 'demo@example.com',
      phone: '+90 555 123 4567',
      instagram: '@demo_influencer',
      tiktok: '@demo_influencer',
      youtube: 'Demo Channel',
      commissionRate: 5.0,
      status: 'active',
      totalEarnings: 1500.75,
      totalClicks: 1250,
      totalSales: 30,
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      links: [
        {
          id: 'link-1',
          shortCode: 'demo-link-1',
          originalUrl: 'https://example.com/product-1',
          campaignName: 'Demo Campaign 1',
          status: 'active',
          clickCount: 450,
          uniqueClickCount: 320,
          conversionCount: 15,
          totalRevenue: 750.50
        }
      ],
      _count: {
        links: 3,
        clicks: 1250,
        commissions: 30
      }
    };

    return NextResponse.json({
      success: true,
      data: mockInfluencer
    });
  } catch (error) {
    console.error('Influencer fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch influencer' },
      { status: 500 }
    );
  }
}

// PUT /api/influencers/[id] - Influencer güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updateData = await request.json();

    // Demo mode - return mock updated influencer
    const mockUpdatedInfluencer = {
      id,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockUpdatedInfluencer
    });
  } catch (error) {
    console.error('Influencer update error:', error);
    return NextResponse.json(
      { error: 'Failed to update influencer' },
      { status: 500 }
    );
  }
}

// DELETE /api/influencers/[id] - Influencer sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Demo mode - simulate deletion
    return NextResponse.json({
      success: true,
      message: 'Influencer deleted successfully (demo mode)'
    });
  } catch (error) {
    console.error('Influencer deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete influencer' },
      { status: 500 }
    );
  }
}


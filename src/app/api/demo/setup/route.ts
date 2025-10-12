import { NextRequest, NextResponse } from 'next/server';

// POST /api/demo/setup - Demo verileri oluştur
export async function POST(request: NextRequest) {
  try {
    // Demo mode - return success without database operations
    return NextResponse.json({
      success: true,
      message: 'Demo mode activated. Database operations disabled.',
      data: {
        influencers: [
          {
            id: 'demo-1',
            name: 'Demo Influencer',
            email: 'demo@influencer.com',
            phone: '+90 555 123 4567',
            instagram: '@demo_influencer',
            commissionRate: 10,
            status: 'active'
          }
        ],
        links: [
          {
            id: 'demo-link-1',
            shortCode: 'demo123',
            originalUrl: 'https://example.com/product',
            campaignName: 'Demo Campaign',
            clicks: 150,
            commissions: 5
          }
        ],
        commissions: [
          {
            id: 'demo-comm-1',
            amount: 25.50,
            status: 'pending',
            influencer: 'Demo Influencer'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Demo setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup demo data' },
      { status: 500 }
    );
  }
}
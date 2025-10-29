import { NextRequest, NextResponse } from 'next/server';

// Export type for merchant response
export interface GetMerchantApiResponse {
  merchant: {
    id: string;
    name: string;
    subdomain: string;
    email: string;
    phone?: string;
    address?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Demo mode - returns mock merchant data
 */
export async function GET(request: NextRequest) {
  try {
    // Demo mode - return mock data
    return NextResponse.json({
      success: true,
      data: {
        merchant: {
          id: 'demo-merchant-123',
          name: 'Demo Mağaza',
          subdomain: 'demo',
          email: 'demo@example.com',
          phone: '+90 555 123 4567',
          address: 'Demo Adres, İstanbul',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Get merchant error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch merchant information' },
      { status: 500 }
    );
  }
}
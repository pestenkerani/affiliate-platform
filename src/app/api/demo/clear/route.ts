import { NextRequest, NextResponse } from 'next/server';

// POST /api/demo/clear - Demo verileri temizle
export async function POST(request: NextRequest) {
  try {
    // Demo mode - return success without database operations
    return NextResponse.json({
      success: true,
      message: 'Demo mode: Data cleared successfully',
      data: {
        cleared: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Demo clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear demo data' },
      { status: 500 }
    );
  }
}
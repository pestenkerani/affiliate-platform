import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/demo/clear - Demo verileri temizle
export async function POST(request: NextRequest) {
  try {
    // Tüm demo verileri sil
    await prisma.commission.deleteMany({
      where: {
        orderId: {
          startsWith: 'ORDER_'
        }
      }
    });

    await prisma.click.deleteMany({
      where: {
        orderId: {
          startsWith: 'ORDER_'
        }
      }
    });

    await prisma.link.deleteMany({
      where: {
        shortCode: 'DEMO123'
      }
    });

    await prisma.influencer.deleteMany({
      where: {
        email: 'demo@influencer.com'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Demo data cleared successfully'
    });
  } catch (error) {
    console.error('Demo clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear demo data' },
      { status: 500 }
    );
  }
}




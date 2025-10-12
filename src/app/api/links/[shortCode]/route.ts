import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/links/[shortCode] - Link detaylarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;

    const link = await prisma.link.findUnique({
      where: { shortCode },
      include: {
        influencer: {
          select: {
            id: true,
            name: true,
            email: true,
            commissionRate: true
          }
        }
      }
    });

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: link
    });
  } catch (error) {
    console.error('Link fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch link' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH /api/influencers/[id]/status - Influencer durumunu güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const influencer = await prisma.influencer.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      data: influencer
    });
  } catch (error) {
    console.error('Influencer status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update influencer status' },
      { status: 500 }
    );
  }
}



import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH /api/commissions/[id]/status - Komisyon durumunu güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, notes } = await request.json();

    const updateData: any = { status };
    if (notes) {
      updateData.notes = notes;
    }
    if (status === 'paid') {
      updateData.paymentDate = new Date();
    }

    const commission = await prisma.commission.update({
      where: { id },
      data: updateData,
      include: {
        influencer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        link: {
          select: {
            id: true,
            shortCode: true,
            campaignName: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: commission
    });
  } catch (error) {
    console.error('Commission status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update commission status' },
      { status: 500 }
    );
  }
}



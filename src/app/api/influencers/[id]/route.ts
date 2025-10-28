import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/influencers/[id] - Influencer detaylarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const influencer = await prisma.influencer.findUnique({
      where: { id },
      include: {
        links: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            links: true,
            clicks: true,
            commissions: true
          }
        }
      }
    });

    if (!influencer) {
      return NextResponse.json(
        { error: 'Influencer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: influencer
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updateData = await request.json();

    // Email güncelleniyorsa benzersizlik kontrol et
    if (updateData.email) {
      const existingInfluencer = await prisma.influencer.findFirst({
        where: {
          email: updateData.email,
          id: { not: id }
        }
      });
      
      if (existingInfluencer) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    const influencer = await prisma.influencer.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: influencer
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Influencer'ın aktif linkleri var mı kontrol et
    const activeLinks = await prisma.link.count({
      where: {
        influencerId: id,
        status: 'active'
      }
    });

    if (activeLinks > 0) {
      return NextResponse.json(
        { error: 'Cannot delete influencer with active links. Please deactivate all links first.' },
        { status: 400 }
      );
    }

    await prisma.influencer.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Influencer deleted successfully'
    });
  } catch (error) {
    console.error('Influencer deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete influencer' },
      { status: 500 }
    );
  }
}


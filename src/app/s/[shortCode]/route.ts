import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /s/[shortCode] - Kısa URL yönlendirme
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
            name: true
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

    // Click kaydı oluştur
    try {
      const click = await prisma.click.create({
        data: {
          linkId: link.id,
          influencerId: link.influencerId,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
          userAgent: request.headers.get('user-agent') || 'Unknown User Agent',
          referer: request.headers.get('referer') || '',
          createdAt: new Date()
        }
      });

      // Link istatistiklerini güncelle
      await prisma.link.update({
        where: { id: link.id },
        data: {
          clickCount: { increment: 1 },
          lastClicked: new Date()
        }
      });

      // Influencer istatistiklerini güncelle
      await prisma.influencer.update({
        where: { id: link.influencerId },
        data: {
          totalClicks: { increment: 1 },
          lastActivity: new Date()
        }
      });

    } catch (clickError) {
      console.log('Click tracking error (continuing):', clickError);
    }

    // Orijinal URL'ye yönlendir
    return NextResponse.redirect(link.originalUrl);

  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.json(
      { error: 'Redirect failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}





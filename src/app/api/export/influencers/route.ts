import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/export/influencers - Influencer listesini CSV olarak export et
export async function GET(request: NextRequest) {
  try {
    const influencers = await prisma.influencer.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // CSV header
    const csvHeader = [
      'ID',
      'İsim',
      'E-posta',
      'Telefon',
      'Instagram',
      'TikTok',
      'YouTube',
      'Twitter',
      'Komisyon Oranı (%)',
      'Durum',
      'Banka Adı',
      'Hesap Numarası',
      'IBAN',
      'Hesap Sahibi',
      'Toplam Kazanç',
      'Toplam Tıklama',
      'Toplam Satış',
      'Son Aktivite',
      'Oluşturma Tarihi'
    ].join(',');

    // CSV data
    const csvData = influencers.map(influencer => [
      influencer.id,
      `"${influencer.name}"`,
      `"${influencer.email}"`,
      `"${influencer.phone || ''}"`,
      `"${influencer.instagram || ''}"`,
      `"${influencer.tiktok || ''}"`,
      `"${influencer.youtube || ''}"`,
      `"${influencer.twitter || ''}"`,
      influencer.commissionRate,
      `"${influencer.status}"`,
      `"${influencer.bankName || ''}"`,
      `"${influencer.accountNumber || ''}"`,
      `"${influencer.iban || ''}"`,
      `"${influencer.accountHolder || ''}"`,
      influencer.totalEarnings,
      influencer.totalClicks,
      influencer.totalSales,
      `"${influencer.lastActivity.toISOString()}"`,
      `"${influencer.createdAt.toISOString()}"`
    ].join(','));

    const csvContent = [csvHeader, ...csvData].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="influencers-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export influencers' },
      { status: 500 }
    );
  }
}




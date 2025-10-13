import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/export/commissions - Komisyon listesini CSV olarak export et
export async function GET(request: NextRequest) {
  try {
    const commissions = await prisma.commission.findMany({
      include: {
        influencer: {
          select: {
            name: true,
            email: true
          }
        },
        link: {
          select: {
            shortCode: true,
            campaignName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // CSV header
    const csvHeader = [
      'ID',
      'Sipariş ID',
      'Influencer',
      'Influencer E-posta',
      'Link Kodu',
      'Kampanya',
      'Sipariş Tutarı',
      'Komisyon Oranı (%)',
      'Komisyon Tutarı',
      'Durum',
      'Müşteri Adı',
      'Müşteri E-posta',
      'Ödeme Tarihi',
      'Oluşturma Tarihi'
    ].join(',');

    // CSV data
    const csvData = commissions.map(commission => [
      commission.id,
      `"${commission.orderId}"`,
      `"${commission.influencer.name}"`,
      `"${commission.influencer.email}"`,
      `"${commission.link.shortCode}"`,
      `"${commission.link.campaignName || ''}"`,
      commission.orderValue,
      commission.commissionRate,
      commission.commissionAmount,
      `"${commission.status}"`,
      `"${commission.customerName || ''}"`,
      `"${commission.customerEmail || ''}"`,
      `"${commission.paymentDate ? commission.paymentDate.toISOString() : ''}"`,
      `"${commission.createdAt.toISOString()}"`
    ].join(','));

    const csvContent = [csvHeader, ...csvData].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="commissions-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export commissions' },
      { status: 500 }
    );
  }
}






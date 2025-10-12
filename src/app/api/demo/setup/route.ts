import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/demo/setup - Demo verileri oluştur
export async function POST(request: NextRequest) {
  try {
    // Demo influencer oluştur
    const demoInfluencer = await prisma.influencer.upsert({
      where: { email: 'demo@influencer.com' },
      update: {},
      create: {
        name: 'Demo Influencer',
        email: 'demo@influencer.com',
        phone: '+90 555 123 4567',
        instagram: '@demo_influencer',
        commissionRate: 10,
        status: 'active',
        bankName: 'Demo Bank',
        accountNumber: '1234567890',
        iban: 'TR123456789012345678901234',
        accountHolder: 'Demo Influencer'
      }
    });

    // Demo link oluştur
    const demoLink = await prisma.link.upsert({
      where: { shortCode: 'DEMO123' },
      update: {},
      create: {
        shortCode: 'DEMO123',
        originalUrl: 'https://google.com',
        influencerId: demoInfluencer.id,
        campaignName: 'Demo Campaign',
        utmSource: 'instagram',
        utmMedium: 'influencer',
        utmCampaign: 'demo-campaign',
        status: 'active'
      }
    });

    // Demo tıklamalar oluştur
    const demoClicks = [];
    for (let i = 0; i < 10; i++) {
      const click = await prisma.click.create({
        data: {
          linkId: demoLink.id,
          influencerId: demoInfluencer.id,
          ipAddress: `192.168.1.${i + 1}`,
          userAgent: 'Mozilla/5.0 (Demo Browser)',
          referer: 'https://instagram.com',
          country: 'Turkey',
          city: 'Istanbul',
          device: i % 2 === 0 ? 'mobile' : 'desktop',
          browser: 'Chrome',
          os: 'Android',
          isUnique: true,
          converted: i < 3, // İlk 3 tıklama dönüşüm
          orderId: i < 3 ? `ORDER_${i + 1}` : null,
          orderValue: i < 3 ? 100 + (i * 50) : null,
          commission: i < 3 ? ((100 + (i * 50)) * 10) / 100 : null,
          conversionTime: i < 3 ? new Date() : null
        }
      });
      demoClicks.push(click);
    }

    // Demo komisyonlar oluştur
    const demoCommissions = [];
    for (let i = 0; i < 3; i++) {
      const commission = await prisma.commission.create({
        data: {
          influencerId: demoInfluencer.id,
          linkId: demoLink.id,
          clickId: demoClicks[i].id,
          orderId: `ORDER_${i + 1}`,
          orderValue: 100 + (i * 50),
          commissionRate: 10,
          commissionAmount: ((100 + (i * 50)) * 10) / 100,
          status: i === 0 ? 'paid' : i === 1 ? 'approved' : 'pending',
          paymentDate: i === 0 ? new Date() : null,
          customerEmail: `customer${i + 1}@example.com`,
          customerName: `Customer ${i + 1}`,
          products: JSON.stringify([
            { name: `Demo Product ${i + 1}`, quantity: 1, price: 100 + (i * 50) }
          ]),
          shippingCity: 'Istanbul',
          shippingCountry: 'Turkey'
        }
      });
      demoCommissions.push(commission);
    }

    // İstatistikleri güncelle
    await prisma.link.update({
      where: { id: demoLink.id },
      data: {
        clickCount: 10,
        uniqueClickCount: 10,
        conversionCount: 3,
        totalRevenue: 450,
        lastClicked: new Date()
      }
    });

    await prisma.influencer.update({
      where: { id: demoInfluencer.id },
      data: {
        totalClicks: 10,
        totalSales: 3,
        totalEarnings: 45,
        lastActivity: new Date()
      }
    });

    // Demo auto payments oluştur
    const demoAutoPayments = [];
    for (let i = 0; i < 3; i++) {
      const autoPayment = await prisma.autoPayment.create({
        data: {
          influencerId: demoInfluencer.id,
          amount: 50 + (i * 25),
          currency: 'TRY',
          method: i === 0 ? 'bank_transfer' : i === 1 ? 'stripe' : 'paypal',
          status: i === 0 ? 'completed' : i === 1 ? 'pending' : 'failed',
          scheduledDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
          processedDate: i === 0 ? new Date(Date.now() - (i * 24 * 60 * 60 * 1000)) : null,
          transactionId: i === 0 ? `DEMO_TXN_${Date.now()}` : null,
          failureReason: i === 2 ? 'Insufficient funds' : null
        }
      });
      demoAutoPayments.push(autoPayment);
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data created successfully',
      data: {
        influencer: demoInfluencer,
        link: demoLink,
        clicksCount: demoClicks.length,
        commissionsCount: demoCommissions.length,
        autoPaymentsCount: demoAutoPayments.length
      }
    });
  } catch (error) {
    console.error('Demo setup error:', error);
    return NextResponse.json(
      { error: 'Failed to create demo data' },
      { status: 500 }
    );
  }
}



import { NextRequest, NextResponse } from 'next/server';
import { getPrisma, isPrismaAvailable } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth-helpers';
import { getIkasClient } from '@/helpers/api-helpers';

// POST /api/webhook/ikas/order-completed - İkas sipariş webhook'u
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('İkas order.completed webhook received:', body);

    // Webhook doğrulama (gerçek projede İkas'tan gelen imzayı kontrol et)
    // const signature = request.headers.get('x-ikas-signature');
    // if (!verifyWebhookSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // Webhook'u işle
    const result = await processIkasWebhook(body);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process webhook',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function processIkasWebhook(webhookData: any) {
  try {
    const { orderId, totalAmount, customerEmail, customerName, products, shippingAddress } = webhookData;

    // Demo modu için basit komisyon hesaplama
    if (process.env.DEMO_MODE === 'true' && !isPrismaAvailable()) {
      // Demo mode without database - return mock success
      return {
        success: true,
        message: 'Demo mode: Webhook processed successfully (no database)',
        data: {
          orderId,
          commission: (totalAmount * 10) / 100, // Mock 10% commission
          status: 'pending'
        }
      };
    }

    // Demo mode with database or production mode
    if (process.env.DEMO_MODE === 'true') {
      const prisma = await getPrisma();
      // Demo veri oluştur
      const demoInfluencer = await prisma.influencer.findFirst();
      if (!demoInfluencer) {
        return {
          success: false,
          message: 'No demo influencer found'
        };
      }

      const demoLink = await prisma.link.findFirst({
        where: { influencerId: demoInfluencer.id }
      });

      if (!demoLink) {
        return {
          success: false,
          message: 'No demo link found'
        };
      }

      // Demo tıklama oluştur
      const demoClick = await prisma.click.create({
        data: {
          linkId: demoLink.id,
          influencerId: demoInfluencer.id,
          ipAddress: '127.0.0.1',
          userAgent: 'Demo User Agent',
          referer: 'https://demo.com',
          converted: true,
          orderId,
          orderValue: totalAmount,
          commission: (totalAmount * demoInfluencer.commissionRate) / 100,
          conversionTime: new Date()
        }
      });

      // Komisyon oluştur
      const commission = await prisma.commission.create({
        data: {
          influencerId: demoInfluencer.id,
          linkId: demoLink.id,
          clickId: demoClick.id,
          orderId,
          orderValue: totalAmount,
          commissionRate: demoInfluencer.commissionRate,
          commissionAmount: (totalAmount * demoInfluencer.commissionRate) / 100,
          status: 'pending',
          customerEmail,
          customerName,
          products: JSON.stringify(products || []),
          shippingCity: shippingAddress?.city,
          shippingCountry: shippingAddress?.country
        }
      });

      // Link istatistiklerini güncelle
      await prisma.link.update({
        where: { id: demoLink.id },
        data: {
          conversionCount: { increment: 1 },
          totalRevenue: { increment: totalAmount },
          lastClicked: new Date()
        }
      });

      // Influencer istatistiklerini güncelle
      await prisma.influencer.update({
        where: { id: demoInfluencer.id },
        data: {
          totalSales: { increment: 1 },
          totalEarnings: { increment: commission.commissionAmount },
          lastActivity: new Date()
        }
      });

      return {
        success: true,
        message: 'Demo commission created successfully',
        commissionId: commission.id
      };
    }

    // Gerçek implementasyon burada olacak
    // İkas'tan gelen gerçek sipariş verilerini işle
    return {
      success: true,
      message: 'Webhook processed successfully'
    };

  } catch (error) {
    console.error('Webhook processing error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Webhook imza doğrulama (gerçek implementasyon için)
function verifyWebhookSignature(payload: any, signature: string | null) {
  // İkas'tan gelen imzayı doğrula
  // Bu kısım İkas API dokümantasyonuna göre implement edilmeli
  return true; // Şimdilik her zaman true döndür
}
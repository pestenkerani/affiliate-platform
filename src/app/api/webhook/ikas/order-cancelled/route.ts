import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/webhook/ikas/order-cancelled - İkas iptal webhook'u
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('İkas order.cancelled webhook received:', body);

    // Sipariş iptal edildiğinde komisyon durumunu güncelle
    const result = await cancelCommission(body);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Commission cancelled successfully',
        commissionId: result.commissionId 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.message 
      }, { status: 400 });
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

async function cancelCommission(webhookData: any) {
  try {
    const { orderId } = webhookData;

    // Komisyonu bul ve durumunu güncelle
    const commission = await prisma.commission.findUnique({
      where: { orderId }
    });

    if (!commission) {
      return {
        success: false,
        message: 'Commission not found for this order'
      };
    }

    // Komisyon durumunu 'cancelled' olarak güncelle
    const updatedCommission = await prisma.commission.update({
      where: { id: commission.id },
      data: {
        status: 'cancelled'
      }
    });

    return {
      success: true,
      message: 'Commission cancelled successfully',
      commissionId: updatedCommission.id
    };

  } catch (error) {
    console.error('Commission cancellation error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}





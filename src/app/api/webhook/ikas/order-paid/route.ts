import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/webhook/ikas/order-paid - İkas ödeme webhook'u
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('İkas order.paid webhook received:', body);

    // Ödeme onaylandığında komisyon durumunu güncelle
    const result = await updateCommissionStatus(body);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Commission status updated successfully',
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

async function updateCommissionStatus(webhookData: any) {
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

    // Komisyon durumunu 'approved' olarak güncelle
    const updatedCommission = await prisma.commission.update({
      where: { id: commission.id },
      data: {
        status: 'approved'
      }
    });

    return {
      success: true,
      message: 'Commission status updated to approved',
      commissionId: updatedCommission.id
    };

  } catch (error) {
    console.error('Commission status update error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}





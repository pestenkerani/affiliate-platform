import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Global state for demo notifications
let demoNotifications = [
  {
    id: '1',
    type: 'commission',
    title: 'Yeni Komisyon',
    message: 'Demo Influencer için ₺15 komisyon oluşturuldu',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    type: 'click',
    title: 'Yüksek Tıklama',
    message: 'DEMO123 linki 10 tıklamaya ulaştı',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '3',
    type: 'conversion',
    title: 'Dönüşüm',
    message: 'Sipariş #ORDER_1 başarıyla dönüştürüldü',
    read: true,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

// GET /api/notifications - Bildirimleri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    return NextResponse.json({
      success: true,
      data: demoNotifications.slice(0, limit),
      unreadCount: demoNotifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Bildirimi okundu olarak işaretle
export async function POST(request: NextRequest) {
  try {
    const { notificationId } = await request.json();

    // Demo modda bildirimi okundu olarak işaretle
    const notificationIndex = demoNotifications.findIndex(n => n.id === notificationId);
    if (notificationIndex !== -1) {
      demoNotifications[notificationIndex].read = true;
      console.log('Marking notification as read:', notificationId);
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

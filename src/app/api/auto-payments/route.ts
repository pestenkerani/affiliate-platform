import { NextRequest, NextResponse } from 'next/server';
import { getPrisma, isPrismaAvailable } from '@/lib/prisma';
import { withSecurity } from '@/lib/security-middleware';

// GET /api/auto-payments - Get auto payment history
export const GET = withSecurity({
  method: ['GET'],
  rateLimit: { windowMs: 60 * 1000, max: 30 },
  cors: { origin: '*', methods: ['GET'], headers: ['Content-Type'] },
})(async (request: NextRequest) => {
  try {
    // Demo mode - return mock data
    if (process.env.DEMO_MODE === 'true' && !isPrismaAvailable()) {
      const mockPayments = [
        {
          id: 'demo-payment-1',
          influencerId: 'demo-1',
          amount: 250.50,
          method: 'bank_transfer',
          status: 'completed',
          scheduledDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          influencer: {
            id: 'demo-1',
            name: 'Demo Influencer',
            email: 'demo@influencer.com',
          },
        },
        {
          id: 'demo-payment-2',
          influencerId: 'demo-2',
          amount: 125.75,
          method: 'bank_transfer',
          status: 'pending',
          scheduledDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          influencer: {
            id: 'demo-2',
            name: 'Test Influencer',
            email: 'test@influencer.com',
          },
        },
      ];

      return NextResponse.json({
        success: true,
        data: {
          payments: mockPayments,
          pagination: {
            page: 1,
            limit: 20,
            total: mockPayments.length,
            totalPages: 1,
          },
        },
      });
    }

    const prisma = await getPrisma();
    const { searchParams } = new URL(request.url);
    const influencerId = searchParams.get('influencerId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const where: any = {};
    if (influencerId) where.influencerId = influencerId;
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      prisma.autoPayment.findMany({
        where,
        include: {
          influencer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.autoPayment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching auto payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auto payments' },
      { status: 500 }
    );
  }
});

// POST /api/auto-payments - Create manual auto payment
export const POST = withSecurity({
  method: ['POST'],
  rateLimit: { windowMs: 60 * 1000, max: 10 },
  cors: { origin: '*', methods: ['POST'], headers: ['Content-Type'] },
  body: {
    required: ['influencerId', 'amount'],
    minLength: { influencerId: 1, amount: 1 },
    maxLength: { influencerId: 50 },
  },
})(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { influencerId, amount, method = 'bank_transfer', scheduledDate } = body;

    // Demo mode - return mock data
    if (process.env.DEMO_MODE === 'true' && !isPrismaAvailable()) {
      const mockPayment = {
        id: `demo-payment-${Date.now()}`,
        influencerId,
        amount: parseFloat(amount),
        method,
        scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : new Date().toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        influencer: {
          id: influencerId,
          name: 'Demo Influencer',
          email: 'demo@influencer.com',
        },
      };

      return NextResponse.json({
        success: true,
        data: mockPayment,
        message: 'Demo mode: Auto payment created successfully',
      });
    }

    const prisma = await getPrisma();

    // Validate influencer exists
    const influencer = await prisma.influencer.findUnique({
      where: { id: influencerId },
    });

    if (!influencer) {
      return NextResponse.json(
        { error: 'Influencer not found' },
        { status: 404 }
      );
    }

    // Create auto payment
    const autoPayment = await prisma.autoPayment.create({
      data: {
        influencerId,
        amount: parseFloat(amount),
        method,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
        status: 'pending',
      },
      include: {
        influencer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: autoPayment,
      message: 'Auto payment created successfully',
    });
  } catch (error) {
    console.error('Error creating auto payment:', error);
    return NextResponse.json(
      { error: 'Failed to create auto payment' },
      { status: 500 }
    );
  }
});

import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import cron from 'node-cron';
import { emailService } from './email-service';

const prisma = new PrismaClient();

// Stripe configuration (demo mode)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_demo_key', {
  apiVersion: '2025-09-30.clover',
});

// Auto payment configuration
const AUTO_PAYMENT_CONFIG = {
  // Minimum commission amount for auto payment
  minAmount: 50, // ₺50
  // Payment schedule (every 1st of month at 10:00 AM)
  schedule: '0 10 1 * *',
  // Payment methods
  methods: ['bank_transfer', 'stripe'] as const,
  // Notification settings
  notifyOnPayment: true,
  notifyOnFailure: true,
};

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// Payment method enum
export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

// Auto payment interface
export interface AutoPayment {
  id: string;
  influencerId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  scheduledDate: Date;
  processedDate?: Date;
  failureReason?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Auto payment service class
 */
export class AutoPaymentService {
  private static instance: AutoPaymentService;
  private isScheduled = false;

  private constructor() {}

  public static getInstance(): AutoPaymentService {
    if (!AutoPaymentService.instance) {
      AutoPaymentService.instance = new AutoPaymentService();
    }
    return AutoPaymentService.instance;
  }

  /**
   * Start auto payment scheduler
   */
  public startScheduler(): void {
    if (this.isScheduled) {
      console.log('Auto payment scheduler already running');
      return;
    }

    console.log('Starting auto payment scheduler...');
    
    // Schedule monthly payments
    cron.schedule(AUTO_PAYMENT_CONFIG.schedule, async () => {
      console.log('Running monthly auto payment process...');
      await this.processMonthlyPayments();
    });

    // Schedule daily checks for pending payments
    cron.schedule('0 9 * * *', async () => {
      console.log('Running daily payment status check...');
      await this.checkPendingPayments();
    });

    this.isScheduled = true;
    console.log('Auto payment scheduler started successfully');
  }

  /**
   * Stop auto payment scheduler
   */
  public stopScheduler(): void {
    // Note: node-cron doesn't have a destroy method
    // In production, you would store the cron job references and call destroy on them
    this.isScheduled = false;
    console.log('Auto payment scheduler stopped');
  }

  /**
   * Process monthly payments for approved commissions
   */
  public async processMonthlyPayments(): Promise<void> {
    try {
      console.log('Processing monthly payments...');

      // Get approved commissions that haven't been paid
      const approvedCommissions = await prisma.commission.findMany({
        where: {
          status: 'approved',
          // Add condition to check if not already paid this month
        },
        include: {
          influencer: true,
          link: true,
        },
      });

      // Group commissions by influencer
      const commissionsByInfluencer = new Map<string, typeof approvedCommissions>();
      
      for (const commission of approvedCommissions) {
        const influencerId = commission.influencerId;
        if (!commissionsByInfluencer.has(influencerId)) {
          commissionsByInfluencer.set(influencerId, []);
        }
        commissionsByInfluencer.get(influencerId)!.push(commission);
      }

      // Process payments for each influencer
      for (const [influencerId, commissions] of commissionsByInfluencer) {
        const totalAmount = commissions.reduce((sum, comm) => sum + comm.commissionAmount, 0);
        
        if (totalAmount >= AUTO_PAYMENT_CONFIG.minAmount) {
          await this.processInfluencerPayment(influencerId, totalAmount, commissions);
        }
      }

      console.log('Monthly payment processing completed');
    } catch (error) {
      console.error('Error processing monthly payments:', error);
    }
  }

  /**
   * Process payment for a specific influencer
   */
  private async processInfluencerPayment(
    influencerId: string,
    totalAmount: number,
    commissions: any[]
  ): Promise<void> {
    try {
      const influencer = await prisma.influencer.findUnique({
        where: { id: influencerId },
      });

      if (!influencer) {
        console.error(`Influencer not found: ${influencerId}`);
        return;
      }

      console.log(`Processing payment for ${influencer.name}: ₺${totalAmount}`);

      // Create auto payment record
      const autoPayment = await prisma.autoPayment.create({
        data: {
          influencerId,
          amount: totalAmount,
          currency: 'TRY',
          method: 'bank_transfer', // Default method
          status: 'pending',
          scheduledDate: new Date(),
        },
      });

      // Try bank transfer first (if IBAN is available)
      if (influencer.iban) {
        const bankTransferResult = await this.processBankTransfer(influencer, totalAmount);
        
        if (bankTransferResult.success) {
          await this.updatePaymentStatus(autoPayment.id, PaymentStatus.COMPLETED, bankTransferResult.transactionId);
          await this.updateCommissionsStatus(commissions, 'paid');
          await this.sendPaymentNotification(influencer, totalAmount, 'completed');
          return;
        }
      }

      // Fallback to Stripe if bank transfer fails
      if (AUTO_PAYMENT_CONFIG.methods.includes('stripe')) {
        const stripeResult = await this.processStripePayment(influencer, totalAmount);
        
        if (stripeResult.success) {
          await this.updatePaymentStatus(autoPayment.id, PaymentStatus.COMPLETED, stripeResult.transactionId);
          await this.updateCommissionsStatus(commissions, 'paid');
          await this.sendPaymentNotification(influencer, totalAmount, 'completed');
          return;
        }
      }

      // Mark payment as failed
      await this.updatePaymentStatus(autoPayment.id, PaymentStatus.FAILED, undefined, 'All payment methods failed');
      await this.sendPaymentNotification(influencer, totalAmount, 'failed');

    } catch (error) {
      console.error(`Error processing payment for influencer ${influencerId}:`, error);
    }
  }

  /**
   * Process bank transfer payment
   */
  private async processBankTransfer(influencer: any, amount: number): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    try {
      // Demo mode - simulate bank transfer
      console.log(`Simulating bank transfer to ${influencer.iban} for ₺${amount}`);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate 90% success rate
      const success = Math.random() > 0.1;
      
      if (success) {
        const transactionId = `BANK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return { success: true, transactionId };
      } else {
        return { success: false, error: 'Bank transfer failed' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Process Stripe payment
   */
  private async processStripePayment(influencer: any, amount: number): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    try {
      // Demo mode - simulate Stripe payment
      console.log(`Simulating Stripe payment for ${influencer.email} for ₺${amount}`);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate 95% success rate
      const success = Math.random() > 0.05;
      
      if (success) {
        const transactionId = `STRIPE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return { success: true, transactionId };
      } else {
        return { success: false, error: 'Stripe payment failed' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update payment status
   */
  private async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    transactionId?: string,
    failureReason?: string
  ): Promise<void> {
    await prisma.autoPayment.update({
      where: { id: paymentId },
      data: {
        status,
        transactionId,
        failureReason,
        processedDate: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Update commissions status
   */
  private async updateCommissionsStatus(commissions: any[], status: string): Promise<void> {
    const commissionIds = commissions.map(comm => comm.id);
    
    await prisma.commission.updateMany({
      where: { id: { in: commissionIds } },
      data: { status },
    });
  }

  /**
   * Send payment notification
   */
  private async sendPaymentNotification(
    influencer: any,
    amount: number,
    status: 'completed' | 'failed'
  ): Promise<void> {
    try {
      if (!AUTO_PAYMENT_CONFIG.notifyOnPayment) return;

      const subject = status === 'completed' 
        ? `Ödeme Tamamlandı - ₺${amount}`
        : `Ödeme Başarısız - ₺${amount}`;

      const message = status === 'completed'
        ? `Merhaba ${influencer.name},\n\n₺${amount} tutarındaki komisyonunuz hesabınıza yatırılmıştır.\n\nTeşekkürler!`
        : `Merhaba ${influencer.name},\n\n₺${amount} tutarındaki komisyonunuzun ödemesi başarısız olmuştur. Lütfen iletişime geçin.\n\nTeşekkürler!`;

      await emailService.sendEmail({
        to: influencer.email,
        subject,
        text: message,
      });

      console.log(`Payment notification sent to ${influencer.email}`);
    } catch (error) {
      console.error('Error sending payment notification:', error);
    }
  }

  /**
   * Check pending payments and retry failed ones
   */
  public async checkPendingPayments(): Promise<void> {
    try {
      const pendingPayments = await prisma.autoPayment.findMany({
        where: {
          status: 'pending',
          scheduledDate: {
            lte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
          },
        },
        include: {
          influencer: true,
        },
      });

      for (const payment of pendingPayments) {
        console.log(`Retrying payment for ${payment.influencer.name}: ₺${payment.amount}`);
        // Retry payment logic here
      }
    } catch (error) {
      console.error('Error checking pending payments:', error);
    }
  }

  /**
   * Get payment history for an influencer
   */
  public async getPaymentHistory(influencerId: string): Promise<any[]> {
    return await prisma.autoPayment.findMany({
      where: { influencerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get payment statistics
   */
  public async getPaymentStats(): Promise<{
    totalPaid: number;
    totalPending: number;
    totalFailed: number;
    monthlyStats: Array<{
      month: string;
      totalPaid: number;
      totalCount: number;
    }>;
  }> {
    const stats = await prisma.autoPayment.groupBy({
      by: ['status'],
      _sum: { amount: true },
      _count: { id: true },
    });

    const totalPaid = stats.find(s => s.status === 'completed')?._sum.amount || 0;
    const totalPending = stats.find(s => s.status === 'pending')?._sum.amount || 0;
    const totalFailed = stats.find(s => s.status === 'failed')?._sum.amount || 0;

    // Get monthly stats for the last 12 months
    const monthlyStats = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(processedDate, '%Y-%m') as month,
        SUM(amount) as totalPaid,
        COUNT(*) as totalCount
      FROM AutoPayment 
      WHERE status = 'completed' 
        AND processedDate >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month DESC
    `;

    return {
      totalPaid,
      totalPending,
      totalFailed,
      monthlyStats: monthlyStats as any,
    };
  }
}

// Export singleton instance
export const autoPaymentService = AutoPaymentService.getInstance();

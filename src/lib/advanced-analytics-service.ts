import { PrismaClient } from '@prisma/client';
import moment from 'moment';

const prisma = new PrismaClient();

// Analytics time periods
export enum TimePeriod {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_YEAR = 'this_year',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom',
}

// Analytics metrics
export interface AnalyticsMetrics {
  // Traffic metrics
  totalClicks: number;
  uniqueClicks: number;
  clickGrowth: number;
  clickGrowthPercentage: number;
  
  // Conversion metrics
  totalConversions: number;
  conversionRate: number;
  conversionGrowth: number;
  conversionGrowthPercentage: number;
  
  // Revenue metrics
  totalRevenue: number;
  totalCommissions: number;
  revenueGrowth: number;
  revenueGrowthPercentage: number;
  avgOrderValue: number;
  
  // Influencer metrics
  activeInfluencers: number;
  topInfluencer: {
    id: string;
    name: string;
    clicks: number;
    conversions: number;
    revenue: number;
  } | null;
  
  // Link metrics
  activeLinks: number;
  topLink: {
    id: string;
    shortCode: string;
    clicks: number;
    conversions: number;
    revenue: number;
  } | null;
  
  // Geographic metrics
  topCountries: Array<{
    country: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  
  // Device metrics
  deviceStats: Array<{
    device: string;
    clicks: number;
    conversions: number;
    conversionRate: number;
  }>;
  
  // Time-based metrics
  hourlyStats: Array<{
    hour: number;
    clicks: number;
    conversions: number;
  }>;
  
  dailyStats: Array<{
    date: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
}

/**
 * Advanced Analytics Service
 */
export class AdvancedAnalyticsService {
  private static instance: AdvancedAnalyticsService;

  private constructor() {}

  public static getInstance(): AdvancedAnalyticsService {
    if (!AdvancedAnalyticsService.instance) {
      AdvancedAnalyticsService.instance = new AdvancedAnalyticsService();
    }
    return AdvancedAnalyticsService.instance;
  }

  /**
   * Get analytics metrics for a specific time period
   */
  public async getMetrics(
    period: TimePeriod,
    startDate?: Date,
    endDate?: Date
  ): Promise<AnalyticsMetrics> {
    const dateRange = this.getDateRange(period, startDate, endDate);
    
    const [
      trafficMetrics,
      conversionMetrics,
      revenueMetrics,
      influencerMetrics,
      linkMetrics,
      geographicMetrics,
      deviceMetrics,
      hourlyStats,
      dailyStats,
    ] = await Promise.all([
      this.getTrafficMetrics(dateRange),
      this.getConversionMetrics(dateRange),
      this.getRevenueMetrics(dateRange),
      this.getInfluencerMetrics(dateRange),
      this.getLinkMetrics(dateRange),
      this.getGeographicMetrics(dateRange),
      this.getDeviceMetrics(dateRange),
      this.getHourlyStats(dateRange),
      this.getDailyStats(dateRange),
    ]);

    // Calculate growth percentages
    const previousPeriodRange = this.getPreviousPeriodRange(period, startDate, endDate);
    const previousMetrics = await this.getPreviousPeriodMetrics(previousPeriodRange);

    const clickGrowth = trafficMetrics.totalClicks - previousMetrics.totalClicks;
    const clickGrowthPercentage = previousMetrics.totalClicks > 0 
      ? (clickGrowth / previousMetrics.totalClicks) * 100 
      : 0;

    const conversionGrowth = conversionMetrics.totalConversions - previousMetrics.totalConversions;
    const conversionGrowthPercentage = previousMetrics.totalConversions > 0 
      ? (conversionGrowth / previousMetrics.totalConversions) * 100 
      : 0;

    const revenueGrowth = revenueMetrics.totalRevenue - previousMetrics.totalRevenue;
    const revenueGrowthPercentage = previousMetrics.totalRevenue > 0 
      ? (revenueGrowth / previousMetrics.totalRevenue) * 100 
      : 0;

    return {
      // Traffic metrics
      totalClicks: trafficMetrics.totalClicks,
      uniqueClicks: trafficMetrics.uniqueClicks,
      clickGrowth,
      clickGrowthPercentage: Math.round(clickGrowthPercentage * 100) / 100,
      
      // Conversion metrics
      totalConversions: conversionMetrics.totalConversions,
      conversionRate: conversionMetrics.conversionRate,
      conversionGrowth,
      conversionGrowthPercentage: Math.round(conversionGrowthPercentage * 100) / 100,
      
      // Revenue metrics
      totalRevenue: revenueMetrics.totalRevenue,
      totalCommissions: revenueMetrics.totalCommissions,
      revenueGrowth,
      revenueGrowthPercentage: Math.round(revenueGrowthPercentage * 100) / 100,
      avgOrderValue: revenueMetrics.avgOrderValue,
      
      // Influencer metrics
      activeInfluencers: influencerMetrics.activeInfluencers,
      topInfluencer: influencerMetrics.topInfluencer,
      
      // Link metrics
      activeLinks: linkMetrics.activeLinks,
      topLink: linkMetrics.topLink,
      
      // Geographic metrics
      topCountries: geographicMetrics,
      
      // Device metrics
      deviceStats: deviceMetrics,
      
      // Time-based metrics
      hourlyStats,
      dailyStats,
    };
  }

  /**
   * Get traffic metrics
   */
  private async getTrafficMetrics(dateRange: { start: Date; end: Date }) {
    const [totalClicks, uniqueClicks] = await Promise.all([
      prisma.click.count({
        where: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
      }),
      prisma.click.count({
        where: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
          isUnique: true,
        },
      }),
    ]);

    return { totalClicks, uniqueClicks };
  }

  /**
   * Get conversion metrics
   */
  private async getConversionMetrics(dateRange: { start: Date; end: Date }) {
    const [totalConversions, totalClicks] = await Promise.all([
      prisma.click.count({
        where: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
          converted: true,
        },
      }),
      prisma.click.count({
        where: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
      }),
    ]);

    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    return { totalConversions, conversionRate };
  }

  /**
   * Get revenue metrics
   */
  private async getRevenueMetrics(dateRange: { start: Date; end: Date }) {
    const [revenueData, commissionData] = await Promise.all([
      prisma.click.aggregate({
        where: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
          converted: true,
        },
        _sum: { orderValue: true },
        _avg: { orderValue: true },
      }),
      prisma.commission.aggregate({
        where: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
          status: { in: ['approved', 'paid'] },
        },
        _sum: { commissionAmount: true },
      }),
    ]);

    return {
      totalRevenue: revenueData._sum.orderValue || 0,
      totalCommissions: commissionData._sum.commissionAmount || 0,
      avgOrderValue: revenueData._avg.orderValue || 0,
    };
  }

  /**
   * Get influencer metrics
   */
  private async getInfluencerMetrics(dateRange: { start: Date; end: Date }) {
    const [activeInfluencers, topInfluencerData] = await Promise.all([
      prisma.influencer.count({
        where: {
          status: 'active',
          lastActivity: {
            gte: dateRange.start,
          },
        },
      }),
      prisma.$queryRaw`
        SELECT 
          i.id,
          i.name,
          COUNT(c.id) as clicks,
          COUNT(CASE WHEN c.converted = 1 THEN 1 END) as conversions,
          COALESCE(SUM(c.orderValue), 0) as revenue
        FROM influencers i
        LEFT JOIN clicks c ON i.id = c.influencerId 
          AND c.createdAt >= ${dateRange.start} 
          AND c.createdAt <= ${dateRange.end}
        WHERE i.status = 'active'
        GROUP BY i.id, i.name
        ORDER BY revenue DESC
        LIMIT 1
      `,
    ]);

    const topInfluencer = topInfluencerData && Array.isArray(topInfluencerData) && topInfluencerData.length > 0
      ? {
          id: topInfluencerData[0].id,
          name: topInfluencerData[0].name,
          clicks: Number(topInfluencerData[0].clicks),
          conversions: Number(topInfluencerData[0].conversions),
          revenue: Number(topInfluencerData[0].revenue),
        }
      : null;

    return { activeInfluencers, topInfluencer };
  }

  /**
   * Get link metrics
   */
  private async getLinkMetrics(dateRange: { start: Date; end: Date }) {
    const [activeLinks, topLinkData] = await Promise.all([
      prisma.link.count({
        where: {
          status: 'active',
          createdAt: {
            lte: dateRange.end,
          },
        },
      }),
      prisma.$queryRaw`
        SELECT 
          l.id,
          l.shortCode,
          COUNT(c.id) as clicks,
          COUNT(CASE WHEN c.converted = 1 THEN 1 END) as conversions,
          COALESCE(SUM(c.orderValue), 0) as revenue
        FROM links l
        LEFT JOIN clicks c ON l.id = c.linkId 
          AND c.createdAt >= ${dateRange.start} 
          AND c.createdAt <= ${dateRange.end}
        WHERE l.status = 'active'
        GROUP BY l.id, l.shortCode
        ORDER BY revenue DESC
        LIMIT 1
      `,
    ]);

    const topLink = topLinkData && Array.isArray(topLinkData) && topLinkData.length > 0
      ? {
          id: topLinkData[0].id,
          shortCode: topLinkData[0].shortCode,
          clicks: Number(topLinkData[0].clicks),
          conversions: Number(topLinkData[0].conversions),
          revenue: Number(topLinkData[0].revenue),
        }
      : null;

    return { activeLinks, topLink };
  }

  /**
   * Get geographic metrics
   */
  private async getGeographicMetrics(dateRange: { start: Date; end: Date }) {
    const topCountriesData = await prisma.$queryRaw`
      SELECT 
        country,
        COUNT(*) as clicks,
        COUNT(CASE WHEN converted = 1 THEN 1 END) as conversions,
        COALESCE(SUM(orderValue), 0) as revenue
      FROM clicks
      WHERE createdAt >= ${dateRange.start} 
        AND createdAt <= ${dateRange.end}
        AND country IS NOT NULL
      GROUP BY country
      ORDER BY revenue DESC
      LIMIT 10
    `;

    return (topCountriesData as any[]).map(item => ({
      country: item.country,
      clicks: Number(item.clicks),
      conversions: Number(item.conversions),
      revenue: Number(item.revenue),
    }));
  }

  /**
   * Get device metrics
   */
  private async getDeviceMetrics(dateRange: { start: Date; end: Date }) {
    const deviceStatsData = await prisma.$queryRaw`
      SELECT 
        device,
        COUNT(*) as clicks,
        COUNT(CASE WHEN converted = 1 THEN 1 END) as conversions,
        ROUND(
          (COUNT(CASE WHEN converted = 1 THEN 1 END) * 100.0 / COUNT(*)), 2
        ) as conversionRate
      FROM clicks
      WHERE createdAt >= ${dateRange.start} 
        AND createdAt <= ${dateRange.end}
      GROUP BY device
      ORDER BY clicks DESC
    `;

    return (deviceStatsData as any[]).map(item => ({
      device: item.device,
      clicks: Number(item.clicks),
      conversions: Number(item.conversions),
      conversionRate: Number(item.conversionRate),
    }));
  }

  /**
   * Get hourly stats
   */
  private async getHourlyStats(dateRange: { start: Date; end: Date }) {
    const hourlyStatsData = await prisma.$queryRaw`
      SELECT 
        CAST(strftime('%H', createdAt) AS INTEGER) as hour,
        COUNT(*) as clicks,
        COUNT(CASE WHEN converted = 1 THEN 1 END) as conversions
      FROM clicks
      WHERE createdAt >= ${dateRange.start} 
        AND createdAt <= ${dateRange.end}
      GROUP BY hour
      ORDER BY hour
    `;

    return (hourlyStatsData as any[]).map(item => ({
      hour: Number(item.hour),
      clicks: Number(item.clicks),
      conversions: Number(item.conversions),
    }));
  }

  /**
   * Get daily stats
   */
  private async getDailyStats(dateRange: { start: Date; end: Date }) {
    const dailyStatsData = await prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as clicks,
        COUNT(CASE WHEN converted = 1 THEN 1 END) as conversions,
        COALESCE(SUM(orderValue), 0) as revenue
      FROM clicks
      WHERE createdAt >= ${dateRange.start} 
        AND createdAt <= ${dateRange.end}
      GROUP BY DATE(createdAt)
      ORDER BY date
    `;

    return (dailyStatsData as any[]).map(item => ({
      date: item.date,
      clicks: Number(item.clicks),
      conversions: Number(item.conversions),
      revenue: Number(item.revenue),
    }));
  }

  /**
   * Get date range for a time period
   */
  private getDateRange(period: TimePeriod, startDate?: Date, endDate?: Date): { start: Date; end: Date } {
    const now = moment();
    let start: moment.Moment;
    let end: moment.Moment = now.clone();

    switch (period) {
      case TimePeriod.TODAY:
        start = now.clone().startOf('day');
        break;
      case TimePeriod.YESTERDAY:
        start = now.clone().subtract(1, 'day').startOf('day');
        end = now.clone().subtract(1, 'day').endOf('day');
        break;
      case TimePeriod.LAST_7_DAYS:
        start = now.clone().subtract(7, 'days').startOf('day');
        break;
      case TimePeriod.LAST_30_DAYS:
        start = now.clone().subtract(30, 'days').startOf('day');
        break;
      case TimePeriod.LAST_90_DAYS:
        start = now.clone().subtract(90, 'days').startOf('day');
        break;
      case TimePeriod.THIS_MONTH:
        start = now.clone().startOf('month');
        break;
      case TimePeriod.LAST_MONTH:
        start = now.clone().subtract(1, 'month').startOf('month');
        end = now.clone().subtract(1, 'month').endOf('month');
        break;
      case TimePeriod.THIS_YEAR:
        start = now.clone().startOf('year');
        break;
      case TimePeriod.LAST_YEAR:
        start = now.clone().subtract(1, 'year').startOf('year');
        end = now.clone().subtract(1, 'year').endOf('year');
        break;
      case TimePeriod.CUSTOM:
        if (!startDate || !endDate) {
          throw new Error('Start and end dates are required for custom period');
        }
        start = moment(startDate);
        end = moment(endDate);
        break;
      default:
        start = now.clone().subtract(30, 'days').startOf('day');
    }

    return {
      start: start.toDate(),
      end: end.toDate(),
    };
  }

  /**
   * Get previous period range for comparison
   */
  private getPreviousPeriodRange(period: TimePeriod, startDate?: Date, endDate?: Date): { start: Date; end: Date } {
    const currentRange = this.getDateRange(period, startDate, endDate);
    const duration = moment(currentRange.end).diff(moment(currentRange.start));
    
    return {
      start: moment(currentRange.start).subtract(duration, 'milliseconds').toDate(),
      end: moment(currentRange.start).toDate(),
    };
  }

  /**
   * Get previous period metrics for comparison
   */
  private async getPreviousPeriodMetrics(dateRange: { start: Date; end: Date }) {
    const [totalClicks, totalConversions, totalRevenue] = await Promise.all([
      prisma.click.count({
        where: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
      }),
      prisma.click.count({
        where: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
          converted: true,
        },
      }),
      prisma.click.aggregate({
        where: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
          converted: true,
        },
        _sum: { orderValue: true },
      }),
    ]);

    return {
      totalClicks,
      totalConversions,
      totalRevenue: totalRevenue._sum.orderValue || 0,
    };
  }

  /**
   * Get real-time metrics (last hour)
   */
  public async getRealTimeMetrics(): Promise<{
    clicksLastHour: number;
    conversionsLastHour: number;
    revenueLastHour: number;
    activeUsers: number;
  }> {
    const oneHourAgo = moment().subtract(1, 'hour').toDate();
    const now = new Date();

    const [clicksLastHour, conversionsLastHour, revenueLastHour, activeUsers] = await Promise.all([
      prisma.click.count({
        where: {
          createdAt: {
            gte: oneHourAgo,
            lte: now,
          },
        },
      }),
      prisma.click.count({
        where: {
          createdAt: {
            gte: oneHourAgo,
            lte: now,
          },
          converted: true,
        },
      }),
      prisma.click.aggregate({
        where: {
          createdAt: {
            gte: oneHourAgo,
            lte: now,
          },
          converted: true,
        },
        _sum: { orderValue: true },
      }),
      prisma.click.count({
        where: {
          createdAt: {
            gte: oneHourAgo,
            lte: now,
          },
          isUnique: true,
        },
      }),
    ]);

    return {
      clicksLastHour,
      conversionsLastHour,
      revenueLastHour: revenueLastHour._sum.orderValue || 0,
      activeUsers,
    };
  }
}

// Export singleton instance
export const advancedAnalyticsService = AdvancedAnalyticsService.getInstance();




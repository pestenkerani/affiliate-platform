'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MousePointer, 
  ShoppingCart, 
  DollarSign,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  Calendar
} from 'lucide-react';

interface AdvancedAnalyticsProps {
  className?: string;
}

interface AnalyticsMetrics {
  totalClicks: number;
  uniqueClicks: number;
  clickGrowth: number;
  clickGrowthPercentage: number;
  totalConversions: number;
  conversionRate: number;
  conversionGrowth: number;
  conversionGrowthPercentage: number;
  totalRevenue: number;
  totalCommissions: number;
  revenueGrowth: number;
  revenueGrowthPercentage: number;
  avgOrderValue: number;
  activeInfluencers: number;
  topInfluencer: {
    id: string;
    name: string;
    clicks: number;
    conversions: number;
    revenue: number;
  } | null;
  activeLinks: number;
  topLink: {
    id: string;
    shortCode: string;
    clicks: number;
    conversions: number;
    revenue: number;
  } | null;
  topCountries: Array<{
    country: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  deviceStats: Array<{
    device: string;
    clicks: number;
    conversions: number;
    conversionRate: number;
  }>;
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdvancedAnalytics({ className }: AdvancedAnalyticsProps) {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('last_30_days');
  const [realtimeMetrics, setRealtimeMetrics] = useState<any>(null);

  const fetchAnalytics = async (selectedPeriod: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/advanced?period=${selectedPeriod}`);
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.data.metrics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeMetrics = async () => {
    try {
      const response = await fetch('/api/analytics/realtime');
      const data = await response.json();
      
      if (data.success) {
        setRealtimeMetrics(data.data.metrics);
      }
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  useEffect(() => {
    // Fetch real-time metrics every 30 seconds
    fetchRealtimeMetrics();
    const interval = setInterval(fetchRealtimeMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Gelişmiş Analitik</h2>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <p className="text-gray-500">Analitik verileri yüklenemedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gelişmiş Analitik</h2>
          <p className="text-gray-600">Detaylı performans metrikleri ve trendler</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Bugün</SelectItem>
              <SelectItem value="yesterday">Dün</SelectItem>
              <SelectItem value="last_7_days">Son 7 Gün</SelectItem>
              <SelectItem value="last_30_days">Son 30 Gün</SelectItem>
              <SelectItem value="last_90_days">Son 90 Gün</SelectItem>
              <SelectItem value="this_month">Bu Ay</SelectItem>
              <SelectItem value="last_month">Geçen Ay</SelectItem>
              <SelectItem value="this_year">Bu Yıl</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Real-time Metrics */}
      {realtimeMetrics && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Canlı Veriler (Son 1 Saat)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{realtimeMetrics.clicksLastHour}</p>
                <p className="text-sm text-gray-600">Tıklama</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{realtimeMetrics.conversionsLastHour}</p>
                <p className="text-sm text-gray-600">Dönüşüm</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(realtimeMetrics.revenueLastHour)}</p>
                <p className="text-sm text-gray-600">Gelir</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{realtimeMetrics.activeUsers}</p>
                <p className="text-sm text-gray-600">Aktif Kullanıcı</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Tıklama</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.totalClicks)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(metrics.clickGrowth)}
                  <span className={`text-sm ${getGrowthColor(metrics.clickGrowth)}`}>
                    {metrics.clickGrowthPercentage > 0 ? '+' : ''}{metrics.clickGrowthPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <MousePointer className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dönüşüm Oranı</p>
                <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(2)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(metrics.conversionGrowth)}
                  <span className={`text-sm ${getGrowthColor(metrics.conversionGrowth)}`}>
                    {metrics.conversionGrowthPercentage > 0 ? '+' : ''}{metrics.conversionGrowthPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(metrics.revenueGrowth)}
                  <span className={`text-sm ${getGrowthColor(metrics.revenueGrowth)}`}>
                    {metrics.revenueGrowthPercentage > 0 ? '+' : ''}{metrics.revenueGrowthPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif Influencer</p>
                <p className="text-2xl font-bold">{metrics.activeInfluencers}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrics.topInfluencer ? `En iyi: ${metrics.topInfluencer.name}` : 'Veri yok'}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="geographic">Coğrafi</TabsTrigger>
          <TabsTrigger value="devices">Cihazlar</TabsTrigger>
          <TabsTrigger value="timeline">Zaman Çizelgesi</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Stats Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Günlük Performans</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="clicks" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="conversions" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Stats Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cihaz Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.deviceStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, percent }) => `${device} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="clicks"
                    >
                      {metrics.deviceStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ülke Performansı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topCountries.map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{country.country}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(country.revenue)}</p>
                      <p className="text-sm text-gray-500">{country.clicks} tıklama, {country.conversions} dönüşüm</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cihaz Performansı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.deviceStats.map((device) => (
                  <div key={device.device} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {device.device === 'mobile' && <Smartphone className="h-4 w-4 text-gray-500" />}
                      {device.device === 'desktop' && <Monitor className="h-4 w-4 text-gray-500" />}
                      {device.device === 'tablet' && <Tablet className="h-4 w-4 text-gray-500" />}
                      {!['mobile', 'desktop', 'tablet'].includes(device.device) && <Monitor className="h-4 w-4 text-gray-500" />}
                      <span className="font-medium capitalize">{device.device}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{device.conversionRate.toFixed(2)}% dönüşüm</p>
                      <p className="text-sm text-gray-500">{device.clicks} tıklama, {device.conversions} dönüşüm</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saatlik Dağılım</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={metrics.hourlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#8884d8" name="Tıklama" />
                  <Bar dataKey="conversions" fill="#82ca9d" name="Dönüşüm" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}





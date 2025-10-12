'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Link, 
  TrendingUp, 
  DollarSign, 
  Plus,
  Copy,
  Edit,
  Trash2,
  Bell,
  BarChart3,
  Sun,
  Moon
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { useTheme } from '@/contexts/ThemeContext';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const API_BASE_URL = '/api';

interface Influencer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  commissionRate: number;
  status: string;
  totalEarnings: number;
  totalClicks: number;
  totalSales: number;
  createdAt: string;
}

interface Link {
  id: string;
  shortCode: string;
  originalUrl: string;
  campaignName?: string;
  influencer: Influencer;
  clickCount: number;
  conversionCount: number;
  status: string;
  createdAt: string;
}

interface Commission {
  id: string;
  orderId: string;
  orderValue: number;
  commissionRate: number;
  commissionAmount: number;
  status: string;
  paymentDate?: string;
  customerEmail?: string;
  customerName?: string;
  createdAt: string;
  influencer: {
    id: string;
    name: string;
    email: string;
  };
  link: {
    id: string;
    shortCode: string;
    campaignName?: string;
  };
}

export default function AffiliateDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'influencers' | 'links' | 'commissions' | 'analytics' | 'advanced-analytics'>('dashboard');
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalInfluencers: 0,
    totalLinks: 0,
    totalClicks: 0,
    totalCommissions: 0,
  });

  // Form states
  const [influencerForm, setInfluencerForm] = useState({
    name: '',
    email: '',
    phone: '',
    commissionRate: 5,
  });

  const [linkForm, setLinkForm] = useState({
    originalUrl: '',
    influencerId: '',
    campaignName: '',
    utmSource: 'affiliate',
    utmMedium: 'social',
    utmCampaign: '',
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Bulk operations states
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // User role state
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'viewer'>('admin');

  const fetchNotifications = async () => {
    try {
      // Demo mode - return mock notifications
      console.log('Demo mode: Using mock notifications');
      setNotifications([
        {
          id: '1',
          title: 'Yeni Komisyon',
          message: 'Demo Influencer için komisyon ödemesi hazır',
          type: 'success',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Sistem Güncellemesi',
          message: 'Demo modda çalışıyor - veritabanı bağlantısı yok',
          type: 'info',
          isRead: true,
          createdAt: new Date().toISOString()
        }
      ]);
      setUnreadCount(1);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      // Demo mode - just update local state
      console.log('Demo mode: Marking notification as read:', notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const checkAuth = useCallback(async () => {
    try {
      console.log('Demo mode: setting authenticated to true');
      setAuthenticated(true);
      // Demo modda admin rolü ile başlat
      setUserRole('admin');
      fetchData();
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthenticated(true);
      setUserRole('admin');
      fetchData();
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    fetchNotifications();
  }, [checkAuth]);

  // userRole değiştiğinde component'i yeniden render et
  useEffect(() => {
    // Bu useEffect sadece userRole değiştiğinde çalışır
  }, [userRole]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Paralel API çağrıları - daha hızlı yükleme
      const [influencersRes, linksRes, commissionsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/influencers`, { timeout: 10000 }),
        axios.get(`${API_BASE_URL}/links`, { timeout: 10000 }),
        axios.get(`${API_BASE_URL}/commissions`, { timeout: 10000 })
      ]);

      // Verileri batch olarak güncelle - tek seferde re-render
      const influencersData = influencersRes.data.data || [];
      const linksData = linksRes.data.data || [];
      const commissionsData = commissionsRes.data.data || [];

      // Stats hesaplamalarını optimize et
      const totalClicks = linksData.reduce((sum: number, link: Link) => sum + link.clickCount, 0);
      const totalCommissions = commissionsData.reduce((sum: number, comm: Commission) => sum + comm.commissionAmount, 0);

      // Tek seferde state güncellemesi
      setInfluencers(influencersData);
      setLinks(linksData);
      setCommissions(commissionsData);
      setStats({
        totalInfluencers: influencersData.length,
        totalLinks: linksData.length,
        totalClicks,
        totalCommissions,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      // Hata durumunda kullanıcıya bilgi ver
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      alert(`Veriler yüklenirken bir hata oluştu: ${errorMessage}\nLütfen sayfayı yenileyin.`);
      
      // Hata durumunda varsayılan değerler
      setInfluencers([]);
      setLinks([]);
      setCommissions([]);
      setStats({
        totalInfluencers: 0,
        totalLinks: 0,
        totalClicks: 0,
        totalCommissions: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const setupDemoData = async () => {
    try {
      await axios.post(`${API_BASE_URL}/demo/setup`);
      fetchData();
      // Bildirimleri yenile
      fetchNotifications();
    } catch (error) {
      console.error('Error setting up demo data:', error);
    }
  };

  const clearDemoData = async () => {
    try {
      await axios.post(`${API_BASE_URL}/demo/clear`);
      fetchData();
    } catch (error) {
      console.error('Error clearing demo data:', error);
    }
  };

  const handleCreateInfluencer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/influencers`, influencerForm);
      setInfluencerForm({ name: '', email: '', phone: '', commissionRate: 5 });
      fetchData();
    } catch (error) {
      console.error('Error creating influencer:', error);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/links`, linkForm);
      setLinkForm({ 
        originalUrl: '', 
        influencerId: '', 
        campaignName: '', 
        utmSource: 'affiliate', 
        utmMedium: 'social', 
        utmCampaign: '' 
      });
      fetchData();
    } catch (error) {
      console.error('Error creating link:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleApproveCommission = async (id: string) => {
    try {
      setActionLoading(`approve-${id}`);
      console.log('Approving commission:', id);
      
      const response = await axios.patch(`${API_BASE_URL}/commissions/${id}/status`, { 
        status: 'approved' 
      }, { timeout: 5000 });
      
      console.log('Approval response:', response.data);
      
      // Optimistic update - UI'yi hemen güncelle
      setCommissions(prev => prev.map(comm => 
        comm.id === id ? { ...comm, status: 'approved' } : comm
      ));
      
      // Email bildirimi gönder (arka planda)
      const commission = commissions.find(c => c.id === id);
      if (commission) {
        axios.post(`${API_BASE_URL}/email/send`, {
          type: 'commission',
          influencerEmail: commission.influencer.email,
          data: {
            commissionAmount: commission.commissionAmount,
            orderId: commission.orderId
          }
        }).catch(emailError => {
          console.error('Email gönderilemedi:', emailError);
        });
      }
      
    } catch (error) {
      console.error('Error approving commission:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      alert(`Komisyon onaylanırken hata oluştu: ${errorMessage}`);
      
      // Optimistic update'i geri al
      setCommissions(prev => prev.map(comm => 
        comm.id === id ? { ...comm, status: 'pending' } : comm
      ));
    } finally {
      setActionLoading(null);
    }
  };

  const handlePayCommission = async (id: string) => {
    try {
      await axios.patch(`${API_BASE_URL}/commissions/${id}/status`, { status: 'paid' });
      
      // Email bildirimi gönder
      const commission = commissions.find(c => c.id === id);
      if (commission) {
        await axios.post(`${API_BASE_URL}/email/send`, {
          type: 'payment',
          influencerEmail: commission.influencer.email,
          data: {
            paymentAmount: commission.commissionAmount,
            paymentDate: new Date().toLocaleDateString('tr-TR')
          }
        });
      }
      
      fetchData();
    } catch (error) {
      console.error('Error paying commission:', error);
    }
  };

  const handleCancelCommission = async (id: string) => {
    if (window.confirm('Bu komisyonu iptal etmek istediğinizden emin misiniz?')) {
      try {
        await axios.patch(`${API_BASE_URL}/commissions/${id}/status`, { status: 'cancelled' });
        fetchData();
      } catch (error) {
        console.error('Error cancelling commission:', error);
      }
    }
  };

  // Bulk operations
  const handleBulkStatusChange = async (status: string) => {
    try {
      await Promise.all(
        selectedInfluencers.map(id => 
          axios.patch(`${API_BASE_URL}/influencers/${id}/status`, { status })
        )
      );
      setSelectedInfluencers([]);
      fetchData();
    } catch (error) {
      console.error('Error updating bulk status:', error);
    }
  };

  const handleBulkDeleteInfluencers = async () => {
    if (window.confirm(`${selectedInfluencers.length} influencer'ı silmek istediğinizden emin misiniz?`)) {
      try {
        await Promise.all(
          selectedInfluencers.map(id => 
            axios.delete(`${API_BASE_URL}/influencers/${id}`)
          )
        );
        setSelectedInfluencers([]);
        fetchData();
      } catch (error) {
        console.error('Error deleting bulk influencers:', error);
      }
    }
  };

  const handleSelectInfluencer = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedInfluencers([...selectedInfluencers, id]);
    } else {
      setSelectedInfluencers(selectedInfluencers.filter(i => i !== id));
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Authentication kontrol ediliyor...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Giriş Gerekli</h1>
          <Button onClick={() => router.push('/authorize-store')}>
            Mağaza Yetkilendir
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Affiliate Tracker</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {/* Dark Mode Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="flex items-center space-x-2"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="hidden sm:inline">
                  {theme === 'light' ? 'Karanlık' : 'Aydınlık'}
                </span>
              </Button>
              {/* Role Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Rol:</span>
                <select 
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as 'admin' | 'manager' | 'viewer')}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="viewer">Viewer</option>
                </select>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  userRole === 'admin' ? 'bg-red-100 text-red-800' :
                  userRole === 'manager' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {userRole === 'admin' ? 'Tam Erişim' :
                   userRole === 'manager' ? 'Sınırlı Erişim' :
                   'Sadece Görüntüleme'}
                </span>
              </div>
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Bildirimler</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.read ? 'bg-gray-300' : 'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{notification.title}</p>
                              <p className="text-sm text-gray-600">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleString('tr-TR')}
                              </p>
                            </div>
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markNotificationAsRead(notification.id);
                                }}
                                className="text-xs"
                              >
                                Okundu
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeTab === 'dashboard' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('dashboard')}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Dashboard
                </Button>
                <Button
                  variant={activeTab === 'influencers' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('influencers')}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Influencerlar
                </Button>
                <Button
                  variant={activeTab === 'links' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('links')}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Linkler
                </Button>
                <Button
                  variant={activeTab === 'commissions' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('commissions')}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Komisyonlar
                </Button>
                <Button
                  variant={activeTab === 'analytics' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('analytics')}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Analitik
                </Button>
                <Button
                  variant={activeTab === 'advanced-analytics' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('advanced-analytics')}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Gelişmiş Analitik
                </Button>
              </div>
              {userRole === 'admin' && (
                <Button
                  variant="outline"
                  onClick={setupDemoData}
                  className="bg-green-100 text-green-800 hover:bg-green-200"
                >
                  Demo Veri
                </Button>
              )}
              {userRole === 'admin' && (
                <Button
                  variant="outline"
                  onClick={clearDemoData}
                  className="bg-red-100 text-red-800 hover:bg-red-200"
                >
                  Temizle
                </Button>
              )}
              {(userRole === 'admin' || userRole === 'manager') && (
                <Button
                  variant="outline"
                  onClick={fetchNotifications}
                  className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                >
                  Bildirim Yenile
                </Button>
              )}
              {(userRole === 'admin' || userRole === 'manager') && (
                <Button
                  variant="outline"
                  onClick={() => window.open('/api/export/influencers', '_blank')}
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">Dashboard</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Toplam Influencer</p>
                      <p className="text-2xl font-bold dark:text-white">{stats.totalInfluencers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Link className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Toplam Link</p>
                      <p className="text-2xl font-bold dark:text-white">{stats.totalLinks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Toplam Tıklama</p>
                      <p className="text-2xl font-bold dark:text-white">{stats.totalClicks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Toplam Komisyon</p>
                      <p className="text-2xl font-bold dark:text-white">₺{stats.totalCommissions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'influencers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white">Influencerlar</h2>
              <div className="flex space-x-2">
                {selectedInfluencers.length > 0 && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleBulkStatusChange('active')}
                      className="text-green-600"
                    >
                      Aktif Yap ({selectedInfluencers.length})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleBulkStatusChange('inactive')}
                      className="text-yellow-600"
                    >
                      Pasif Yap ({selectedInfluencers.length})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleBulkDeleteInfluencers()}
                      className="text-red-600"
                    >
                      Sil ({selectedInfluencers.length})
                    </Button>
                  </div>
                )}
                <Input
                  placeholder="Influencer ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                  <option value="suspended">Askıya Alındı</option>
                </select>
                {(userRole === 'admin' || userRole === 'manager') && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Influencer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Yeni Influencer Ekle</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateInfluencer}>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">İsim</Label>
                            <Input
                              id="name"
                              value={influencerForm.name}
                              onChange={(e) => setInfluencerForm({...influencerForm, name: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">E-posta</Label>
                            <Input
                              id="email"
                              type="email"
                              value={influencerForm.email}
                              onChange={(e) => setInfluencerForm({...influencerForm, email: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Telefon</Label>
                            <Input
                              id="phone"
                              value={influencerForm.phone}
                              onChange={(e) => setInfluencerForm({...influencerForm, phone: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="commissionRate">Komisyon Oranı (%)</Label>
                            <Input
                              id="commissionRate"
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={influencerForm.commissionRate}
                              onChange={(e) => setInfluencerForm({...influencerForm, commissionRate: parseFloat(e.target.value)})}
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            Influencer Ekle
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {influencers
                .filter(influencer => 
                  influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  influencer.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .filter(influencer => 
                  statusFilter === '' || influencer.status === statusFilter
                )
                .map((influencer) => (
                <Card key={influencer.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {userRole === 'admin' && (
                          <input
                            type="checkbox"
                            checked={selectedInfluencers.includes(influencer.id)}
                            onChange={(e) => handleSelectInfluencer(influencer.id, e.target.checked)}
                            className="w-4 h-4"
                          />
                        )}
                        <h3 className="font-semibold text-lg">{influencer.name}</h3>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        influencer.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {influencer.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{influencer.email}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Komisyon:</span>
                        <span className="text-sm font-medium">{influencer.commissionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Toplam Kazanç:</span>
                        <span className="text-sm font-medium">₺{influencer.totalEarnings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tıklama:</span>
                        <span className="text-sm font-medium">{influencer.totalClicks}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white">Linkler</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Link Ekle</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateLink}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="originalUrl">Orijinal URL</Label>
                        <Input
                          id="originalUrl"
                          value={linkForm.originalUrl}
                          onChange={(e) => setLinkForm({...linkForm, originalUrl: e.target.value})}
                          placeholder="https://example.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="influencerId">Influencer</Label>
                        <select
                          id="influencerId"
                          value={linkForm.influencerId}
                          onChange={(e) => setLinkForm({...linkForm, influencerId: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="">Influencer Seçin</option>
                          {influencers.map((influencer) => (
                            <option key={influencer.id} value={influencer.id}>
                              {influencer.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="campaignName">Kampanya Adı</Label>
                        <Input
                          id="campaignName"
                          value={linkForm.campaignName}
                          onChange={(e) => setLinkForm({...linkForm, campaignName: e.target.value})}
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Link Ekle
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {links.map((link) => (
                <Card key={link.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg font-mono">{link.shortCode}</h3>
                        <p className="text-sm text-gray-600">{link.campaignName || 'Kampanya yok'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        link.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {link.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Influencer:</span>
                        <span className="text-sm font-medium">{link.influencer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tıklama:</span>
                        <span className="text-sm font-medium">{link.clickCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Dönüşüm:</span>
                        <span className="text-sm font-medium">{link.conversionCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Input
                        value={`${window.location.origin}/s/${link.shortCode}`}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(`${window.location.origin}/s/${link.shortCode}`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'commissions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white">Komisyon Yönetimi</h2>
              {userRole === 'admin' && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const influencer = influencers[0]; // Demo için ilk influencer
                      if (influencer) {
                        await axios.post(`${API_BASE_URL}/email/send`, {
                          type: 'performance',
                          influencerEmail: influencer.email,
                          data: {
                            clicks: influencer.totalClicks,
                            conversions: influencer.totalSales
                          }
                        });
                        alert('Performans emaili gönderildi! Console\'u kontrol edin.');
                      }
                    } catch (error) {
                      console.error('Error sending performance email:', error);
                    }
                  }}
                  className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                >
                  📧 Performans Emaili Gönder
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Beklemede</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {commissions.filter(c => c.status === 'pending').length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Onaylandı</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {commissions.filter(c => c.status === 'approved').length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Ödendi</p>
                    <p className="text-2xl font-bold text-green-600">
                      {commissions.filter(c => c.status === 'paid').length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Toplam Tutar</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ₺{commissions.reduce((sum, c) => sum + c.commissionAmount, 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {commissions.map((commission) => (
                <Card key={commission.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Sipariş #{commission.orderId}</h3>
                        <p className="text-sm text-gray-600">{commission.customerName || commission.customerEmail}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          commission.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : commission.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : commission.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {commission.status === 'pending' ? 'Beklemede' :
                           commission.status === 'approved' ? 'Onaylandı' :
                           commission.status === 'paid' ? 'Ödendi' : 'İptal'}
                        </span>
                        {userRole === 'admin' && (
                          <>
                            {commission.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveCommission(commission.id)}
                                className="text-green-600"
                                disabled={actionLoading === `approve-${commission.id}`}
                              >
                                {actionLoading === `approve-${commission.id}` ? 'Onaylanıyor...' : 'Onayla'}
                              </Button>
                            )}
                            {commission.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePayCommission(commission.id)}
                                className="text-blue-600"
                              >
                                Öde
                              </Button>
                            )}
                            {commission.status !== 'cancelled' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelCommission(commission.id)}
                                className="text-red-600"
                              >
                                İptal
                              </Button>
                            )}
                          </>
                        )}
                        {(userRole === 'manager') && commission.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveCommission(commission.id)}
                            className="text-green-600"
                          >
                            Onayla
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Influencer</p>
                        <p className="font-medium">{commission.influencer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sipariş Tutarı</p>
                        <p className="font-medium">₺{commission.orderValue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Komisyon Oranı</p>
                        <p className="font-medium">%{commission.commissionRate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Komisyon Tutarı</p>
                        <p className="font-medium text-green-600">₺{commission.commissionAmount}</p>
                      </div>
                    </div>
                    
                    {commission.paymentDate && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          Ödeme Tarihi: {new Date(commission.paymentDate).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">Analitik & Raporlar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Günlük Tıklama Trendi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Bar
                    data={{
                      labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
                      datasets: [
                        {
                          label: 'Tıklama Sayısı',
                          data: [12, 19, 3, 5, 2, 3, 8],
                          backgroundColor: 'rgba(59, 130, 246, 0.5)',
                          borderColor: 'rgba(59, 130, 246, 1)',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: 'Son 7 Günün Tıklama Verileri',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Komisyon Dağılımı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Doughnut
                    data={{
                      labels: ['Beklemede', 'Onaylandı', 'Ödendi', 'İptal'],
                      datasets: [
                        {
                          data: [
                            commissions.filter(c => c.status === 'pending').length,
                            commissions.filter(c => c.status === 'approved').length,
                            commissions.filter(c => c.status === 'paid').length,
                            commissions.filter(c => c.status === 'cancelled').length,
                          ],
                          backgroundColor: [
                            'rgba(255, 193, 7, 0.8)',
                            'rgba(13, 110, 253, 0.8)',
                            'rgba(25, 135, 84, 0.8)',
                            'rgba(220, 53, 69, 0.8)',
                          ],
                          borderColor: [
                            'rgba(255, 193, 7, 1)',
                            'rgba(13, 110, 253, 1)',
                            'rgba(25, 135, 84, 1)',
                            'rgba(220, 53, 69, 1)',
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                        title: {
                          display: true,
                          text: 'Komisyon Durumları',
                        },
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>En Performanslı Influencerlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {influencers.slice(0, 5).map((influencer, index) => (
                    <div key={influencer.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{influencer.name}</p>
                          <p className="text-sm text-gray-600">{influencer.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₺{influencer.totalEarnings}</p>
                        <p className="text-sm text-gray-600">{influencer.totalClicks} tıklama</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Toplam Gelir Trendi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">₺{stats.totalCommissions}</p>
                    <p className="text-sm text-gray-600">Bu ay</p>
                    <p className="text-xs text-green-600 mt-2">+12% geçen aya göre</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Dönüşüm Oranı</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">3.2%</p>
                    <p className="text-sm text-gray-600">Ortalama</p>
                    <p className="text-xs text-blue-600 mt-2">+0.5% geçen haftaya göre</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Aktif Influencer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{influencers.filter(i => i.status === 'active').length}</p>
                    <p className="text-sm text-gray-600">Toplam {influencers.length}</p>
                    <p className="text-xs text-purple-600 mt-2">%{Math.round((influencers.filter(i => i.status === 'active').length / influencers.length) * 100)} aktif</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'advanced-analytics' && (
          <AdvancedAnalytics />
        )}
      </div>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
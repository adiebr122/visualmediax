
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/AdminSidebar';
import HeroEditor from '@/components/HeroEditor';
import ServiceManager from '@/components/ServiceManager';
import PortfolioManager from '@/components/PortfolioManager';
import ClientLogosManager from '@/components/ClientLogosManager';
import TestimonialManager from '@/components/TestimonialManager';
import FormSubmissions from '@/components/FormSubmissions';
import LiveChatManager from '@/components/LiveChatManager';
import CRMManager from '@/components/CRMManager';
import QuotationManager from '@/components/QuotationManager';
import InvoiceManager from '@/components/InvoiceManager';
import UserManagement from '@/components/UserManagement';
import SettingsManager from '@/components/SettingsManager';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { DashboardCharts } from '@/components/admin/DashboardCharts';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  TrendingUp,
  Eye,
  Mail,
  Phone,
  LogOut,
  User,
  Briefcase,
  Users,
  Calculator,
  Receipt,
  MessageSquare,
  Building
} from 'lucide-react';

const Admin = () => {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loggingOut, setLoggingOut] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
      toast({
        title: "Berhasil logout",
        description: "Anda telah berhasil keluar dari sistem",
      });
      navigate('/auth');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Gagal melakukan logout",
        variant: "destructive",
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent onTabChange={setActiveTab} />;
      case 'hero':
        return <HeroEditor />;
      case 'services':
        return <ServiceManager />;
      case 'portfolio':
        return <PortfolioManager />;
      case 'clientlogos':
        return <ClientLogosManager />;
      case 'testimonials':
        return <TestimonialManager />;
      case 'submissions':
        return <FormSubmissions />;
      case 'livechat':
        return <LiveChatManager />;
      case 'crm':
        return <CRMManager />;
      case 'quotations':
        return <QuotationManager />;
      case 'invoices':
        return <InvoiceManager />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <DashboardContent onTabChange={setActiveTab} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-gray-50">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 overflow-hidden">
          {/* Header with logout */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Kelola website Anda</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{loggingOut ? 'Logout...' : 'Logout'}</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="h-full overflow-y-auto">
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

interface DashboardContentProps {
  onTabChange: (tab: string) => void;
}

const DashboardContent = ({ onTabChange }: DashboardContentProps) => {
  const { stats } = useDashboardStats();

  const quickActions = [
    {
      title: 'Kelola Portfolio',
      description: 'Tambah atau edit proyek portfolio',
      icon: Briefcase,
      action: 'portfolio',
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      title: 'Buat Penawaran',
      description: 'Buat penawaran baru untuk klien',
      icon: Calculator,
      action: 'quotations',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Buat Invoice',
      description: 'Generate invoice dari penawaran',
      icon: Receipt,
      action: 'invoices',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Kelola CRM',
      description: 'Tambah kontak dan leads baru',
      icon: Users,
      action: 'crm',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Lihat Submissions',
      description: 'Cek form yang masuk',
      icon: Mail,
      action: 'submissions',
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  const handleQuickAction = (action: string) => {
    console.log('Quick action clicked:', action);
    onTabChange(action);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-gray-600 mt-1">Selamat datang di panel admin website Anda</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium">{new Date().toLocaleDateString('id-ID')}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <DashboardStats stats={stats} />

      {/* Charts */}
      <DashboardCharts stats={stats} />

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div
                key={index}
                onClick={() => handleQuickAction(action.action)}
                className={`p-4 rounded-lg text-white cursor-pointer transition-all duration-200 hover:scale-105 ${action.color}`}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-6 w-6" />
                  <div>
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-xs opacity-90">{action.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Aktivitas Terbaru
            </CardTitle>
            <CardDescription>
              Aktivitas sistem dalam 24 jam terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Belum ada aktivitas terbaru</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-green-600" />
              Kontak Terbaru
            </CardTitle>
            <CardDescription>
              Lead dan kontak yang masuk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Belum ada kontak masuk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;

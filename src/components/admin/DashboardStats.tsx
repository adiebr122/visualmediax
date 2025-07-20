
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Calculator, 
  Receipt, 
  MessageSquare, 
  Building,
  Briefcase,
  Star
} from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalCRMContacts: number;
    activeQuotations: number;
    pendingInvoices: number;
    formSubmissions: number;
    clientLogos: number;
    portfolioProjects: number;
    testimonials: number;
    loading: boolean;
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const statsCards = [
    {
      title: 'Total Kontak CRM',
      value: stats.loading ? '...' : stats.totalCRMContacts.toString(),
      description: 'Kontak yang terdaftar',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      title: 'Penawaran Aktif',
      value: stats.loading ? '...' : stats.activeQuotations.toString(),
      description: 'Penawaran yang terkirim',
      icon: Calculator,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      title: 'Invoice Pending',
      value: stats.loading ? '...' : stats.pendingInvoices.toString(),
      description: 'Invoice belum dibayar',
      icon: Receipt,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: 'Form Submissions',
      value: stats.loading ? '...' : stats.formSubmissions.toString(),
      description: 'Formulir masuk hari ini',
      icon: MessageSquare,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    {
      title: 'Client Logos',
      value: stats.loading ? '...' : stats.clientLogos.toString(),
      description: 'Logo klien aktif',
      icon: Building,
      color: 'text-cyan-600',
      bg: 'bg-cyan-100'
    },
    {
      title: 'Portfolio Projects',
      value: stats.loading ? '...' : stats.portfolioProjects.toString(),
      description: 'Proyek portfolio aktif',
      icon: Briefcase,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100'
    },
    {
      title: 'Testimonials',
      value: stats.loading ? '...' : stats.testimonials.toString(),
      description: 'Testimonial aktif',
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {statsCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <IconComponent className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

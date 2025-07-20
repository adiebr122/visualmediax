
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Calculator, Receipt } from 'lucide-react';

interface DashboardChartsProps {
  stats: {
    totalCRMContacts: number;
    activeQuotations: number;
    pendingInvoices: number;
    formSubmissions: number;
    clientLogos: number;
    portfolioProjects: number;
    testimonials: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export const DashboardCharts = ({ stats }: DashboardChartsProps) => {
  const barData = [
    { name: 'CRM', value: stats.totalCRMContacts, color: '#0088FE' },
    { name: 'Quotations', value: stats.activeQuotations, color: '#00C49F' },
    { name: 'Invoices', value: stats.pendingInvoices, color: '#FFBB28' },
    { name: 'Submissions', value: stats.formSubmissions, color: '#FF8042' },
  ];

  const pieData = [
    { name: 'Portfolio', value: stats.portfolioProjects },
    { name: 'Testimonials', value: stats.testimonials },
    { name: 'Client Logos', value: stats.clientLogos },
    { name: 'Form Submissions', value: stats.formSubmissions },
  ];

  const chartConfig = {
    crm: { label: 'CRM Contacts', color: '#0088FE' },
    quotations: { label: 'Quotations', color: '#00C49F' },
    invoices: { label: 'Invoices', color: '#FFBB28' },
    submissions: { label: 'Submissions', color: '#FF8042' },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Overview Statistik
          </CardTitle>
          <CardDescription>
            Ringkasan data utama sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-600" />
            Distribusi Konten
          </CardTitle>
          <CardDescription>
            Sebaran data konten website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-green-600" />
            Ringkasan Finansial
          </CardTitle>
          <CardDescription>
            Status quotations dan invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Quotations Aktif</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.activeQuotations}</p>
                </div>
                <Calculator className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Invoice Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pendingInvoices}</p>
                </div>
                <Receipt className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total CRM</p>
                  <p className="text-2xl font-bold text-green-900">{stats.totalCRMContacts}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

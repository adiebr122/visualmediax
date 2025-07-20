import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Eye, 
  Trash2, 
  Mail, 
  Phone, 
  User, 
  Building, 
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Check,
  X,
  Clock,
  Star,
  Archive,
  ExternalLink,
  Download,
  RefreshCw,
  MapPin,
  Tag,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';

interface FormSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  form_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const FormSubmissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('form_submissions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === id 
            ? { ...sub, status, updated_at: new Date().toISOString() }
            : sub
        )
      );

      toast({
        title: "Berhasil",
        description: `Status submission berhasil diubah ke ${status}`,
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Gagal mengubah status submission",
        variant: "destructive",
      });
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus submission ini?')) return;

    try {
      setDeleting(id);
      const { error } = await supabase
        .from('form_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSubmissions(prev => prev.filter(sub => sub.id !== id));
      
      toast({
        title: "Berhasil",
        description: "Submission berhasil dihapus",
      });
    } catch (error: any) {
      console.error('Error deleting submission:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus submission",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-3 w-3" />;
      case 'in_progress': return <RefreshCw className="h-3 w-3" />;
      case 'completed': return <Check className="h-3 w-3" />;
      case 'archived': return <Archive className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Service', 'Status', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredSubmissions.map(sub => [
        sub.name,
        sub.email,
        sub.phone || '',
        sub.company || '',
        sub.service || '',
        sub.status,
        new Date(sub.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Login Diperlukan</h3>
        <p className="text-gray-500">Anda harus login untuk melihat form submissions</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center mb-2">
                <MessageSquare className="h-8 w-8 mr-3 text-purple-200" />
                Form Submissions
              </CardTitle>
              <CardDescription className="text-purple-100 text-lg">
                Kelola dan pantau semua form submission dari website
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{submissions.length}</div>
              <div className="text-purple-200">Total Submissions</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Actions */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari nama, email, perusahaan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-gray-200 focus:border-purple-500"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 border-2 border-gray-200 focus:border-purple-500">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="new">Baru</SelectItem>
                  <SelectItem value="in_progress">Dalam Proses</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="archived">Arsip</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="flex items-center gap-2 border-2 border-gray-200 hover:border-purple-500"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              
              <Button
                onClick={fetchSubmissions}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="grid gap-6">
        {filteredSubmissions.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {submissions.length === 0 ? 'Belum Ada Submission' : 'Tidak Ada Hasil'}
              </h3>
              <p className="text-gray-500">
                {submissions.length === 0 
                  ? 'Form submissions akan muncul di sini setelah pengunjung mengisi form' 
                  : 'Coba ubah filter atau kata kunci pencarian'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="border-2 border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{submission.name}</h3>
                      <Badge className={`flex items-center gap-1 ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        {submission.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {submission.form_type}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-purple-500" />
                        <a href={`mailto:${submission.email}`} className="hover:text-purple-600 transition-colors">
                          {submission.email}
                        </a>
                      </div>
                      
                      {submission.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-green-500" />
                          <a href={`tel:${submission.phone}`} className="hover:text-green-600 transition-colors">
                            {submission.phone}
                          </a>
                        </div>
                      )}
                      
                      {submission.company && (
                        <div className="flex items-center text-gray-600">
                          <Building className="h-4 w-4 mr-2 text-blue-500" />
                          {submission.company}
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                        {new Date(submission.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>

                    {submission.service && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700">Service: </span>
                        <Badge variant="secondary">{submission.service}</Badge>
                      </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">{submission.message}</p>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSubmission(submission)}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-0">
                        <DialogHeader className="bg-gradient-to-r from-purple-50 to-blue-50 -m-6 p-6 mb-6 border-b">
                          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            Detail Submission - {submission.name}
                          </DialogTitle>
                          <DialogDescription className="text-gray-600 mt-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Dikirim pada {new Date(submission.created_at).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            <Badge className={`flex items-center gap-2 px-3 py-1 text-sm ${getStatusColor(submission.status)}`}>
                              {getStatusIcon(submission.status)}
                              Status: {submission.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="px-3 py-1">
                              <Tag className="h-3 w-3 mr-1" />
                              {submission.form_type}
                            </Badge>
                          </div>

                          {/* Contact Information */}
                          <Card className="border border-gray-200 shadow-sm">
                            <CardHeader className="bg-gray-50 pb-3">
                              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                                <User className="h-5 w-5 text-purple-500" />
                                Informasi Kontak
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                                    <Mail className="h-5 w-5 text-purple-500" />
                                    <div>
                                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</label>
                                      <p className="text-gray-900 font-medium">{submission.email}</p>
                                    </div>
                                  </div>
                                  
                                  {submission.phone && (
                                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                                      <Phone className="h-5 w-5 text-green-500" />
                                      <div>
                                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Telepon</label>
                                        <p className="text-gray-900 font-medium">{submission.phone}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-3">
                                  {submission.company && (
                                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                                      <Building className="h-5 w-5 text-blue-500" />
                                      <div>
                                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Perusahaan</label>
                                        <p className="text-gray-900 font-medium">{submission.company}</p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {submission.service && (
                                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                                      <Star className="h-5 w-5 text-amber-500" />
                                      <div>
                                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Layanan</label>
                                        <p className="text-gray-900 font-medium">{submission.service}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Message Content */}
                          <Card className="border border-gray-200 shadow-sm">
                            <CardHeader className="bg-gray-50 pb-3">
                              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                                <MessageCircle className="h-5 w-5 text-blue-500" />
                                Pesan
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="bg-white border border-gray-100 rounded-lg p-4">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{submission.message}</p>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Timeline */}
                          <Card className="border border-gray-200 shadow-sm">
                            <CardHeader className="bg-gray-50 pb-3">
                              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                                <Clock className="h-5 w-5 text-orange-500" />
                                Timeline
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="bg-blue-500 p-1 rounded-full">
                                    <Calendar className="h-3 w-3 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-blue-800">Submission Dibuat</p>
                                    <p className="text-xs text-blue-600">
                                      {new Date(submission.created_at).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                
                                {submission.updated_at !== submission.created_at && (
                                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="bg-green-500 p-1 rounded-full">
                                      <RefreshCw className="h-3 w-3 text-white" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-green-800">Terakhir Diupdate</p>
                                      <p className="text-xs text-green-600">
                                        {new Date(submission.updated_at).toLocaleDateString('id-ID', {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <DialogFooter className="mt-6 pt-6 border-t">
                          <div className="flex gap-3 w-full">
                            <Button
                              variant="outline"
                              onClick={() => setSelectedSubmission(null)}
                              className="flex-1"
                            >
                              Tutup
                            </Button>
                            <Button
                              onClick={() => {
                                window.open(`mailto:${submission.email}?subject=Re: ${submission.service || 'Form Submission'}&body=Halo ${submission.name},%0D%0A%0D%0ATerima kasih telah menghubungi kami.%0D%0A%0D%0ASalam,%0D%0ATeam`);
                              }}
                              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Balas Email
                            </Button>
                          </div>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <MoreHorizontal className="h-4 w-4 mr-1" />
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border shadow-lg">
                        <DropdownMenuItem onClick={() => updateSubmissionStatus(submission.id, 'new')}>
                          <Clock className="h-4 w-4 mr-2" />
                          Mark as New
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateSubmissionStatus(submission.id, 'in_progress')}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateSubmissionStatus(submission.id, 'completed')}>
                          <Check className="h-4 w-4 mr-2" />
                          Mark Complete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateSubmissionStatus(submission.id, 'archived')}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteSubmission(submission.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deleting === submission.id}
                        >
                          {deleting === submission.id ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FormSubmissions;

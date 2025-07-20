import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Mail, 
  Eye,
  Search,
  RefreshCw,
  Calculator,
  User,
  Building,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuotationPreview } from './quotation/QuotationPreview';
import { downloadAsPDF } from '@/lib/pdfUtils';

interface Quotation {
  id: string;
  quotation_number: string;
  client_name: string;
  client_email: string;
  client_company: string | null;
  client_address: string | null;
  quotation_date: string;
  valid_until: string | null;
  subtotal: number;
  tax_percentage: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  notes: string | null;
  terms_conditions: string | null;
  created_at: string;
  lead_id: string | null;
}

interface QuotationItem {
  id: string;
  item_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  total: number;
}

interface CRMContact {
  id: string;
  client_name: string;
  client_email: string;
  client_company: string | null;
  client_phone: string | null;
}

const QuotationManager = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [crmContacts, setCrmContacts] = useState<CRMContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  
  const [formData, setFormData] = useState({
    lead_id: '',
    client_name: '',
    client_email: '',
    client_company: '',
    client_address: '',
    quotation_date: new Date().toISOString().split('T')[0],
    valid_until: '',
    tax_percentage: 11,
    notes: '',
    terms_conditions: 'Penawaran ini berlaku selama 30 hari dari tanggal penerbitan.',
    items: [{
      item_name: '',
      description: '',
      quantity: 1,
      unit_price: 0
    }]
  });

  const { toast } = useToast();

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Clock },
    { value: 'sent', label: 'Terkirim', color: 'bg-blue-100 text-blue-700', icon: Mail },
    { value: 'accepted', label: 'Diterima', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    { value: 'rejected', label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: XCircle },
    { value: 'expired', label: 'Kedaluwarsa', color: 'bg-orange-100 text-orange-700', icon: Calendar }
  ];

  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);
  const [previewItems, setPreviewItems] = useState<QuotationItem[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: 'PT. Example Company',
    address: 'Jl. Contoh No. 123\nJakarta 12345\nIndonesia',
    phone: '+62 21 1234 5678',
    email: 'info@example.com'
  });

  useEffect(() => {
    fetchQuotations();
    fetchCRMContacts();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal memuat penawaran: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCRMContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_management')
        .select('id, client_name, client_email, client_company, client_phone')
        .order('client_name', { ascending: true });

      if (error) throw error;
      setCrmContacts(data || []);
    } catch (error: any) {
      console.error('Error fetching CRM contacts:', error);
    }
  };

  const generateQuotationNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `QUO-${year}${month}-${random}`;
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);
    
    const taxAmount = (subtotal * formData.tax_percentage) / 100;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const handleSave = async () => {
    if (!formData.client_name.trim() || !formData.client_email.trim()) {
      toast({
        title: "Error",
        description: "Nama klien dan email wajib diisi",
        variant: "destructive",
      });
      return;
    }

    if (formData.items.some(item => !item.item_name.trim() || item.unit_price <= 0)) {
      toast({
        title: "Error",
        description: "Semua item harus memiliki nama dan harga yang valid",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak terautentikasi');

      const { subtotal, taxAmount, total } = calculateTotals();

      const quotationData = {
        user_id: user.id,
        lead_id: formData.lead_id || null,
        quotation_number: editingId ? undefined : generateQuotationNumber(),
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_company: formData.client_company || null,
        client_address: formData.client_address || null,
        quotation_date: formData.quotation_date,
        valid_until: formData.valid_until || null,
        subtotal,
        tax_percentage: formData.tax_percentage,
        tax_amount: taxAmount,
        total_amount: total,
        status: 'draft',
        notes: formData.notes || null,
        terms_conditions: formData.terms_conditions || null,
        updated_at: new Date().toISOString()
      };

      let quotationId = editingId;

      if (editingId) {
        const { error } = await supabase
          .from('quotations')
          .update(quotationData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('quotations')
          .insert(quotationData)
          .select()
          .single();

        if (error) throw error;
        quotationId = data.id;
      }

      // Save quotation items
      if (quotationId) {
        // Delete existing items if editing
        if (editingId) {
          await supabase
            .from('quotation_items')
            .delete()
            .eq('quotation_id', quotationId);
        }

        // Insert new items
        const items = formData.items.map(item => ({
          quotation_id: quotationId,
          item_name: item.item_name,
          description: item.description || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price
        }));

        const { error: itemsError } = await supabase
          .from('quotation_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      toast({ 
        title: "Berhasil!", 
        description: editingId ? "Penawaran berhasil diupdate" : "Penawaran berhasil dibuat" 
      });
      
      resetForm();
      setIsDialogOpen(false);
      await fetchQuotations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal menyimpan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (quotation: Quotation) => {
    try {
      // Fetch quotation items
      const { data: items, error } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', quotation.id);

      if (error) throw error;

      setEditingId(quotation.id);
      setFormData({
        lead_id: quotation.lead_id || '',
        client_name: quotation.client_name,
        client_email: quotation.client_email,
        client_company: quotation.client_company || '',
        client_address: quotation.client_address || '',
        quotation_date: quotation.quotation_date,
        valid_until: quotation.valid_until || '',
        tax_percentage: quotation.tax_percentage,
        notes: quotation.notes || '',
        terms_conditions: quotation.terms_conditions || '',
        items: items.map(item => ({
          item_name: item.item_name,
          description: item.description || '',
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      });
      setIsDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal memuat data penawaran: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus penawaran ini?')) return;

    try {
      const { error } = await supabase.from('quotations').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Berhasil!", description: "Penawaran berhasil dihapus" });
      await fetchQuotations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal menghapus: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (quotation: Quotation) => {
    try {
      await handlePreview(quotation);
      setTimeout(async () => {
        try {
          await downloadAsPDF(
            'quotation-preview',
            `Penawaran-${quotation.quotation_number}.pdf`
          );
          toast({
            title: "Berhasil!",
            description: "PDF berhasil didownload",
          });
        } catch (error: any) {
          toast({
            title: "Error",
            description: `Gagal download PDF: ${error.message}`,
            variant: "destructive",
          });
        }
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal memuat data untuk download: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handlePreview = async (quotation: Quotation) => {
    try {
      const { data: items, error } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', quotation.id);

      if (error) throw error;

      setPreviewQuotation(quotation);
      setPreviewItems(items || []);
      setIsPreviewOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal memuat preview: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async (quotation: Quotation) => {
    toast({
      title: "Info",
      description: "Fitur kirim email akan segera tersedia",
    });
  };

  const handleUpdateStatus = async (quotationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('quotations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', quotationId);

      if (error) throw error;
      
      toast({ 
        title: "Berhasil!", 
        description: `Status penawaran berhasil diupdate ke ${getStatusInfo(newStatus).label}` 
      });
      
      await fetchQuotations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal mengupdate status: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      lead_id: '',
      client_name: '',
      client_email: '',
      client_company: '',
      client_address: '',
      quotation_date: new Date().toISOString().split('T')[0],
      valid_until: '',
      tax_percentage: 11,
      notes: '',
      terms_conditions: 'Penawaran ini berlaku selama 30 hari dari tanggal penerbitan.',
      items: [{
        item_name: '',
        description: '',
        quantity: 1,
        unit_price: 0
      }]
    });
  };

  const handleLeadSelect = (leadId: string) => {
    const selectedLead = crmContacts.find(contact => contact.id === leadId);
    if (selectedLead) {
      setFormData(prev => ({
        ...prev,
        lead_id: leadId,
        client_name: selectedLead.client_name,
        client_email: selectedLead.client_email,
        client_company: selectedLead.client_company || ''
      }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        item_name: '',
        description: '',
        quantity: 1,
        unit_price: 0
      }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = 
      quotation.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quotation.client_company && quotation.client_company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const { subtotal, taxAmount, total } = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
        <span className="text-lg">Memuat penawaran...</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-full space-y-8">
        {/* Header with Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                Total Penawaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{quotations.length}</div>
              <p className="text-xs text-gray-500 mt-1">Semua penawaran</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                Menunggu Respons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {quotations.filter(q => q.status === 'sent').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Penawaran terkirim</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Diterima
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {quotations.filter(q => q.status === 'accepted').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Penawaran disetujui</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-purple-500" />
                Total Nilai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {formatCurrency(quotations.reduce((sum, q) => sum + q.total_amount, 0))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Nilai total penawaran</p>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white rounded-xl p-6 shadow-lg border-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
              <Calculator className="h-8 w-8 mr-3 text-blue-600" />
              Manajemen Penawaran
            </h1>
            <p className="text-gray-600 text-lg">Kelola penawaran untuk klien Anda dengan mudah dan efisien</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetForm} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Buat Penawaran Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto bg-white">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-2xl font-bold flex items-center text-gray-900">
                  <FileText className="h-6 w-6 mr-3 text-blue-600" />
                  {editingId ? 'Edit Penawaran' : 'Buat Penawaran Baru'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-8 mt-6">
                {/* Client Information Card */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                    <CardTitle className="text-xl font-semibold flex items-center text-gray-900">
                      <User className="h-6 w-6 mr-2 text-blue-600" />
                      Informasi Klien
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Masukkan data lengkap klien untuk penawaran ini
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Lead Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Pilih dari CRM (Opsional)
                      </label>
                      <select
                        value={formData.lead_id}
                        onChange={(e) => handleLeadSelect(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                      >
                        <option value="">Pilih kontak dari CRM atau isi manual</option>
                        {crmContacts.map(contact => (
                          <option key={contact.id} value={contact.id}>
                            {contact.client_name} - {contact.client_email}
                            {contact.client_company && ` (${contact.client_company})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Nama Klien *
                        </label>
                        <input
                          type="text"
                          value={formData.client_name}
                          onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                          placeholder="Masukkan nama klien"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Email Klien *
                        </label>
                        <input
                          type="email"
                          value={formData.client_email}
                          onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                          placeholder="email@klien.com"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Perusahaan
                        </label>
                        <input
                          type="text"
                          value={formData.client_company}
                          onChange={(e) => setFormData({ ...formData, client_company: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                          placeholder="Nama perusahaan"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Tanggal Penawaran
                        </label>
                        <input
                          type="date"
                          value={formData.quotation_date}
                          onChange={(e) => setFormData({ ...formData, quotation_date: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Berlaku Hingga
                        </label>
                        <input
                          type="date"
                          value={formData.valid_until}
                          onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          PPN (%)
                        </label>
                        <input
                          type="number"
                          value={formData.tax_percentage}
                          onChange={(e) => setFormData({ ...formData, tax_percentage: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                          min="0"
                          step="0.01"
                          placeholder="11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Alamat Klien
                      </label>
                      <textarea
                        value={formData.client_address}
                        onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                        placeholder="Alamat lengkap klien"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Items Card */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl font-semibold flex items-center text-gray-900">
                          <FileText className="h-6 w-6 mr-2 text-green-600" />
                          Item Penawaran
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          Tambahkan produk atau layanan yang akan ditawarkan
                        </CardDescription>
                      </div>
                      <Button 
                        type="button" 
                        onClick={addItem} 
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white shadow"
                      >
                        <Plus className="h-5 w-5 mr-1" />
                        Tambah Item
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {formData.items.map((item, index) => (
                        <div key={index} className="p-5 border border-gray-200 rounded-xl bg-gray-50 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Item *
                              </label>
                              <input
                                type="text"
                                value={item.item_name}
                                onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                                placeholder="Nama produk/layanan"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Qty
                              </label>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                                min="1"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Harga Satuan
                              </label>
                              <input
                                type="number"
                                value={item.unit_price}
                                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                                min="0"
                                placeholder="0"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Total
                              </label>
                              <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl font-semibold text-green-700 shadow-inner">
                                {formatCurrency(item.quantity * item.unit_price)}
                              </div>
                            </div>
                            
                            <div className="flex items-end">
                              {formData.items.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeItem(index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Deskripsi
                            </label>
                            <textarea
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              rows={2}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                              placeholder="Deskripsi detail item..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals Summary */}
                    <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border shadow-sm">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Subtotal:</span>
                          <span className="font-semibold text-gray-900 text-lg">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">PPN ({formData.tax_percentage}%):</span>
                          <span className="font-semibold text-gray-900 text-lg">{formatCurrency(taxAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold border-t pt-3 mt-3 border-gray-300">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-blue-600">{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes and Terms Card */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-t-lg">
                    <CardTitle className="text-xl font-semibold text-gray-900">Catatan & Syarat</CardTitle>
                    <CardDescription className="text-gray-600">
                      Tambahkan catatan dan syarat ketentuan untuk penawaran ini
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Catatan
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows={5}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                          placeholder="Catatan tambahan untuk penawaran ini..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Syarat & Ketentuan
                        </label>
                        <textarea
                          value={formData.terms_conditions}
                          onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                          rows={5}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                          placeholder="Syarat dan ketentuan penawaran..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-6"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
                >
                  {saving ? (
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <FileText className="h-5 w-5 mr-2" />
                  )}
                  {saving ? 'Menyimpan...' : (editingId ? 'Update Penawaran' : 'Simpan Penawaran')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1">
                <Search className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari penawaran berdasarkan nama, nomor, atau perusahaan..."
                  className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm w-full sm:w-auto"
                >
                  <option value="all">Semua Status</option>
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <Button onClick={fetchQuotations} variant="outline" size="icon" className="h-12 w-12">
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotations Table */}
        <Card className="shadow-lg border-0 overflow-hidden bg-white">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">No. Penawaran</TableHead>
                  <TableHead className="font-semibold text-gray-700">Klien</TableHead>
                  <TableHead className="font-semibold text-gray-700">Tanggal</TableHead>
                  <TableHead className="font-semibold text-gray-700">Total</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center">
                        <FileText className="h-16 w-16 text-gray-300 mb-4" />
                        <h4 className="text-xl font-medium text-gray-900 mb-2">
                          {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum Ada Penawaran'}
                        </h4>
                        <p className="text-gray-500 mb-6 max-w-md text-center">
                          {searchTerm ? 'Coba kata kunci yang berbeda' : 'Buat penawaran pertama Anda untuk klien dan mulai mengelola proses penjualan Anda'}
                        </p>
                        {!searchTerm && (
                          <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 text-lg">
                            <Plus className="h-5 w-5 mr-2" />
                            Buat Penawaran
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotations.map((quotation) => {
                    const statusInfo = getStatusInfo(quotation.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <TableRow key={quotation.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            {quotation.quotation_number}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center">
                              <User className="h-3 w-3 mr-1 text-gray-400" />
                              {quotation.client_name}
                            </div>
                            <div className="text-sm text-gray-500">{quotation.client_email}</div>
                            {quotation.client_company && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <Building className="h-3 w-3 mr-1" />
                                {quotation.client_company}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                              {new Date(quotation.quotation_date).toLocaleDateString('id-ID')}
                            </div>
                            {quotation.valid_until && (
                              <div className="text-gray-500 text-xs">
                                Berlaku hingga: {new Date(quotation.valid_until).toLocaleDateString('id-ID')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                            {formatCurrency(quotation.total_amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusInfo.color} flex items-center w-fit px-3 py-1.5`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePreview(quotation)}
                              className="hover:bg-blue-50 h-9 w-9"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(quotation)}
                              className="hover:bg-blue-50 h-9 w-9"
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(quotation)}
                              className="hover:bg-green-50 h-9 w-9"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendEmail(quotation)}
                              className="hover:bg-purple-50 h-9 w-9"
                              title="Kirim Email"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            {quotation.status === 'draft' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(quotation.id, 'sent')}
                                className="hover:bg-blue-50 h-9 w-9"
                                title="Tandai Terkirim"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(quotation.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 w-9"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto bg-white">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl font-bold flex items-center text-gray-900">
              <Eye className="h-6 w-6 mr-3 text-blue-600" />
              Preview Penawaran
            </DialogTitle>
          </DialogHeader>
          
          {previewQuotation && (
            <div className="mt-6">
              <QuotationPreview
                quotation={previewQuotation}
                items={previewItems}
                companyInfo={companyInfo}
              />
              
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                <Button
                  onClick={() => setIsPreviewOpen(false)}
                  variant="outline"
                  size="lg"
                >
                  Tutup
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await downloadAsPDF(
                        'quotation-preview',
                        `Penawaran-${previewQuotation.quotation_number}.pdf`
                      );
                      toast({
                        title: "Berhasil!",
                        description: "PDF berhasil didownload",
                      });
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: `Gagal download PDF: ${error.message}`,
                        variant: "destructive",
                      });
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuotationManager;

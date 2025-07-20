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
  CreditCard,
  User,
  Building,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
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
import { InvoicePreview } from './invoice/InvoicePreview';
import { downloadAsPDF } from '@/lib/pdfUtils';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_company: string | null;
  client_address: string | null;
  invoice_date: string;
  due_date: string | null;
  subtotal: number;
  tax_percentage: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  notes: string | null;
  terms_conditions: string | null;
  created_at: string;
  lead_id: string | null;
  quotation_id: string | null;
}

interface InvoiceItem {
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

interface Quotation {
  id: string;
  quotation_number: string;
  client_name: string;
  client_email: string;
  client_company: string | null;
  total_amount: number;
}

const InvoiceManager = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [crmContacts, setCrmContacts] = useState<CRMContact[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewItems, setPreviewItems] = useState<InvoiceItem[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: 'PT. Example Company',
    address: 'Jl. Contoh No. 123\nJakarta 12345\nIndonesia',
    phone: '+62 21 1234 5678',
    email: 'info@example.com'
  });
  
  const [formData, setFormData] = useState({
    quotation_id: '',
    lead_id: '',
    client_name: '',
    client_email: '',
    client_company: '',
    client_address: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    tax_percentage: 11,
    notes: '',
    terms_conditions: 'Pembayaran dalam 30 hari setelah tanggal invoice.',
    items: [{
      item_name: '',
      description: '',
      quantity: 1,
      unit_price: 0
    }]
  });

  const { toast } = useToast();

  const statusOptions = [
    { value: 'unpaid', label: 'Belum Lunas', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    { value: 'paid', label: 'Lunas', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    { value: 'overdue', label: 'Terlambat', color: 'bg-orange-100 text-orange-700', icon: Clock },
    { value: 'cancelled', label: 'Dibatalkan', color: 'bg-gray-100 text-gray-700', icon: XCircle }
  ];

  useEffect(() => {
    fetchInvoices();
    fetchCRMContacts();
    fetchQuotations();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal memuat invoice: ${error.message}`,
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

  const fetchQuotations = async () => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('id, quotation_number, client_name, client_email, client_company, total_amount')
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (error: any) {
      console.error('Error fetching quotations:', error);
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);
    
    const taxAmount = (subtotal * formData.tax_percentage) / 100;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const handlePreview = async (invoice: Invoice) => {
    try {
      // Fetch invoice items
      const { data: items, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoice.id);

      if (error) throw error;

      setPreviewInvoice(invoice);
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

  const handleDownload = async (invoice: Invoice) => {
    try {
      // First show preview
      await handlePreview(invoice);
      
      // Wait a bit for the preview to render
      setTimeout(async () => {
        try {
          await downloadAsPDF(
            'invoice-preview',
            `Invoice-${invoice.invoice_number}.pdf`
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

      const invoiceData = {
        user_id: user.id,
        quotation_id: formData.quotation_id || null,
        lead_id: formData.lead_id || null,
        invoice_number: editingId ? undefined : generateInvoiceNumber(),
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_company: formData.client_company || null,
        client_address: formData.client_address || null,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date || null,
        subtotal,
        tax_percentage: formData.tax_percentage,
        tax_amount: taxAmount,
        total_amount: total,
        status: 'unpaid',
        notes: formData.notes || null,
        terms_conditions: formData.terms_conditions || null,
        updated_at: new Date().toISOString()
      };

      let invoiceId = editingId;

      if (editingId) {
        const { error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single();

        if (error) throw error;
        invoiceId = data.id;
      }

      // Save invoice items
      if (invoiceId) {
        // Delete existing items if editing
        if (editingId) {
          await supabase
            .from('invoice_items')
            .delete()
            .eq('invoice_id', invoiceId);
        }

        // Insert new items
        const items = formData.items.map(item => ({
          invoice_id: invoiceId,
          item_name: item.item_name,
          description: item.description || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      toast({ 
        title: "Berhasil!", 
        description: editingId ? "Invoice berhasil diupdate" : "Invoice berhasil dibuat" 
      });
      
      resetForm();
      setIsDialogOpen(false);
      await fetchInvoices();
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

  const handleEdit = async (invoice: Invoice) => {
    try {
      // Fetch invoice items
      const { data: items, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoice.id);

      if (error) throw error;

      setEditingId(invoice.id);
      setFormData({
        quotation_id: invoice.quotation_id || '',
        lead_id: invoice.lead_id || '',
        client_name: invoice.client_name,
        client_email: invoice.client_email,
        client_company: invoice.client_company || '',
        client_address: invoice.client_address || '',
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date || '',
        tax_percentage: invoice.tax_percentage,
        notes: invoice.notes || '',
        terms_conditions: invoice.terms_conditions || '',
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
        description: `Gagal memuat data invoice: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus invoice ini?')) return;

    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Berhasil!", description: "Invoice berhasil dihapus" });
      await fetchInvoices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal menghapus: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    toast({
      title: "Info",
      description: "Fitur kirim email akan segera tersedia",
    });
  };

  const handleUpdateStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', invoiceId);

      if (error) throw error;
      
      toast({ 
        title: "Berhasil!", 
        description: `Status invoice berhasil diupdate ke ${getStatusInfo(newStatus).label}` 
      });
      
      await fetchInvoices();
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
      quotation_id: '',
      lead_id: '',
      client_name: '',
      client_email: '',
      client_company: '',
      client_address: '',
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: '',
      tax_percentage: 11,
      notes: '',
      terms_conditions: 'Pembayaran dalam 30 hari setelah tanggal invoice.',
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

  const handleQuotationSelect = (quotationId: string) => {
    const selectedQuotation = quotations.find(q => q.id === quotationId);
    if (selectedQuotation) {
      setFormData(prev => ({
        ...prev,
        quotation_id: quotationId,
        client_name: selectedQuotation.client_name,
        client_email: selectedQuotation.client_email,
        client_company: selectedQuotation.client_company || ''
      }));
      
      // Fetch quotation items to populate invoice items
      fetchQuotationItems(quotationId);
    }
  };

  const fetchQuotationItems = async (quotationId: string) => {
    try {
      const { data, error } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', quotationId);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          items: data.map(item => ({
            item_name: item.item_name,
            description: item.description || '',
            quantity: item.quantity,
            unit_price: item.unit_price
          }))
        }));
      }
    } catch (error: any) {
      console.error('Error fetching quotation items:', error);
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

  const updateTaxPercentage = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setFormData(prev => ({ ...prev, tax_percentage: numValue }));
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.client_company && invoice.client_company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const { subtotal, taxAmount, total } = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-green-600 mr-3" />
        <span className="text-lg">Memuat invoice...</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-full space-y-8">
        {/* Header with Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-green-500" />
                Total Invoice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{invoices.length}</div>
              <p className="text-xs text-gray-500 mt-1">Semua invoice</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                Belum Lunas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {invoices.filter(q => q.status === 'unpaid').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Menunggu pembayaran</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Lunas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {invoices.filter(q => q.status === 'paid').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Invoice terbayar</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                Total Pendapatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Dari invoice lunas</p>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white rounded-xl p-6 shadow-lg border-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
              <CreditCard className="h-8 w-8 mr-3 text-green-600" />
              Manajemen Invoice
            </h1>
            <p className="text-gray-600 text-lg">Kelola invoice dan pantau pembayaran dari klien Anda</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetForm} 
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Buat Invoice Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto bg-white">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-2xl font-bold flex items-center text-gray-900">
                  <FileText className="h-6 w-6 mr-3 text-green-600" />
                  {editingId ? 'Edit Invoice' : 'Buat Invoice Baru'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-8 mt-6">
                {/* Client Information Card */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 rounded-t-lg">
                    <CardTitle className="text-xl font-semibold flex items-center text-gray-900">
                      <User className="h-6 w-6 mr-2 text-green-600" />
                      Informasi Klien
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Masukkan data lengkap klien untuk invoice ini
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Quotation Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Buat dari Penawaran (Opsional)
                      </label>
                      <select
                        value={formData.quotation_id}
                        onChange={(e) => handleQuotationSelect(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                      >
                        <option value="">Pilih penawaran atau buat invoice baru</option>
                        {quotations.map(quotation => (
                          <option key={quotation.id} value={quotation.id}>
                            {quotation.quotation_number} - {quotation.client_name} ({formatCurrency(quotation.total_amount)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Lead Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Pilih dari CRM (Opsional)
                      </label>
                      <select
                        value={formData.lead_id}
                        onChange={(e) => handleLeadSelect(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                          placeholder="Nama perusahaan"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Tanggal Invoice
                        </label>
                        <input
                          type="date"
                          value={formData.invoice_date}
                          onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Jatuh Tempo
                        </label>
                        <input
                          type="date"
                          value={formData.due_date}
                          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          PPN (%) - Dapat diubah sesuai kebutuhan
                        </label>
                        <input
                          type="number"
                          value={formData.tax_percentage}
                          onChange={(e) => updateTaxPercentage(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="Masukkan persentase pajak (0-100)"
                        />
                        <p className="text-xs text-gray-500">
                          Masukkan 0 jika tidak ada pajak, atau sesuaikan dengan tarif pajak yang berlaku
                        </p>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                        placeholder="Alamat lengkap klien"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Items Card */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-t-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl font-semibold flex items-center text-gray-900">
                          <FileText className="h-6 w-6 mr-2 text-teal-600" />
                          Item Invoice
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          Tambahkan produk atau layanan yang akan ditagihkan
                        </CardDescription>
                      </div>
                      <Button 
                        type="button" 
                        onClick={addItem} 
                        size="sm"
                        className="bg-teal-500 hover:bg-teal-600 text-white shadow"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                              placeholder="Deskripsi detail item..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals Summary */}
                    <div className="mt-8 bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl border shadow-sm">
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
                          <span className="text-green-600">{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes and Terms Card */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg">
                    <CardTitle className="text-xl font-semibold text-gray-900">Catatan & Syarat</CardTitle>
                    <CardDescription className="text-gray-600">
                      Tambahkan catatan dan syarat ketentuan untuk invoice ini
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                          placeholder="Catatan tambahan untuk invoice ini..."
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                          placeholder="Syarat dan ketentuan invoice..."
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
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 px-8"
                >
                  {saving ? (
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <FileText className="h-5 w-5 mr-2" />
                  )}
                  {saving ? 'Menyimpan...' : (editingId ? 'Update Invoice' : 'Simpan Invoice')}
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
                  placeholder="Cari invoice berdasarkan nama, nomor, atau perusahaan..."
                  className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                />
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm w-full sm:w-auto"
                >
                  <option value="all">Semua Status</option>
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <Button onClick={fetchInvoices} variant="outline" size="icon" className="h-12 w-12">
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card className="shadow-lg border-0 overflow-hidden bg-white">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">No. Invoice</TableHead>
                  <TableHead className="font-semibold text-gray-700">Klien</TableHead>
                  <TableHead className="font-semibold text-gray-700">Tanggal</TableHead>
                  <TableHead className="font-semibold text-gray-700">Total</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center">
                        <FileText className="h-16 w-16 text-gray-300 mb-4" />
                        <h4 className="text-xl font-medium text-gray-900 mb-2">
                          {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum Ada Invoice'}
                        </h4>
                        <p className="text-gray-500 mb-6 max-w-md text-center">
                          {searchTerm ? 'Coba kata kunci yang berbeda' : 'Buat invoice pertama Anda untuk klien dan mulai mengelola pembayaran Anda'}
                        </p>
                        {!searchTerm && (
                          <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700 px-6 py-2 text-lg">
                            <Plus className="h-5 w-5 mr-2" />
                            Buat Invoice
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const statusInfo = getStatusInfo(invoice.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <TableRow key={invoice.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-green-600" />
                            {invoice.invoice_number}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center">
                              <User className="h-3 w-3 mr-1 text-gray-400" />
                              {invoice.client_name}
                            </div>
                            <div className="text-sm text-gray-500">{invoice.client_email}</div>
                            {invoice.client_company && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <Building className="h-3 w-3 mr-1" />
                                {invoice.client_company}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                              {new Date(invoice.invoice_date).toLocaleDateString('id-ID')}
                            </div>
                            {invoice.due_date && (
                              <div className="text-gray-500 text-xs">
                                Jatuh tempo: {new Date(invoice.due_date).toLocaleDateString('id-ID')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                            {formatCurrency(invoice.total_amount)}
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
                              onClick={() => handlePreview(invoice)}
                              className="hover:bg-blue-50 h-9 w-9"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(invoice)}
                              className="hover:bg-blue-50 h-9 w-9"
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(invoice)}
                              className="hover:bg-green-50 h-9 w-9"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendEmail(invoice)}
                              className="hover:bg-purple-50 h-9 w-9"
                              title="Kirim Email"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            {invoice.status === 'unpaid' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(invoice.id, 'paid')}
                                className="hover:bg-green-50 h-9 w-9"
                                title="Tandai Lunas"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(invoice.id)}
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
              <Eye className="h-6 w-6 mr-3 text-green-600" />
              Preview Invoice
            </DialogTitle>
          </DialogHeader>
          
          {previewInvoice && (
            <div className="mt-6">
              <InvoicePreview
                invoice={previewInvoice}
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
                        'invoice-preview',
                        `Invoice-${previewInvoice.invoice_number}.pdf`
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

export default InvoiceManager;

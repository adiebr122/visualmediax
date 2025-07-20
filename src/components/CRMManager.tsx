import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Edit3, Plus, Trash2, Search, RefreshCw, Users, Phone, Mail, Building, Calendar } from 'lucide-react';

interface CRMContact {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  client_company: string | null;
  client_position: string | null;
  lead_source: string | null;
  lead_status: string;
  assigned_to: string | null;
  notes: string | null;
  last_contact_date: string | null;
  next_follow_up: string | null;
  estimated_value: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const CRMManager = () => {
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_company: '',
    client_position: '',
    lead_source: '',
    lead_status: 'new',
    notes: '',
    last_contact_date: '',
    next_follow_up: '',
    estimated_value: '',
    tags: ''
  });
  const { toast } = useToast();

  const leadStatuses = [
    { value: 'new', label: 'Baru', color: 'bg-blue-100 text-blue-800' },
    { value: 'contacted', label: 'Sudah Dihubungi', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'qualified', label: 'Berkualitas', color: 'bg-green-100 text-green-800' },
    { value: 'proposal', label: 'Proposal Sent', color: 'bg-purple-100 text-purple-800' },
    { value: 'negotiation', label: 'Negosiasi', color: 'bg-orange-100 text-orange-800' },
    { value: 'closed-won', label: 'Deal Sukses', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'closed-lost', label: 'Deal Gagal', color: 'bg-red-100 text-red-800' },
    { value: 'on-hold', label: 'Ditunda', color: 'bg-gray-100 text-gray-800' }
  ];

  const leadSources = [
    'Website', 'Referral', 'Social Media', 'Google Ads', 'Email Campaign', 
    'Phone Call', 'Event', 'Partner', 'Direct', 'Other'
  ];

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_management')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to ensure tags is always a string array
      const transformedData = (data || []).map(contact => ({
        ...contact,
        tags: Array.isArray(contact.tags) 
          ? (contact.tags as any[]).map(tag => String(tag)) 
          : []
      }));
      
      setContacts(transformedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal memuat kontak: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.client_name.trim() || !formData.client_email.trim()) {
      toast({
        title: "Error",
        description: "Nama dan email wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak terautentikasi');

      const contactData = {
        client_name: formData.client_name.trim(),
        client_email: formData.client_email.trim(),
        client_phone: formData.client_phone.trim() || null,
        client_company: formData.client_company.trim() || null,
        client_position: formData.client_position.trim() || null,
        lead_source: formData.lead_source.trim() || null,
        lead_status: formData.lead_status,
        notes: formData.notes.trim() || null,
        last_contact_date: formData.last_contact_date || null,
        next_follow_up: formData.next_follow_up || null,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        updated_at: new Date().toISOString()
      };

      if (editingId) {
        const { error } = await supabase
          .from('user_management')
          .update(contactData)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: "Berhasil!", description: "Kontak berhasil diupdate" });
      } else {
        const { error } = await supabase
          .from('user_management')
          .insert({
            admin_user_id: user.id,
            ...contactData
          });

        if (error) throw error;
        toast({ title: "Berhasil!", description: "Kontak berhasil ditambahkan" });
      }

      resetForm();
      await fetchContacts();
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

  const handleEdit = (contact: CRMContact) => {
    setEditingId(contact.id);
    setFormData({
      client_name: contact.client_name,
      client_email: contact.client_email,
      client_phone: contact.client_phone || '',
      client_company: contact.client_company || '',
      client_position: contact.client_position || '',
      lead_source: contact.lead_source || '',
      lead_status: contact.lead_status,
      notes: contact.notes || '',
      last_contact_date: contact.last_contact_date ? contact.last_contact_date.split('T')[0] : '',
      next_follow_up: contact.next_follow_up ? contact.next_follow_up.split('T')[0] : '',
      estimated_value: contact.estimated_value?.toString() || '',
      tags: contact.tags.join(', ')
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kontak ini?')) return;

    try {
      const { error } = await supabase.from('user_management').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Berhasil!", description: "Kontak berhasil dihapus" });
      await fetchContacts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal menghapus: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      client_name: '',
      client_email: '',
      client_phone: '',
      client_company: '',
      client_position: '',
      lead_source: '',
      lead_status: 'new',
      notes: '',
      last_contact_date: '',
      next_follow_up: '',
      estimated_value: '',
      tags: ''
    });
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.client_name.toLowerCase().includes(searchTerm.toLowerCase())
      || contact.client_email.toLowerCase().includes(searchTerm.toLowerCase()) 
      || (contact.client_company && contact.client_company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || contact.lead_status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status: string) => {
    return leadStatuses.find(s => s.value === status) || leadStatuses[0];
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
        <span className="text-lg">Memuat kontak...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          {editingId ? <Edit3 className="h-5 w-5 mr-2 text-blue-600" /> : <Plus className="h-5 w-5 mr-2 text-green-600" />}
          {editingId ? 'Edit Kontak' : 'Tambah Kontak Baru'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap *
            </label>
            <input
              type="text"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.client_email}
              onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon
            </label>
            <input
              type="tel"
              value={formData.client_phone}
              onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+62812345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Perusahaan
            </label>
            <input
              type="text"
              value={formData.client_company}
              onChange={(e) => setFormData({ ...formData, client_company: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="PT Example Indonesia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Posisi/Jabatan
            </label>
            <input
              type="text"
              value={formData.client_position}
              onChange={(e) => setFormData({ ...formData, client_position: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="CEO, Manager, dll"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sumber Lead
            </label>
            <select
              value={formData.lead_source}
              onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih sumber</option>
              {leadSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Lead
            </label>
            <select
              value={formData.lead_status}
              onChange={(e) => setFormData({ ...formData, lead_status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {leadStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimasi Nilai (IDR)
            </label>
            <input
              type="number"
              value={formData.estimated_value}
              onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="50000000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kontak Terakhir
            </label>
            <input
              type="date"
              value={formData.last_contact_date}
              onChange={(e) => setFormData({ ...formData, last_contact_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Follow Up Berikutnya
            </label>
            <input
              type="date"
              value={formData.next_follow_up}
              onChange={(e) => setFormData({ ...formData, next_follow_up: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VIP, Enterprise, Hot Lead (pisahkan dengan koma)"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              placeholder="Catatan tentang klien..."
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving || !formData.client_name.trim() || !formData.client_email.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Menyimpan...' : (editingId ? 'Update' : 'Simpan')}</span>
          </button>
          
          {editingId && (
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              Batal
            </button>
          )}
          
          <button
            onClick={fetchContacts}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold">CRM Kontak ({filteredContacts.length})</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari kontak..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                {leadStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum Ada Kontak'}
            </h4>
            <p className="text-gray-500">
              {searchTerm ? 'Coba kata kunci yang berbeda' : 'Tambahkan kontak pertama Anda'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perusahaan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow Up</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => {
                  const statusInfo = getStatusInfo(contact.lead_status);
                  return (
                    <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{contact.client_name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {contact.client_email}
                          </div>
                          {contact.client_phone && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {contact.client_phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          {contact.client_company && (
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              <Building className="h-3 w-3 mr-1" />
                              {contact.client_company}
                            </div>
                          )}
                          {contact.client_position && (
                            <div className="text-sm text-gray-500">{contact.client_position}</div>
                          )}
                          {contact.lead_source && (
                            <div className="text-xs text-gray-400">Sumber: {contact.lead_source}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        {contact.tags.length > 0 && (
                          <div className="mt-1">
                            {contact.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1">
                                {tag}
                              </span>
                            ))}
                            {contact.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{contact.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {formatCurrency(contact.estimated_value)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {contact.next_follow_up && (
                          <div className="text-sm text-gray-900 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(contact.next_follow_up).toLocaleDateString('id-ID')}
                          </div>
                        )}
                        {contact.last_contact_date && (
                          <div className="text-xs text-gray-500">
                            Terakhir: {new Date(contact.last_contact_date).toLocaleDateString('id-ID')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(contact)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit kontak"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Hapus kontak"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMManager;

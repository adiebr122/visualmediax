
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Edit3, Plus, Trash2, Eye, EyeOff, Search, RefreshCw, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  client_name: string;
  client_company: string | null;
  client_position: string | null;
  rating: number;
  testimonial_text: string;
  client_photo_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TestimonialManager = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    client_name: '',
    client_company: '',
    client_position: '',
    rating: 5,
    testimonial_text: '',
    client_photo_url: '',
    is_featured: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal memuat testimoni: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.client_name.trim() || !formData.testimonial_text.trim()) {
      toast({
        title: "Error",
        description: "Nama klien dan testimoni wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak terautentikasi');

      if (editingId) {
        const { error } = await supabase
          .from('testimonials')
          .update({
            client_name: formData.client_name.trim(),
            client_company: formData.client_company.trim() || null,
            client_position: formData.client_position.trim() || null,
            rating: formData.rating,
            testimonial_text: formData.testimonial_text.trim(),
            client_photo_url: formData.client_photo_url.trim() || null,
            is_featured: formData.is_featured,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: "Berhasil!", description: "Testimoni berhasil diupdate" });
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert({
            user_id: user.id,
            client_name: formData.client_name.trim(),
            client_company: formData.client_company.trim() || null,
            client_position: formData.client_position.trim() || null,
            rating: formData.rating,
            testimonial_text: formData.testimonial_text.trim(),
            client_photo_url: formData.client_photo_url.trim() || null,
            is_featured: formData.is_featured
          });

        if (error) throw error;
        toast({ title: "Berhasil!", description: "Testimoni berhasil ditambahkan" });
      }

      resetForm();
      await fetchTestimonials();
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

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setFormData({
      client_name: testimonial.client_name,
      client_company: testimonial.client_company || '',
      client_position: testimonial.client_position || '',
      rating: testimonial.rating,
      testimonial_text: testimonial.testimonial_text,
      client_photo_url: testimonial.client_photo_url || '',
      is_featured: testimonial.is_featured
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) return;

    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Berhasil!", description: "Testimoni berhasil dihapus" });
      await fetchTestimonials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal menghapus: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Berhasil!",
        description: `Testimoni berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
      });
      await fetchTestimonials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal mengubah status: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      client_name: '',
      client_company: '',
      client_position: '',
      rating: 5,
      testimonial_text: '',
      client_photo_url: '',
      is_featured: false
    });
  };

  const filteredTestimonials = testimonials.filter(testimonial =>
    testimonial.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (testimonial.client_company && testimonial.client_company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    testimonial.testimonial_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
        <span className="text-lg">Memuat testimoni...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          {editingId ? <Edit3 className="h-5 w-5 mr-2 text-blue-600" /> : <Plus className="h-5 w-5 mr-2 text-green-600" />}
          {editingId ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Klien *
            </label>
            <input
              type="text"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nama lengkap klien"
              required
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
              placeholder="Nama perusahaan"
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
              Rating
            </label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Bintang' : 'Bintang'}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Foto Klien
            </label>
            <input
              type="url"
              value={formData.client_photo_url}
              onChange={(e) => setFormData({ ...formData, client_photo_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Testimoni *
            </label>
            <textarea
              value={formData.testimonial_text}
              onChange={(e) => setFormData({ ...formData, testimonial_text: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              placeholder="Tulis testimoni klien..."
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Jadikan testimoni unggulan</span>
            </label>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving || !formData.client_name.trim() || !formData.testimonial_text.trim()}
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
            onClick={fetchTestimonials}
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
            <h3 className="text-lg font-semibold">Daftar Testimoni ({filteredTestimonials.length})</h3>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari testimoni..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        {filteredTestimonials.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum Ada Testimoni'}
            </h4>
            <p className="text-gray-500">
              {searchTerm ? 'Coba kata kunci yang berbeda' : 'Tambahkan testimoni pertama Anda'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Klien</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Testimoni</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTestimonials.map((testimonial) => (
                  <tr key={testimonial.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{testimonial.client_name}</div>
                        {testimonial.client_company && (
                          <div className="text-sm text-gray-500">{testimonial.client_company}</div>
                        )}
                        {testimonial.client_position && (
                          <div className="text-xs text-gray-400">{testimonial.client_position}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {Array.from({ length: testimonial.rating }, (_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                        <span className="ml-1 text-sm text-gray-600">({testimonial.rating})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate" title={testimonial.testimonial_text}>
                        {testimonial.testimonial_text}
                      </div>
                      {testimonial.is_featured && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full mt-1">
                          Unggulan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(testimonial.id, testimonial.is_active)}
                        className={`inline-flex items-center px-2 py-1 text-xs rounded-full transition-colors ${
                          testimonial.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {testimonial.is_active ? (
                          <><Eye className="h-3 w-3 mr-1" /> Aktif</>
                        ) : (
                          <><EyeOff className="h-3 w-3 mr-1" /> Nonaktif</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(testimonial)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit testimoni"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(testimonial.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Hapus testimoni"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialManager;

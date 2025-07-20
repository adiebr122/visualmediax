
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Edit3, Plus, Trash2, Eye, EyeOff, Search, RefreshCw } from 'lucide-react';

interface ContentItem {
  id: string;
  section: string;
  title: string | null;
  content: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CMSEditor = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    section: '',
    title: '',
    content: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contents:', error);
        throw error;
      }
      
      console.log('Fetched contents:', data);
      setContents(data || []);
    } catch (error: any) {
      console.error('Fetch contents error:', error);
      toast({
        title: "Error",
        description: `Gagal memuat konten: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.section.trim()) {
      toast({
        title: "Error",
        description: "Section wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User tidak terautentikasi');
      }

      console.log('Saving content:', { formData, editingId, userId: user.id });

      if (editingId) {
        // Update existing content
        const { data, error } = await supabase
          .from('website_content')
          .update({
            title: formData.title.trim() || null,
            content: formData.content.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }

        console.log('Update result:', data);
        
        toast({
          title: "Berhasil!",
          description: "Konten berhasil diupdate",
        });
      } else {
        // Create new content
        const { data, error } = await supabase
          .from('website_content')
          .insert({
            user_id: user.id,
            section: formData.section.trim(),
            title: formData.title.trim() || null,
            content: formData.content.trim() || null
          })
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }

        console.log('Insert result:', data);
        
        toast({
          title: "Berhasil!",
          description: "Konten berhasil ditambahkan",
        });
      }

      // Reset form and refresh data
      setEditingId(null);
      setFormData({ section: '', title: '', content: '' });
      await fetchContents();
      
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: `Gagal menyimpan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (content: ContentItem) => {
    console.log('Editing content:', content);
    setEditingId(content.id);
    setFormData({
      section: content.section,
      title: content.title || '',
      content: content.content || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konten ini?')) {
      return;
    }

    try {
      console.log('Deleting content:', id);
      
      const { error } = await supabase
        .from('website_content')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Content deleted successfully');
      
      toast({
        title: "Berhasil!",
        description: "Konten berhasil dihapus",
      });

      await fetchContents();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: `Gagal menghapus: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      console.log('Toggling status:', { id, currentStatus });
      
      const { error } = await supabase
        .from('website_content')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Toggle status error:', error);
        throw error;
      }

      console.log('Status toggled successfully');
      
      toast({
        title: "Berhasil!",
        description: `Status berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
      });

      await fetchContents();
    } catch (error: any) {
      console.error('Toggle status error:', error);
      toast({
        title: "Error",
        description: `Gagal mengubah status: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ section: '', title: '', content: '' });
  };

  const filteredContents = contents.filter(content =>
    content.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (content.title && content.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (content.content && content.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
        <span className="text-lg">Memuat konten...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          {editingId ? <Edit3 className="h-5 w-5 mr-2 text-blue-600" /> : <Plus className="h-5 w-5 mr-2 text-green-600" />}
          {editingId ? 'Edit Konten' : 'Tambah Konten Baru'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section *
            </label>
            <input
              type="text"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="hero_title, about_text, services_description, etc."
              disabled={!!editingId}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Gunakan format: hero_title, about_text, services_description
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Judul konten (opsional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              placeholder="Isi konten (opsional)"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={saving || !formData.section.trim()}
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
              onClick={fetchContents}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content List Section */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold">Daftar Konten ({filteredContents.length})</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari konten..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
        
        {filteredContents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {searchTerm ? (
                <Search className="h-12 w-12 mx-auto" />
              ) : (
                <Plus className="h-12 w-12 mx-auto" />
              )}
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum Ada Konten'}
            </h4>
            <p className="text-gray-500">
              {searchTerm ? 'Coba kata kunci yang berbeda' : 'Tambahkan konten pertama Anda'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContents.map((content) => (
                  <tr key={content.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 bg-blue-100 px-2 py-1 rounded">
                        {content.section}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={content.title || '-'}>
                        {content.title || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate" title={content.content || '-'}>
                        {content.content || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(content.id, content.is_active)}
                        className={`inline-flex items-center px-2 py-1 text-xs rounded-full transition-colors ${
                          content.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {content.is_active ? (
                          <><Eye className="h-3 w-3 mr-1" /> Aktif</>
                        ) : (
                          <><EyeOff className="h-3 w-3 mr-1" /> Nonaktif</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(content.updated_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(content)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit konten"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(content.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Hapus konten"
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

export default CMSEditor;

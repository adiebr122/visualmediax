
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, ExternalLink, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ClientLogo {
  id: string;
  name: string;
  logo_url: string;
  company_url?: string;
  display_order: number;
  is_active: boolean;
}

const ClientLogosManager = () => {
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLogo, setEditingLogo] = useState<ClientLogo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    company_url: '',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchLogos();
  }, []);

  // Reset preview when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setPreviewUrl('');
    }
  }, [isDialogOpen]);

  const fetchLogos = async () => {
    try {
      const { data, error } = await supabase
        .from('client_logos')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLogos(data || []);
    } catch (error) {
      console.error('Error fetching logos:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat logo klien',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('client-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('client-logos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengupload logo',
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent, logoFile?: File) => {
    e.preventDefault();
    
    try {
      let logoUrl = editingLogo?.logo_url;

      if (logoFile) {
        logoUrl = await handleFileUpload(logoFile);
        if (!logoUrl) return;
      }

      if (!logoUrl && !editingLogo) {
        toast({
          title: 'Error',
          description: 'Silakan upload logo',
          variant: 'destructive'
        });
        return;
      }

      const logoData = {
        name: formData.name,
        logo_url: logoUrl!,
        company_url: formData.company_url || null,
        display_order: formData.display_order,
        is_active: formData.is_active
      };

      if (editingLogo) {
        const { error } = await supabase
          .from('client_logos')
          .update(logoData)
          .eq('id', editingLogo.id);

        if (error) throw error;
        toast({
          title: 'Berhasil',
          description: 'Logo berhasil diperbarui'
        });
      } else {
        const { error } = await supabase
          .from('client_logos')
          .insert(logoData);

        if (error) throw error;
        toast({
          title: 'Berhasil',
          description: 'Logo berhasil ditambahkan'
        });
      }

      setIsDialogOpen(false);
      setEditingLogo(null);
      setFormData({ name: '', company_url: '', display_order: 0, is_active: true });
      setPreviewUrl('');
      fetchLogos();
    } catch (error) {
      console.error('Error saving logo:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan logo',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (logo: ClientLogo) => {
    setEditingLogo(logo);
    setFormData({
      name: logo.name,
      company_url: logo.company_url || '',
      display_order: logo.display_order,
      is_active: logo.is_active
    });
    setPreviewUrl(logo.logo_url);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus logo ini?')) return;

    try {
      const { error } = await supabase
        .from('client_logos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Berhasil',
        description: 'Logo berhasil dihapus'
      });
      fetchLogos();
    } catch (error) {
      console.error('Error deleting logo:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus logo',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (logo: ClientLogo) => {
    try {
      const { error } = await supabase
        .from('client_logos')
        .update({ is_active: !logo.is_active })
        .eq('id', logo.id);

      if (error) throw error;
      
      toast({
        title: 'Berhasil',
        description: `Logo ${!logo.is_active ? 'diaktifkan' : 'dinonaktifkan'}`
      });
      fetchLogos();
    } catch (error) {
      console.error('Error toggling logo status:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengubah status logo',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kelola Logo Klien</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingLogo(null);
              setFormData({ name: '', company_url: '', display_order: 0, is_active: true });
              setPreviewUrl('');
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Logo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border shadow-2xl">
            <DialogHeader className="pb-6 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {editingLogo ? 'Edit Logo Klien' : 'Tambah Logo Klien Baru'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              const fileInput = document.getElementById('logo-file') as HTMLInputElement;
              const file = fileInput?.files?.[0];
              handleSubmit(e, file);
            }} className="space-y-8 pt-6">
              
              {/* Logo Preview Section - Enhanced */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-900">Preview Logo</Label>
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 min-h-[200px] flex items-center justify-center">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 shadow-md inline-block">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-32 max-w-full mx-auto object-contain"
                          onError={() => setPreviewUrl('')}
                        />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Preview logo yang akan ditampilkan</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white rounded-full p-6 shadow-md inline-block">
                        <ImageIcon className="h-16 w-16 text-blue-400 mx-auto" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          {editingLogo ? 'Logo Saat Ini' : 'Belum Ada Logo Dipilih'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {editingLogo ? 'Logo saat ini akan tetap digunakan jika tidak mengupload logo baru' : 'Pilih file logo untuk melihat preview'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* File Upload - Enhanced */}
              <div className="space-y-3">
                <Label htmlFor="logo-file" className="text-lg font-semibold text-gray-900">
                  <Upload className="h-5 w-5 inline mr-2" />
                  Upload Logo {editingLogo ? '(Opsional)' : '*'}
                </Label>
                <div className="relative">
                  <Input
                    id="logo-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required={!editingLogo}
                    className="cursor-pointer text-sm border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-lg p-3 bg-white"
                  />
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Format yang didukung:</strong> JPG, PNG, GIF | <strong>Ukuran maksimal:</strong> 5MB
                  </p>
                </div>
              </div>

              {/* Company Name - Enhanced */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-lg font-semibold text-gray-900">
                  Nama Perusahaan *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: PT. Teknologi Indonesia"
                  required
                  className="border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-lg p-3 text-base"
                />
              </div>

              {/* Company URL - Enhanced */}
              <div className="space-y-3">
                <Label htmlFor="company_url" className="text-lg font-semibold text-gray-900">
                  <ExternalLink className="h-5 w-5 inline mr-2" />
                  URL Perusahaan (Opsional)
                </Label>
                <Input
                  id="company_url"
                  type="url"
                  value={formData.company_url}
                  onChange={(e) => setFormData({ ...formData, company_url: e.target.value })}
                  placeholder="https://www.example.com"
                  className="border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-lg p-3 text-base"
                />
              </div>

              {/* Display Order - Enhanced */}
              <div className="space-y-3">
                <Label htmlFor="display_order" className="text-lg font-semibold text-gray-900">
                  Urutan Tampil
                </Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-lg p-3 text-base"
                />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Semakin kecil angka, semakin awal logo ditampilkan di halaman utama
                  </p>
                </div>
              </div>

              {/* Action Buttons - Enhanced */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={uploading}
                  className="px-6 py-3 text-base border-2 hover:bg-gray-50"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={uploading}
                  className="min-w-[120px] px-6 py-3 text-base bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {uploading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Mengupload...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {editingLogo ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      <span>{editingLogo ? 'Update Logo' : 'Simpan Logo'}</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Logo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logos.map((logo) => (
          <div key={logo.id} className="border rounded-lg p-4 space-y-4 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center h-32 bg-gray-50 rounded border">
              <img
                src={logo.logo_url}
                alt={logo.name}
                className="max-h-24 max-w-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/120x60/f3f4f6/6b7280?text=${logo.name.replace(' ', '+')}`;
                }}
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{logo.name}</h3>
              <p className="text-sm text-gray-600">Urutan: {logo.display_order}</p>
              {logo.company_url && (
                <div className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <a href={logo.company_url} target="_blank" rel="noopener noreferrer">
                    Website
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  logo.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {logo.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(logo)}
                    className="text-xs"
                  >
                    {logo.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(logo)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(logo.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {logos.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 mb-4">Belum ada logo klien</div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Logo Pertama
          </Button>
        </div>
      )}
    </div>
  );
};

export default ClientLogosManager;

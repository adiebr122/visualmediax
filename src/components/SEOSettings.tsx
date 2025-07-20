
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, Globe, Search, Image, FileText, Sparkles, Zap, Plus, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';

interface SEOSetting {
  id?: string;
  setting_key: string;
  setting_value: string;
  description: string;
}

const SEOSettings = () => {
  const [settings, setSettings] = useState<SEOSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SEOSetting | null>(null);
  const [showSettingForm, setShowSettingForm] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [newSetting, setNewSetting] = useState<SEOSetting>({
    setting_key: '',
    setting_value: '',
    description: ''
  });

  const defaultSettings: SEOSetting[] = [
    { setting_key: 'site_title', setting_value: '', description: 'Judul Website' },
    { setting_key: 'site_description', setting_value: '', description: 'Deskripsi Website' },
    { setting_key: 'site_keywords', setting_value: '', description: 'Keywords (pisahkan dengan koma)' },
    { setting_key: 'og_title', setting_value: '', description: 'Open Graph Title' },
    { setting_key: 'og_description', setting_value: '', description: 'Open Graph Description' },
    { setting_key: 'og_image', setting_value: '', description: 'Open Graph Image URL' },
    { setting_key: 'twitter_title', setting_value: '', description: 'Twitter Card Title' },
    { setting_key: 'twitter_description', setting_value: '', description: 'Twitter Card Description' },
    { setting_key: 'canonical_url', setting_value: '', description: 'Canonical URL' },
    { setting_key: 'robots_txt', setting_value: '', description: 'Robots.txt Content' }
  ];

  useEffect(() => {
    if (user) {
      fetchSEOSettings();
    }
  }, [user]);

  const fetchSEOSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_category', 'seo_config')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedSettings = defaultSettings.map(defaultSetting => {
          const existingSetting = data.find(d => d.setting_key === defaultSetting.setting_key);
          return existingSetting ? {
            id: existingSetting.id,
            setting_key: existingSetting.setting_key,
            setting_value: existingSetting.setting_value || '',
            description: existingSetting.description || defaultSetting.description
          } : defaultSetting;
        });
        
        // Add any custom settings that aren't in defaults
        const customSettings = data.filter(d => 
          !defaultSettings.some(ds => ds.setting_key === d.setting_key)
        ).map(cs => ({
          id: cs.id,
          setting_key: cs.setting_key,
          setting_value: cs.setting_value || '',
          description: cs.description || ''
        }));
        
        setSettings([...mappedSettings, ...customSettings]);
      } else {
        setSettings(defaultSettings);
      }
    } catch (error: any) {
      console.error('Error fetching SEO settings:', error);
      toast({
        title: "Error",
        description: `Gagal memuat pengaturan SEO: ${error.message}`,
        variant: "destructive",
      });
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const updated = [...settings];
    updated[index] = { ...updated[index], setting_value: value };
    setSettings(updated);
  };

  const saveSEOSettings = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "User tidak ditemukan. Silakan login ulang.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      for (const setting of settings) {
        if (!setting.setting_key) continue;
        
        const settingData = {
          setting_category: 'seo_config',
          setting_key: setting.setting_key,
          setting_value: setting.setting_value,
          setting_type: 'text',
          description: setting.description,
          is_public: true,
          updated_at: new Date().toISOString(),
          user_id: user.id
        };

        if (setting.id) {
          const { error } = await supabase
            .from('app_settings')
            .update(settingData)
            .eq('id', setting.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('app_settings')
            .insert(settingData);
          if (error) throw error;
        }
      }

      toast({
        title: "🎉 Berhasil!",
        description: "Pengaturan SEO berhasil disimpan dan akan segera terupdate di website",
      });

      await fetchSEOSettings();
    } catch (error: any) {
      console.error('Error saving SEO settings:', error);
      toast({
        title: "Error",
        description: `Gagal menyimpan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addCustomSetting = () => {
    setEditingSetting(null);
    setNewSetting({
      setting_key: '',
      setting_value: '',
      description: ''
    });
    setShowSettingForm(true);
  };

  const editSetting = (setting: SEOSetting, index: number) => {
    setEditingSetting({ ...setting, id: setting.id || index.toString() });
    setNewSetting(setting);
    setShowSettingForm(true);
  };

  const deleteSetting = async (setting: SEOSetting, index: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengaturan ini?')) return;

    try {
      if (setting.id) {
        const { error } = await supabase
          .from('app_settings')
          .delete()
          .eq('id', setting.id);
        
        if (error) throw error;
      }

      const newSettings = settings.filter((_, i) => i !== index);
      setSettings(newSettings);
      
      toast({
        title: "Berhasil",
        description: "Pengaturan berhasil dihapus",
      });
    } catch (error: any) {
      console.error('Error deleting setting:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus pengaturan",
        variant: "destructive",
      });
    }
  };

  const saveCustomSetting = () => {
    if (!newSetting.setting_key || !newSetting.description) {
      toast({
        title: "Error",
        description: "Key dan deskripsi harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (editingSetting) {
      const index = parseInt(editingSetting.id || '0');
      const newSettings = [...settings];
      newSettings[index] = newSetting;
      setSettings(newSettings);
    } else {
      setSettings([...settings, newSetting]);
    }

    setShowSettingForm(false);
    setEditingSetting(null);
    setNewSetting({
      setting_key: '',
      setting_value: '',
      description: ''
    });

    toast({
      title: "Berhasil",
      description: "Pengaturan berhasil ditambahkan. Jangan lupa simpan perubahan!",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
            <Sparkles className="h-6 w-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-gray-700 text-lg font-medium">Memuat pengaturan SEO...</p>
        </div>
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
                <Search className="h-8 w-8 mr-3 text-purple-200" />
                Pengaturan SEO
              </CardTitle>
              <CardDescription className="text-purple-100 text-lg">
                Optimalkan website Anda untuk mesin pencari dan social media
              </CardDescription>
            </div>
            <div className="hidden md:block">
              <Zap className="h-16 w-16 text-purple-200" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Actions */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Pengaturan SEO ({settings.length})</h3>
            <div className="flex gap-3">
              <Button
                onClick={addCustomSetting}
                variant="outline"
                className="flex items-center gap-2 border-2 border-gray-200 hover:border-green-500 hover:text-green-600"
              >
                <Plus className="h-4 w-4" />
                Tambah Setting Custom
              </Button>
              <Button
                onClick={saveSEOSettings}
                disabled={saving}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Simpan Semua Pengaturan
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Form */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 gap-8">
            {settings.map((setting, index) => (
              <div key={`${setting.setting_key}-${index}`} className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Label 
                      htmlFor={setting.setting_key} 
                      className="text-sm font-bold text-gray-800 mb-3 flex items-center"
                    >
                      {setting.setting_key.includes('image') ? 
                        <Image className="h-5 w-5 mr-2 text-purple-600" /> : 
                       setting.setting_key.includes('robots') ? 
                        <FileText className="h-5 w-5 mr-2 text-blue-600" /> :
                        <Globe className="h-5 w-5 mr-2 text-emerald-600" />}
                      {setting.description}
                    </Label>
                    <div className="text-xs text-gray-500 mb-3">
                      Key: <code className="bg-gray-100 px-2 py-1 rounded">{setting.setting_key}</code>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editSetting(setting, index)}
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!defaultSettings.some(ds => ds.setting_key === setting.setting_key) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSetting(setting, index)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {setting.setting_key === 'site_description' || setting.setting_key === 'robots_txt' ? (
                  <Textarea
                    id={setting.setting_key}
                    value={setting.setting_value}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 resize-vertical bg-white/80 backdrop-blur-sm"
                    placeholder={`Masukkan ${setting.description.toLowerCase()}`}
                  />
                ) : (
                  <Input
                    id={setting.setting_key}
                    type="text"
                    value={setting.setting_value}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    placeholder={`Masukkan ${setting.description.toLowerCase()}`}
                    className="border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 py-3 bg-white/80 backdrop-blur-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Setting Form Modal */}
      {showSettingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <Card className="border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center">
                  {editingSetting ? <Edit className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                  {editingSetting ? 'Edit Setting' : 'Tambah Setting Custom'}
                </CardTitle>
                <CardDescription className="text-purple-100">
                  {editingSetting ? 'Update pengaturan SEO' : 'Buat pengaturan SEO custom baru'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="setting_key">Setting Key *</Label>
                  <Input
                    id="setting_key"
                    value={newSetting.setting_key}
                    onChange={(e) => setNewSetting({ ...newSetting, setting_key: e.target.value })}
                    placeholder="e.g., custom_meta_tag"
                    disabled={!!editingSetting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi *</Label>
                  <Input
                    id="description"
                    value={newSetting.description}
                    onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                    placeholder="Deskripsi pengaturan ini"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="setting_value">Nilai</Label>
                  <Textarea
                    id="setting_value"
                    value={newSetting.setting_value}
                    onChange={(e) => setNewSetting({ ...newSetting, setting_value: e.target.value })}
                    placeholder="Nilai untuk pengaturan ini"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSettingForm(false);
                      setEditingSetting(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Batal
                  </Button>
                  <Button
                    onClick={saveCustomSetting}
                    disabled={!newSetting.setting_key || !newSetting.description}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {editingSetting ? 'Update' : 'Tambah'} Setting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOSettings;

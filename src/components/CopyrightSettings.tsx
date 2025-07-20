
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, Copyright } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';

interface CopyrightSetting {
  id?: string;
  setting_key: string;
  setting_value: string;
  description: string;
}

const CopyrightSettings = () => {
  const [settings, setSettings] = useState<CopyrightSetting[]>([
    { setting_key: 'copyright_year', setting_value: '', description: 'Tahun Copyright' },
    { setting_key: 'copyright_company', setting_value: '', description: 'Nama Perusahaan' },
    { setting_key: 'copyright_text', setting_value: '', description: 'Teks Copyright Lengkap' },
    { setting_key: 'privacy_policy_url', setting_value: '', description: 'URL Privacy Policy' },
    { setting_key: 'terms_of_service_url', setting_value: '', description: 'URL Terms of Service' }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCopyrightSettings();
    }
  }, [user]);

  const fetchCopyrightSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_category', 'copyright')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const updatedSettings = settings.map(setting => {
          const existingSetting = data.find(d => d.setting_key === setting.setting_key);
          return existingSetting ? {
            ...setting,
            id: existingSetting.id,
            setting_value: existingSetting.setting_value || ''
          } : setting;
        });
        setSettings(updatedSettings);
      }
    } catch (error: any) {
      console.error('Error fetching copyright settings:', error);
      toast({
        title: "Error",
        description: `Gagal memuat pengaturan copyright: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const updated = [...settings];
    updated[index] = { ...updated[index], setting_value: value };
    setSettings(updated);
  };

  const saveCopyrightSettings = async () => {
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
        const settingData = {
          setting_category: 'copyright',
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
        title: "Berhasil!",
        description: "Pengaturan copyright berhasil disimpan dan akan segera terupdate di website",
      });

      await fetchCopyrightSettings();
    } catch (error: any) {
      console.error('Error saving copyright settings:', error);
      toast({
        title: "Error",
        description: `Gagal menyimpan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
        <span>Memuat pengaturan copyright...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Copyright className="h-5 w-5 mr-2 text-blue-600" />
          Pengaturan Copyright Footer
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settings.map((setting, index) => (
          <div key={setting.setting_key} className={setting.setting_key === 'copyright_text' ? 'md:col-span-2' : ''}>
            <Label htmlFor={setting.setting_key} className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Copyright className="h-4 w-4 mr-1" />
              {setting.description}
            </Label>
            {setting.setting_key === 'copyright_text' ? (
              <Textarea
                id={setting.setting_key}
                value={setting.setting_value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                rows={3}
                placeholder={`Masukkan ${setting.description.toLowerCase()}`}
              />
            ) : (
              <Input
                id={setting.setting_key}
                type="text"
                value={setting.setting_value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder={`Masukkan ${setting.description.toLowerCase()}`}
              />
            )}
            {setting.setting_key === 'copyright_year' && (
              <p className="text-sm text-gray-500 mt-1">Contoh: 2024 atau 2020-2024</p>
            )}
            {setting.setting_key === 'copyright_company' && (
              <p className="text-sm text-gray-500 mt-1">Contoh: Visual Media X</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={saveCopyrightSettings}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Simpan Pengaturan Copyright
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CopyrightSettings;

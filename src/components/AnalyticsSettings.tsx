
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, BarChart3, Eye, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsSetting {
  id?: string;
  setting_key: string;
  setting_value: string;
  description: string;
  placeholder: string;
}

const AnalyticsSettings = () => {
  const [settings, setSettings] = useState<AnalyticsSetting[]>([
    { 
      setting_key: 'google_analytics_id', 
      setting_value: '', 
      description: 'Google Analytics ID',
      placeholder: 'G-XXXXXXXXXX atau UA-XXXXXXXXX-X'
    },
    { 
      setting_key: 'google_tag_manager_id', 
      setting_value: '', 
      description: 'Google Tag Manager ID',
      placeholder: 'GTM-XXXXXXX'
    },
    { 
      setting_key: 'facebook_pixel_id', 
      setting_value: '', 
      description: 'Facebook Pixel ID',
      placeholder: '1234567890123456'
    },
    { 
      setting_key: 'hotjar_id', 
      setting_value: '', 
      description: 'Hotjar Site ID',
      placeholder: '1234567'
    },
    { 
      setting_key: 'google_search_console', 
      setting_value: '', 
      description: 'Google Search Console Verification',
      placeholder: 'google-site-verification=xxxxx'
    },
    { 
      setting_key: 'custom_head_code', 
      setting_value: '', 
      description: 'Custom Code (Head)',
      placeholder: '<script>/* Your custom code */</script>'
    },
    { 
      setting_key: 'custom_body_code', 
      setting_value: '', 
      description: 'Custom Code (Body)',
      placeholder: '<script>/* Your custom code */</script>'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAnalyticsSettings();
    }
  }, [user]);

  const fetchAnalyticsSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_category', 'analytics_config')
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
      console.error('Error fetching analytics settings:', error);
      toast({
        title: "Error",
        description: `Gagal memuat pengaturan analytics: ${error.message}`,
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

  const saveAnalyticsSettings = async () => {
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
          setting_category: 'analytics_config',
          setting_key: setting.setting_key,
          setting_value: setting.setting_value,
          setting_type: setting.setting_key.includes('code') ? 'html' : 'text',
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
        description: "Pengaturan analytics berhasil disimpan dan akan segera terupdate di website",
      });

      await fetchAnalyticsSettings();
    } catch (error: any) {
      console.error('Error saving analytics settings:', error);
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
        <span>Memuat pengaturan analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
          Analytics & Tracking
        </h3>
      </div>

      <div className="space-y-6">
        {settings.map((setting, index) => (
          <div key={setting.setting_key}>
            <Label htmlFor={setting.setting_key} className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              {setting.setting_key.includes('code') ? <Code className="h-4 w-4 mr-1" /> : 
               setting.setting_key.includes('search') ? <Eye className="h-4 w-4 mr-1" /> :
               <BarChart3 className="h-4 w-4 mr-1" />}
              {setting.description}
            </Label>
            {setting.setting_key.includes('code') ? (
              <textarea
                id={setting.setting_key}
                value={setting.setting_value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical font-mono text-sm"
                placeholder={setting.placeholder}
              />
            ) : (
              <Input
                id={setting.setting_key}
                type="text"
                value={setting.setting_value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder={setting.placeholder}
              />
            )}
            {setting.setting_key === 'google_analytics_id' && setting.setting_value && (
              <p className="text-sm text-gray-500 mt-1">
                Preview: Google Analytics akan dilacak dengan ID ini
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Penting!</h4>
        <p className="text-sm text-yellow-700">
          Pastikan ID tracking yang Anda masukkan sudah benar. Kode analytics akan diintegrasikan ke website secara otomatis.
          Untuk Google Analytics 4, gunakan format G-XXXXXXXXXX. Untuk Universal Analytics (lama), gunakan UA-XXXXXXXXX-X.
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={saveAnalyticsSettings}
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
              Simpan Pengaturan Analytics
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsSettings;

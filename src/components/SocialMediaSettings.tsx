
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, Facebook, Instagram, Youtube, Twitter, Linkedin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

interface SocialMediaSetting {
  id?: string;
  setting_key: string;
  setting_value: string;
  description: string;
  icon: React.ComponentType<any>;
}

const SocialMediaSettings = () => {
  const [settings, setSettings] = useState<SocialMediaSetting[]>([
    { setting_key: 'facebook_url', setting_value: '', description: 'Facebook', icon: Facebook },
    { setting_key: 'instagram_url', setting_value: '', description: 'Instagram', icon: Instagram },
    { setting_key: 'youtube_url', setting_value: '', description: 'YouTube', icon: Youtube },
    { setting_key: 'twitter_url', setting_value: '', description: 'Twitter/X', icon: Twitter },
    { setting_key: 'linkedin_url', setting_value: '', description: 'LinkedIn', icon: Linkedin },
    { setting_key: 'tiktok_url', setting_value: '', description: 'TikTok', icon: Globe },
    { setting_key: 'whatsapp_url', setting_value: '', description: 'WhatsApp', icon: Globe },
    { setting_key: 'telegram_url', setting_value: '', description: 'Telegram', icon: Globe }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSocialMediaSettings();
    }
  }, [user]);

  const fetchSocialMediaSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_category', 'social_media')
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
      console.error('Error fetching social media settings:', error);
      toast({
        title: "Error",
        description: `Gagal memuat pengaturan social media: ${error.message}`,
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

  const saveSocialMediaSettings = async () => {
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
          setting_category: 'social_media',
          setting_key: setting.setting_key,
          setting_value: setting.setting_value,
          setting_type: 'url',
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
        description: "Pengaturan social media berhasil disimpan dan akan segera terupdate di website",
      });

      await fetchSocialMediaSettings();
    } catch (error: any) {
      console.error('Error saving social media settings:', error);
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
        <span>Memuat pengaturan social media...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Globe className="h-5 w-5 mr-2 text-blue-600" />
          Pengaturan Social Media
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settings.map((setting, index) => {
          const IconComponent = setting.icon;
          return (
            <div key={setting.setting_key}>
              <Label htmlFor={setting.setting_key} className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <IconComponent className="h-4 w-4 mr-2" />
                {setting.description}
              </Label>
              <Input
                id={setting.setting_key}
                type="url"
                value={setting.setting_value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder={`Masukkan URL ${setting.description}`}
              />
              {setting.setting_value && (
                <p className="text-xs text-gray-500 mt-1">
                  Preview: <a href={setting.setting_value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{setting.setting_value}</a>
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Catatan:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Masukkan URL lengkap (contoh: https://facebook.com/username)</li>
          <li>• Link ini akan muncul di footer website</li>
          <li>• Kosongkan field jika tidak ingin menampilkan social media tersebut</li>
          <li>• Pastikan URL valid dan dapat diakses</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={saveSocialMediaSettings}
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
              Simpan Pengaturan Social Media
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SocialMediaSettings;

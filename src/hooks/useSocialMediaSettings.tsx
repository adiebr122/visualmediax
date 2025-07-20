
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SocialMediaSettings {
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  tiktok_url?: string;
  whatsapp_url?: string;
  telegram_url?: string;
}

export const useSocialMediaSettings = () => {
  const [socialMediaSettings, setSocialMediaSettings] = useState<SocialMediaSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocialMediaSettings();
  }, []);

  const fetchSocialMediaSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .eq('setting_category', 'social_media')
        .eq('is_public', true);

      if (error) throw error;

      const settings: SocialMediaSettings = {};
      data?.forEach((item) => {
        if (item.setting_value) {
          settings[item.setting_key as keyof SocialMediaSettings] = item.setting_value;
        }
      });

      setSocialMediaSettings(settings);
    } catch (error) {
      console.error('Error fetching social media settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { socialMediaSettings, loading };
};

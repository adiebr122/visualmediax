
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CopyrightSettings {
  copyright_year?: string;
  copyright_company?: string;
  copyright_text?: string;
  privacy_policy_url?: string;
  terms_of_service_url?: string;
}

export const useCopyrightSettings = () => {
  const [copyrightSettings, setCopyrightSettings] = useState<CopyrightSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCopyrightSettings();
  }, []);

  const fetchCopyrightSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .eq('setting_category', 'copyright')
        .eq('is_public', true);

      if (error) throw error;

      const settings: CopyrightSettings = {};
      data?.forEach((item) => {
        if (item.setting_value) {
          settings[item.setting_key as keyof CopyrightSettings] = item.setting_value;
        }
      });

      setCopyrightSettings(settings);
    } catch (error) {
      console.error('Error fetching copyright settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { copyrightSettings, loading };
};

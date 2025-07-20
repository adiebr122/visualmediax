
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppSettings {
  whatsapp_number: string;
  whatsapp_message: string;
}

export const useWhatsAppSettings = () => {
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings>({
    whatsapp_number: '085674722278',
    whatsapp_message: 'Halo, saya tertarik untuk konsultasi gratis mengenai layanan AI dan digital transformation. Bisakah kita berdiskusi lebih lanjut?'
  });
  const [loading, setLoading] = useState(true);

  const fetchWhatsAppSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['whatsapp_number', 'whatsapp_message']);

      if (error) {
        console.error('Error fetching WhatsApp settings:', error);
      }

      if (data && data.length > 0) {
        const settings = data.reduce((acc, setting) => {
          acc[setting.key] = setting.value || '';
          return acc;
        }, {} as Record<string, string>);

        setWhatsappSettings({
          whatsapp_number: settings.whatsapp_number || '085674722278',
          whatsapp_message: settings.whatsapp_message || 'Halo, saya tertarik untuk konsultasi gratis mengenai layanan AI dan digital transformation. Bisakah kita berdiskusi lebih lanjut?'
        });
      }
    } catch (error) {
      console.error('Error in fetchWhatsAppSettings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWhatsAppSettings();

    // Listen for updates from admin panel
    const handleWhatsAppUpdate = () => {
      console.log('WhatsApp settings update event received');
      fetchWhatsAppSettings();
    };

    window.addEventListener('contactInfoUpdated', handleWhatsAppUpdate);

    return () => {
      window.removeEventListener('contactInfoUpdated', handleWhatsAppUpdate);
    };
  }, []);

  const createWhatsAppLink = (customMessage?: string) => {
    const number = whatsappSettings.whatsapp_number.replace(/\D/g, ''); // Remove non-digits
    const formattedNumber = number.startsWith('62') ? number : `62${number.replace(/^0/, '')}`;
    const message = encodeURIComponent(customMessage || whatsappSettings.whatsapp_message);
    return `https://wa.me/${formattedNumber}?text=${message}`;
  };

  return {
    whatsappSettings,
    loading,
    createWhatsAppLink,
    refreshSettings: fetchWhatsAppSettings
  };
};

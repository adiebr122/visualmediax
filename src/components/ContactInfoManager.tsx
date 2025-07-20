
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const ContactInfoManager = () => {
  const [contactInfo, setContactInfo] = useState({
    company_phone: '',
    company_email: '',
    company_address: '',
    whatsapp_number: '085674722278',
    whatsapp_message: 'Halo, saya tertarik untuk konsultasi gratis mengenai layanan AI dan digital transformation. Bisakah kita berdiskusi lebih lanjut?'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchContactInfo();
    }
  }, [user]);

  const fetchContactInfo = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['company_phone', 'company_email', 'company_address', 'whatsapp_number', 'whatsapp_message']);

      if (error) throw error;

      const settings = data?.reduce((acc, setting) => {
        acc[setting.key] = setting.value || '';
        return acc;
      }, {} as Record<string, string>) || {};

      setContactInfo({
        company_phone: settings.company_phone || '',
        company_email: settings.company_email || '',
        company_address: settings.company_address || '',
        whatsapp_number: settings.whatsapp_number || '085674722278',
        whatsapp_message: settings.whatsapp_message || 'Halo, saya tertarik untuk konsultasi gratis mengenai layanan AI dan digital transformation. Bisakah kita berdiskusi lebih lanjut?'
      });
    } catch (error) {
      console.error('Error fetching contact info:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil informasi kontak",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "User tidak ditemukan. Silakan login ulang.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const updates = Object.entries(contactInfo).map(([key, value]) => ({
        key,
        value,
        description: getFieldDescription(key),
        user_id: user.id
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(
            {
              key: update.key,
              value: update.value,
              description: update.description,
              user_id: update.user_id
            },
            {
              onConflict: 'key'
            }
          );

        if (error) {
          console.error(`Error upserting ${update.key}:`, error);
          throw error;
        }
      }

      toast({
        title: "Berhasil",
        description: "Informasi kontak berhasil disimpan",
      });

      // Trigger refresh for other components
      window.dispatchEvent(new CustomEvent('contactInfoUpdated'));
      
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan informasi kontak",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getFieldDescription = (key: string) => {
    const descriptions = {
      company_phone: 'Nomor telepon perusahaan',
      company_email: 'Email perusahaan',
      company_address: 'Alamat perusahaan',
      whatsapp_number: 'Nomor WhatsApp untuk konsultasi',
      whatsapp_message: 'Pesan default untuk konsultasi WhatsApp'
    };
    return descriptions[key as keyof typeof descriptions] || '';
  };

  const handleInputChange = (field: string, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Informasi Kontak</CardTitle>
          <CardDescription>Kelola informasi kontak perusahaan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Informasi Kontak
        </CardTitle>
        <CardDescription>
          Kelola informasi kontak perusahaan dan pengaturan WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Nomor Telepon Perusahaan
            </Label>
            <Input
              id="company_phone"
              value={contactInfo.company_phone}
              onChange={(e) => handleInputChange('company_phone', e.target.value)}
              placeholder="Contoh: +62 21 1234 5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Perusahaan
            </Label>
            <Input
              id="company_email"
              type="email"
              value={contactInfo.company_email}
              onChange={(e) => handleInputChange('company_email', e.target.value)}
              placeholder="Contoh: info@perusahaan.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Alamat Perusahaan
            </Label>
            <Textarea
              id="company_address"
              value={contactInfo.company_address}
              onChange={(e) => handleInputChange('company_address', e.target.value)}
              placeholder="Alamat lengkap perusahaan"
              rows={3}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Pengaturan WhatsApp
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">
              Nomor WhatsApp (untuk tombol konsultasi)
            </Label>
            <Input
              id="whatsapp_number"
              value={contactInfo.whatsapp_number}
              onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
              placeholder="Contoh: 085674722278"
            />
            <p className="text-sm text-gray-500">
              Masukkan nomor tanpa tanda +62 atau 0. Contoh: 85674722278
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp_message">
              Pesan Default WhatsApp
            </Label>
            <Textarea
              id="whatsapp_message"
              value={contactInfo.whatsapp_message}
              onChange={(e) => handleInputChange('whatsapp_message', e.target.value)}
              placeholder="Pesan yang akan dikirim saat tombol konsultasi diklik"
              rows={4}
            />
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContactInfoManager;

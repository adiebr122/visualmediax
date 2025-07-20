
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Service {
  id?: string;
  service_name: string;
  service_description: string;
  service_category: string;
  price_starting_from: number;
  price_currency: string;
  estimated_duration: string;
  service_image_url: string;
  service_features: string[];
  is_active: boolean;
  display_order: number;
}

interface ServiceFormProps {
  service?: Service | null;
  onSave: () => void;
  onCancel: () => void;
}

const ServiceForm = ({ service, onSave, onCancel }: ServiceFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Service>({
    service_name: '',
    service_description: '',
    service_category: '',
    price_starting_from: 0,
    price_currency: 'IDR',
    estimated_duration: '',
    service_image_url: '',
    service_features: [],
    is_active: true,
    display_order: 0
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (service) {
      setFormData(service);
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const serviceData = {
        ...formData,
        user_id: user.id,
        service_features: formData.service_features
      };

      if (service?.id) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', service.id);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Layanan berhasil diperbarui",
        });
      } else {
        // Create new service
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Layanan berhasil ditambahkan",
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan layanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        service_features: [...formData.service_features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      service_features: formData.service_features.filter((_, i) => i !== index)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {service?.id ? 'Edit Layanan' : 'Tambah Layanan Baru'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service_name">Nama Layanan *</Label>
              <Input
                id="service_name"
                value={formData.service_name}
                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="service_category">Kategori *</Label>
              <Input
                id="service_category"
                value={formData.service_category}
                onChange={(e) => setFormData({ ...formData, service_category: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="service_description">Deskripsi *</Label>
            <Textarea
              id="service_description"
              value={formData.service_description}
              onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price_starting_from">Harga Mulai Dari *</Label>
              <Input
                id="price_starting_from"
                type="number"
                value={formData.price_starting_from}
                onChange={(e) => setFormData({ ...formData, price_starting_from: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="price_currency">Mata Uang</Label>
              <Select value={formData.price_currency} onValueChange={(value) => setFormData({ ...formData, price_currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">IDR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="estimated_duration">Estimasi Durasi</Label>
              <Input
                id="estimated_duration"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                placeholder="e.g. 2-3 minggu"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="service_image_url">URL Gambar</Label>
            <Input
              id="service_image_url"
              type="url"
              value={formData.service_image_url}
              onChange={(e) => setFormData({ ...formData, service_image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <Label>Fitur Layanan</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Tambah fitur baru"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {formData.service_features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display_order">Urutan Tampil</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active">Aktif</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : service?.id ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceForm;

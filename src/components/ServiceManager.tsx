

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Save, 
  Edit, 
  Trash2, 
  FileText,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import ServiceDetail from './ServiceDetail';
import ServiceForm from './ServiceForm';

interface Service {
  id: string;
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

const ServiceManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user]);

  const fetchServices = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching services...');
      setLoading(true);
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      console.log('Services data:', data);
      
      // Transform the data to match our interface
      const transformedServices: Service[] = (data || []).map(service => ({
        ...service,
        service_features: Array.isArray(service.service_features) 
          ? service.service_features as string[]
          : []
      }));
      
      setServices(transformedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data layanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus layanan ini?')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setServices(services.filter(service => service.id !== id));
      toast({
        title: "Berhasil",
        description: "Layanan berhasil dihapus",
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus layanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const viewServiceDetail = (service: Service) => {
    setSelectedService(service);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedService(null);
  };

  const handleAddService = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingService(null);
    fetchServices();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingService(null);
  };

  // Filter services based on search term and category
  const filteredServices = services.filter(service => {
    const matchesSearch = searchTerm === '' || 
      service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.service_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.service_category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === '' || service.service_category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(services.map(service => service.service_category))];

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Login Diperlukan</h3>
        <p className="text-gray-500">Anda harus login untuk mengelola layanan</p>
      </div>
    );
  }

  if (showDetail && selectedService) {
    return <ServiceDetail service={selectedService} onBack={closeDetail} />;
  }

  if (showForm) {
    return <ServiceForm service={editingService} onSave={handleFormSave} onCancel={handleFormCancel} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kelola Layanan</h2>
          <p className="text-gray-600 mt-1">Total layanan: {services.length} | Ditampilkan: {filteredServices.length}</p>
        </div>
        <Button onClick={handleAddService}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Layanan
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter dan Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Cari layanan berdasarkan nama, deskripsi, atau kategori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Kategori</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('');
                }}
                variant="outline"
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Layanan ({filteredServices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {services.length === 0 ? 'Belum Ada Layanan' : 'Tidak Ada Layanan yang Sesuai Filter'}
              </h3>
              <p className="text-gray-500 mb-4">
                {services.length === 0 
                  ? 'Mulai dengan menambahkan layanan pertama Anda'
                  : 'Coba ubah kata kunci pencarian atau filter kategori'
                }
              </p>
              {services.length === 0 && (
                <Button onClick={handleAddService}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Layanan Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {service.service_category}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewServiceDetail(service)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Lihat Detail"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditService(service)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteService(service.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <img 
                    src={service.service_image_url} 
                    alt={service.service_name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                    {service.service_name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {service.service_description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-green-600 font-semibold">
                        {service.price_currency} {service.price_starting_from?.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="text-gray-500">
                      {service.estimated_duration}
                    </div>
                  </div>

                  {service.service_features && service.service_features.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Fitur:</p>
                      <div className="flex flex-wrap gap-1">
                        {service.service_features.slice(0, 2).map((feature, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                        {service.service_features.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{service.service_features.length - 2} lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceManager;

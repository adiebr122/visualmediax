
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, Star, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';

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
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedService: Service = {
        ...data,
        service_features: Array.isArray(data.service_features) 
          ? data.service_features as string[]
          : []
      };
      
      setService(transformedService);
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16 flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16 text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Layanan Tidak Ditemukan</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Service Image */}
            <div className="relative">
              <img 
                src={service.service_image_url}
                alt={service.service_name}
                className="w-full h-96 object-cover rounded-2xl shadow-xl"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {service.service_category}
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {service.service_name}
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {service.service_description}
                </p>
              </div>

              {/* Service Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-semibold text-gray-900">Harga Mulai Dari</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {service.price_currency} {service.price_starting_from?.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-gray-900">Estimasi Durasi</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {service.estimated_duration}
                  </div>
                </div>
              </div>

              {/* Service Features */}
              {service.service_features && service.service_features.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    Fitur Layanan
                  </h3>
                  <ul className="space-y-3">
                    {service.service_features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Button */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl text-white">
                <h3 className="text-xl font-semibold mb-2">Tertarik dengan layanan ini?</h3>
                <p className="mb-4 opacity-90">
                  Konsultasikan kebutuhan Anda dengan tim ahli kami secara gratis
                </p>
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Konsultasi Gratis Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;

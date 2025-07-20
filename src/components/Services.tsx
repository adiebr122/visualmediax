import { useState, useEffect } from 'react';
import { ArrowRight, Code, Brain, Smartphone, Globe, Database, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';

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

interface ServicesContent {
  title: string;
  description: string;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [content, setContent] = useState<ServicesContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { createWhatsAppLink } = useWhatsAppSettings();

  useEffect(() => {
    fetchContent();
    fetchServices();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'services')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching services content:', error);
      }

      if (data) {
        setContent({
          title: data.title || 'Layanan Terbaik Kami',
          description: data.content || 'Kami menyediakan berbagai layanan AI dan teknologi untuk mengoptimalkan bisnis Anda'
        });
      }
    } catch (error) {
      console.error('Error fetching services content:', error);
    }
  };

  const fetchServices = async () => {
    try {
      console.log('Fetching services from database...');
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
      
      console.log('Services data fetched:', data);
      
      // Transform the data to match our interface
      const transformedServices: Service[] = (data || []).map(service => ({
        ...service,
        service_features: Array.isArray(service.service_features) 
          ? service.service_features as string[]
          : []
      }));
      
      console.log('Transformed services:', transformedServices);
      setServices(transformedServices);
    } catch (error) {
      console.error('Error in fetchServices:', error);
      // Fallback to static data if fetch fails
      setServices([
        {
          id: 'ai-chatbot',
          service_name: 'AI Chatbot Development',
          service_description: 'Kembangkan chatbot AI yang cerdas untuk meningkatkan customer service dan engagement pelanggan dengan teknologi NLP terdepan.',
          service_category: 'AI Solutions',
          price_starting_from: 15000000,
          price_currency: 'IDR',
          estimated_duration: '4-6 minggu',
          service_image_url: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          service_features: ['Natural Language Processing', '24/7 Customer Support', 'Multi-platform Integration', 'Analytics Dashboard'],
          is_active: true
        },
        {
          id: 'web-development',
          service_name: 'Custom Web Development',
          service_description: 'Solusi pengembangan website custom yang responsif, cepat, dan user-friendly menggunakan teknologi terkini.',
          service_category: 'Web Development',
          price_starting_from: 25000000,
          price_currency: 'IDR',
          estimated_duration: '6-8 minggu',
          service_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          service_features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Admin Panel'],
          is_active: true
        },
        {
          id: 'mobile-app',
          service_name: 'Mobile App Development',
          service_description: 'Pengembangan aplikasi mobile native dan cross-platform untuk iOS dan Android dengan performa optimal.',
          service_category: 'Mobile Development',
          price_starting_from: 35000000,
          price_currency: 'IDR',
          estimated_duration: '8-12 minggu',
          service_image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          service_features: ['Cross-platform', 'Push Notifications', 'Offline Support', 'App Store Ready'],
          is_active: true
        },
        {
          id: 'data-analytics',
          service_name: 'Data Analytics & BI',
          service_description: 'Transformasi data menjadi insights bisnis yang actionable dengan dashboard interaktif dan machine learning.',
          service_category: 'Data Science',
          price_starting_from: 20000000,
          price_currency: 'IDR',
          estimated_duration: '6-10 minggu',
          service_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          service_features: ['Interactive Dashboards', 'Predictive Analytics', 'Real-time Monitoring', 'Custom Reports'],
          is_active: true
        },
        {
          id: 'ai-automation',
          service_name: 'Process Automation',
          service_description: 'Otomatisasi proses bisnis menggunakan AI dan RPA untuk meningkatkan efisiensi operasional.',
          service_category: 'AI Automation',
          price_starting_from: 30000000,
          price_currency: 'IDR',
          estimated_duration: '8-14 minggu',
          service_image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          service_features: ['RPA Implementation', 'Workflow Optimization', 'AI Integration', 'Performance Monitoring'],
          is_active: true
        },
        {
          id: 'cybersecurity',
          service_name: 'Cybersecurity Solutions',
          service_description: 'Solusi keamanan siber komprehensif untuk melindungi aset digital dan data bisnis Anda.',
          service_category: 'Security',
          price_starting_from: 18000000,
          price_currency: 'IDR',
          estimated_duration: '4-8 minggu',
          service_image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          service_features: ['Penetration Testing', 'Security Audit', 'Incident Response', '24/7 Monitoring'],
          is_active: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const defaultContent: ServicesContent = {
    title: 'Layanan Terbaik Kami',
    description: 'Kami menyediakan berbagai layanan AI dan teknologi untuk mengoptimalkan bisnis Anda'
  };

  const displayContent = content || defaultContent;

  const getServiceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ai solutions': return Brain;
      case 'ai customer service': return Brain;
      case 'ai automation': return Code;
      case 'web development': return Globe;
      case 'mobile development': return Smartphone;
      case 'data science': return Database;
      case 'ai analytics': return Database;
      case 'security': return Shield;
      case 'content generation': return Brain;
      default: return Code;
    }
  };

  const handleServiceClick = (serviceName: string) => {
    const message = `Halo, saya tertarik dengan layanan ${serviceName}. Bisakah kita berdiskusi lebih lanjut mengenai konsultasi gratis?`;
    const whatsappLink = createWhatsAppLink(message);
    window.open(whatsappLink, '_blank');
  };

  const handleServiceDetail = (serviceId: string) => {
    window.location.href = `/services/${serviceId}`;
  };

  if (loading) {
    return (
      <section id="layanan" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-pulse">
            <div className="h-10 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <div key={index} className="bg-gray-100 p-8 rounded-3xl animate-pulse">
                <div className="h-12 w-12 bg-gray-300 rounded-xl mb-6"></div>
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="layanan" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-6">
            {displayContent.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {displayContent.description}
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <Code className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Memuat Layanan...</h3>
            <p className="text-gray-500">Sedang mengambil data layanan dari database</p>
            <button 
              onClick={fetchServices}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Refresh Layanan
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = getServiceIcon(service.service_category);
              return (
                <div 
                  key={service.id} 
                  className="group bg-gradient-to-br from-white to-blue-50 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-100 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full mb-4 font-medium">
                    {service.service_category}
                  </span>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {service.service_name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                    {service.service_description}
                  </p>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleServiceDetail(service.id)}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center font-semibold"
                    >
                      Lihat Detail
                    </button>
                    <button
                      onClick={() => handleServiceClick(service.service_name)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl"
                    >
                      Konsultasi
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;

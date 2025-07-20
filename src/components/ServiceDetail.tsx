
import { ArrowLeft, ExternalLink, Clock, DollarSign, Star, CheckCircle, Phone, Mail, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

interface ServiceDetailProps {
  service: Service;
  onBack: () => void;
}

const ServiceDetail = ({ service, onBack }: ServiceDetailProps) => {
  const { createWhatsAppLink } = useWhatsAppSettings();

  const handleConsultation = () => {
    const message = `Halo! Saya tertarik dengan layanan ${service.service_name}. Bisakah kita berdiskusi tentang kebutuhan saya?`;
    const whatsappUrl = createWhatsAppLink(message);
    window.open(whatsappUrl, '_blank');
  };

  const handleContactForm = () => {
    const element = document.getElementById('contact');
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    } else {
      // If not on main page, navigate to contact section
      window.location.href = '/#contact';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Kembali ke Layanan
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <img 
              src={service.service_image_url} 
              alt={service.service_name}
              className="w-full h-64 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{service.service_name}</h1>
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {service.service_category}
              </span>
            </div>
            <p className="text-xl text-gray-600 mb-4">{service.service_description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Harga Mulai Dari</p>
                    <p className="font-medium text-green-600">
                      {service.price_currency} {service.price_starting_from?.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Estimasi Durasi</p>
                    <p className="font-medium">{service.estimated_duration || 'Tidak disebutkan'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Fitur Layanan</h3>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              {service.service_features && service.service_features.length > 0 ? (
                <ul className="space-y-2">
                  {service.service_features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">Belum ada fitur yang didefinisikan</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 mt-12">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Tertarik dengan Layanan Ini?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Konsultasikan kebutuhan Anda dengan tim ahli kami secara gratis untuk layanan {service.service_name}.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleConsultation}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2 min-w-[200px] justify-center"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Konsultasi via WhatsApp</span>
            </button>
            
            <button
              onClick={handleContactForm}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center space-x-2 min-w-[200px] justify-center"
            >
              <Mail className="h-5 w-5" />
              <span>Kirim Pesan</span>
            </button>
          </div>

          <p className="text-blue-100 text-sm mt-4">
            <Phone className="h-4 w-4 inline mr-1" />
            Atau hubungi langsung: <span className="font-medium">085674722278</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;

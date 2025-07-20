
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ClientLogo {
  id: string;
  name: string;
  logo_url: string;
  company_url?: string;
  display_order: number;
  is_active: boolean;
}

const ClientLogos = () => {
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const { data, error } = await supabase
        .from('client_logos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLogos(data || []);
    } catch (error) {
      console.error('Error fetching logos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced default logos with companies from various sectors
  const defaultLogos: ClientLogo[] = [
    // BUMN
    { id: '1', name: 'Pertamina', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Pertamina_Logo.svg/200px-Pertamina_Logo.svg.png', company_url: 'https://pertamina.com', display_order: 1, is_active: true },
    { id: '2', name: 'PLN', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/PLN_logo.svg/200px-PLN_logo.svg.png', company_url: 'https://pln.co.id', display_order: 2, is_active: true },
    { id: '3', name: 'Telkom Indonesia', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Telkom_Indonesia_2013.svg/200px-Telkom_Indonesia_2013.svg.png', company_url: 'https://telkom.co.id', display_order: 3, is_active: true },
    { id: '4', name: 'Bank Mandiri', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/200px-Bank_Mandiri_logo_2016.svg.png', company_url: 'https://bankmandiri.co.id', display_order: 4, is_active: true },
    
    // Pertambangan
    { id: '5', name: 'Vale Indonesia', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Vale_logo.svg/200px-Vale_logo.svg.png', company_url: 'https://vale.com', display_order: 5, is_active: true },
    { id: '6', name: 'Freeport', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Freeport-McMoRan_Logo.svg/200px-Freeport-McMoRan_Logo.svg.png', company_url: 'https://fcx.com', display_order: 6, is_active: true },
    { id: '7', name: 'Adaro Energy', logo_url: 'https://via.placeholder.com/200x80/1e40af/ffffff?text=ADARO', company_url: 'https://adaro.com', display_order: 7, is_active: true },
    
    // Manufaktur
    { id: '8', name: 'Astra International', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Astra_International_logo.svg/200px-Astra_International_logo.svg.png', company_url: 'https://astra.co.id', display_order: 8, is_active: true },
    { id: '9', name: 'Unilever Indonesia', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Unilever.svg/200px-Unilever.svg.png', company_url: 'https://unilever.co.id', display_order: 9, is_active: true },
    { id: '10', name: 'Indofood', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Indofood_logo.svg/200px-Indofood_logo.svg.png', company_url: 'https://indofood.com', display_order: 10, is_active: true },
    { id: '11', name: 'Kalbe Farma', logo_url: 'https://via.placeholder.com/200x80/059669/ffffff?text=KALBE', company_url: 'https://kalbe.co.id', display_order: 11, is_active: true },
    
    // Logistik
    { id: '12', name: 'JNE', logo_url: 'https://via.placeholder.com/200x80/dc2626/ffffff?text=JNE', company_url: 'https://jne.co.id', display_order: 12, is_active: true },
    { id: '13', name: 'J&T Express', logo_url: 'https://via.placeholder.com/200x80/ea580c/ffffff?text=J%26T', company_url: 'https://jet.co.id', display_order: 13, is_active: true },
    { id: '14', name: 'SiCepat', logo_url: 'https://via.placeholder.com/200x80/7c3aed/ffffff?text=SiCepat', company_url: 'https://sicepat.com', display_order: 14, is_active: true },
    { id: '15', name: 'Pos Indonesia', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Pos_Indonesia_logo.svg/200px-Pos_Indonesia_logo.svg.png', company_url: 'https://posindonesia.co.id', display_order: 15, is_active: true },
    
    // Fashion & Retail
    { id: '16', name: 'Matahari', logo_url: 'https://via.placeholder.com/200x80/dc2626/ffffff?text=MATAHARI', company_url: 'https://matahari.co.id', display_order: 16, is_active: true },
    { id: '17', name: 'Ramayana', logo_url: 'https://via.placeholder.com/200x80/059669/ffffff?text=RAMAYANA', company_url: 'https://ramayana.co.id', display_order: 17, is_active: true },
    { id: '18', name: 'Zalora', logo_url: 'https://via.placeholder.com/200x80/1e40af/ffffff?text=ZALORA', company_url: 'https://zalora.co.id', display_order: 18, is_active: true },
    
    // Tech & E-commerce
    { id: '19', name: 'Gojek', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Gojek_logo_2019.svg/200px-Gojek_logo_2019.svg.png', company_url: 'https://gojek.com', display_order: 19, is_active: true },
    { id: '20', name: 'Tokopedia', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Tokopedia.svg/200px-Tokopedia.svg.png', company_url: 'https://tokopedia.com', display_order: 20, is_active: true },
    { id: '21', name: 'Shopee', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopee_logo.svg/200px-Shopee_logo.svg.png', company_url: 'https://shopee.co.id', display_order: 21, is_active: true },
    { id: '22', name: 'Bukalapak', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bukalapak_official_logo.svg/200px-Bukalapak_official_logo.svg.png', company_url: 'https://bukalapak.com', display_order: 22, is_active: true },
    
    // Financial
    { id: '23', name: 'BCA', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/BCA_logo.svg/200px-BCA_logo.svg.png', company_url: 'https://bca.co.id', display_order: 23, is_active: true },
    { id: '24', name: 'OVO', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/200px-Logo_ovo_purple.svg.png', company_url: 'https://ovo.id', display_order: 24, is_active: true }
  ];

  const displayLogos = logos.length > 0 ? logos : defaultLogos;

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="h-16 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-4">
            Dipercaya oleh Perusahaan Terkemuka
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Lebih dari {displayLogos.length}+ perusahaan besar Indonesia dari berbagai sektor telah mempercayakan transformasi digital mereka kepada kami
          </p>
        </div>

        {/* Running Text Logo Slider */}
        <div className="relative mb-16 marquee-container">
          <div className="flex overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {/* First set of logos */}
              {displayLogos.map((logo, index) => (
                <div 
                  key={`${logo.id}-1`}
                  className="mx-6 flex items-center justify-center min-w-[180px] h-24 group"
                >
                  {logo.company_url ? (
                    <a
                      href={logo.company_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full h-full p-6 rounded-2xl bg-white/70 hover:bg-white transition-all duration-300 hover:shadow-xl hover:scale-110 border border-gray-100"
                    >
                      <img 
                        src={logo.logo_url} 
                        alt={logo.name}
                        className="max-h-14 max-w-[160px] w-auto object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/160x56/f3f4f6/6b7280?text=${logo.name.replace(' ', '+')}`;
                        }}
                      />
                    </a>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full p-6 rounded-2xl bg-white/70 hover:bg-white transition-all duration-300 hover:shadow-xl hover:scale-110 border border-gray-100">
                      <img 
                        src={logo.logo_url} 
                        alt={logo.name}
                        className="max-h-14 max-w-[160px] w-auto object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/160x56/f3f4f6/6b7280?text=${logo.name.replace(' ', '+')}`;
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex animate-marquee2 whitespace-nowrap" aria-hidden="true">
              {/* Second set of logos for seamless loop */}
              {displayLogos.map((logo, index) => (
                <div 
                  key={`${logo.id}-2`}
                  className="mx-6 flex items-center justify-center min-w-[180px] h-24 group"
                >
                  {logo.company_url ? (
                    <a
                      href={logo.company_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full h-full p-6 rounded-2xl bg-white/70 hover:bg-white transition-all duration-300 hover:shadow-xl hover:scale-110 border border-gray-100"
                    >
                      <img 
                        src={logo.logo_url} 
                        alt={logo.name}
                        className="max-h-14 max-w-[160px] w-auto object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/160x56/f3f4f6/6b7280?text=${logo.name.replace(' ', '+')}`;
                        }}
                      />
                    </a>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full p-6 rounded-2xl bg-white/70 hover:bg-white transition-all duration-300 hover:shadow-xl hover:scale-110 border border-gray-100">
                      <img 
                        src={logo.logo_url} 
                        alt={logo.name}
                        className="max-h-14 max-w-[160px] w-auto object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/160x56/f3f4f6/6b7280?text=${logo.name.replace(' ', '+')}`;
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Trust indicators with sector breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="text-2xl font-bold text-blue-600 mb-2">5+</div>
            <div className="text-gray-600 text-sm">BUMN</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="text-2xl font-bold text-green-600 mb-2">8+</div>
            <div className="text-gray-600 text-sm">Manufaktur</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="text-2xl font-bold text-purple-600 mb-2">4+</div>
            <div className="text-gray-600 text-sm">Logistik</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="text-2xl font-bold text-orange-600 mb-2">3+</div>
            <div className="text-gray-600 text-sm">Fashion</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="text-2xl font-bold text-red-600 mb-2">3+</div>
            <div className="text-gray-600 text-sm">Pertambangan</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;

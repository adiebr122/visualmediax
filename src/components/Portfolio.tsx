import { useState, useEffect } from 'react';
import { ExternalLink, Github, ArrowRight, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  title: string;
  description: string;
  detailed_description?: string;
  image_url: string;
  gallery_images?: string[];
  client: string;
  category: string;
  technologies: string[];
  demo_url?: string;
  github_url?: string;
  project_duration?: string;
  team_size?: string;
  challenges?: string;
  solutions?: string;
  results?: string;
}

interface PortfolioContent {
  title: string;
  description: string;
  projects: Project[];
}

const Portfolio = () => {
  const [content, setContent] = useState<PortfolioContent>({
    title: 'Portfolio Proyek Terbaik',
    description: 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
    projects: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // Try to get portfolio content from website_content table
      const { data: websiteContent, error: websiteError } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'portfolio')
        .eq('is_active', true)
        .maybeSingle();

      if (websiteError && websiteError.code !== 'PGRST116') {
        console.error('Error fetching website content:', websiteError);
      }

      if (websiteContent && websiteContent.metadata) {
        // Type-safe metadata access
        const metadata = websiteContent.metadata as { projects?: Project[] };
        if (metadata && Array.isArray(metadata.projects)) {
          setContent({
            title: websiteContent.title || 'Portfolio Proyek Terbaik',
            description: websiteContent.content || 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
            projects: metadata.projects
          });
        } else {
          setContent({
            title: 'Portfolio Proyek Terbaik',
            description: 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
            projects: getDefaultProjects()
          });
        }
      } else {
        // If no content found, set default content
        setContent({
          title: 'Portfolio Proyek Terbaik',
          description: 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
          projects: getDefaultProjects()
        });
      }
    } catch (error) {
      console.error('Error fetching portfolio content:', error);
      // Set default content on error
      setContent({
        title: 'Portfolio Proyek Terbaik',
        description: 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
        projects: getDefaultProjects()
      });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultProjects = (): Project[] => [
    {
      title: 'AI Chatbot Bank Digital',
      description: 'Chatbot AI canggih untuk layanan perbankan digital yang dapat menangani 10,000+ query harian dengan akurasi 95%.',
      detailed_description: 'Sistem chatbot AI yang dirancang khusus untuk industri perbankan dengan kemampuan natural language processing yang canggih. Chatbot ini dapat menangani berbagai jenis pertanyaan nasabah mulai dari informasi saldo, transfer dana, hingga layanan customer service 24/7.',
      image_url: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      client: 'Bank Central Asia',
      category: 'AI Chatbot',
      technologies: ['Python', 'TensorFlow', 'NLP', 'React', 'Node.js', 'PostgreSQL'],
      demo_url: 'https://demo.example.com/chatbot',
      github_url: 'https://github.com/example/ai-chatbot',
      project_duration: '6 bulan',
      team_size: '8 developer, 2 AI specialist, 1 project manager',
      challenges: 'Membangun sistem yang dapat memahami bahasa Indonesia dengan berbagai dialek dan slang, serta mengintegrasikan dengan sistem perbankan yang kompleks.',
      solutions: 'Menggunakan model NLP yang dilatih khusus untuk bahasa Indonesia dan implementasi API gateway yang aman untuk integrasi banking system.',
      results: 'Berhasil mengurangi beban customer service hingga 70% dan meningkatkan kepuasan nasabah dengan response time rata-rata 2 detik.'
    },
    {
      title: 'E-commerce Platform',
      description: 'Platform e-commerce lengkap dengan sistem rekomendasi AI yang meningkatkan conversion rate hingga 40%.',
      detailed_description: 'Platform e-commerce modern dengan fitur marketplace, sistem pembayaran terintegrasi, dan algoritma rekomendasi produk berbasis machine learning untuk meningkatkan pengalaman berbelanja pengguna.',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      client: 'Tokopedia',
      category: 'Web Development',
      technologies: ['React', 'Node.js', 'MongoDB', 'AI/ML', 'AWS', 'Redis'],
      demo_url: 'https://demo.example.com/ecommerce',
      project_duration: '8 bulan',
      team_size: '12 developer, 3 designer, 2 devops engineer',
      challenges: 'Menangani traffic tinggi pada event flash sale dan mengintegrasikan multiple payment gateway dengan tingkat keamanan tinggi.',
      solutions: 'Implementasi microservices architecture dengan load balancing dan caching strategy yang optimal, serta enkripsi end-to-end untuk payment processing.',
      results: 'Platform mampu menangani 100,000+ concurrent users dengan uptime 99.9% dan peningkatan conversion rate 40%.'
    },
    {
      title: 'Mobile App Ride Sharing',
      description: 'Aplikasi ride sharing dengan AI route optimization yang mengurangi waktu tempuh hingga 25%.',
      detailed_description: 'Aplikasi mobile ride sharing dengan teknologi GPS tracking real-time, sistem matching driver-passenger otomatis, dan algoritma optimasi rute berbasis AI untuk efisiensi maksimal.',
      image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      client: 'Gojek Indonesia',
      category: 'Mobile App',
      technologies: ['React Native', 'Python', 'Machine Learning', 'Google Maps API', 'Firebase'],
      demo_url: 'https://demo.example.com/ridesharing',
      project_duration: '10 bulan',
      team_size: '15 developer, 4 mobile specialist, 2 ML engineer',
      challenges: 'Mengoptimalkan algoritma matching dan routing dalam kondisi traffic padat serta memastikan akurasi lokasi yang presisi.',
      solutions: 'Pengembangan algoritma machine learning untuk prediksi traffic pattern dan implementasi GPS correction algorithm untuk akurasi lokasi.',
      results: 'Pengurangan waktu tunggu driver rata-rata 30% dan efisiensi rute yang menghemat waktu tempuh hingga 25%.'
    },
    {
      title: 'Sistem Manajemen Rumah Sakit',
      description: 'Platform terintegrasi untuk manajemen rumah sakit dengan fitur AI diagnosis support dan electronic medical records.',
      detailed_description: 'Sistem informasi rumah sakit komprehensif yang mengintegrasikan manajemen pasien, jadwal dokter, billing system, dan fitur AI assistant untuk membantu diagnosis awal berdasarkan gejala yang diinput.',
      image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      client: 'RS Siloam',
      category: 'Healthcare System',
      technologies: ['Vue.js', 'Laravel', 'MySQL', 'AI/ML', 'HL7 FHIR', 'Docker'],
      demo_url: 'https://demo.example.com/hospital',
      project_duration: '12 bulan',
      team_size: '20 developer, 5 healthcare specialist, 3 security expert',
      challenges: 'Memastikan keamanan data kesehatan sesuai standar internasional dan integrasi dengan berbagai medical devices.',
      solutions: 'Implementasi enkripsi tingkat enterprise, audit trail system, dan standardisasi HL7 FHIR untuk interoperability.',
      results: 'Efisiensi operasional rumah sakit meningkat 60% dengan pengurangan waktu administrasi dan peningkatan akurasi diagnosis.'
    },
    {
      title: 'Smart City Dashboard',
      description: 'Dashboard analitik real-time untuk monitoring dan manajemen kota cerdas dengan IoT integration.',
      detailed_description: 'Platform dashboard yang mengintegrasikan data dari berbagai sensor IoT di seluruh kota untuk monitoring traffic, kualitas udara, konsumsi energi, dan layanan publik dalam satu interface yang komprehensif.',
      image_url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      client: 'Pemerintah DKI Jakarta',
      category: 'IoT & Analytics',
      technologies: ['Angular', 'Spring Boot', 'Apache Kafka', 'Elasticsearch', 'Grafana', 'IoT Sensors'],
      demo_url: 'https://demo.example.com/smartcity',
      project_duration: '15 bulan',
      team_size: '25 developer, 5 IoT specialist, 3 data scientist',
      challenges: 'Mengintegrasikan data dari ribuan sensor dengan protokol berbeda dan memastikan real-time processing untuk data yang massive.',
      solutions: 'Arsitektur event-driven dengan Apache Kafka untuk data streaming dan implementasi data lake untuk storage dan analytics.',
      results: 'Peningkatan efisiensi traffic management 35% dan respons time emergency services berkurang 40%.'
    },
    {
      title: 'Financial Trading Platform',
      description: 'Platform trading online dengan algoritma AI untuk analisis pasar dan automated trading strategies.',
      detailed_description: 'Platform trading saham dan cryptocurrency dengan fitur real-time market data, technical analysis tools, dan algoritma machine learning untuk prediksi trend pasar dan automated trading.',
      image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      client: 'PT Indo Premier Sekuritas',
      category: 'Fintech',
      technologies: ['React', 'Python', 'TensorFlow', 'WebSocket', 'Redis', 'PostgreSQL'],
      demo_url: 'https://demo.example.com/trading',
      project_duration: '9 bulan',
      team_size: '18 developer, 4 financial analyst, 3 ML engineer',
      challenges: 'Memproses data market real-time dengan latency rendah dan memastikan keamanan transaksi finansial tingkat bank.',
      solutions: 'Implementasi low-latency architecture dengan WebSocket connections dan multi-layer security with 2FA and biometric authentication.',
      results: 'Platform mampu memproses 50,000+ transaksi per detik dengan latency rata-rata 10ms and 99.99% security.'
    }
  ];

  if (loading) {
    return (
      <section id="portfolio" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-pulse">
            <div className="h-10 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-6">
            {content.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {content.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.projects.map((project, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={project.image_url} 
                  alt={project.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {project.category}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{project.client}</p>
                <p className="text-gray-700 mb-4 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 3).map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      +{project.technologies.length - 3} lainnya
                    </span>
                  )}
                </div>
                
                {(project.project_duration || project.team_size) && (
                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                    {project.project_duration && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{project.project_duration}</span>
                      </div>
                    )}
                    {project.team_size && (
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{project.team_size}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <Link
                    to={`/portfolio/${index}`}
                    className="group/btn text-blue-600 hover:text-blue-800 transition-colors flex items-center text-sm font-medium"
                  >
                    Lihat Detail
                    <ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PortfolioDetail from '@/components/PortfolioDetail';

interface Project {
  title: string;
  description: string;
  detailed_description: string;
  image_url: string;
  gallery_images: string[];
  client: string;
  category: string;
  technologies: string[];
  demo_url?: string;
  github_url?: string;
  project_duration: string;
  team_size: string;
  challenges: string;
  solutions: string;
  results: string;
}

const PortfolioDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      console.log('Fetching project with id:', id);
      
      // Get portfolio content from website_content table
      const { data: websiteContent, error: websiteError } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'portfolio')
        .eq('is_active', true)
        .maybeSingle();

      if (websiteError && websiteError.code !== 'PGRST116') {
        console.error('Error fetching website content:', websiteError);
      }

      let projects: Project[] = [];

      if (websiteContent && websiteContent.metadata) {
        // Type-safe metadata access
        const metadata = websiteContent.metadata as { projects?: Project[] };
        if (metadata && Array.isArray(metadata.projects)) {
          projects = metadata.projects;
          console.log('Loaded projects from admin:', projects.length);
        } else {
          projects = getDefaultProjects();
          console.log('Using default projects');
        }
      } else {
        // Use default projects if no admin data
        projects = getDefaultProjects();
        console.log('No admin data found, using default projects');
      }

      const projectIndex = parseInt(id || '0');
      console.log('Project index:', projectIndex, 'Total projects:', projects.length);
      
      if (projectIndex >= 0 && projectIndex < projects.length) {
        const selectedProject = projects[projectIndex];
        // Ensure all required fields are present
        const projectWithDefaults: Project = {
          title: selectedProject.title || '',
          description: selectedProject.description || '',
          detailed_description: selectedProject.detailed_description || selectedProject.description || '',
          image_url: selectedProject.image_url || '',
          gallery_images: selectedProject.gallery_images || [],
          client: selectedProject.client || '',
          category: selectedProject.category || '',
          technologies: selectedProject.technologies || [],
          demo_url: selectedProject.demo_url,
          github_url: selectedProject.github_url,
          project_duration: selectedProject.project_duration || '',
          team_size: selectedProject.team_size || '',
          challenges: selectedProject.challenges || '',
          solutions: selectedProject.solutions || '',
          results: selectedProject.results || ''
        };
        console.log('Selected project:', projectWithDefaults);
        setProject(projectWithDefaults);
      } else {
        console.log('Project not found, redirecting to 404');
        navigate('/404');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      navigate('/404');
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

  const handleBack = () => {
    navigate('/#portfolio');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Proyek Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">Maaf, proyek yang Anda cari tidak ditemukan.</p>
            <button
              onClick={handleBack}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PortfolioDetail project={project} onBack={handleBack} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PortfolioDetailPage;

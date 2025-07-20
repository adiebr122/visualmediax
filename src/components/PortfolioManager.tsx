
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Save, 
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { ProjectCard } from './portfolio/ProjectCard';
import { ProjectForm } from './portfolio/ProjectForm';
import { PortfolioHeader } from './portfolio/PortfolioHeader';

interface Project {
  id?: string;
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

interface PortfolioContent {
  title: string;
  description: string;
  projects: Project[];
}

interface PortfolioManagerProps {
  onProjectSelect?: (project: Project) => void;
}

const PortfolioManager = ({ onProjectSelect }: PortfolioManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState<PortfolioContent>({
    title: 'Portfolio Proyek Terbaik',
    description: 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
    projects: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formProject, setFormProject] = useState<Project>({
    title: '',
    description: '',
    detailed_description: '',
    image_url: '',
    gallery_images: [],
    client: '',
    category: '',
    technologies: [],
    demo_url: '',
    github_url: '',
    project_duration: '',
    team_size: '',
    challenges: '',
    solutions: '',
    results: ''
  });

  useEffect(() => {
    if (user) {
      fetchContent();
    }
  }, [user]);

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

  const fetchContent = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching portfolio content for user:', user.id);
      
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'portfolio')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching portfolio content:', error);
        throw error;
      }

      if (data && data.metadata) {
        console.log('Found portfolio data:', data);
        const metadata = data.metadata as any;
        setContent({
          title: data.title || 'Portfolio Proyek Terbaik',
          description: data.content || 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
          projects: metadata.projects || []
        });
      } else {
        console.log('No portfolio data found, using default projects');
        const defaultProjects = getDefaultProjects();
        setContent({
          title: 'Portfolio Proyek Terbaik',
          description: 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
          projects: defaultProjects
        });
      }
    } catch (error) {
      console.error('Error fetching portfolio content:', error);
      
      const defaultProjects = getDefaultProjects();
      setContent({
        title: 'Portfolio Proyek Terbaik',
        description: 'Lihat hasil karya terbaik kami dalam mengembangkan solusi AI dan aplikasi untuk berbagai industri.',
        projects: defaultProjects
      });
      
      toast({
        title: "Info",
        description: "Menggunakan data portfolio default",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveContentToDatabase = async (updatedContent: PortfolioContent) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Anda harus login untuk menyimpan konten",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      console.log('Saving portfolio content:', updatedContent);
      
      // First, try to find existing record
      const { data: existingData } = await supabase
        .from('website_content')
        .select('id')
        .eq('section', 'portfolio')
        .eq('user_id', user.id)
        .maybeSingle();

      let result;
      
      if (existingData) {
        // Update existing record
        result = await supabase
          .from('website_content')
          .update({
            title: updatedContent.title,
            content: updatedContent.description,
            metadata: { projects: updatedContent.projects } as any,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id)
          .eq('user_id', user.id);
      } else {
        // Insert new record
        result = await supabase
          .from('website_content')
          .insert({
            section: 'portfolio',
            title: updatedContent.title,
            content: updatedContent.description,
            metadata: { projects: updatedContent.projects } as any,
            user_id: user.id,
            is_active: true
          });
      }

      if (result.error) {
        console.error('Database error:', result.error);
        throw result.error;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving portfolio content:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan konten portfolio",
        variant: "destructive",
      });
      return false;
    }
  };

  const saveContent = async () => {
    setSaving(true);
    const success = await saveContentToDatabase(content);
    if (success) {
      toast({
        title: "Berhasil",
        description: "Konten portfolio berhasil disimpan",
        variant: "default",
      });
    }
    setSaving(false);
  };

  const resetForm = () => {
    setFormProject({
      title: '',
      description: '',
      detailed_description: '',
      image_url: '',
      gallery_images: [],
      client: '',
      category: '',
      technologies: [],
      demo_url: '',
      github_url: '',
      project_duration: '',
      team_size: '',
      challenges: '',
      solutions: '',
      results: ''
    });
    setEditingIndex(null);
    setShowProjectForm(false);
  };

  const addProject = () => {
    resetForm();
    setShowProjectForm(true);
  };

  const editProject = (project: Project, index: number) => {
    console.log('Editing project at index:', index, project);
    setFormProject({ ...project });
    setEditingIndex(index);
    setShowProjectForm(true);
  };

  const deleteProject = async (index: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus proyek ini?')) {
      console.log('Deleting project at index:', index);
      const newProjects = content.projects.filter((_, i) => i !== index);
      const updatedContent = { ...content, projects: newProjects };
      
      // Save to database immediately
      const success = await saveContentToDatabase(updatedContent);
      if (success) {
        setContent(updatedContent);
        toast({
          title: "Berhasil",
          description: "Proyek berhasil dihapus dan perubahan disimpan",
          variant: "default",
        });
      }
    }
  };

  const saveProject = async (project: Project) => {
    console.log('Saving project:', project);
    const newProjects = [...content.projects];
    
    if (editingIndex !== null) {
      console.log('Updating project at index:', editingIndex);
      newProjects[editingIndex] = { ...project };
    } else {
      console.log('Adding new project');
      newProjects.push({ ...project });
    }

    const updatedContent = { ...content, projects: newProjects };
    
    // Save to database immediately
    const success = await saveContentToDatabase(updatedContent);
    if (success) {
      setContent(updatedContent);
      resetForm();
      
      toast({
        title: "Berhasil",
        description: editingIndex !== null ? "Proyek berhasil diperbarui dan disimpan" : "Proyek berhasil ditambahkan dan disimpan",
        variant: "default",
      });
    }
  };

  // Filter projects based on search term and category
  const filteredProjects = content.projects.filter(project => {
    const matchesSearch = searchTerm === '' || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === '' || project.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(content.projects.map(project => project.category))];

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Login Diperlukan</h3>
        <p className="text-gray-500">Anda harus login untuk mengelola portfolio</p>
      </div>
    );
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
          <h2 className="text-2xl font-bold text-gray-900">Kelola Portfolio</h2>
          <p className="text-gray-600 mt-1">Total proyek: {content.projects.length} | Ditampilkan: {filteredProjects.length}</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={saveContent}
            disabled={saving}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Menyimpan...' : 'Simpan Header & Deskripsi'}
          </Button>
        </div>
      </div>

      <PortfolioHeader
        title={content.title}
        description={content.description}
        onTitleChange={(title) => setContent({ ...content, title })}
        onDescriptionChange={(description) => setContent({ ...content, description })}
      />

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
                  placeholder="Cari proyek berdasarkan nama, deskripsi, klien, atau teknologi..."
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
          <CardTitle>Daftar Proyek Portfolio ({filteredProjects.length})</CardTitle>
          <Button
            onClick={addProject}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Proyek
          </Button>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {content.projects.length === 0 ? 'Belum Ada Proyek' : 'Tidak Ada Proyek yang Sesuai Filter'}
              </h3>
              <p className="text-gray-500 mb-4">
                {content.projects.length === 0 
                  ? 'Mulai dengan menambahkan proyek portfolio pertama Anda'
                  : 'Coba ubah kata kunci pencarian atau filter kategori'
                }
              </p>
              {content.projects.length === 0 && (
                <Button onClick={addProject} className="bg-blue-600 text-white hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Proyek Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => {
                const originalIndex = content.projects.findIndex(p => p === project);
                return (
                  <ProjectCard
                    key={`${project.title}-${originalIndex}`}
                    project={project}
                    index={originalIndex}
                    onEdit={editProject}
                    onDelete={deleteProject}
                    onView={onProjectSelect}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ProjectForm
              project={formProject}
              isEditing={editingIndex !== null}
              onSave={saveProject}
              onCancel={resetForm}
              onChange={setFormProject}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;

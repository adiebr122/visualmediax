import { ArrowLeft, ExternalLink, Github, Calendar, Users, Target, CheckCircle, Award, Phone, Mail, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';

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

interface PortfolioDetailProps {
  project: Project;
  onBack: () => void;
}

const PortfolioDetail = ({ project, onBack }: PortfolioDetailProps) => {
  const { createWhatsAppLink } = useWhatsAppSettings();

  const handleConsultation = () => {
    const message = `Halo! Saya tertarik dengan proyek ${project.title} yang ada di portfolio Anda. Bisakah kita berdiskusi tentang proyek serupa untuk bisnis saya?`;
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
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali ke Portfolio
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <img 
                src={project.image_url} 
                alt={project.title}
                className="w-full h-64 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                }}
              />
            </div>

            {project.gallery_images && project.gallery_images.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Galeri Proyek</h4>
                <div className="grid grid-cols-2 gap-4">
                  {project.gallery_images.map((img, idx) => (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>
                        <div className="cursor-pointer hover:scale-105 transition-transform duration-200">
                          <img
                            src={img}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="p-0 border-0 bg-transparent shadow-lg">
                        <div className="bg-white rounded-lg border shadow-lg overflow-hidden">
                          <img
                            src={img}
                            alt={`Gallery ${idx + 1} - Enlarged`}
                            className="w-80 h-60 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {project.category}
                </span>
              </div>
              <p className="text-xl text-gray-600 mb-4">{project.description}</p>
              <p className="text-gray-700 leading-relaxed">{project.detailed_description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Durasi Proyek</p>
                      <p className="font-medium">{project.project_duration || 'Tidak disebutkan'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Tim</p>
                      <p className="font-medium">{project.team_size || 'Tidak disebutkan'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Teknologi yang Digunakan</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Lihat Demo
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <Github className="h-4 w-4 mr-2" />
                  Source Code
                </a>
              )}
            </div>
          </div>
        </div>

        {(project.challenges || project.solutions || project.results) && (
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detail Proyek</h2>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {project.challenges && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Target className="h-6 w-6 text-red-600" />
                      <h3 className="text-lg font-semibold">Tantangan</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{project.challenges}</p>
                  </CardContent>
                </Card>
              )}

              {project.solutions && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                      <h3 className="text-lg font-semibold">Solusi</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{project.solutions}</p>
                  </CardContent>
                </Card>
              )}

              {project.results && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Award className="h-6 w-6 text-green-600" />
                      <h3 className="text-lg font-semibold">Hasil</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{project.results}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Call to Action Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 mt-12">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Tertarik dengan Proyek Serupa?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Kami siap membantu mewujudkan visi digital Anda dengan solusi yang inovatif dan berkualitas tinggi seperti proyek {project.title}.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">Konsultasi Gratis</h3>
                <p className="text-blue-100 text-sm">Diskusi kebutuhan proyek Anda</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">Solusi Custom</h3>
                <p className="text-blue-100 text-sm">Dibuat sesuai kebutuhan bisnis</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">Hasil Berkualitas</h3>
                <p className="text-blue-100 text-sm">Standar industri terbaik</p>
              </div>
            </div>

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
    </TooltipProvider>
  );
};

export default PortfolioDetail;


import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Youtube, Twitter, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContactInfo } from '@/hooks/useContactInfo';
import { useSocialMediaSettings } from '@/hooks/useSocialMediaSettings';
import { useCopyrightSettings } from '@/hooks/useCopyrightSettings';

const Footer = () => {
  const { contactInfo, loading } = useContactInfo();
  const { socialMediaSettings, loading: socialLoading } = useSocialMediaSettings();
  const { copyrightSettings, loading: copyrightLoading } = useCopyrightSettings();

  const formatAddress = (address: string) => {
    return address.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < address.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'facebook_url': return Facebook;
      case 'instagram_url': return Instagram;
      case 'linkedin_url': return Linkedin;
      case 'youtube_url': return Youtube;
      case 'twitter_url': return Twitter;
      default: return Globe;
    }
  };

  const getSocialLabel = (platform: string) => {
    switch (platform) {
      case 'facebook_url': return 'Facebook';
      case 'instagram_url': return 'Instagram';
      case 'linkedin_url': return 'LinkedIn';
      case 'youtube_url': return 'YouTube';
      case 'twitter_url': return 'Twitter/X';
      case 'tiktok_url': return 'TikTok';
      case 'whatsapp_url': return 'WhatsApp';
      case 'telegram_url': return 'Telegram';
      default: return platform;
    }
  };

  const getCopyrightText = () => {
    if (copyrightSettings.copyright_text) {
      return copyrightSettings.copyright_text;
    }
    
    const year = copyrightSettings.copyright_year || '2024';
    const company = copyrightSettings.copyright_company || 'Visual Media X';
    return `© ${year} ${company}. All rights reserved.`;
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/a31e965f-5dde-4e87-8495-27e1458b7a39.png" 
                alt="Visual Media X" 
                className="h-16 w-auto"
              />
            </div>
            <p className="text-gray-300 leading-relaxed">
              Leading digital agency di Indonesia yang menghadirkan solusi web development, 
              mobile apps, dan teknologi AI untuk transformasi digital perusahaan.
            </p>
            {!socialLoading && (
              <div className="flex flex-wrap gap-4">
                {Object.entries(socialMediaSettings).map(([platform, url]) => {
                  if (!url) return null;
                  const IconComponent = getSocialIcon(platform);
                  const label = getSocialLabel(platform);
                  
                  return (
                    <a 
                      key={platform}
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                      title={label}
                    >
                      <IconComponent className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Layanan Kami</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Web Development</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Mobile App Development</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">AI Chatbot Development</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Custom AI Application</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Data Analytics & Insights</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">AI Content Generation</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Link Cepat</h3>
            <ul className="space-y-3">
              <li><a href="/" className="text-gray-300 hover:text-blue-400 transition-colors">Beranda</a></li>
              <li><a href="#layanan" className="text-gray-300 hover:text-blue-400 transition-colors">Layanan</a></li>
              <li><a href="#portfolio" className="text-gray-300 hover:text-blue-400 transition-colors">Portfolio</a></li>
              <li><a href="#testimoni" className="text-gray-300 hover:text-blue-400 transition-colors">Testimoni</a></li>
              <li><a href="#kontak" className="text-gray-300 hover:text-blue-400 transition-colors">Kontak</a></li>
              <li><Link to="/admin" className="text-gray-300 hover:text-blue-400 transition-colors">Admin</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Kontak</h3>
            {!loading && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">{contactInfo.company_phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">{contactInfo.company_email}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-400 mt-1" />
                  <span className="text-gray-300">
                    {formatAddress(contactInfo.company_address)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          {!copyrightLoading && (
            <p className="text-gray-400">
              {getCopyrightText()}
              {(copyrightSettings.privacy_policy_url || copyrightSettings.terms_of_service_url) && (
                <>
                  {' | '}
                  {copyrightSettings.privacy_policy_url && (
                    <a 
                      href={copyrightSettings.privacy_policy_url} 
                      className="hover:text-blue-400 transition-colors ml-1"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                  )}
                  {copyrightSettings.privacy_policy_url && copyrightSettings.terms_of_service_url && ' | '}
                  {copyrightSettings.terms_of_service_url && (
                    <a 
                      href={copyrightSettings.terms_of_service_url} 
                      className="hover:text-blue-400 transition-colors ml-1"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Terms of Service
                    </a>
                  )}
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

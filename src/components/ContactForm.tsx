
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useContactInfo } from '@/hooks/useContactInfo';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { contactInfo, loading: contactLoading } = useContactInfo();
  const { createWhatsAppLink } = useWhatsAppSettings();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save form submission to database
      const { error } = await supabase
        .from('form_submissions')
        .insert([{
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          service: formData.service,
          message: formData.message,
          form_type: 'contact',
          status: 'new'
        }]);

      if (error) throw error;

      toast({
        title: "Pesan Terkirim!",
        description: "Terima kasih atas pesan Anda. Tim kami akan segera menghubungi Anda.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        service: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Gagal mengirim pesan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppConsultation = () => {
    const message = `Halo, saya ingin konsultasi gratis.

Nama: ${formData.name || '[Belum diisi]'}
Email: ${formData.email || '[Belum diisi]'}
Perusahaan: ${formData.company || '[Belum diisi]'}
Telepon: ${formData.phone || '[Belum diisi]'}
Layanan: ${formData.service || '[Belum diisi]'}
Pesan: ${formData.message || '[Belum diisi]'}

Terima kasih!`;

    const whatsappLink = createWhatsAppLink(message);
    window.open(whatsappLink, '_blank');
  };

  const formatAddress = (address: string) => {
    return address.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < address.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <section id="kontak" className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Hubungi Kami</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ada pertanyaan atau ingin memulai proyek? Hubungi tim kami untuk konsultasi gratis.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900">Informasi Kontak</h3>
              
              {contactLoading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Telepon</h4>
                      <p className="text-lg font-semibold text-gray-900">{contactInfo.company_phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Email</h4>
                      <p className="text-lg font-semibold text-gray-900">{contactInfo.company_email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Alamat</h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatAddress(contactInfo.company_address)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <MessageCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">WhatsApp</h4>
                      <Button 
                        onClick={handleWhatsAppConsultation}
                        className="mt-2 bg-green-500 hover:bg-green-600 flex items-center space-x-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Chat via WhatsApp</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="md:col-span-3">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900">Kirim Pesan</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Masukkan email"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">Nama Perusahaan</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama perusahaan"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service">Layanan yang Diminati</Label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih Layanan</option>
                    <option value="AI Chatbot Development">AI Chatbot Development</option>
                    <option value="AI Customer Service">AI Customer Service</option>
                    <option value="Custom Web Development">Custom Web Development</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                    <option value="Data Analytics & BI">Data Analytics & BI</option>
                    <option value="Process Automation">Process Automation</option>
                    <option value="Cybersecurity Solutions">Cybersecurity Solutions</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Pesan</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Deskripsikan kebutuhan atau pertanyaan Anda"
                    rows={5}
                    required
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <Button 
                    type="submit" 
                    className="flex-1 py-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengirim...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Send className="mr-2 h-5 w-5" />
                        Kirim Pesan
                      </span>
                    )}
                  </Button>
                  
                  <Button 
                    type="button"
                    className="flex-1 bg-green-500 hover:bg-green-600 py-6"
                    onClick={handleWhatsAppConsultation}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Konsultasi via WhatsApp
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;

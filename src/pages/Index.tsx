
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import ClientLogos from '@/components/ClientLogos';
import Testimonials from '@/components/Testimonials';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import LiveChat from '@/components/LiveChat';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <ClientLogos />
      <Services />
      <Portfolio />
      <Testimonials />
      <ContactForm />
      <Footer />
      <LiveChat />
    </div>
  );
};

export default Index;

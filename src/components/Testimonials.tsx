
import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  client_name: string;
  client_company: string | null;
  client_position: string | null;
  rating: number;
  testimonial_text: string;
  client_photo_url: string | null;
  is_featured: boolean;
  is_active: boolean;
}

interface TestimonialsContent {
  title: string;
  description: string;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [content, setContent] = useState<TestimonialsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchContent();
    fetchTestimonials();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'testimonials')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setContent({
          title: data.title || 'Testimoni Klien Terpercaya',
          description: data.content || 'Dengarkan pengalaman klien-klien kami yang telah merasakan transformasi bisnis melalui implementasi solusi AI yang kami kembangkan.'
        });
      }
    } catch (error) {
      console.error('Error fetching testimonials content:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Fallback to static data if fetch fails
      setTestimonials([
        {
          id: 'fallback-1',
          client_name: 'Budi Santoso',
          client_position: 'CEO',
          client_company: 'PT Telkom Indonesia',
          client_photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
          rating: 5,
          testimonial_text: 'AI Consultant Pro telah mentransformasi operasional kami dengan chatbot AI yang luar biasa. Customer satisfaction meningkat 40% dan response time berkurang drastis. Tim mereka sangat profesional dan hasil kerjanya melebihi ekspektasi.',
          is_featured: true,
          is_active: true
        },
        {
          id: 'fallback-2',
          client_name: 'Sari Dewi',
          client_position: 'Director of Digital Innovation',
          client_company: 'Bank Central Asia',
          client_photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b5e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
          rating: 5,
          testimonial_text: 'Implementasi AI untuk fraud detection yang mereka kembangkan berhasil mengurangi kerugian hingga 60%. Sistem prediktif yang akurat dan real-time monitoring sangat membantu keamanan transaksi nasabah kami.',
          is_featured: true,
          is_active: true
        },
        {
          id: 'fallback-3',
          client_name: 'Ahmad Rahman',
          client_position: 'Head of Technology',
          client_company: 'Gojek Indonesia',
          client_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
          rating: 5,
          testimonial_text: 'Kerjasama dengan AI Consultant Pro dalam pengembangan algoritma machine learning untuk route optimization sangat memuaskan. Efisiensi delivery meningkat 35% dan driver experience menjadi lebih optimal.',
          is_featured: true,
          is_active: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const defaultContent: TestimonialsContent = {
    title: 'Testimoni Klien Terpercaya',
    description: 'Dengarkan pengalaman klien-klien kami yang telah merasakan transformasi bisnis melalui implementasi solusi AI yang kami kembangkan.'
  };

  const displayContent = content || defaultContent;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, testimonials.length));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % Math.max(1, testimonials.length));
  };

  // Auto-slide functionality
  useEffect(() => {
    if (testimonials.length > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [testimonials.length]);

  if (loading) {
    return (
      <section id="testimoni" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-pulse">
            <div className="h-10 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl shadow-lg animate-pulse">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mr-4"></div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimoni" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-6">
            {displayContent.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {displayContent.description}
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-12">
            <Quote className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Testimoni</h3>
            <p className="text-gray-500">Testimoni dari klien akan ditampilkan di sini</p>
          </div>
        ) : (
          <>
            {/* Featured testimonial carousel */}
            <div className="relative mb-16">
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl max-w-4xl mx-auto">
                <Quote className="h-12 w-12 text-blue-200 mb-6" />
                
                {testimonials.length > 0 && (
                  <div className="text-center">
                    <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 italic">
                      "{testimonials[currentIndex]?.testimonial_text}"
                    </p>
                    
                    <div className="flex items-center justify-center mb-4">
                      {testimonials[currentIndex]?.client_photo_url ? (
                        <img 
                          src={testimonials[currentIndex].client_photo_url} 
                          alt={testimonials[currentIndex].client_name}
                          className="w-16 h-16 rounded-full object-cover mr-4"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonials[currentIndex].client_name)}&background=3b82f6&color=fff`;
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl mr-4">
                          {testimonials[currentIndex]?.client_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-900">
                          {testimonials[currentIndex]?.client_name}
                        </h3>
                        {testimonials[currentIndex]?.client_position && (
                          <p className="text-sm text-gray-600">
                            {testimonials[currentIndex].client_position}
                          </p>
                        )}
                        {testimonials[currentIndex]?.client_company && (
                          <p className="text-sm text-blue-600 font-medium">
                            {testimonials[currentIndex].client_company}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center mb-4">
                      {[...Array(testimonials[currentIndex]?.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation arrows */}
              {testimonials.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-600" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-600" />
                  </button>
                </>
              )}

              {/* Dots indicator */}
              {testimonials.length > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentIndex 
                          ? 'bg-blue-600 scale-125' 
                          : 'bg-gray-300 hover:bg-blue-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* All testimonials grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id} 
                  className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Quote className="h-8 w-8 text-blue-200 mb-4" />
                  
                  <div className="flex items-center mb-6">
                    {testimonial.client_photo_url ? (
                      <img 
                        src={testimonial.client_photo_url} 
                        alt={testimonial.client_name}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.client_name)}&background=3b82f6&color=fff`;
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold mr-4">
                        {testimonial.client_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">{testimonial.client_name}</h3>
                      {testimonial.client_position && (
                        <p className="text-xs text-gray-600">{testimonial.client_position}</p>
                      )}
                      {testimonial.client_company && (
                        <p className="text-xs text-blue-600 font-medium">{testimonial.client_company}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                    {testimonial.is_featured && (
                      <span className="ml-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Unggulan
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 leading-relaxed text-sm italic">
                    "{testimonial.testimonial_text}"
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Testimonials;

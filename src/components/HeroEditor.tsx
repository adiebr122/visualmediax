
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2, Edit3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  cta_primary: string;
  cta_secondary: string;
  cta_primary_url: string;
  hero_image_url: string;
  dynamic_headlines: string[];
  stats: Array<{
    icon: string;
    label: string;
    value: string;
  }>;
}

const HeroEditor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [content, setContent] = useState<HeroContent>({
    title: 'AI Consultant Pro',
    subtitle: 'Transformasi Digital dengan Teknologi AI',
    description: 'Solusi AI terdepan untuk bisnis modern.',
    cta_primary: 'Konsultasi Gratis',
    cta_secondary: 'Lihat Portfolio',
    cta_primary_url: 'https://wa.me/6281234567890',
    hero_image_url: '',
    dynamic_headlines: ['Revolusi Bisnis dengan Kekuatan AI 🚀'],
    stats: [
      { icon: 'Users', label: 'Klien Terpercaya', value: '150+' }
    ]
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', 'hero')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.metadata) {
        setExistingId(data.id);
        const metadata = data.metadata as any;
        setContent({
          title: data.title || 'AI Consultant Pro',
          subtitle: metadata.subtitle || 'Transformasi Digital dengan Teknologi AI',
          description: data.content || 'Solusi AI terdepan untuk bisnis modern.',
          cta_primary: metadata.cta_primary || 'Konsultasi Gratis',
          cta_secondary: metadata.cta_secondary || 'Lihat Portfolio',
          cta_primary_url: metadata.cta_primary_url || 'https://wa.me/6281234567890',
          hero_image_url: data.image_url || '',
          dynamic_headlines: metadata.dynamic_headlines || ['Revolusi Bisnis dengan Kekuatan AI 🚀'],
          stats: metadata.stats || [{ icon: 'Users', label: 'Klien Terpercaya', value: '150+' }]
        });
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const contentData = {
        section: 'hero',
        title: content.title,
        content: content.description,
        image_url: content.hero_image_url,
        metadata: {
          subtitle: content.subtitle,
          cta_primary: content.cta_primary,
          cta_secondary: content.cta_secondary,
          cta_primary_url: content.cta_primary_url,
          dynamic_headlines: content.dynamic_headlines,
          stats: content.stats
        } as any,
        user_id: user.id,
        is_active: true
      };

      let error;

      if (existingId) {
        // Update existing record
        const result = await supabase
          .from('website_content')
          .update(contentData)
          .eq('id', existingId);
        error = result.error;
      } else {
        // Insert new record
        const result = await supabase
          .from('website_content')
          .insert(contentData)
          .select()
          .single();
        
        if (result.data) {
          setExistingId(result.data.id);
        }
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Berhasil!",
        description: "Konten Hero berhasil disimpan",
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: `Gagal menyimpan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addHeadline = () => {
    setContent({
      ...content,
      dynamic_headlines: [...content.dynamic_headlines, '']
    });
  };

  const updateHeadline = (index: number, value: string) => {
    const newHeadlines = [...content.dynamic_headlines];
    newHeadlines[index] = value;
    setContent({ ...content, dynamic_headlines: newHeadlines });
  };

  const removeHeadline = (index: number) => {
    const newHeadlines = content.dynamic_headlines.filter((_, i) => i !== index);
    setContent({ ...content, dynamic_headlines: newHeadlines });
  };

  const addStat = () => {
    setContent({
      ...content,
      stats: [...content.stats, { icon: 'Star', label: '', value: '' }]
    });
  };

  const updateStat = (index: number, field: string, value: string) => {
    const newStats = [...content.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setContent({ ...content, stats: newStats });
  };

  const removeStat = (index: number) => {
    const newStats = content.stats.filter((_, i) => i !== index);
    setContent({ ...content, stats: newStats });
  };

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
        <h2 className="text-2xl font-bold text-gray-900">Hero Section Editor</h2>
        <button
          onClick={saveContent}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
        </button>
      </div>

      <div className="grid gap-6">
        {/* Basic Content */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Konten Utama</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Judul Utama</label>
              <input
                type="text"
                value={content.title}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <input
                type="text"
                value={content.subtitle}
                onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
              <textarea
                value={content.description}
                onChange={(e) => setContent({ ...content, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL Gambar Hero</label>
              <input
                type="url"
                value={content.hero_image_url}
                onChange={(e) => setContent({ ...content, hero_image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Tombol Call-to-Action</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tombol Utama (Teks)</label>
              <input
                type="text"
                value={content.cta_primary}
                onChange={(e) => setContent({ ...content, cta_primary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tombol Utama (URL)</label>
              <input
                type="url"
                value={content.cta_primary_url}
                onChange={(e) => setContent({ ...content, cta_primary_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://wa.me/6281234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tombol Sekunder</label>
              <input
                type="text"
                value={content.cta_secondary}
                onChange={(e) => setContent({ ...content, cta_secondary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Headlines */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Headline Dinamis</h3>
            <button
              onClick={addHeadline}
              className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah</span>
            </button>
          </div>
          <div className="space-y-3">
            {content.dynamic_headlines.map((headline, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => updateHeadline(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Headline menarik dengan emoji 🚀"
                />
                <button
                  onClick={() => removeHeadline(index)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Statistik</h3>
            <button
              onClick={addStat}
              className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah</span>
            </button>
          </div>
          <div className="space-y-4">
            {content.stats.map((stat, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 items-end">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Icon</label>
                  <select
                    value={stat.icon}
                    onChange={(e) => updateStat(index, 'icon', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="Users">Users</option>
                    <option value="Award">Award</option>
                    <option value="Star">Star</option>
                    <option value="TrendingUp">TrendingUp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Label</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStat(index, 'label', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Value</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(index, 'value', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <button
                  onClick={() => removeStat(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroEditor;

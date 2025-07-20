
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image, RefreshCw, Trash2 } from 'lucide-react';

interface GalleryUploadProps {
  galleryImages: string[];
  onGalleryChange: (images: string[]) => void;
}

export const GalleryUpload = ({ galleryImages, onGalleryChange }: GalleryUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const handleGalleryUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `gallery_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `portfolio/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newGalleryImages = [...galleryImages, ...uploadedUrls];
      onGalleryChange(newGalleryImages);
      
      toast({
        title: "Berhasil",
        description: `${uploadedUrls.length} gambar berhasil diupload ke galeri`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      toast({
        title: "Error",
        description: "Gagal mengupload gambar galeri",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = async (index: number) => {
    setDeletingIndex(index);
    
    try {
      // Get the image URL to check if it's from our storage
      const imageUrl = galleryImages[index];
      
      // If it's a Supabase storage URL, try to delete from storage
      if (imageUrl && imageUrl.includes('supabase.co') && imageUrl.includes('portfolio-images')) {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `portfolio/${fileName}`;
        
        // Try to delete from storage (don't fail if it doesn't exist)
        await supabase.storage
          .from('portfolio-images')
          .remove([filePath]);
      }
      
      // Remove from the gallery array
      const newGalleryImages = galleryImages.filter((_, i) => i !== index);
      onGalleryChange(newGalleryImages);
      
      toast({
        title: "Berhasil",
        description: "Gambar berhasil dihapus dari galeri",
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus gambar galeri",
        variant: "destructive",
      });
    } finally {
      setDeletingIndex(null);
    }
  };

  const addImageUrl = () => {
    const url = prompt('Masukkan URL gambar:');
    if (url && url.trim()) {
      const newGalleryImages = [...galleryImages, url.trim()];
      onGalleryChange(newGalleryImages);
    }
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <Image className="h-5 w-5 mr-2" />
          Galeri Gambar Project
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.multiple = true;
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) handleGalleryUpload(files);
              };
              input.click();
            }}
            disabled={uploading}
          >
            {uploading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Upload Gambar
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={addImageUrl}
          >
            <Image className="h-4 w-4 mr-2" />
            Tambah URL
          </Button>
        </div>

        {galleryImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={imageUrl}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeGalleryImage(index)}
                  disabled={deletingIndex === index}
                >
                  {deletingIndex === index ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {galleryImages.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Belum ada gambar di galeri</p>
            <p className="text-sm text-gray-400">Upload gambar atau tambah URL untuk memulai</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

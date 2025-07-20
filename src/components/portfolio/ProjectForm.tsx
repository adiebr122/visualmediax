import { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Upload, 
  RefreshCw, 
  Save, 
  X, 
  Globe, 
  Github,
  Target,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GalleryUpload } from './GalleryUpload';

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

interface ProjectFormProps {
  project: Project;
  isEditing: boolean;
  onSave: (project: Project) => void;
  onCancel: () => void;
  onChange: (project: Project) => void;
}

export const ProjectForm = ({ project, isEditing, onSave, onCancel, onChange }: ProjectFormProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(filePath);

      onChange({ ...project, image_url: urlData.publicUrl });
      
      toast({
        title: "Berhasil",
        description: "Gambar berhasil diupload",
        variant: "default",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Gagal mengupload gambar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleTechnologiesChange = (value: string) => {
    const technologies = value.split(',').map(tech => tech.trim()).filter(tech => tech);
    onChange({ ...project, technologies });
  };

  const handleSave = () => {
    if (!project.title.trim()) {
      toast({
        title: "Error",
        description: "Judul proyek harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!project.description.trim()) {
      toast({
        title: "Error",
        description: "Deskripsi proyek harus diisi",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    onSave(project);
    setSaving(false);
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          {isEditing ? <Edit className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
          {isEditing ? 'Edit Project' : 'Add New Project'}
        </CardTitle>
        <CardDescription>
          {isEditing ? 'Update project details' : 'Create a new portfolio project'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Project Title *
            </Label>
            <Input
              id="title"
              type="text"
              value={project.title}
              onChange={(e) => onChange({...project, title: e.target.value})}
              placeholder="Enter project title"
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-gray-700">
              Category
            </Label>
            <Input
              id="category"
              type="text"
              value={project.category}
              onChange={(e) => onChange({...project, category: e.target.value})}
              placeholder="e.g., Web Development, Mobile App"
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Short Description *
          </Label>
          <Textarea
            id="description"
            value={project.description}
            onChange={(e) => onChange({...project, description: e.target.value})}
            placeholder="Brief description of the project"
            rows={2}
            className="border-gray-300 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="detailed_description" className="text-sm font-medium text-gray-700">
            Detailed Description
          </Label>
          <Textarea
            id="detailed_description"
            value={project.detailed_description}
            onChange={(e) => onChange({...project, detailed_description: e.target.value})}
            placeholder="Comprehensive project description"
            rows={4}
            className="border-gray-300 focus:border-blue-500"
          />
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client" className="text-sm font-medium text-gray-700">
              Client
            </Label>
            <Input
              id="client"
              type="text"
              value={project.client}
              onChange={(e) => onChange({...project, client: e.target.value})}
              placeholder="Client name"
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project_duration" className="text-sm font-medium text-gray-700">
              Duration
            </Label>
            <Input
              id="project_duration"
              type="text"
              value={project.project_duration}
              onChange={(e) => onChange({...project, project_duration: e.target.value})}
              placeholder="e.g., 3 months"
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="team_size" className="text-sm font-medium text-gray-700">
            Team Size
          </Label>
          <Input
            id="team_size"
            type="text"
            value={project.team_size}
            onChange={(e) => onChange({...project, team_size: e.target.value})}
            placeholder="e.g., 5 developers, 2 designers"
            className="border-gray-300 focus:border-blue-500"
          />
        </div>

        {/* Technologies */}
        <div className="space-y-2">
          <Label htmlFor="technologies" className="text-sm font-medium text-gray-700">
            Technologies Used
          </Label>
          <Input
            id="technologies"
            type="text"
            value={project.technologies.join(', ')}
            onChange={(e) => handleTechnologiesChange(e.target.value)}
            placeholder="React, Node.js, MongoDB (separate with commas)"
            className="border-gray-300 focus:border-blue-500"
          />
        </div>

        {/* URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="demo_url" className="text-sm font-medium text-gray-700 flex items-center">
              <Globe className="h-4 w-4 mr-1" />
              Demo URL
            </Label>
            <Input
              id="demo_url"
              type="url"
              value={project.demo_url || ''}
              onChange={(e) => onChange({...project, demo_url: e.target.value})}
              placeholder="https://demo.example.com"
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="github_url" className="text-sm font-medium text-gray-700 flex items-center">
              <Github className="h-4 w-4 mr-1" />
              GitHub URL
            </Label>
            <Input
              id="github_url"
              type="url"
              value={project.github_url || ''}
              onChange={(e) => onChange({...project, github_url: e.target.value})}
              placeholder="https://github.com/user/repo"
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Main Image Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Project Main Image</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={project.image_url}
              onChange={(e) => onChange({...project, image_url: e.target.value})}
              placeholder="Image URL or upload file"
              className="flex-1 border-gray-300 focus:border-blue-500"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleImageUpload(file);
                };
                input.click();
              }}
            >
              {uploading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
          </div>
          {project.image_url && (
            <div className="mt-2 border rounded-lg p-2 bg-gray-50">
              <img 
                src={project.image_url} 
                alt="Project preview"
                className="max-h-32 max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Gallery Upload Component */}
        <GalleryUpload
          galleryImages={project.gallery_images}
          onGalleryChange={(images) => onChange({...project, gallery_images: images})}
        />

        {/* Project Challenges & Solutions */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="challenges" className="text-sm font-medium text-gray-700 flex items-center">
              <Target className="h-4 w-4 mr-1" />
              Challenges
            </Label>
            <Textarea
              id="challenges"
              value={project.challenges}
              onChange={(e) => onChange({...project, challenges: e.target.value})}
              placeholder="What challenges did you face during this project?"
              rows={3}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solutions" className="text-sm font-medium text-gray-700 flex items-center">
              <Lightbulb className="h-4 w-4 mr-1" />
              Solutions
            </Label>
            <Textarea
              id="solutions"
              value={project.solutions}
              onChange={(e) => onChange({...project, solutions: e.target.value})}
              placeholder="How did you solve the challenges?"
              rows={3}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="results" className="text-sm font-medium text-gray-700 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Results & Impact
            </Label>
            <Textarea
              id="results"
              value={project.results}
              onChange={(e) => onChange({...project, results: e.target.value})}
              placeholder="What were the outcomes and impact of the project?"
              rows={3}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex items-center"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !project.title || !project.description}
            className="bg-blue-600 hover:bg-blue-700 flex items-center"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                {isEditing ? 'Update Project' : 'Save Project'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

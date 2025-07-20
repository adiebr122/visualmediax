
import { 
  Edit, 
  Trash2, 
  Eye, 
  Globe, 
  Github, 
  Calendar,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface ProjectCardProps {
  project: Project;
  index: number;
  onEdit: (project: Project, index: number) => void;
  onDelete: (index: number) => void;
  onView?: (project: Project) => void;
}

export const ProjectCard = ({ project, index, onEdit, onDelete, onView }: ProjectCardProps) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Edit clicked for project:', project.title, 'at index:', index);
    onEdit(project, index);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Delete clicked for project:', project.title, 'at index:', index);
    onDelete(index);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) {
      onView(project);
    }
  };

  const handleDemoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.demo_url) {
      window.open(project.demo_url, '_blank');
    }
  };

  const handleGithubClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.github_url) {
      window.open(project.github_url, '_blank');
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {project.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 line-clamp-2">
              {project.description}
            </CardDescription>
          </div>
          <div className="flex space-x-1 ml-4">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleView}
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                title="Lihat Detail"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"
              title="Edit Proyek"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              title="Hapus Proyek"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {project.image_url && (
          <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
            <img 
              src={project.image_url} 
              alt={project.title}
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{project.project_duration || 'N/A'}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {project.category || 'Uncategorized'}
            </Badge>
          </div>
          
          {project.client && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              <span>Client: {project.client}</span>
            </div>
          )}
          
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.technologies.slice(0, 3).map((tech, techIndex) => (
                <Badge key={techIndex} variant="secondary" className="text-xs px-2 py-1">
                  {tech}
                </Badge>
              ))}
              {project.technologies.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  +{project.technologies.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <div className="flex space-x-2">
              {project.demo_url && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDemoClick}
                  className="h-8 px-2 text-blue-600 hover:bg-blue-50"
                  title="Lihat Demo"
                >
                  <Globe className="h-3 w-3 mr-1" />
                  <span className="text-xs">Demo</span>
                </Button>
              )}
              {project.github_url && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleGithubClick}
                  className="h-8 px-2 text-gray-600 hover:bg-gray-50"
                  title="Lihat Source Code"
                >
                  <Github className="h-3 w-3 mr-1" />
                  <span className="text-xs">Code</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

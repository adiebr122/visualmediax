
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface PortfolioHeaderProps {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

export const PortfolioHeader = ({ 
  title, 
  description, 
  onTitleChange, 
  onDescriptionChange 
}: PortfolioHeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Konten Header Portfolio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Judul</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Masukkan judul portfolio"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
            className="w-full"
            placeholder="Masukkan deskripsi portfolio"
          />
        </div>
      </CardContent>
    </Card>
  );
};

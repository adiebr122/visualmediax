
import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface LoadingWrapperProps {
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  loadingText?: string;
  minHeight?: string;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ 
  loading, 
  error, 
  children, 
  skeleton,
  loadingText = "Memuat...",
  minHeight = "py-8"
}) => {
  if (error) {
    return (
      <div className={`flex items-center justify-center ${minHeight}`}>
        <div className="text-center max-w-md">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <div className="text-red-600 font-medium mb-2">Terjadi Kesalahan</div>
          <p className="text-gray-600 mb-3 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return skeleton || (
      <div className={`flex items-center justify-center ${minHeight}`}>
        <div className="text-center">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
          <span className="text-gray-600 text-sm">{loadingText}</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingWrapper;


import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Only redirect if we're sure there's no user and not loading
    if (!loading && !user && !redirecting) {
      console.log('No authenticated user found, redirecting to auth page');
      setRedirecting(true);
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate, redirecting]);

  // Show loading spinner while checking auth or redirecting
  if (loading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat halaman admin...</p>
        </div>
      </div>
    );
  }

  // If no user and not loading, don't render anything (redirect is happening)
  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

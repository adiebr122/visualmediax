
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  MessageCircle, 
  Users, 
  Settings, 
  Star,
  Image,
  Phone,
  Palette,
  BarChart3,
  Search,
  LogOut,
  Menu,
  X,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AdminSidebarUpdated = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', exact: true },
    { icon: FileText, label: 'Konten Website', path: '/admin#content' },
    { icon: Briefcase, label: 'Portfolio', path: '/admin#portfolio' },
    { icon: Settings, label: 'Layanan', path: '/admin#services' },
    { icon: Star, label: 'Testimonial', path: '/admin#testimonials' },
    { icon: Image, label: 'Client Logos', path: '/admin#client-logos' },
    { icon: Users, label: 'CRM', path: '/admin#crm' },
    { icon: MessageCircle, label: 'Live Chat', path: '/admin#chat' },
    { icon: Phone, label: 'WhatsApp', path: '/admin#whatsapp' },
    { icon: Palette, label: 'Brand & SEO', path: '/admin#brand' },
    { icon: BarChart3, label: 'Analytics', path: '/admin#analytics' },
    { icon: Settings, label: 'Pengaturan', path: '/admin#settings' },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path) || location.hash === path.split('#')[1];
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg z-40
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
              )}
              <button
                onClick={toggleCollapse}
                className="hidden lg:block p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="p-4 border-b border-gray-200">
              <Link
                to="/"
                target="_blank"
                className="flex items-center w-full px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Lihat Website
              </Link>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              
              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center px-3 py-2 rounded-lg transition-all duration-200
                    ${active 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={signOut}
              className={`
                flex items-center w-full px-3 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? 'Logout' : ''}
            >
              <LogOut className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} />
              {!isCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebarUpdated;


import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Star,
  Briefcase,
  Settings,
  Building,
  Zap,
  UserCheck,
  Globe,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Calculator
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      id: 'dashboard',
      description: 'Overview & Analytics',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Hero Section',
      icon: Zap,
      id: 'hero',
      description: 'Manage homepage hero',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Services',
      icon: Briefcase,
      id: 'services',
      description: 'Manage service offerings',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Portfolio',
      icon: FileText,
      id: 'portfolio',
      description: 'Manage project portfolio',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      title: 'Client Logos',
      icon: Building,
      id: 'clientlogos',
      description: 'Manage client logos',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Testimonials',
      icon: Star,
      id: 'testimonials',
      description: 'Manage client reviews',
      gradient: 'from-yellow-500 to-orange-600'
    },
    {
      title: 'Form Submissions',
      icon: MessageSquare,
      id: 'submissions',
      description: 'View contact forms',
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      title: 'Live Chat',
      icon: MessageCircle,
      id: 'livechat',
      description: 'Manage chat system',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      title: 'CRM',
      icon: Users,
      id: 'crm',
      description: 'Customer management',
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Penawaran',
      icon: Calculator,
      id: 'quotations',
      description: 'Manage quotations',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Invoice',
      icon: Receipt,
      id: 'invoices',
      description: 'Manage invoices',
      gradient: 'from-green-500 to-teal-600'
    },
    {
      title: 'User Management',
      icon: UserCheck,
      id: 'users',
      description: 'Manage system users',
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      title: 'Settings',
      icon: Settings,
      id: 'settings',
      description: 'System configuration',
      gradient: 'from-slate-500 to-gray-600'
    }
  ];

  return (
    <Sidebar 
      className={`
        ${isCollapsed ? 'w-16' : 'w-64'} 
        bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out
      `}
      collapsible="icon"
    >
      <SidebarContent className="bg-white">
        {/* Compact Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-1.5 rounded-lg mr-2">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Admin Panel</h2>
                <p className="text-xs text-gray-500">Kelola website</p>
              </div>
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            className={`
              p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors
              ${isCollapsed ? 'mx-auto' : ''}
            `}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        <SidebarGroup className="px-2 py-3">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      className={`
                        group relative w-full rounded-lg transition-all duration-200 border
                        ${isCollapsed ? 'h-10 p-2 justify-center' : 'h-12 px-3 py-2'}
                        ${isActive 
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-md border-transparent` 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }
                      `}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} w-full`}>
                        <div className={`
                          rounded-lg transition-all duration-200
                          ${isCollapsed ? 'p-0' : 'p-1.5'}
                          ${isActive 
                            ? 'bg-white/20 text-white' 
                            : `bg-gradient-to-r ${item.gradient} text-white group-hover:scale-105`
                          }
                        `}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        
                        {!isCollapsed && (
                          <div className="flex-1 text-left min-w-0">
                            <div className={`font-semibold text-xs truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                              {item.title}
                            </div>
                            <div className={`text-xs truncate ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                              {item.description}
                            </div>
                          </div>
                        )}
                        
                        {!isCollapsed && isActive && (
                          <div className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Compact Footer */}
        {!isCollapsed && (
          <div className="mt-auto p-3 border-t border-gray-100">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-2 text-center border border-purple-100">
              <div className="flex justify-center space-x-1 mb-1">
                <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce delay-200"></div>
              </div>
              <p className="text-xs text-gray-600 font-medium">Admin v2.0</p>
              <p className="text-xs text-gray-500">Modern & Powerful</p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;

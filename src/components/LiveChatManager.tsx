
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  MessageCircle, 
  Users, 
  Settings, 
  BarChart3,
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import WhatsAppChat from './WhatsAppChat';
import WhatsAppConfig from './WhatsAppConfig';
import ChatAgentManager from './ChatAgentManager';

const LiveChatManager = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');

  // Fetch chat statistics
  const { data: chatStats } = useQuery({
    queryKey: ['chat_stats'],
    queryFn: async () => {
      const [conversationsResult, messagesResult, agentsResult] = await Promise.all([
        supabase.from('chat_conversations').select('id, status, platform'),
        supabase.from('chat_messages').select('id').gte('message_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('chat_agents').select('id, is_active, is_online')
      ]);

      const conversations = conversationsResult.data || [];
      const todayMessages = messagesResult.data || [];
      const agents = agentsResult.data || [];

      return {
        totalConversations: conversations.length,
        activeConversations: conversations.filter(c => c.status === 'active').length,
        pendingConversations: conversations.filter(c => c.status === 'pending').length,
        unassignedConversations: conversations.filter(c => c.status === 'unassigned').length,
        websiteChats: conversations.filter(c => c.platform === 'website').length,
        whatsappChats: conversations.filter(c => c.platform === 'whatsapp').length,
        todayMessages: todayMessages.length,
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.is_active).length,
        onlineAgents: agents.filter(a => a.is_online).length
      };
    },
    enabled: !!user
  });

  const tabs = [
    { id: 'chat', label: 'Live Chat', icon: MessageCircle },
    { id: 'agents', label: 'Manajemen Agent', icon: UserCheck },
    { id: 'config', label: 'Konfigurasi', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Analytics Live Chat</h3>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Percakapan</p>
              <p className="text-2xl font-bold text-gray-900">{chatStats?.totalConversations || 0}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Percakapan Aktif</p>
              <p className="text-2xl font-bold text-green-600">{chatStats?.activeConversations || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Belum Ditugaskan</p>
              <p className="text-2xl font-bold text-orange-600">{chatStats?.unassignedConversations || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Menunggu Respons</p>
              <p className="text-2xl font-bold text-yellow-600">{chatStats?.pendingConversations || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chat Website</p>
              <p className="text-2xl font-bold text-blue-600">{chatStats?.websiteChats || 0}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chat WhatsApp</p>
              <p className="text-2xl font-bold text-green-600">{chatStats?.whatsappChats || 0}</p>
            </div>
            <Phone className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pesan Hari Ini</p>
              <p className="text-2xl font-bold text-purple-600">{chatStats?.todayMessages || 0}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Agent Online</p>
              <p className="text-2xl font-bold text-green-600">
                {chatStats?.onlineAgents || 0}/{chatStats?.totalAgents || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Charts placeholder */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h4 className="text-lg font-semibold mb-4">Pesan per Hari</h4>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500">Chart akan ditampilkan di sini</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h4 className="text-lg font-semibold mb-4">Status Percakapan</h4>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500">Pie chart akan ditampilkan di sini</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Live Chat Manager</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-blue-600">
            <Users className="h-4 w-4 mr-1" />
            <span className="text-sm">{chatStats?.onlineAgents || 0} Agent Online</span>
          </div>
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span className="text-sm">Sistem Aktif</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'chat' && <WhatsAppChat />}
        {activeTab === 'agents' && <ChatAgentManager />}
        {activeTab === 'config' && <WhatsAppConfig />}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default LiveChatManager;

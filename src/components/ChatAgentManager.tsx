
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  UserCheck, 
  UserX,
  Mail,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: string;
  agent_name: string;
  agent_email: string;
  is_active: boolean;
  is_online: boolean;
  max_concurrent_chats: number;
  created_at: string;
}

const ChatAgentManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    agent_name: '',
    agent_email: '',
    max_concurrent_chats: 5
  });

  // Fetch agents
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['chat_agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_agents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Agent[];
    },
    enabled: !!user
  });

  // Create/Update agent mutation
  const agentMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingAgent) {
        const { error } = await supabase
          .from('chat_agents')
          .update(data)
          .eq('id', editingAgent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('chat_agents')
          .insert({ ...data, user_id: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_agents'] });
      setShowForm(false);
      setEditingAgent(null);
      setFormData({ agent_name: '', agent_email: '', max_concurrent_chats: 5 });
      toast({
        title: "Berhasil",
        description: editingAgent ? "Agent berhasil diupdate" : "Agent berhasil ditambahkan",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Gagal menyimpan agent: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Delete agent mutation
  const deleteMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const { error } = await supabase
        .from('chat_agents')
        .delete()
        .eq('id', agentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_agents'] });
      toast({
        title: "Berhasil",
        description: "Agent berhasil dihapus",
      });
    }
  });

  // Toggle agent status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string, field: string, value: boolean }) => {
      const { error } = await supabase
        .from('chat_agents')
        .update({ [field]: value })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_agents'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    agentMutation.mutate(formData);
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      agent_name: agent.agent_name,
      agent_email: agent.agent_email,
      max_concurrent_chats: agent.max_concurrent_chats
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAgent(null);
    setFormData({ agent_name: '', agent_email: '', max_concurrent_chats: 5 });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold flex items-center">
          <Users className="h-6 w-6 mr-2 text-blue-600" />
          Manajemen Agent Live Chat
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Agent
        </button>
      </div>

      {/* Agent Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h4 className="text-lg font-semibold mb-4">
            {editingAgent ? 'Edit Agent' : 'Tambah Agent Baru'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Agent
              </label>
              <input
                type="text"
                value={formData.agent_name}
                onChange={(e) => setFormData({...formData, agent_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Agent
              </label>
              <input
                type="email"
                value={formData.agent_email}
                onChange={(e) => setFormData({...formData, agent_email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Chat Bersamaan
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.max_concurrent_chats}
                onChange={(e) => setFormData({...formData, max_concurrent_chats: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={agentMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {agentMutation.isPending ? 'Menyimpan...' : (editingAgent ? 'Update' : 'Simpan')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Agents List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : agents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Belum ada agent yang ditambahkan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Chat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Online</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {agents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                        <span className="font-medium">{agent.agent_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-1" />
                        {agent.agent_email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{agent.max_concurrent_chats}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatusMutation.mutate({
                          id: agent.id,
                          field: 'is_active',
                          value: !agent.is_active
                        })}
                        className={`px-2 py-1 text-xs rounded-full ${
                          agent.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {agent.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatusMutation.mutate({
                          id: agent.id,
                          field: 'is_online',
                          value: !agent.is_online
                        })}
                        className={`px-2 py-1 text-xs rounded-full ${
                          agent.is_online 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {agent.is_online ? 'Online' : 'Offline'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(agent)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(agent.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAgentManager;

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Download,
  UserPlus,
  Star,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Target,
  Activity,
  TrendingUp,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface UserRecord {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  client_company: string | null;
  client_position: string | null;
  lead_status: string;
  lead_source: string;
  estimated_value: number | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  admin_user_id: string;
  assigned_to: string | null;
}

interface NewUser {
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_company?: string;
  client_position?: string;
  lead_status: string;
  lead_source: string;
  estimated_value?: number;
  notes?: string;
  tags?: string[];
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [newUser, setNewUser] = useState<NewUser>({
    lead_status: 'new',
    lead_source: 'website',
    tags: []
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const leadStatuses = [
    { value: 'new', label: 'New Lead', color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500', lightColor: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { value: 'qualified', label: 'Qualified', color: 'bg-green-500', lightColor: 'bg-green-50 text-green-700 border-green-200' },
    { value: 'proposal', label: 'Proposal Sent', color: 'bg-purple-500', lightColor: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-500', lightColor: 'bg-orange-50 text-orange-700 border-orange-200' },
    { value: 'closed_won', label: 'Closed Won', color: 'bg-emerald-500', lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'closed_lost', label: 'Closed Lost', color: 'bg-red-500', lightColor: 'bg-red-50 text-red-700 border-red-200' }
  ];

  const leadSources = [
    'website', 'social_media', 'referral', 'cold_outreach', 'advertising', 'event', 'partnership', 'other'
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_management')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert JSON tags to string array and ensure proper types
      const formattedUsers: UserRecord[] = (data || []).map(user => ({
        ...user,
        tags: Array.isArray(user.tags) 
          ? user.tags.filter((tag): tag is string => typeof tag === 'string')
          : []
      }));
      
      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('user_management')
          .update({
            client_name: newUser.client_name,
            client_email: newUser.client_email,
            client_phone: newUser.client_phone,
            client_company: newUser.client_company,
            client_position: newUser.client_position,
            lead_status: newUser.lead_status,
            lead_source: newUser.lead_source,
            estimated_value: newUser.estimated_value,
            notes: newUser.notes,
            tags: newUser.tags || [],
            updated_at: new Date().toISOString()
          })
          .eq('id', editingUser.id);

        if (error) throw error;

        setUsers(prev => prev.map(u => 
          u.id === editingUser.id 
            ? { ...u, ...newUser, tags: newUser.tags || [] }
            : u
        ));

        toast({
          title: "Berhasil",
          description: "User berhasil diperbarui",
        });
      } else {
        // Create new user
        const { data, error } = await supabase
          .from('user_management')
          .insert({
            client_name: newUser.client_name!,
            client_email: newUser.client_email!,
            client_phone: newUser.client_phone,
            client_company: newUser.client_company,
            client_position: newUser.client_position,
            lead_status: newUser.lead_status,
            lead_source: newUser.lead_source,
            estimated_value: newUser.estimated_value,
            notes: newUser.notes,
            tags: newUser.tags || [],
            admin_user_id: user.id
          })
          .select()
          .single();

        if (error) throw error;
        
        const formattedUser: UserRecord = {
          ...data,
          tags: Array.isArray(data.tags) 
            ? data.tags.filter((tag): tag is string => typeof tag === 'string')
            : []
        };
        
        setUsers(prev => [formattedUser, ...prev]);
        
        toast({
          title: "Berhasil",
          description: "User baru berhasil ditambahkan",
        });
      }

      // Reset form
      setNewUser({
        lead_status: 'new',
        lead_source: 'website',
        tags: []
      });
      setEditingUser(null);
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast({
        title: "Error",
        description: "Failed to save user",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_management')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({
        title: "Berhasil",
        description: "User berhasil dihapus",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const exportToCsv = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Company', 'Position', 'Status', 'Source', 'Value', 'Created'],
      ...filteredUsers.map(user => [
        user.client_name,
        user.client_email,
        user.client_phone || '',
        user.client_company || '',
        user.client_position || '',
        user.lead_status,
        user.lead_source,
        user.estimated_value?.toString() || '',
        new Date(user.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.client_company && user.client_company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || user.lead_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: users.length,
    new: users.filter(u => u.lead_status === 'new').length,
    qualified: users.filter(u => u.lead_status === 'qualified').length,
    closed_won: users.filter(u => u.lead_status === 'closed_won').length,
    totalValue: users.reduce((sum, u) => sum + (u.estimated_value || 0), 0)
  };

  const getStatusConfig = (status: string) => {
    return leadStatuses.find(s => s.value === status) || leadStatuses[0];
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center mb-2">
                <Users className="h-8 w-8 mr-3 text-purple-200" />
                User Management
              </CardTitle>
              <CardDescription className="text-purple-100 text-lg">
                Kelola semua pengguna dan leads dengan mudah
              </CardDescription>
            </div>
            <div className="hidden md:block">
              <Activity className="h-16 w-16 text-purple-200" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { title: 'Total Users', value: stats.total, icon: Users, gradient: 'from-blue-500 to-purple-600', bgGradient: 'from-blue-50 to-purple-50' },
          { title: 'New Leads', value: stats.new, icon: UserPlus, gradient: 'from-emerald-500 to-teal-600', bgGradient: 'from-emerald-50 to-teal-50' },
          { title: 'Qualified', value: stats.qualified, icon: Star, gradient: 'from-yellow-500 to-orange-600', bgGradient: 'from-yellow-50 to-orange-50' },
          { title: 'Closed Won', value: stats.closed_won, icon: Target, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-50' },
          { title: 'Total Value', value: `$${stats.totalValue.toLocaleString()}`, icon: DollarSign, gradient: 'from-purple-500 to-pink-600', bgGradient: 'from-purple-50 to-pink-50' }
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} border-2 border-gray-200 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 group`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`bg-gradient-to-r ${stat.gradient} p-3 rounded-2xl shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Controls */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-2 border-gray-200 focus:border-purple-400 transition-colors"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-white border-2 border-gray-200 focus:border-purple-400">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {leadStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={exportToCsv}
                variant="outline"
                className="flex items-center gap-2 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={() => {
                      setEditingUser(null);
                      setNewUser({
                        lead_status: 'new',
                        lead_source: 'website',
                        tags: []
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] bg-white border-0 shadow-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                      {editingUser ? 'Update user details here.' : 'Enter the details for the new user.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        type="text"
                        id="name"
                        value={newUser.client_name || ''}
                        onChange={(e) => setNewUser({ ...newUser, client_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        type="email"
                        id="email"
                        value={newUser.client_email || ''}
                        onChange={(e) => setNewUser({ ...newUser, client_email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        type="tel"
                        id="phone"
                        value={newUser.client_phone || ''}
                        onChange={(e) => setNewUser({ ...newUser, client_phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        type="text"
                        id="company"
                        value={newUser.client_company || ''}
                        onChange={(e) => setNewUser({ ...newUser, client_company: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        type="text"
                        id="position"
                        value={newUser.client_position || ''}
                        onChange={(e) => setNewUser({ ...newUser, client_position: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lead_status">Lead Status</Label>
                      <Select value={newUser.lead_status} onValueChange={(value) => setNewUser({ ...newUser, lead_status: value })}>
                        <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-purple-400">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {leadStatuses.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lead_source">Lead Source</Label>
                      <Select value={newUser.lead_source} onValueChange={(value) => setNewUser({ ...newUser, lead_source: value })}>
                        <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-purple-400">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {leadSources.map(source => (
                            <SelectItem key={source} value={source}>{source}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="estimated_value">Estimated Value</Label>
                      <Input
                        type="number"
                        id="estimated_value"
                        value={newUser.estimated_value || ''}
                        onChange={(e) => setNewUser({ ...newUser, estimated_value: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newUser.notes || ''}
                        onChange={(e) => setNewUser({ ...newUser, notes: e.target.value })}
                        className="bg-white border-2 border-gray-200 focus:border-purple-400 transition-colors"
                      />
                    </div>
                    <Button type="submit" className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg">
                      {editingUser ? 'Update User' : 'Save User'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6">
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const statusConfig = getStatusConfig(user.lead_status);
              return (
                <div key={user.id} className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-purple-200 group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{user.client_name}</h3>
                      <p className="text-gray-600">{user.client_company || 'No Company'}</p>
                    </div>
                    <Badge className={`uppercase text-xs font-bold rounded-full px-3 py-1 border ${statusConfig.lightColor} text-white`} style={{ backgroundColor: statusConfig.lightColor }}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center text-gray-700 mb-2">
                        <Mail className="h-4 w-4 mr-2 text-purple-400" />
                        {user.client_email}
                      </div>
                      {user.client_phone && (
                        <div className="flex items-center text-gray-700">
                          <Phone className="h-4 w-4 mr-2 text-blue-400" />
                          {user.client_phone}
                        </div>
                      )}
                    </div>
                    <div>
                      {user.client_position && (
                        <div className="flex items-center text-gray-700 mb-2">
                          <Building className="h-4 w-4 mr-2 text-green-400" />
                          {user.client_position}
                        </div>
                      )}
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-4 w-4 mr-2 text-orange-400" />
                        Created: {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
                      onClick={() => {
                        setSelectedUser(user);
                        setNewUser({
                          client_name: user.client_name,
                          client_email: user.client_email,
                          client_phone: user.client_phone || '',
                          client_company: user.client_company || '',
                          client_position: user.client_position || '',
                          lead_status: user.lead_status,
                          lead_source: user.lead_source,
                          estimated_value: user.estimated_value || 0,
                          notes: user.notes || '',
                          tags: user.tags || []
                        });
                        setEditingUser(user);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="hover:bg-red-600 transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Are you sure you want to delete this user?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteUser(user.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No users found</p>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;

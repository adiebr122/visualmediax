import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Settings, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  QrCode,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCodeModal from './QRCodeModal';

interface WhatsAppDevice {
  id: string;
  device_name: string;
  phone_number: string;
  connection_status: string;
  qr_code_data: string | null;
  last_connected_at: string | null;
}

interface WhatsAppConfig {
  id: string;
  config_type: string;
  api_key: string | null;
  base_url: string | null;
  webhook_url: string | null;
  is_configured: boolean;
  is_active: boolean;
}

const WhatsAppConfig = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [qrModal, setQrModal] = useState<{isOpen: boolean, deviceId: string, deviceName: string}>({
    isOpen: false,
    deviceId: '',
    deviceName: ''
  });
  const [newDevice, setNewDevice] = useState({
    device_name: '',
    phone_number: ''
  });
  const [configData, setConfigData] = useState({
    config_type: 'whatsapp_business',
    api_key: '',
    base_url: '',
    webhook_url: ''
  });

  // Fetch WhatsApp devices
  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['whatsapp_devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_devices')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WhatsAppDevice[];
    },
    enabled: !!user
  });

  // Fetch WhatsApp config
  const { data: config } = useQuery({
    queryKey: ['whatsapp_config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_configs')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as WhatsAppConfig | null;
    },
    enabled: !!user
  });

  // Add device mutation
  const addDeviceMutation = useMutation({
    mutationFn: async (deviceData: typeof newDevice) => {
      const { error } = await supabase
        .from('whatsapp_devices')
        .insert({
          ...deviceData,
          user_id: user?.id,
          connection_status: 'pending'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp_devices'] });
      setShowAddDevice(false);
      setNewDevice({ device_name: '', phone_number: '' });
      toast({
        title: "Device Ditambahkan",
        description: "WhatsApp device berhasil ditambahkan",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menambahkan device: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Save config mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (configInfo: typeof configData) => {
      if (config) {
        const { error } = await supabase
          .from('whatsapp_configs')
          .update({
            ...configInfo,
            is_configured: true
          })
          .eq('id', config.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('whatsapp_configs')
          .insert({
            ...configInfo,
            user_id: user?.id,
            is_configured: true
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp_config'] });
      setShowConfig(false);
      toast({
        title: "Konfigurasi Disimpan",
        description: "WhatsApp configuration berhasil disimpan",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menyimpan konfigurasi: " + error.message,
        variant: "destructive",
      });
    }
  });

  const disconnectDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const { data, error } = await supabase.functions.invoke('whatsapp-qr', {
        body: { deviceId, action: 'disconnect' }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp_devices'] });
      toast({
        title: "Device Disconnected",
        description: "WhatsApp device berhasil diputus",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal memutus koneksi device: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevice.device_name || !newDevice.phone_number) return;
    addDeviceMutation.mutate(newDevice);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfigMutation.mutate(configData);
  };

  const handleQRCode = (deviceId: string, deviceName: string) => {
    setQrModal({
      isOpen: true,
      deviceId,
      deviceName
    });
  };

  const handleDisconnect = (deviceId: string) => {
    disconnectDeviceMutation.mutate(deviceId);
  };

  const deleteDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const { error } = await supabase
        .from('whatsapp_devices')
        .delete()
        .eq('id', deviceId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp_devices'] });
      toast({
        title: "Device Deleted",
        description: "WhatsApp device berhasil dihapus",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menghapus device: " + error.message,
        variant: "destructive",
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <WifiOff className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Terhubung';
      case 'pending': return 'Menunggu';
      case 'disconnected': return 'Terputus';
      default: return 'Tidak diketahui';
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            WhatsApp Configuration
          </h3>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>{config ? 'Edit Config' : 'Setup Config'}</span>
          </button>
        </div>

        {config ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Status Konfigurasi</h4>
              <p className="text-sm text-green-600">
                {config.is_configured ? 'Terkonfigurasi' : 'Belum Terkonfigurasi'}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Tipe Konfigurasi</h4>
              <p className="text-sm text-blue-600">{config.config_type}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Belum Ada Konfigurasi
            </h4>
            <p className="text-gray-500 mb-4">
              Setup WhatsApp configuration untuk mulai menggunakan live chat
            </p>
          </div>
        )}

        {/* Config Form */}
        {showConfig && (
          <form onSubmit={handleSaveConfig} className="mt-6 space-y-4 border-t pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Konfigurasi
                </label>
                <select
                  value={configData.config_type}
                  onChange={(e) => setConfigData({...configData, config_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="whatsapp_business">WhatsApp Business API</option>
                  <option value="whatsapp_web">WhatsApp Web</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={configData.api_key}
                  onChange={(e) => setConfigData({...configData, api_key: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan API Key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base URL
                </label>
                <input
                  type="url"
                  value={configData.base_url}
                  onChange={(e) => setConfigData({...configData, base_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://api.example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={configData.webhook_url}
                  onChange={(e) => setConfigData({...configData, webhook_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://yourapp.com/webhook"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={saveConfigMutation.isPending}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Konfigurasi</span>
              </button>
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Devices List */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            WhatsApp Devices
          </h3>
          <button
            onClick={() => setShowAddDevice(!showAddDevice)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Device</span>
          </button>
        </div>

        {/* Add Device Form */}
        {showAddDevice && (
          <form onSubmit={handleAddDevice} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Device
                </label>
                <input
                  type="text"
                  value={newDevice.device_name}
                  onChange={(e) => setNewDevice({...newDevice, device_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Contoh: WhatsApp Office"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={newDevice.phone_number}
                  onChange={(e) => setNewDevice({...newDevice, phone_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+62812345678"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={addDeviceMutation.isPending}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Tambah Device
              </button>
              <button
                type="button"
                onClick={() => setShowAddDevice(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {/* Devices Grid */}
        {devicesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading devices...</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-8">
            <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Belum Ada Device
            </h4>
            <p className="text-gray-500">
              Tambahkan WhatsApp device untuk mulai menggunakan live chat
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <div key={device.id} className="border border-gray-200 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{device.device_name}</h4>
                  {getStatusIcon(device.connection_status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{device.phone_number}</p>
                <p className="text-sm text-gray-500 mb-3">
                  Status: {getStatusText(device.connection_status)}
                </p>
                {device.last_connected_at && (
                  <p className="text-xs text-gray-400 mb-3">
                    Terakhir terhubung: {new Date(device.last_connected_at).toLocaleString('id-ID')}
                  </p>
                )}
                <div className="flex space-x-2">
                  {device.connection_status === 'connected' ? (
                    <button 
                      onClick={() => handleDisconnect(device.id)}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 flex items-center justify-center"
                    >
                      <WifiOff className="h-3 w-3 mr-1" />
                      Disconnect
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleQRCode(device.id, device.device_name)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                    >
                      <QrCode className="h-3 w-3 mr-1" />
                      Connect
                    </button>
                  )}
                  <button 
                    onClick={() => deleteDeviceMutation.mutate(device.id)}
                    className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <QRCodeModal
        isOpen={qrModal.isOpen}
        onClose={() => setQrModal({isOpen: false, deviceId: '', deviceName: ''})}
        deviceId={qrModal.deviceId}
        deviceName={qrModal.deviceName}
        onConnectionSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['whatsapp_devices'] });
          queryClient.invalidateQueries({ queryKey: ['chat_stats'] });
        }}
      />
    </div>
  );
};

export default WhatsAppConfig;


import { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string;
  deviceName: string;
  onConnectionSuccess: () => void;
}

const QRCodeModal = ({ isOpen, onClose, deviceId, deviceName, onConnectionSuccess }: QRCodeModalProps) => {
  const [qrData, setQrData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'generating' | 'waiting' | 'connected' | 'error'>('generating');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      generateQR();
    } else {
      setQrData('');
      setConnectionStatus('generating');
    }
  }, [isOpen]);

  const generateQR = async () => {
    setLoading(true);
    setConnectionStatus('generating');

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-qr', {
        body: { deviceId, action: 'generate' }
      });

      if (error) throw error;

      if (data.success) {
        setQrData(data.qrData);
        setConnectionStatus('waiting');
        
        // Start polling for connection status
        startPolling();
        
        toast({
          title: "QR Code Generated",
          description: "Scan dengan WhatsApp untuk menghubungkan device",
        });
      }
    } catch (error) {
      console.error('Error generating QR:', error);
      setConnectionStatus('error');
      toast({
        title: "Error",
        description: "Gagal generate QR code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('whatsapp_devices')
          .select('connection_status')
          .eq('id', deviceId)
          .single();

        if (error) throw error;

        if (data.connection_status === 'connected') {
          setConnectionStatus('connected');
          clearInterval(interval);
          
          setTimeout(() => {
            onConnectionSuccess();
            onClose();
          }, 2000);
          
          toast({
            title: "Device Terhubung",
            description: `${deviceName} berhasil terhubung ke WhatsApp`,
          });
        }
      } catch (error) {
        console.error('Error polling status:', error);
        clearInterval(interval);
      }
    }, 3000);

    // Clear interval after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  const simulateConnection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-qr', {
        body: { deviceId, action: 'connect' }
      });

      if (error) throw error;

      if (data.success) {
        setConnectionStatus('connected');
        setTimeout(() => {
          onConnectionSuccess();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: "Error",
        description: "Gagal menghubungkan device",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Connect WhatsApp Device</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center">
          <h4 className="font-medium mb-2">{deviceName}</h4>
          
          {connectionStatus === 'generating' && (
            <div className="py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Generating QR Code...</p>
            </div>
          )}

          {connectionStatus === 'waiting' && qrData && (
            <div className="py-4">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="text-6xl font-mono break-all text-center">
                  📱
                </div>
                <p className="text-xs text-gray-500 mt-2">QR Code: {qrData.substring(0, 20)}...</p>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                1. Buka WhatsApp di ponsel Anda<br/>
                2. Tap Menu → Perangkat Tertaut<br/>
                3. Tap "Tautkan Perangkat"<br/>
                4. Scan QR code di atas
              </p>
              <button
                onClick={simulateConnection}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
              >
                Simulate Connection (Demo)
              </button>
            </div>
          )}

          {connectionStatus === 'connected' && (
            <div className="py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-green-600 font-medium">Device Connected!</p>
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="py-8">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 font-medium mb-4">Connection Failed</p>
              <button
                onClick={generateQR}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;

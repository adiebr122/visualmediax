
import React, { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/pdfUtils';
import { Building, Calendar, Mail, Phone, User, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface InvoiceItem {
  item_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoicePreviewProps {
  invoice: {
    invoice_number: string;
    client_name: string;
    client_email: string;
    client_company: string | null;
    client_address: string | null;
    invoice_date: string;
    due_date: string | null;
    subtotal: number;
    tax_percentage: number;
    tax_amount: number;
    total_amount: number;
    status: string;
    notes: string | null;
    terms_conditions: string | null;
  };
  items: InvoiceItem[];
  companyLogo?: string;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  items,
  companyLogo: propCompanyLogo,
  companyInfo: propCompanyInfo
}) => {
  const [brandSettings, setBrandSettings] = useState<any>({});
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBrandSettings();
    }
  }, [user]);

  const fetchBrandSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_category', 'brand_config')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const settings: any = {};
        data.forEach(setting => {
          settings[setting.setting_key] = setting.setting_value;
        });
        setBrandSettings(settings);
      }
    } catch (error) {
      console.error('Error fetching brand settings:', error);
    }
  };

  const companyLogo = brandSettings.company_logo || propCompanyLogo;
  const companyInfo = {
    name: brandSettings.company_name || propCompanyInfo?.name || 'Nama Perusahaan',
    address: brandSettings.company_address || propCompanyInfo?.address || 'Alamat Perusahaan',
    phone: brandSettings.company_phone || propCompanyInfo?.phone || 'No. Telepon',
    email: brandSettings.company_email || propCompanyInfo?.email || 'email@perusahaan.com'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'unpaid':
        return 'text-red-600 bg-red-100';
      case 'overdue':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'LUNAS';
      case 'unpaid':
        return 'BELUM LUNAS';
      case 'overdue':
        return 'TERLAMBAT';
      default:
        return status.toUpperCase();
    }
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" id="invoice-preview">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          {companyLogo && (
            <img
              src={companyLogo}
              alt="Company Logo"
              className="h-16 w-16 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
            <p className="text-lg text-gray-600">#{invoice.invoice_number}</p>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(invoice.status)}`}>
              {getStatusLabel(invoice.status)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-gray-900">
            {companyInfo.name}
          </h2>
          <p className="text-gray-600 mt-2 whitespace-pre-line">
            {companyInfo.address}
          </p>
          <div className="flex items-center justify-end mt-2 text-gray-600">
            <Phone className="h-4 w-4 mr-1" />
            <span>{companyInfo.phone}</span>
          </div>
          <div className="flex items-center justify-end mt-1 text-gray-600">
            <Mail className="h-4 w-4 mr-1" />
            <span>{companyInfo.email}</span>
          </div>
        </div>
      </div>

      {/* Client Info & Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Tagihan Kepada:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">{invoice.client_name}</span>
            </div>
            <div className="flex items-center mb-2">
              <Mail className="h-4 w-4 mr-2 text-gray-500" />
              <span>{invoice.client_email}</span>
            </div>
            {invoice.client_company && (
              <div className="flex items-center mb-2">
                <Building className="h-4 w-4 mr-2 text-gray-500" />
                <span>{invoice.client_company}</span>
              </div>
            )}
            {invoice.client_address && (
              <p className="text-gray-600 text-sm mt-2 whitespace-pre-line">
                {invoice.client_address}
              </p>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Detail Invoice:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Tanggal Invoice:</span>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                <span className="font-medium">
                  {new Date(invoice.invoice_date).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
            {invoice.due_date && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Jatuh Tempo:</span>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="font-medium">
                    {new Date(invoice.due_date).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rincian Tagihan:</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">No.</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Item</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Qty</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Harga Satuan</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="font-medium">{item.item_name}</div>
                    {item.description && (
                      <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-3 text-right">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-full max-w-md">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">PPN ({invoice.tax_percentage}%):</span>
              <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Tagihan:</span>
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(invoice.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      {(invoice.notes || invoice.terms_conditions) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {invoice.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Catatan:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
              </div>
            </div>
          )}
          
          {invoice.terms_conditions && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Syarat & Ketentuan:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">{invoice.terms_conditions}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Info */}
      {invoice.status === 'unpaid' && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-8">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Informasi Pembayaran:</h3>
          <p className="text-red-700">
            Silakan lakukan pembayaran sebelum tanggal jatuh tempo. 
            Hubungi kami jika ada pertanyaan mengenai invoice ini.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-600 text-sm border-t border-gray-200 pt-4">
        <p>Terima kasih atas kepercayaan Anda kepada layanan kami.</p>
        <p className="mt-1">Invoice ini dibuat secara otomatis pada {new Date().toLocaleDateString('id-ID')}</p>
      </div>
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/pdfUtils';
import { Building, Calendar, Mail, Phone, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface QuotationItem {
  item_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  total: number;
}

interface QuotationPreviewProps {
  quotation: {
    quotation_number: string;
    client_name: string;
    client_email: string;
    client_company: string | null;
    client_address: string | null;
    quotation_date: string;
    valid_until: string | null;
    subtotal: number;
    tax_percentage: number;
    tax_amount: number;
    total_amount: number;
    notes: string | null;
    terms_conditions: string | null;
  };
  items: QuotationItem[];
  companyLogo?: string;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export const QuotationPreview: React.FC<QuotationPreviewProps> = ({
  quotation,
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

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" id="quotation-preview">
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
            <h1 className="text-3xl font-bold text-gray-900">PENAWARAN</h1>
            <p className="text-lg text-gray-600">#{quotation.quotation_number}</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Kepada:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">{quotation.client_name}</span>
            </div>
            <div className="flex items-center mb-2">
              <Mail className="h-4 w-4 mr-2 text-gray-500" />
              <span>{quotation.client_email}</span>
            </div>
            {quotation.client_company && (
              <div className="flex items-center mb-2">
                <Building className="h-4 w-4 mr-2 text-gray-500" />
                <span>{quotation.client_company}</span>
              </div>
            )}
            {quotation.client_address && (
              <p className="text-gray-600 text-sm mt-2 whitespace-pre-line">
                {quotation.client_address}
              </p>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Detail Penawaran:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Tanggal Penawaran:</span>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                <span className="font-medium">
                  {new Date(quotation.quotation_date).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
            {quotation.valid_until && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Berlaku Hingga:</span>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="font-medium">
                    {new Date(quotation.valid_until).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rincian Penawaran:</h3>
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
              <span className="font-medium">{formatCurrency(quotation.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">PPN ({quotation.tax_percentage}%):</span>
              <span className="font-medium">{formatCurrency(quotation.tax_amount)}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(quotation.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      {(quotation.notes || quotation.terms_conditions) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {quotation.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Catatan:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">{quotation.notes}</p>
              </div>
            </div>
          )}
          
          {quotation.terms_conditions && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Syarat & Ketentuan:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">{quotation.terms_conditions}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-600 text-sm border-t border-gray-200 pt-4">
        <p>Terima kasih atas kepercayaan Anda kepada layanan kami.</p>
        <p className="mt-1">Penawaran ini dibuat secara otomatis pada {new Date().toLocaleDateString('id-ID')}</p>
      </div>
    </div>
  );
};

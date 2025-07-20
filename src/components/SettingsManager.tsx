import { useState } from 'react';
import { 
  Settings, 
  Globe, 
  Palette, 
  Users, 
  Bell, 
  Shield, 
  Database,
  Mail,
  Phone,
  MapPin,
  Share2,
  Search,
  BarChart3,
  Copyright,
  MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SEOSettings from './SEOSettings';
import SocialMediaSettings from './SocialMediaSettings';
import ContactInfoManager from './ContactInfoManager';
import AnalyticsSettings from './AnalyticsSettings';
import CopyrightSettings from './CopyrightSettings';
import BrandSettings from './BrandSettings';
import WhatsAppConfig from './WhatsAppConfig';

const SettingsManager = () => {
  const [activeTab, setActiveTab] = useState('seo');

  const settingsTabs = [
    {
      id: 'seo',
      label: 'SEO & Meta',
      icon: Search,
      description: 'Search Engine Optimization',
      component: SEOSettings
    },
    {
      id: 'brand',
      label: 'Brand Settings',
      icon: Palette,
      description: 'Brand identity & design',
      component: BrandSettings
    },
    {
      id: 'contact',
      label: 'Contact Info',
      icon: Phone,
      description: 'Contact information',
      component: ContactInfoManager
    },
    {
      id: 'social',
      label: 'Social Media',
      icon: Share2,
      description: 'Social media links',
      component: SocialMediaSettings
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      description: 'WhatsApp integration',
      component: WhatsAppConfig
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Google Analytics & tracking',
      component: AnalyticsSettings
    },
    {
      id: 'copyright',
      label: 'Copyright',
      icon: Copyright,
      description: 'Copyright information',
      component: CopyrightSettings
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center mb-2">
                <Settings className="h-8 w-8 mr-3 text-purple-200" />
                Pengaturan Website
              </CardTitle>
              <CardDescription className="text-purple-100 text-lg">
                Kelola semua pengaturan dan konfigurasi website Anda
              </CardDescription>
            </div>
            <div className="hidden md:block">
              <Globe className="h-16 w-16 text-purple-200" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Tabs */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            {/* Tab Navigation */}
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 h-auto p-2 bg-gray-100 rounded-2xl">
              {settingsTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center p-4 rounded-xl space-y-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300 hover:scale-105"
                  >
                    <IconComponent className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold text-sm">{tab.label}</div>
                      <div className="text-xs opacity-70 hidden lg:block">{tab.description}</div>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab Content */}
            <div className="min-h-[600px]">
              {settingsTabs.map((tab) => {
                const Component = tab.component;
                return (
                  <TabsContent key={tab.id} value={tab.id} className="mt-8">
                    <Component />
                  </TabsContent>
                );
              })}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManager;

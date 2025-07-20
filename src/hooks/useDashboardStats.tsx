
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalCRMContacts: number;
  activeQuotations: number;
  pendingInvoices: number;
  formSubmissions: number;
  clientLogos: number;
  portfolioProjects: number;
  testimonials: number;
  loading: boolean;
}

export const useDashboardStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalCRMContacts: 0,
    activeQuotations: 0,
    pendingInvoices: 0,
    formSubmissions: 0,
    clientLogos: 0,
    portfolioProjects: 0,
    testimonials: 0,
    loading: true,
  });

  const fetchStats = async () => {
    if (!user) return;

    try {
      setStats(prev => ({ ...prev, loading: true }));

      // Parallel fetch all statistics
      const [
        crmResponse,
        quotationsResponse,
        invoicesResponse,
        submissionsResponse,
        logosResponse,
        portfolioResponse,
        testimonialsResponse,
      ] = await Promise.all([
        supabase.from('user_management').select('id', { count: 'exact' }).eq('admin_user_id', user.id),
        supabase.from('quotations').select('id', { count: 'exact' }).eq('user_id', user.id).in('status', ['draft', 'sent']),
        supabase.from('invoices').select('id', { count: 'exact' }).eq('user_id', user.id).eq('status', 'unpaid'),
        supabase.from('form_submissions').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('client_logos').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('website_content').select('*').eq('section', 'portfolio').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
        supabase.from('testimonials').select('id', { count: 'exact' }).eq('user_id', user.id).eq('is_active', true),
      ]);

      // Count portfolio projects from metadata
      let portfolioCount = 0;
      if (portfolioResponse.data && portfolioResponse.data.metadata) {
        const metadata = portfolioResponse.data.metadata as any;
        if (metadata.projects && Array.isArray(metadata.projects)) {
          portfolioCount = metadata.projects.length;
        }
      }

      setStats({
        totalCRMContacts: crmResponse.count || 0,
        activeQuotations: quotationsResponse.count || 0,
        pendingInvoices: invoicesResponse.count || 0,
        formSubmissions: submissionsResponse.count || 0,
        clientLogos: logosResponse.count || 0,
        portfolioProjects: portfolioCount,
        testimonials: testimonialsResponse.count || 0,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return { stats, refetchStats: fetchStats };
};

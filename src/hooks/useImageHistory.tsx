import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

type ImageRequest = Tables<'image_requests'>;
type GeneratedImage = Tables<'generated_images'>;

export interface ImageRequestWithImages extends ImageRequest {
  generated_images: GeneratedImage[];
}

export const useImageHistory = () => {
  const [requests, setRequests] = useState<ImageRequestWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRequests();
      
      // Configurar subscription para atualizações em tempo real
      const subscription = supabase
        .channel('image_requests_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'image_requests',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchRequests();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'generated_images'
          },
          () => {
            fetchRequests();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('image_requests')
        .select(`
          *,
          generated_images (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setRequests(data || []);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const getRequestsByStatus = (status: string) => {
    return requests.filter(request => request.status === status);
  };

  const getRequestsByDateRange = (startDate: Date, endDate: Date) => {
    return requests.filter(request => {
      const requestDate = new Date(request.created_at || '');
      return requestDate >= startDate && requestDate <= endDate;
    });
  };

  const getRequestsByCategory = (category: string) => {
    return requests.filter(request => request.category === category);
  };

  const deleteRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('image_requests')
        .delete()
        .eq('id', requestId)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      // Atualizar lista local
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      return { success: true };
    } catch (err) {
      console.error('Erro ao deletar solicitação:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erro ao deletar' 
      };
    }
  };

  const retryRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('image_requests')
        .update({ 
          status: 'pending',
          processing_logs: null,
          n8n_execution_id: null
        })
        .eq('id', requestId)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      await fetchRequests();
      
      return { success: true };
    } catch (err) {
      console.error('Erro ao reprocessar solicitação:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erro ao reprocessar' 
      };
    }
  };

  const getRequestStats = () => {
    const total = requests.length;
    const completed = requests.filter(r => r.status === 'completed').length;
    const pending = requests.filter(r => r.status === 'pending' || r.status === 'processing').length;
    const failed = requests.filter(r => r.status === 'failed').length;
    
    const totalImages = requests.reduce((sum, req) => sum + req.generated_images.length, 0);
    
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const recentRequests = getRequestsByDateRange(lastMonth, new Date()).length;

    return {
      total,
      completed,
      pending,
      failed,
      totalImages,
      recentRequests,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  return {
    requests,
    loading,
    error,
    fetchRequests,
    getRequestsByStatus,
    getRequestsByDateRange,
    getRequestsByCategory,
    deleteRequest,
    retryRequest,
    getRequestStats
  };
};

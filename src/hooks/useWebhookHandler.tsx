import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WebhookResponse {
  id: number;
  image_request_id: number;
  n8n_execution_id: string;
  status: 'completed' | 'failed';
  generated_images?: string[];
  error_message?: string;
  created_at: string;
  processed_at?: string;
}

export const useWebhookHandler = () => {
  const [webhookResponses, setWebhookResponses] = useState<WebhookResponse[]>([]);
  const [isListening, setIsListening] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Configurar listener para respostas de webhook
    const subscription = supabase
      .channel('webhook-responses')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webhook_responses',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🎯 Nova resposta de webhook recebida:', payload.new);
          const newResponse = payload.new as WebhookResponse;
          setWebhookResponses(prev => [...prev, newResponse]);
          
          // Notificar outros componentes sobre a nova resposta
          window.dispatchEvent(new CustomEvent('webhookResponse', { 
            detail: newResponse 
          }));
        }
      )
      .subscribe();

    setIsListening(true);

    return () => {
      subscription.unsubscribe();
      setIsListening(false);
    };
  }, [user]);

  // Função para marcar resposta como processada
  const markResponseAsProcessed = async (responseId: number) => {
    try {
      await supabase
        .from('webhook_responses')
        .update({ processed_at: new Date().toISOString() })
        .eq('id', responseId);
      
      console.log('✅ Resposta marcada como processada:', responseId);
    } catch (error) {
      console.error('❌ Erro ao marcar resposta como processada:', error);
    }
  };

  // Função para buscar respostas não processadas
  const fetchUnprocessedResponses = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('webhook_responses')
        .select('*')
        .eq('user_id', user.id)
        .is('processed_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar respostas não processadas:', error);
      return [];
    }
  };

  return {
    webhookResponses,
    isListening,
    markResponseAsProcessed,
    fetchUnprocessedResponses
  };
};

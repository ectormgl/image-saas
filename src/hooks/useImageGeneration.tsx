import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWebhookHandler } from './useWebhookHandler';

export interface ImageGenerationRequest {
  productName: string;
  slogan?: string;
  category: string;
  benefits: string;
  productImage: string;
  userId: string;
  requestId: string;
  brandTone?: string;
  colorTheme?: string;
  targetAudience?: string;
  stylePreferences?: string;
}

export interface ImageGenerationResult {
  success: boolean;
  requestId: string;
  executionId?: string;
  images?: string[];
  error?: string;
}

export const useImageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<string>('idle');
  const { user } = useAuth();
  const { webhookResponses, markResponseAsProcessed } = useWebhookHandler();

  // Escutar respostas de webhook para o request atual
  useEffect(() => {
    if (!currentRequestId) return;

    const handleWebhookResponse = (event: CustomEvent) => {
      const response = event.detail;
      
      // Verificar se esta resposta é para o request atual
      if (response.request_id === currentRequestId) {
        console.log('🎯 Resposta de webhook para request atual:', response);
        
        if (response.status === 'completed' && response.generated_images) {
          setGenerationProgress(100);
          setGenerationStatus('completed');
          setIsGenerating(false);
          
          // Marcar como processada
          markResponseAsProcessed(response.id);
          
          // Disparar evento personalizado com as imagens
          window.dispatchEvent(new CustomEvent('imagesGenerated', {
            detail: {
              requestId: currentRequestId,
              images: response.generated_images
            }
          }));
        } else if (response.status === 'failed') {
          setGenerationStatus('error');
          setIsGenerating(false);
          
          // Disparar evento de erro
          window.dispatchEvent(new CustomEvent('imageGenerationError', {
            detail: {
              requestId: currentRequestId,
              error: response.error_message || 'Erro desconhecido'
            }
          }));
        }
      }
    };

    window.addEventListener('webhookResponse', handleWebhookResponse as EventListener);
    
    return () => {
      window.removeEventListener('webhookResponse', handleWebhookResponse as EventListener);
    };
  }, [currentRequestId, markResponseAsProcessed]);

  const generateImages = async (requestData: ImageGenerationRequest): Promise<ImageGenerationResult> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    setIsGenerating(true);
    setCurrentRequestId(requestData.requestId);
    setGenerationProgress(10);
    setGenerationStatus('starting');

    try {
      // 1. Salvar request no banco de dados
      const { data: imageRequest, error: dbError } = await supabase
        .from('image_requests')
        .insert({
          user_id: user.id,
          request_id: requestData.requestId,
          product_name: requestData.productName,
          category: requestData.category,
          slogan: requestData.slogan,
          image_input_url: requestData.productImage,
          target_audience: requestData.targetAudience,
          style_preferences: requestData.stylePreferences,
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Erro ao salvar solicitação: ${dbError.message}`);
      }

      setGenerationProgress(25);
      setGenerationStatus('calling_n8n');

      // 2. Chamar workflow N8N via webhook
      const webhookUrl = 'https://primary-production-8c118.up.railway.app/webhook/generate-image';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageRequestId: imageRequest.id,
          ...requestData,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na chamada do webhook: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📡 Resposta do N8N webhook:', result);

      setGenerationProgress(50);
      setGenerationStatus('processing');

      // 3. Atualizar request com execution ID
      if (result.executionId) {
        await supabase
          .from('image_requests')
          .update({
            n8n_execution_id: result.executionId,
            status: 'processing'
          })
          .eq('id', imageRequest.id);
      }

      // 4. Aguardar resposta via webhook (será tratada pelo useEffect)
      return {
        success: true,
        requestId: requestData.requestId,
        executionId: result.executionId
      };

    } catch (error) {
      console.error('❌ Erro na geração de imagens:', error);
      setIsGenerating(false);
      setGenerationStatus('error');
      
      throw error;
    }
  };

  const cancelGeneration = () => {
    setIsGenerating(false);
    setCurrentRequestId(null);
    setGenerationProgress(0);
    setGenerationStatus('idle');
  };

  return {
    generateImages,
    cancelGeneration,
    isGenerating,
    generationProgress,
    generationStatus,
    currentRequestId
  };
};

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface N8nWorkflowData {
  productName: string;
  slogan?: string;
  category: string;
  benefits: string;
  productImage: string;
  userId: string;
  requestId: string;
  // Enhanced fields for AI image generation
  brandName?: string;
  brandTone?: string;
  colorTheme?: string;
  backgroundTone?: string;
  surfaceType?: string;
  lighting?: string;
  cameraAngle?: string;
  accentProp?: string;
  productPlacement?: string;
  compositionGuidelines?: string;
  visualMood?: string;
  texturePreferences?: string;
  premiumLevel?: string;
  overlayText?: string;
  typographyStyle?: string;
  socialMediaFormat?: string;
  marketingGoal?: string;
  targetAudience?: string;
  stylePreferences?: string;
  // Mantido para compatibilidade
  theme?: string;
  brandColors?: {
    primary: string;
    secondary: string;
  };
  additionalInfo?: string;
  imageUrl?: string;
}

export interface N8nResponse {
  executionId: string;
  workflowId: string;
  status: 'running' | 'success' | 'error';
  success?: boolean;
  data?: any;
  error?: string;
}

export const useN8nIntegration = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<string>('idle');
  const { user } = useAuth();
  
  // Use environment variables for N8N configuration
  const n8nConfig = {
    baseUrl: import.meta.env.VITE_N8N_BASE_URL || 'https://primary-production-8c118.up.railway.app/',
    apiKey: import.meta.env.VITE_N8N_API_KEY || '',
    webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || `${import.meta.env.VITE_N8N_BASE_URL}/webhook/generate-image` || "https://primary-production-8c118.up.railway.app/webhook/generate-image"
  };

  const executeWorkflow = async (
    workflowData: N8nWorkflowData,
    customWorkflowId?: string
  ): Promise<N8nResponse> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Use the webhook URL from environment variables if no custom workflow ID is provided
    const workflowIdToUse = customWorkflowId || 'generate-image';

    setIsExecuting(true);
    setExecutionStatus('starting');

    let imageRequest: any = null;

    try {
      // Primeiro, salvar a solicitação no banco de dados
      const { data: dbImageRequest, error: dbError } = await supabase
        .from('image_requests')
        .insert({
          user_id: user.id,
          product_name: workflowData.productName,
          category: workflowData.category,
          slogan: workflowData.slogan,
          image_input_url: workflowData.imageUrl || null, // Handle nullable image URL
          status: 'pending', // Ensure this matches the check constraint exactly
          // Only include enhanced fields that exist in the current schema
          ...(workflowData.theme && { theme: workflowData.theme }),
          ...(workflowData.targetAudience && { target_audience: workflowData.targetAudience }),
          ...(workflowData.brandColors && { brand_colors: workflowData.brandColors }),
          ...(workflowData.stylePreferences && { style_preferences: workflowData.stylePreferences }),
          ...(workflowData.benefits && { benefits: workflowData.benefits }),
          ...(workflowData.additionalInfo && { additional_info: workflowData.additionalInfo }),
          ...(workflowData.requestId && { request_id: workflowData.requestId }),
          // Enhanced AI generation fields (conditional inclusion)
          ...(workflowData.brandName && { brand_name: workflowData.brandName }),
          ...(workflowData.brandTone && { brand_tone: workflowData.brandTone }),
          ...(workflowData.colorTheme && { color_theme: workflowData.colorTheme }),
          ...(workflowData.backgroundTone && { background_tone: workflowData.backgroundTone }),
          ...(workflowData.surfaceType && { surface_type: workflowData.surfaceType }),
          ...(workflowData.lighting && { lighting: workflowData.lighting }),
          ...(workflowData.cameraAngle && { camera_angle: workflowData.cameraAngle }),
          ...(workflowData.accentProp && { accent_prop: workflowData.accentProp }),
          ...(workflowData.productPlacement && { product_placement: workflowData.productPlacement }),
          ...(workflowData.compositionGuidelines && { composition_guidelines: workflowData.compositionGuidelines }),
          ...(workflowData.visualMood && { visual_mood: workflowData.visualMood }),
          ...(workflowData.texturePreferences && { texture_preferences: workflowData.texturePreferences }),
          ...(workflowData.premiumLevel && { premium_level: workflowData.premiumLevel }),
          ...(workflowData.overlayText && { overlay_text: workflowData.overlayText }),
          ...(workflowData.typographyStyle && { typography_style: workflowData.typographyStyle }),
          ...(workflowData.socialMediaFormat && { social_media_format: workflowData.socialMediaFormat }),
          ...(workflowData.marketingGoal && { marketing_goal: workflowData.marketingGoal })
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Erro ao salvar solicitação: ${dbError.message}`);
      }

      imageRequest = dbImageRequest;

      // Log inicial
      await supabase.from('processing_logs').insert({
        image_request_id: imageRequest.id,
        step_name: 'workflow_started',
        status: 'started',
        message: 'Iniciando workflow de geração de imagens'
      });

      setExecutionStatus('processing');

      // Executar workflow no n8n
      const n8nPayload = {
        imageRequestId: imageRequest.id,
        ...workflowData,
        userId: user.id,
        timestamp: new Date().toISOString()
      };

      // Usar o workflow ID personalizado se fornecido, caso contrário usar o padrão do .env
      const workflowIdToUse = customWorkflowId || 'generate-image';
      const n8nResponse = await executeN8nWorkflow(workflowIdToUse, n8nPayload);

      // Atualizar solicitação com IDs do n8n
      await supabase
        .from('image_requests')
        .update({
          n8n_workflow_id: n8nResponse.workflowId,
          n8n_execution_id: n8nResponse.executionId,
          status: 'processing'
        })
        .eq('id', imageRequest.id);

      // Log de sucesso
      await supabase.from('processing_logs').insert({
        image_request_id: imageRequest.id,
        step_name: 'n8n_execution',
        status: 'completed',
        message: `Workflow executado com sucesso. Execution ID: ${n8nResponse.executionId}`,
        data: { executionId: n8nResponse.executionId, workflowId: n8nResponse.workflowId }
      });

      setExecutionStatus('completed');

      return n8nResponse;
    } catch (error) {
      console.error('Erro na execução do workflow:', error);
      setExecutionStatus('error');
      
      // Log de erro
      if (user && imageRequest) {
        await supabase.from('processing_logs').insert({
          image_request_id: imageRequest.id,
          step_name: 'workflow_error',
          status: 'failed',
          message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }

      throw error;
    } finally {
      setIsExecuting(false);
    }
  };

  const checkExecutionStatus = async (executionId: string): Promise<any> => {
    try {
      // Em desenvolvimento, simular check de status
      if (import.meta.env.DEV || !n8nConfig.apiKey) {
        // Simular processo de geração
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              finished: true,
              data: {
                images: [
                  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=600&fit=crop',
                  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=600&fit=crop'
                ]
              }
            });
          }, 2000);
        });
      }

      const response = await fetch(`${n8nConfig.baseUrl}/api/v1/executions/${executionId}`, {
        headers: {
          'Authorization': `Bearer ${n8nConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao verificar status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar status da execução:', error);
      throw error;
    }
  };

  // Função privada para executar workflow no n8n
  const executeN8nWorkflow = async (workflowId: string, data: any): Promise<N8nResponse> => {
    try {
      // Use the configured webhook URL directly
      const webhookUrl = n8nConfig.webhookUrl;
      
      console.log('🚀 Calling N8N webhook:', webhookUrl);
      console.log('📤 Payload:', data);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Erro na execução do workflow: ${response.statusText}`);
      }

      const result = await response.json();

      // Se for ambiente de desenvolvimento, simular resposta
      if (import.meta.env.DEV) {
        return {
          executionId: `exec_${Date.now()}`,
          workflowId: workflowId,
          status: 'running',
          success: true,
          data: result
        };
      }

      return {
        ...result,
        success: true
      };
    } catch (error) {
      console.error('Erro na chamada para n8n:', error);
      
      // Fallback para desenvolvimento
      if (import.meta.env.DEV) {
        return {
          executionId: `dev_exec_${Date.now()}`,
          workflowId: workflowId,
          status: 'running',
          success: true,
          data: { message: 'Desenvolvimento - workflow simulado' }
        };
      }

      throw error;
    }
  };

  return {
    executeWorkflow,
    checkExecutionStatus,
    isExecuting,
    executionStatus,
    n8nConfig
  };
};

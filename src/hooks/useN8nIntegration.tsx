import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface N8nWorkflowData {
  productName: string;
  category: string;
  theme: string;
  targetAudience: string;
  brandColors: {
    primary: string;
    secondary: string;
  };
  stylePreferences: string;
  additionalInfo: string;
  imageUrl: string;
  slogan?: string;
}

export interface N8nResponse {
  executionId: string;
  workflowId: string;
  status: 'running' | 'success' | 'error';
  data?: any;
  error?: string;
}

export const useN8nIntegration = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<string>('idle');
  const { user } = useAuth();

  // URL base do n8n (deve ser configurada via variáveis de ambiente)
  const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL || 'https://your-n8n-instance.com';
  const N8N_API_KEY = import.meta.env.VITE_N8N_API_KEY || '';

  const executeWorkflow = async (
    workflowData: N8nWorkflowData,
    workflowId: string = 'image-generation-workflow'
  ): Promise<N8nResponse> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

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
          image_input_url: workflowData.imageUrl,
          theme: workflowData.theme,
          target_audience: workflowData.targetAudience,
          brand_colors: workflowData.brandColors,
          style_preferences: workflowData.stylePreferences,
          status: 'pending'
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

      // Simulação da chamada para n8n (substitua pela implementação real)
      const n8nResponse = await executeN8nWorkflow(workflowId, n8nPayload);

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
      const response = await fetch(`${N8N_BASE_URL}/api/v1/executions/${executionId}`, {
        headers: {
          'Authorization': `Bearer ${N8N_API_KEY}`,
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
      // Para desenvolvimento, usar webhook ou API direta
      const response = await fetch(`${N8N_BASE_URL}/webhook/${workflowId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${N8N_API_KEY}`
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
          data: result
        };
      }

      return result;
    } catch (error) {
      console.error('Erro na chamada para n8n:', error);
      
      // Fallback para desenvolvimento
      if (import.meta.env.DEV) {
        return {
          executionId: `dev_exec_${Date.now()}`,
          workflowId: workflowId,
          status: 'running',
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
    executionStatus
  };
};

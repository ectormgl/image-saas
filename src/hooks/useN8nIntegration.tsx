import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useN8nWorkflowManager } from '@/hooks/useN8nWorkflowManager';

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
  const { activeWorkflow } = useN8nWorkflowManager();
  
  // URL base do n8n (será substituído pelo workflow ativo do usuário, se existir)
  const [n8nConfig, setN8nConfig] = useState({
    baseUrl: import.meta.env.VITE_N8N_BASE_URL || 'https://your-n8n-instance.com',
    apiKey: import.meta.env.VITE_N8N_API_KEY || '',
    workflowId: '',
    webhookUrl: ''
  });

  // Atualizar a configuração quando o workflow ativo mudar
  useEffect(() => {
    if (activeWorkflow) {
      setN8nConfig({
        baseUrl: activeWorkflow.workflow_url,
        apiKey: activeWorkflow.api_key || '',
        workflowId: activeWorkflow.cloned_workflow_id || '',
        webhookUrl: activeWorkflow.webhook_url || ''
      });
    }
  }, [activeWorkflow]);

  const executeWorkflow = async (
    workflowData: N8nWorkflowData,
    customWorkflowId?: string
  ): Promise<N8nResponse> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se existe um workflow ativo
    if (!activeWorkflow && !customWorkflowId) {
      throw new Error('Nenhum workflow ativo configurado. Configure um workflow em "Configurações".');
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

      // Usar o workflow ID personalizado se fornecido, caso contrário usar o workflow ativo
      const workflowIdToUse = customWorkflowId || n8nConfig.workflowId || 'default-workflow';
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
      // Determinar a URL correta para execução
      const webhookOrApi = n8nConfig.webhookUrl || `${n8nConfig.baseUrl}/webhook/${workflowId}`;
      
      const response = await fetch(webhookOrApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(n8nConfig.apiKey && { 'Authorization': `Bearer ${n8nConfig.apiKey}` })
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
    executionStatus,
    activeWorkflow
  };
};

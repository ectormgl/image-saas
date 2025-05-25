import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  workflow_id: string;
  n8n_base_url: string;
  is_active: boolean;
}

interface UserWorkflow {
  id: string;
  workflow_name: string;
  workflow_url: string;
  webhook_url: string | null;
  api_key: string | null;
  is_active: boolean;
  template_workflow_id: string | null;
  cloned_workflow_id: string | null;
  last_sync_at: string | null;
}

export const useN8nWorkflowManager = () => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [userWorkflows, setUserWorkflows] = useState<UserWorkflow[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<UserWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Carregar templates e workflows do usuário quando componente montar
  useEffect(() => {
    if (user) {
      Promise.all([
        fetchTemplates(),
        fetchUserWorkflows()
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  // Buscar templates de workflow disponíveis
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('n8n_workflow_templates')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      setTemplates(data || []);
      return data;
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os templates de workflow.",
        variant: "destructive"
      });
      return [];
    }
  };

  // Buscar workflows do usuário atual
  const fetchUserWorkflows = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('n8n_configurations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setUserWorkflows(data || []);
      
      // Se houver workflows, definir o primeiro como ativo
      if (data && data.length > 0) {
        const activeWorkflow = data.find(wf => wf.is_active) || data[0];
        setActiveWorkflow(activeWorkflow);
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar workflows do usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus workflows.",
        variant: "destructive"
      });
      return [];
    }
  };

  // Clonar um template de workflow para o usuário
  const cloneWorkflow = async (templateId: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um workflow.",
        variant: "destructive"
      });
      return null;
    }

    setCloning(true);

    try {
      // Verificar se o template existe
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template não encontrado');
      }

      // Chamar API do n8n para clonar o workflow
      const n8nApiKey = import.meta.env.VITE_N8N_ADMIN_API_KEY;
      const n8nBaseUrl = template.n8n_base_url;

      if (!n8nApiKey || !n8nBaseUrl) {
        throw new Error('Configurações de API do n8n não encontradas');
      }

      // 1. Obter o workflow original do n8n
      const getWorkflowResponse = await fetch(`${n8nBaseUrl}/api/v1/workflows/${template.workflow_id}`, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': n8nApiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!getWorkflowResponse.ok) {
        throw new Error(`Erro ao obter workflow: ${getWorkflowResponse.statusText}`);
      }

      const originalWorkflow = await getWorkflowResponse.json();

      // 2. Criar uma cópia do workflow para o usuário
      const workflowData = {
        ...originalWorkflow,
        name: `${originalWorkflow.name} - ${user.email}`,
        active: false, // Inicialmente inativo
        id: undefined // Remover ID para criar um novo
      };

      const createWorkflowResponse = await fetch(`${n8nBaseUrl}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': n8nApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflowData)
      });

      if (!createWorkflowResponse.ok) {
        throw new Error(`Erro ao criar workflow: ${createWorkflowResponse.statusText}`);
      }

      const newWorkflow = await createWorkflowResponse.json();

      // 3. Salvar a configuração no banco de dados
      const { data, error } = await supabase
        .from('n8n_configurations')
        .insert({
          user_id: user.id,
          workflow_name: `${template.name} - Personalizado`,
          workflow_url: template.n8n_base_url,
          template_workflow_id: template.workflow_id,
          cloned_workflow_id: newWorkflow.id,
          is_active: true,
          last_sync_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // 4. Atualizar o estado local
      setUserWorkflows(prev => [data, ...prev]);
      setActiveWorkflow(data);

      toast({
        title: "Sucesso!",
        description: "Workflow clonado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Erro ao clonar workflow:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao clonar workflow.",
        variant: "destructive"
      });
      return null;
    } finally {
      setCloning(false);
    }
  };

  // Atualizar configuração do workflow
  const updateWorkflowConfig = async (workflowId: string, apiKey: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('n8n_configurations')
        .update({
          api_key: apiKey,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Atualizar o estado local
      setUserWorkflows(prev => 
        prev.map(wf => wf.id === workflowId ? { ...wf, api_key } : wf)
      );
      
      if (activeWorkflow?.id === workflowId) {
        setActiveWorkflow(prev => prev ? { ...prev, api_key } : null);
      }
      
      toast({
        title: "Sucesso!",
        description: "Configuração do workflow atualizada.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Ativar/desativar workflow
  const toggleWorkflowActive = async (workflowId: string, isActive: boolean) => {
    if (!user) return false;
    
    try {
      // Se estamos ativando este workflow, desativar todos os outros
      if (isActive) {
        await supabase
          .from('n8n_configurations')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .neq('id', workflowId);
      }
      
      // Atualizar o status deste workflow
      const { data, error } = await supabase
        .from('n8n_configurations')
        .update({ is_active: isActive })
        .eq('id', workflowId)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar estado local
      setUserWorkflows(prev => prev.map(wf => {
        if (wf.id === workflowId) return { ...wf, is_active: isActive };
        return isActive ? { ...wf, is_active: false } : wf;
      }));
      
      // Se ativamos este workflow, defini-lo como ativo
      if (isActive) {
        setActiveWorkflow(data);
      } else if (activeWorkflow?.id === workflowId) {
        setActiveWorkflow(null);
      }
      
      toast({
        title: "Sucesso!",
        description: isActive 
          ? "Workflow ativado com sucesso." 
          : "Workflow desativado com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao alterar status do workflow:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do workflow.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Excluir workflow
  const deleteWorkflow = async (workflowId: string) => {
    if (!user) return false;
    
    try {
      // Verificar se é o workflow ativo
      const workflow = userWorkflows.find(wf => wf.id === workflowId);
      if (!workflow) {
        throw new Error('Workflow não encontrado');
      }
      
      // Primeiro, excluir no n8n se tiver cloned_workflow_id
      if (workflow.cloned_workflow_id) {
        const n8nApiKey = import.meta.env.VITE_N8N_ADMIN_API_KEY;
        const n8nBaseUrl = workflow.workflow_url;
        
        if (n8nApiKey && n8nBaseUrl) {
          try {
            await fetch(`${n8nBaseUrl}/api/v1/workflows/${workflow.cloned_workflow_id}`, {
              method: 'DELETE',
              headers: {
                'X-N8N-API-KEY': n8nApiKey,
                'Content-Type': 'application/json'
              }
            });
          } catch (e) {
            console.warn('Erro ao excluir workflow no n8n:', e);
            // Continuar mesmo se falhar a exclusão no n8n
          }
        }
      }
      
      // Excluir no banco de dados
      const { error } = await supabase
        .from('n8n_configurations')
        .delete()
        .eq('id', workflowId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Atualizar estado local
      setUserWorkflows(prev => prev.filter(wf => wf.id !== workflowId));
      
      if (activeWorkflow?.id === workflowId) {
        // Se excluímos o workflow ativo, definir o primeiro disponível como ativo
        const nextWorkflow = userWorkflows.find(wf => wf.id !== workflowId);
        if (nextWorkflow) {
          setActiveWorkflow(nextWorkflow);
          await toggleWorkflowActive(nextWorkflow.id, true);
        } else {
          setActiveWorkflow(null);
        }
      }
      
      toast({
        title: "Sucesso!",
        description: "Workflow excluído com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir workflow:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o workflow.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Testar conexão com o workflow
  const testWorkflowConnection = async (workflowId: string) => {
    try {
      const workflow = userWorkflows.find(wf => wf.id === workflowId);
      if (!workflow) {
        throw new Error('Workflow não encontrado');
      }

      if (!workflow.api_key || !workflow.cloned_workflow_id) {
        throw new Error('Configuração incompleta do workflow');
      }

      // Testar conexão com o n8n
      const testResponse = await fetch(`${workflow.workflow_url}/api/v1/workflows/${workflow.cloned_workflow_id}`, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': workflow.api_key,
          'Content-Type': 'application/json'
        }
      });

      if (!testResponse.ok) {
        throw new Error(`Erro na conexão: ${testResponse.statusText}`);
      }

      toast({
        title: "Sucesso!",
        description: "Conexão com o n8n estabelecida com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao testar conexão com o workflow.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Atualizar workflow a partir do template original
  const syncWorkflowWithTemplate = async (workflowId: string) => {
    if (!user) return false;
    
    try {
      const workflow = userWorkflows.find(wf => wf.id === workflowId);
      if (!workflow) {
        throw new Error('Workflow não encontrado');
      }
      
      if (!workflow.template_workflow_id || !workflow.cloned_workflow_id) {
        throw new Error('Workflow não tem informações de template');
      }
      
      const n8nApiKey = import.meta.env.VITE_N8N_ADMIN_API_KEY;
      const n8nBaseUrl = workflow.workflow_url;
      
      if (!n8nApiKey || !n8nBaseUrl) {
        throw new Error('Configurações de API do n8n não encontradas');
      }
      
      // 1. Obter o template atualizado
      const getTemplateResponse = await fetch(`${n8nBaseUrl}/api/v1/workflows/${workflow.template_workflow_id}`, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': n8nApiKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (!getTemplateResponse.ok) {
        throw new Error(`Erro ao obter template: ${getTemplateResponse.statusText}`);
      }
      
      const templateWorkflow = await getTemplateResponse.json();
      
      // 2. Obter o workflow do usuário
      const getUserWorkflowResponse = await fetch(`${n8nBaseUrl}/api/v1/workflows/${workflow.cloned_workflow_id}`, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': n8nApiKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (!getUserWorkflowResponse.ok) {
        throw new Error(`Erro ao obter workflow do usuário: ${getUserWorkflowResponse.statusText}`);
      }
      
      const userWorkflow = await getUserWorkflowResponse.json();
      
      // 3. Mesclar o template com o workflow do usuário (mantendo configurações personalizadas)
      const mergedWorkflow = {
        ...templateWorkflow,
        id: userWorkflow.id,
        name: userWorkflow.name,
        active: userWorkflow.active,
        // Manter outras personalizações específicas do usuário conforme necessário
      };
      
      // 4. Atualizar o workflow do usuário no n8n
      const updateResponse = await fetch(`${n8nBaseUrl}/api/v1/workflows/${workflow.cloned_workflow_id}`, {
        method: 'PUT',
        headers: {
          'X-N8N-API-KEY': n8nApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mergedWorkflow)
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Erro ao atualizar workflow: ${updateResponse.statusText}`);
      }
      
      // 5. Atualizar o último horário de sincronização no banco de dados
      const { error } = await supabase
        .from('n8n_configurations')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', workflowId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // 6. Atualizar estado local
      setUserWorkflows(prev => 
        prev.map(wf => wf.id === workflowId ? { ...wf, last_sync_at: new Date().toISOString() } : wf)
      );
      
      toast({
        title: "Sucesso!",
        description: "Workflow sincronizado com o template original.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao sincronizar workflow:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao sincronizar workflow.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    templates,
    userWorkflows,
    activeWorkflow,
    loading,
    cloning,
    fetchTemplates,
    fetchUserWorkflows,
    cloneWorkflow,
    updateWorkflowConfig,
    toggleWorkflowActive,
    deleteWorkflow,
    testWorkflowConnection,
    syncWorkflowWithTemplate
  };
};

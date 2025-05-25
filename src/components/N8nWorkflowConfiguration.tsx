import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useN8nWorkflowManager } from '@/hooks/useN8nWorkflowManager';

export const N8nWorkflowConfiguration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
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
  } = useN8nWorkflowManager();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Função para testar a conexão com um workflow
  const handleTestConnection = async (workflowId: string) => {
    const success = await testWorkflowConnection(workflowId);
    if (success) {
      toast({
        title: "Conexão bem-sucedida",
        description: "O workflow n8n está respondendo corretamente.",
      });
    }
  };

  // Função para atualizar a API key de um workflow
  const handleUpdateApiKey = async (workflowId: string) => {
    if (!newApiKey) {
      toast({
        title: "Campo obrigatório",
        description: "A chave API é necessária para autenticação com o n8n.",
        variant: "destructive"
      });
      return;
    }

    const success = await updateWorkflowConfig(workflowId, newApiKey);
    if (success) {
      setNewApiKey('');
    }
  };

  // Função para confirmar e excluir um workflow
  const handleConfirmDelete = async (workflowId: string) => {
    await deleteWorkflow(workflowId);
    setConfirmDelete(null);
  };

  // Função para sincronizar um workflow com seu template
  const handleSync = async (workflowId: string) => {
    await syncWorkflowWithTemplate(workflowId);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="templates">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Templates de Workflow</TabsTrigger>
          <TabsTrigger value="user-workflows">Meus Workflows</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Workflow do n8n</CardTitle>
              <CardDescription>
                Escolha um template de workflow para clonar e personalizar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Como funciona:</strong> Escolha um template de workflow abaixo e clique em "Clonar" para 
                  criar sua própria cópia. Você poderá personalizar as configurações do seu workflow conforme necessário.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {templates.length === 0 ? (
                  <div className="text-center p-4 border rounded-lg border-dashed">
                    <p className="text-gray-500">Nenhum template disponível no momento.</p>
                  </div>
                ) : (
                  templates.map(template => (
                    <div 
                      key={template.id} 
                      className="p-4 border rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        </div>
                        <Button
                          onClick={() => cloneWorkflow(template.id)}
                          disabled={cloning}
                          size="sm"
                        >
                          {cloning ? 'Clonando...' : 'Clonar'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="user-workflows" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Meus Workflows</CardTitle>
              <CardDescription>
                Gerencie seus workflows personalizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userWorkflows.length === 0 ? (
                <div className="text-center p-8 border rounded-lg border-dashed">
                  <p className="text-gray-500 mb-4">Você ainda não tem nenhum workflow configurado.</p>
                  <Button 
                    onClick={() => document.querySelector<HTMLElement>('[data-value="templates"]')?.click()} 
                    variant="outline"
                  >
                    Explorar templates
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {userWorkflows.map(workflow => (
                    <div 
                      key={workflow.id} 
                      className={`p-4 border rounded-lg ${workflow.is_active ? 'border-blue-400 bg-blue-50' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{workflow.workflow_name}</h4>
                            <Badge variant={workflow.is_active ? "default" : "secondary"}>
                              {workflow.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{workflow.workflow_url}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestConnection(workflow.id)}
                          >
                            Testar
                          </Button>
                          
                          <Button
                            variant={workflow.is_active ? "secondary" : "default"}
                            size="sm"
                            onClick={() => toggleWorkflowActive(workflow.id, !workflow.is_active)}
                          >
                            {workflow.is_active ? 'Desativar' : 'Ativar'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label htmlFor={`api_key_${workflow.id}`}>API Key</Label>
                          <div className="flex mt-1">
                            <Input
                              id={`api_key_${workflow.id}`}
                              type="password"
                              value={newApiKey}
                              onChange={(e) => setNewApiKey(e.target.value)}
                              placeholder={workflow.api_key ? '••••••••' : 'Digite sua API key do n8n'}
                              className="rounded-r-none"
                            />
                            <Button 
                              onClick={() => handleUpdateApiKey(workflow.id)}
                              className="rounded-l-none"
                            >
                              Salvar
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="text-sm text-gray-500">
                          {workflow.last_sync_at ? (
                            <>Última sincronização: {new Date(workflow.last_sync_at).toLocaleString()}</>
                          ) : (
                            <>Nunca sincronizado</>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {workflow.template_workflow_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSync(workflow.id)}
                            >
                              Sincronizar
                            </Button>
                          )}
                          
                          {confirmDelete === workflow.id ? (
                            <>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleConfirmDelete(workflow.id)}
                              >
                                Confirmar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setConfirmDelete(null)}
                              >
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setConfirmDelete(workflow.id)}
                            >
                              Excluir
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Exemplo de Payload</CardTitle>
          <CardDescription>
            Este é o formato dos dados que serão enviados para seu workflow n8n
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={JSON.stringify({
              imageRequestId: "uuid-exemplo",
              productName: "Produto Exemplo",
              category: "fashion",
              theme: "modern",
              targetAudience: "millennials",
              brandColors: {
                primary: "#3B82F6",
                secondary: "#8B5CF6"
              },
              stylePreferences: "cores vibrantes, fundo limpo",
              additionalInfo: "Destacar qualidade premium",
              imageUrl: "https://storage.url/image.jpg",
              slogan: "Seu slogan aqui",
              userId: "user-uuid",
              timestamp: "2024-01-01T12:00:00Z"
            }, null, 2)}
            rows={15}
            readOnly
            className="font-mono text-xs"
          />
        </CardContent>
      </Card>
    </div>
  );
};

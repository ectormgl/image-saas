import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface N8nConfiguration {
  id: string;
  workflow_name: string;
  workflow_url: string;
  webhook_url?: string;
  api_key?: string;
  is_active: boolean;
}

export const N8nWorkflowConfiguration = () => {
  const [configurations, setConfigurations] = useState<N8nConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [newConfig, setNewConfig] = useState({
    workflow_name: 'Image Generation Workflow',
    workflow_url: '',
    webhook_url: '',
    api_key: ''
  });

  useEffect(() => {
    if (user) {
      fetchConfigurations();
    }
  }, [user]);

  const fetchConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('n8n_configurations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setConfigurations(data || []);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações do n8n.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    if (!user) return;

    if (!newConfig.workflow_name || !newConfig.workflow_url) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome do workflow e URL são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('n8n_configurations')
        .insert({
          user_id: user.id,
          ...newConfig,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setConfigurations(prev => [data, ...prev]);
      setNewConfig({
        workflow_name: 'Image Generation Workflow',
        workflow_url: '',
        webhook_url: '',
        api_key: ''
      });

      toast({
        title: "Sucesso",
        description: "Configuração do n8n salva com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (config: N8nConfiguration) => {
    setTestingConnection(true);

    try {
      // Fazer uma chamada de teste para o n8n
      const response = await fetch(config.webhook_url || config.workflow_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.api_key && { 'Authorization': `Bearer ${config.api_key}` })
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast({
          title: "Conexão bem-sucedida",
          description: "O workflow n8n está respondendo corretamente.",
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      toast({
        title: "Erro na conexão",
        description: error instanceof Error ? error.message : "Não foi possível conectar ao n8n.",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const toggleConfiguration = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('n8n_configurations')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setConfigurations(prev =>
        prev.map(config =>
          config.id === id ? { ...config, is_active: !isActive } : config
        )
      );

      toast({
        title: "Configuração atualizada",
        description: `Workflow ${!isActive ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração.",
        variant: "destructive"
      });
    }
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
      <Card>
        <CardHeader>
          <CardTitle>Configuração do n8n</CardTitle>
          <CardDescription>
            Configure seus workflows do n8n para automação da geração de imagens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Importante:</strong> Você precisa ter um workflow n8n configurado que aceite 
              dados de produto e retorne URLs de imagens geradas. 
              <a 
                href="https://docs.n8n.io/webhooks/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                Saiba mais sobre webhooks n8n
              </a>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workflow_name">Nome do Workflow *</Label>
              <Input
                id="workflow_name"
                value={newConfig.workflow_name}
                onChange={(e) => setNewConfig(prev => ({ ...prev, workflow_name: e.target.value }))}
                placeholder="Ex: Image Generation Workflow"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="workflow_url">URL do Workflow *</Label>
              <Input
                id="workflow_url"
                value={newConfig.workflow_url}
                onChange={(e) => setNewConfig(prev => ({ ...prev, workflow_url: e.target.value }))}
                placeholder="https://your-n8n.com/workflow/..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="webhook_url">URL do Webhook (Opcional)</Label>
              <Input
                id="webhook_url"
                value={newConfig.webhook_url}
                onChange={(e) => setNewConfig(prev => ({ ...prev, webhook_url: e.target.value }))}
                placeholder="https://your-n8n.com/webhook/..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="api_key">API Key (Opcional)</Label>
              <Input
                id="api_key"
                type="password"
                value={newConfig.api_key}
                onChange={(e) => setNewConfig(prev => ({ ...prev, api_key: e.target.value }))}
                placeholder="Sua API key do n8n"
                className="mt-1"
              />
            </div>
          </div>

          <Button 
            onClick={saveConfiguration} 
            disabled={saving}
            className="w-full"
          >
            {saving ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
        </CardContent>
      </Card>

      {configurations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Workflows Configurados</CardTitle>
            <CardDescription>
              Gerencie seus workflows do n8n
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {configurations.map((config) => (
                <div 
                  key={config.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{config.workflow_name}</h4>
                      <Badge variant={config.is_active ? "default" : "secondary"}>
                        {config.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {config.webhook_url || config.workflow_url}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(config)}
                      disabled={testingConnection}
                    >
                      {testingConnection ? 'Testando...' : 'Testar'}
                    </Button>
                    
                    <Button
                      variant={config.is_active ? "secondary" : "default"}
                      size="sm"
                      onClick={() => toggleConfiguration(config.id, config.is_active)}
                    >
                      {config.is_active ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

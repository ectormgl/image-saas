import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useAuth } from '@/contexts/AuthContext';
import { useN8nIntegration } from '@/hooks/useN8nIntegration';

export const DebugPanel = () => {
  const { user } = useAuth();
  const { n8nConfig } = useN8nIntegration();
  const { credits, loading: creditsLoading } = useUserCredits();
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Mostrar debug apenas em desenvolvimento
    setShowDebug(import.meta.env.DEV);
  }, []);

  if (!showDebug || !user) return null;

  return (
    <Card className="mt-8 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Debug Panel (Development)
          <Badge variant="secondary">DEV</Badge>
        </CardTitle>
        <CardDescription>
          Informações de debug para verificar a implementação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">👤 Usuário:</h4>
          <p className="text-sm text-gray-600">
            ID: {user.id}<br/>
            Email: {user.email}
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">💳 Créditos:</h4>
          <p className="text-sm text-gray-600">
            Total: {credits}<br/>
            Status: {creditsLoading ? 'Carregando...' : 'Carregado'}
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">🔄 N8N Configuration:</h4>
          <p className="text-sm text-gray-600">
            Webhook URL: {n8nConfig.webhookUrl || 'Não configurado'}<br/>
            Status: {n8nConfig.webhookUrl ? '✅ Configurado' : '❌ Não configurado'}
          </p>
          {n8nConfig.webhookUrl && (
            <div className="mt-2 p-2 bg-green-100 rounded text-xs">
              <strong>N8N Webhook Ativo:</strong><br/>
              URL: {n8nConfig.webhookUrl}
            </div>
          )}
        </div>

        <div>
          <h4 className="font-semibold mb-2">🌍 Ambiente:</h4>
          <p className="text-sm text-gray-600">
            N8N Webhook URL: {import.meta.env.VITE_N8N_WEBHOOK_URL || 'Não configurado'}<br/>
            Dev Mode: {import.meta.env.VITE_DEV_MODE}<br/>
            Supabase URL: {import.meta.env.VITE_SUPABASE_URL}
          </p>
        </div>

        <div className="text-xs text-gray-500 border-t pt-2">
          💡 Este painel só aparece em desenvolvimento. Verifique se:
          <ul className="list-disc list-inside mt-1">
            <li>A URL do webhook N8N está configurada no .env</li>
            <li>Os créditos foram adicionados</li>
            <li>A integração n8n está funcionando</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

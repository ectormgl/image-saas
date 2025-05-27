import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

export const N8nWorkflowConfiguration = () => {
  // Get the N8N webhook URL from environment variables
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
  const isConfigured = Boolean(webhookUrl);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Configuração do n8n
            <Badge variant={isConfigured ? "default" : "destructive"}>
              {isConfigured ? 'Configurado' : 'Não Configurado'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Status da integração com n8n para geração automática de imagens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <div className="flex items-center gap-2">
              {isConfigured ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {isConfigured ? (
                  <span>
                    <strong>n8n está configurado e pronto para uso!</strong><br/>
                    Todas as solicitações de imagem serão processadas automaticamente através do workflow configurado.
                  </span>
                ) : (
                  <span>
                    <strong>n8n não está configurado.</strong><br/>
                    Entre em contato com o administrador para configurar a URL do webhook do n8n.
                  </span>
                )}
              </AlertDescription>
            </div>
          </Alert>

          {isConfigured && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Configuração Atual:</h4>
              <p className="text-sm text-gray-600 break-all">
                <strong>Webhook URL:</strong> {webhookUrl}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
          <CardDescription>
            Processo automatizado de geração de imagens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">1</div>
              <div>
                <strong>Solicitação de Imagem:</strong> Você preenche o formulário com detalhes do produto
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">2</div>
              <div>
                <strong>Processamento Automático:</strong> Os dados são enviados para o workflow n8n configurado
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">3</div>
              <div>
                <strong>Geração de Imagem:</strong> O n8n processa a solicitação e gera a imagem automaticamente
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">4</div>
              <div>
                <strong>Resultado:</strong> A imagem gerada é salva e você recebe uma notificação
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exemplo de Payload</CardTitle>
          <CardDescription>
            Este é o formato dos dados que serão enviados para o workflow n8n
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

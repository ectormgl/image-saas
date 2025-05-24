
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useImageRequests } from '@/hooks/useImageRequests';
import { useUserStats } from '@/hooks/useUserStats';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Dashboard = () => {
  const { credits, loading: creditsLoading } = useUserCredits();
  const { imageRequests, loading: requestsLoading } = useImageRequests();
  const { stats, loading: statsLoading } = useUserStats();

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'processing':
        return 'Processando';
      case 'failed':
        return 'Falhou';
      case 'queued':
        return 'Na fila';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-700">Créditos Restantes</CardTitle>
            <CardDescription>Gerações disponíveis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 mb-2">
              {creditsLoading ? '...' : credits}
            </div>
            <div className="text-sm text-blue-600">créditos disponíveis</div>
            <Progress value={Math.min(credits * 10, 100)} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-700">Total de Gerações</CardTitle>
            <CardDescription>Este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 mb-2">
              {statsLoading ? '...' : stats.totalGenerations}
            </div>
            <div className="text-sm text-purple-600">gerações realizadas</div>
            <div className="mt-3 text-xs text-purple-500">
              {stats.totalImages} imagens criadas
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-700">Taxa de Sucesso</CardTitle>
            <CardDescription>Gerações de qualidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-2">
              {statsLoading ? '...' : `${stats.successRate}%`}
            </div>
            <div className="text-sm text-green-600">Excelente qualidade</div>
            <Progress value={stats.successRate} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gerações Recentes</CardTitle>
            <CardDescription>Suas últimas gerações de imagens IA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requestsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-pulse text-gray-500">Carregando...</div>
                </div>
              ) : imageRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma geração ainda.</p>
                  <p className="text-sm">Comece criando sua primeira imagem!</p>
                </div>
              ) : (
                imageRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{request.product_name}</h4>
                      <p className="text-sm text-gray-600">{formatDate(request.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {request.generated_images?.length || 0} imagens
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análise de Uso</CardTitle>
            <CardDescription>Seus padrões de geração</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-pulse text-gray-500">Carregando...</div>
                </div>
              ) : Object.keys(stats.categoryStats).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma categoria ainda.</p>
                  <p className="text-sm">Comece gerando imagens para ver suas estatísticas!</p>
                </div>
              ) : (
                Object.entries(stats.categoryStats).map(([category, count]) => {
                  const percentage = stats.totalGenerations > 0 ? Math.round((count / stats.totalGenerations) * 100) : 0;
                  return (
                    <div key={category}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{category}</span>
                        <span className="font-medium">{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="mt-1" />
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cobrança e Créditos</CardTitle>
          <CardDescription>Gerencie sua assinatura e compre créditos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <h4 className="font-medium mb-2">Plano Atual: Starter</h4>
              <p className="text-sm text-gray-600 mb-4">10 créditos por mês • R$ 49/mês</p>
              <Button variant="outline" className="w-full sm:w-auto">
                Atualizar Plano
              </Button>
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-2">Precisa de Mais Créditos?</h4>
              <p className="text-sm text-gray-600 mb-4">Compre créditos adicionais por R$ 30 cada</p>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600">
                Comprar Créditos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

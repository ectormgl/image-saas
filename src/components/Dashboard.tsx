
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useImageRequests } from '@/hooks/useImageRequests';
import { useUserStats } from '@/hooks/useUserStats';
import { ImageHistory } from './ImageHistory';
import { CreationWorkflow } from './CreationWorkflow';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Image as ImageIcon, 
  Plus, 
  CreditCard, 
  TrendingUp,
  History,
  Star
} from 'lucide-react';

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
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="create" className="gap-2">
            <Plus className="h-4 w-4" />
            Criar
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Cobrança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-700 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Créditos Restantes
                </CardTitle>
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
                <CardTitle className="text-purple-700 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Total de Gerações
                </CardTitle>
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
                <CardTitle className="text-green-700 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Taxa de Sucesso
                </CardTitle>
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

          {/* Seções de Conteúdo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Gerações Recentes
                </CardTitle>
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
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Nenhuma geração ainda.</p>
                      <p className="text-sm">Comece criando sua primeira imagem!</p>
                    </div>
                  ) : (
                    imageRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden">
                            <img
                              src={request.image_input_url}
                              alt="Input"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium">{request.product_name}</h4>
                            <p className="text-sm text-gray-600">{formatDate(request.created_at)}</p>
                          </div>
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
                {imageRequests.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" size="sm">
                      Ver todas as gerações
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Análise de Uso
                </CardTitle>
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
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
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

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>Comece a criar novas imagens ou gerencie sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex flex-col gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="h-6 w-6" />
                  Nova Geração
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <History className="h-6 w-6" />
                  Ver Histórico
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <CreditCard className="h-6 w-6" />
                  Comprar Créditos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <ImageHistory />
        </TabsContent>

        <TabsContent value="create">
          <CreationWorkflow />
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Cobrança e Créditos
              </CardTitle>
              <CardDescription>Gerencie sua assinatura e compre créditos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border rounded-lg">
                    <h4 className="font-medium mb-2">Plano Atual: Starter</h4>
                    <p className="text-sm text-gray-600 mb-4">10 créditos por mês • R$ 49/mês</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Créditos usados este mês:</span>
                        <span>{10 - credits}/10</span>
                      </div>
                      <Progress value={((10 - credits) / 10) * 100} />
                    </div>
                    <Button variant="outline" className="w-full">
                      Atualizar Plano
                    </Button>
                  </div>
                  
                  <div className="p-6 border rounded-lg">
                    <h4 className="font-medium mb-2">Precisa de Mais Créditos?</h4>
                    <p className="text-sm text-gray-600 mb-4">Compre créditos adicionais</p>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="text-sm">5 créditos</span>
                        <span className="font-medium">R$ 25</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded bg-blue-50">
                        <span className="text-sm">10 créditos</span>
                        <span className="font-medium">R$ 45 <span className="text-xs text-green-600">(10% off)</span></span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="text-sm">25 créditos</span>
                        <span className="font-medium">R$ 100 <span className="text-xs text-green-600">(20% off)</span></span>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      Comprar Créditos
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

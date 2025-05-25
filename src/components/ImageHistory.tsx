import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MoreHorizontal, 
  Download, 
  Trash2, 
  RefreshCw, 
  Calendar,
  Clock,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useImageHistory } from '@/hooks/useImageHistory';
import { ImageDownloader } from './ImageDownloader';
import { ImagePreviewModal } from './ImagePreviewModal';
import { useToast } from '@/hooks/use-toast';

export const ImageHistory: React.FC = () => {
  const { 
    requests, 
    loading, 
    error, 
    deleteRequest, 
    retryRequest,
    getRequestStats 
  } = useImageHistory();
  
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    type: string;
  } | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<string | null>(null);
  const [retryingRequest, setRetryingRequest] = useState<string | null>(null);
  
  const { toast } = useToast();

  const stats = getRequestStats();

  const handleDeleteRequest = async (requestId: string) => {
    setDeletingRequest(requestId);
    
    const result = await deleteRequest(requestId);
    
    if (result.success) {
      toast({
        title: "Solicitação excluída",
        description: "A solicitação foi removida com sucesso.",
      });
    } else {
      toast({
        title: "Erro ao excluir",
        description: result.error,
        variant: "destructive",
      });
    }
    
    setDeletingRequest(null);
  };

  const handleRetryRequest = async (requestId: string) => {
    setRetryingRequest(requestId);
    
    const result = await retryRequest(requestId);
    
    if (result.success) {
      toast({
        title: "Solicitação reprocessada",
        description: "A solicitação está sendo processada novamente.",
      });
    } else {
      toast({
        title: "Erro ao reprocessar",
        description: result.error,
        variant: "destructive",
      });
    }
    
    setRetryingRequest(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pendente',
      'processing': 'Processando',
      'completed': 'Concluído',
      'failed': 'Falhou'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando histórico...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">Erro ao carregar histórico: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total de Solicitações</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Concluídas</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Imagens Geradas</p>
                <p className="text-2xl font-bold">{stats.totalImages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Solicitações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="completed">Concluídas</TabsTrigger>
                <TabsTrigger value="processing">Processando</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="failed">Falharam</TabsTrigger>
              </TabsList>
              
              {['all', 'completed', 'processing', 'pending', 'failed'].map(status => (
                <TabsContent key={status} value={status} className="space-y-4">
                  {requests
                    .filter(req => status === 'all' || req.status === status)
                    .map(request => (
                      <div
                        key={request.id}
                        className={`border rounded-lg p-4 transition-all ${
                          selectedRequest === request.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
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
                              <h3 className="font-semibold">{request.product_name}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                {getStatusIcon(request.status)}
                                <Badge 
                                  variant="secondary" 
                                  className={getStatusColor(request.status)}
                                >
                                  {getStatusLabel(request.status)}
                                </Badge>
                                <span>•</span>
                                <span>{new Date(request.created_at!).toLocaleDateString('pt-BR')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {request.status === 'failed' && (
                                <DropdownMenuItem 
                                  onClick={() => handleRetryRequest(request.id)}
                                  disabled={retryingRequest === request.id}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Reprocessar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDeleteRequest(request.id)}
                                disabled={deletingRequest === request.id}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Detalhes da Solicitação */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          {request.category && (
                            <div>
                              <span className="font-medium">Categoria:</span> {request.category}
                            </div>
                          )}
                          {request.theme && (
                            <div>
                              <span className="font-medium">Tema:</span> {request.theme}
                            </div>
                          )}
                          {request.target_audience && (
                            <div>
                              <span className="font-medium">Público:</span> {request.target_audience}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Imagens:</span> {request.generated_images.length}
                          </div>
                        </div>

                        {/* Imagens Geradas */}
                        {request.generated_images.length > 0 && (
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => 
                                setSelectedRequest(
                                  selectedRequest === request.id ? null : request.id
                                )
                              }
                              className="mb-3"
                            >
                              {selectedRequest === request.id ? 'Ocultar' : 'Ver'} Imagens
                              ({request.generated_images.length})
                            </Button>

                            {selectedRequest === request.id && (
                              <ImageDownloader
                                images={request.generated_images}
                                requestId={request.id}
                                onPreview={(url, type) => setPreviewImage({ url, type })}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Modal de Preview */}
      {previewImage && (
        <ImagePreviewModal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          imageUrl={previewImage.url}
          imageType={previewImage.type}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Eye, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedImage {
  id: string;
  type: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

interface ImageDownloaderProps {
  images: GeneratedImage[];
  requestId: string;
  onPreview: (imageUrl: string, type: string) => void;
}

export const ImageDownloader: React.FC<ImageDownloaderProps> = ({
  images,
  requestId,
  onPreview
}) => {
  const [downloadingItems, setDownloadingItems] = useState<Set<string>>(new Set());
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const downloadImage = async (image: GeneratedImage) => {
    if (downloadingItems.has(image.id)) return;

    setDownloadingItems(prev => new Set([...prev, image.id]));
    setDownloadProgress(prev => ({ ...prev, [image.id]: 0 }));

    try {
      const response = await fetch(image.image_url);
      
      if (!response.ok) {
        throw new Error('Falha ao baixar a imagem');
      }

      const reader = response.body?.getReader();
      const contentLength = Number(response.headers.get('Content-Length'));
      
      if (!reader) {
        throw new Error('Não foi possível ler o stream da imagem');
      }

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (contentLength) {
          const progress = (receivedLength / contentLength) * 100;
          setDownloadProgress(prev => ({ ...prev, [image.id]: progress }));
        }
      }

      // Criar blob e fazer download
      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${image.type}_${requestId}_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      toast({
        title: "Download concluído",
        description: `Imagem ${image.type} baixada com sucesso!`,
      });

    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro no download",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setDownloadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(image.id);
        return newSet;
      });
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[image.id];
        return newProgress;
      });
    }
  };

  const downloadAllImages = async () => {
    if (downloadingAll || images.length === 0) return;

    setDownloadingAll(true);

    try {
      // Download sequencial para evitar sobrecarga
      for (const image of images) {
        if (!downloadingItems.has(image.id)) {
          await downloadImage(image);
          // Pequena pausa entre downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      toast({
        title: "Downloads concluídos",
        description: `Todas as ${images.length} imagens foram baixadas!`,
      });

    } catch (error) {
      console.error('Erro no download em lote:', error);
      toast({
        title: "Erro nos downloads",
        description: "Alguns downloads podem ter falhado",
        variant: "destructive",
      });
    } finally {
      setDownloadingAll(false);
    }
  };

  const getImageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'instagram_post': 'Post Instagram',
      'instagram_story': 'Story Instagram',
      'product_detail': 'Detalhe do Produto',
      'banner': 'Banner',
      'thumbnail': 'Miniatura'
    };
    return labels[type] || type;
  };

  const getImageTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'instagram_post': 'bg-pink-100 text-pink-800',
      'instagram_story': 'bg-purple-100 text-purple-800',
      'product_detail': 'bg-blue-100 text-blue-800',
      'banner': 'bg-green-100 text-green-800',
      'thumbnail': 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (images.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma imagem disponível para download</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          Imagens Geradas ({images.length})
        </CardTitle>
        <Button
          onClick={downloadAllImages}
          disabled={downloadingAll || downloadingItems.size > 0}
          className="gap-2"
        >
          {downloadingAll ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Baixar Todas
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {images.map((image) => {
          const isDownloading = downloadingItems.has(image.id);
          const progress = downloadProgress[image.id] || 0;

          return (
            <div
              key={image.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={image.image_url}
                    alt={`${image.type} preview`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className={getImageTypeColor(image.type)}
                    >
                      {getImageTypeLabel(image.type)}
                    </Badge>
                    {!isDownloading && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {image.caption && (
                    <p className="text-sm text-gray-600 max-w-xs truncate">
                      {image.caption}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(image.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPreview(image.image_url, image.type)}
                  className="gap-1"
                >
                  <Eye className="h-4 w-4" />
                  Ver
                </Button>
                <Button
                  onClick={() => downloadImage(image)}
                  disabled={isDownloading}
                  size="sm"
                  className="gap-1 min-w-[80px]"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {Math.round(progress)}%
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Baixar
                    </>
                  )}
                </Button>
              </div>

              {isDownloading && (
                <div className="absolute bottom-0 left-0 right-0">
                  <Progress value={progress} className="h-1" />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, X } from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageType: string;
  onDownload?: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageType,
  onDownload
}) => {
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

  const getImageDimensions = (type: string) => {
    const dimensions: Record<string, { width: string; height: string; ratio: string }> = {
      'instagram_post': { width: '1080px', height: '1080px', ratio: '1:1' },
      'instagram_story': { width: '1080px', height: '1920px', ratio: '9:16' },
      'product_detail': { width: '1200px', height: '1200px', ratio: '1:1' },
      'banner': { width: '1920px', height: '1080px', ratio: '16:9' },
      'thumbnail': { width: '400px', height: '400px', ratio: '1:1' }
    };
    return dimensions[type] || { width: 'Auto', height: 'Auto', ratio: 'Auto' };
  };

  const dimensions = getImageDimensions(imageType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-2">
            <DialogTitle className="text-xl font-semibold">
              Visualização da Imagem
            </DialogTitle>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-sm">
                {getImageTypeLabel(imageType)}
              </Badge>
              <span className="text-sm text-gray-500">
                {dimensions.width} × {dimensions.height} ({dimensions.ratio})
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onDownload && (
              <Button
                onClick={onDownload}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="gap-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="flex justify-center p-4">
            <div className="relative max-w-full max-h-[70vh] bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <img
                src={imageUrl}
                alt={`Preview ${getImageTypeLabel(imageType)}`}
                className="max-w-full max-h-full object-contain"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  width: 'auto',
                  height: 'auto'
                }}
                onError={(e) => {
                  console.error('Erro ao carregar imagem:', imageUrl);
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Formato:</span> JPG/PNG
            </div>
            <div>
              <span className="font-medium">Qualidade:</span> Alta resolução
            </div>
            <div>
              <span className="font-medium">Uso recomendado:</span>{' '}
              {getUsageRecommendation(imageType)}
            </div>
            <div>
              <span className="font-medium">Otimizado para:</span>{' '}
              {getOptimizedFor(imageType)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const getUsageRecommendation = (type: string) => {
  const recommendations: Record<string, string> = {
    'instagram_post': 'Feed do Instagram, Facebook',
    'instagram_story': 'Stories, Reels',
    'product_detail': 'E-commerce, catálogos',
    'banner': 'Sites, anúncios display',
    'thumbnail': 'Miniaturas, ícones'
  };
  return recommendations[type] || 'Uso geral';
};

const getOptimizedFor = (type: string) => {
  const optimizations: Record<string, string> = {
    'instagram_post': 'Redes sociais',
    'instagram_story': 'Mobile vertical',
    'product_detail': 'Visualização detalhada',
    'banner': 'Web e desktop',
    'thumbnail': 'Carregamento rápido'
  };
  return optimizations[type] || 'Multiplataforma';
};

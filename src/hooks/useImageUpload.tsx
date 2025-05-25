import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UploadResult {
  url: string;
  path: string;
  publicUrl: string;
}

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();

  const uploadImage = async (file: File, folder: string = 'products'): Promise<UploadResult> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validar arquivo
      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('Arquivo muito grande. Máximo 10MB.');
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não suportado. Use JPG, PNG ou WebP.');
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;
      const filePath = `${user.id}/${folder}/${fileName}`;

      // Simular progresso (em uma implementação real, você usaria um listener de progresso)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      // Fazer upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) {
        throw new Error(`Erro no upload: ${error.message}`);
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      setUploadProgress(100);

      return {
        url: publicUrlData.publicUrl,
        path: filePath,
        publicUrl: publicUrlData.publicUrl
      };

    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const deleteImage = async (filePath: string): Promise<void> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const { error } = await supabase.storage
        .from('user-uploads')
        .remove([filePath]);

      if (error) {
        throw new Error(`Erro ao deletar arquivo: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      throw error;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
    uploadProgress
  };
};

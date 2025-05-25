import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  business_name: string | null;
  default_slogan: string | null;
  category: string | null;
  brand_colors: {
    primary: string;
    secondary: string;
  } | null;
  logo_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProfileUpdateData {
  business_name: string;
  default_slogan: string;
  category: string;
  brand_colors: {
    primary: string;
    secondary: string;
  };
  logo_url?: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setProfile(null);
        return;
      }

      // Buscar perfil na tabela profiles
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Perfil não existe, criar um novo
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email?.split('@')[0] || '',
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating profile:', insertError);
            throw insertError;
          }

          // Converter dados do banco para o formato esperado
          const profile: UserProfile = {
            ...newProfile,
            brand_colors: newProfile.brand_colors as { primary: string; secondary: string } | null,
          };

          setProfile(profile);
        } else {
          throw error;
        }
      } else {
        // Converter dados do banco para o formato esperado
        const profile: UserProfile = {
          ...profileData,
          brand_colors: profileData.brand_colors as { primary: string; secondary: string } | null,
        };

        setProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erro ao carregar perfil",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updateData: ProfileUpdateData) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para atualizar o perfil.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setUpdating(true);
      
      // Atualizar perfil na tabela profiles
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: updateData.business_name,
          default_slogan: updateData.default_slogan,
          category: updateData.category,
          brand_colors: updateData.brand_colors,
          logo_url: updateData.logo_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as alterações do perfil.",
          variant: "destructive",
        });
        return false;
      }

      // Atualizar o estado local
      setProfile(prev => prev ? {
        ...prev,
        business_name: updateData.business_name,
        default_slogan: updateData.default_slogan,
        category: updateData.category,
        brand_colors: updateData.brand_colors,
        logo_url: updateData.logo_url || prev.logo_url,
        updated_at: new Date().toISOString(),
      } : null);

      toast({
        title: "Perfil salvo!",
        description: "Suas informações foram atualizadas com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro inesperado ao salvar o perfil.",
        variant: "destructive",
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer upload do logo.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload para o bucket user-uploads
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        toast({
          title: "Erro no upload",
          description: "Não foi possível fazer upload do logo.",
          variant: "destructive",
        });
        // Fallback para base64 se houver erro
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      const { data } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      // Fallback para base64 se o storage não estiver disponível
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  return {
    profile,
    loading,
    updating,
    updateProfile,
    uploadLogo,
    refetch: fetchProfile,
  };
};

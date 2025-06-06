import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type Product = Tables<'products'>;

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  image_url?: string;
  brand_colors: {
    primary: string;
    secondary: string;
  };
  target_audience: string;
  style_preferences: string;
}

export const useUserProducts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setProducts([]);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Erro ao carregar produtos",
          description: "Não foi possível carregar seus produtos.",
          variant: "destructive",
        });
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar seus produtos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: ProductFormData): Promise<Product | null> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um produto.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: productData.name,
          description: productData.description,
          category: productData.category,
          image_url: productData.image_url,
          brand_colors: productData.brand_colors,
          target_audience: productData.target_audience,
          style_preferences: productData.style_preferences,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        toast({
          title: "Erro ao criar produto",
          description: "Não foi possível criar o produto.",
          variant: "destructive",
        });
        return null;
      }

      // Atualizar lista local
      setProducts(prev => [data, ...prev]);

      toast({
        title: "Produto criado!",
        description: "Seu produto foi criado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao criar o produto.",
        variant: "destructive",
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const updateProduct = async (id: string, productData: Partial<ProductFormData>): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para atualizar um produto.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        toast({
          title: "Erro ao atualizar produto",
          description: "Não foi possível atualizar o produto.",
          variant: "destructive",
        });
        return false;
      }

      // Atualizar lista local
      setProducts(prev => prev.map(product => 
        product.id === id ? data : product
      ));

      toast({
        title: "Produto atualizado!",
        description: "Seu produto foi atualizado com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao atualizar o produto.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para excluir um produto.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Erro ao excluir produto",
          description: "Não foi possível excluir o produto.",
          variant: "destructive",
        });
        return false;
      }

      // Atualizar lista local
      setProducts(prev => prev.filter(product => product.id !== id));

      toast({
        title: "Produto excluído!",
        description: "Seu produto foi excluído com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao excluir o produto.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    products,
    loading,
    saving,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
};

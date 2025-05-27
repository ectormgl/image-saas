import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: Json;
  is_active: boolean;
}

export const usePromptTemplates = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) {
        throw error;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTemplatesByCategory = (category: string) => {
    return templates.filter(template => template.category === category);
  };

  const generatePrompt = (template: PromptTemplate, variables: Record<string, string>) => {
    let prompt = template.template;
    
    // Substituir variáveis no template
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), value || '');
    });

    return prompt;
  };

  const getImageFormats = () => {
    return [
      {
        id: 'instagram_post',
        name: 'Instagram Post',
        dimensions: '1080x1080',
        description: 'Quadrado para feed do Instagram'
      },
      {
        id: 'instagram_story',
        name: 'Instagram Story',
        dimensions: '1080x1920',
        description: 'Vertical para stories do Instagram'
      },
      {
        id: 'product_detail',
        name: 'Product Detail',
        dimensions: '1200x1200',
        description: 'Imagem detalhada do produto'
      },
      {
        id: 'facebook_ad',
        name: 'Facebook Ad',
        dimensions: '1200x630',
        description: 'Anúncio para Facebook'
      },
      {
        id: 'website_banner',
        name: 'Website Banner',
        dimensions: '1920x600',
        description: 'Banner para website'
      }
    ];
  };

  return {
    templates,
    loading,
    getTemplatesByCategory,
    generatePrompt,
    getImageFormats,
    refreshTemplates: fetchTemplates
  };
};

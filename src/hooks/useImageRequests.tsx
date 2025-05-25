
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

type ImageRequest = Tables<'image_requests'>;
type GeneratedImage = Tables<'generated_images'>;

export interface ImageRequestWithImages extends ImageRequest {
  generated_images: GeneratedImage[];
}

export const useImageRequests = () => {
  const [imageRequests, setImageRequests] = useState<ImageRequestWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setImageRequests([]);
      setLoading(false);
      return;
    }

    const fetchImageRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('image_requests')
          .select(`
            *,
            generated_images (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching image requests:', error);
          return;
        }

        setImageRequests(data || []);
      } catch (error) {
        console.error('Error fetching image requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImageRequests();
  }, [user]);

  return { imageRequests, loading };
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ImageRequest {
  id: string;
  product_name: string;
  status: string;
  created_at: string;
  category?: string;
  generated_images?: { id: string; image_url: string }[];
}

export const useImageRequests = () => {
  const [imageRequests, setImageRequests] = useState<ImageRequest[]>([]);
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
            id,
            product_name,
            status,
            created_at,
            category,
            generated_images (
              id,
              image_url
            )
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


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserStats {
  totalGenerations: number;
  totalImages: number;
  successRate: number;
  categoryStats: { [key: string]: number };
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats>({
    totalGenerations: 0,
    totalImages: 0,
    successRate: 0,
    categoryStats: {}
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setStats({
        totalGenerations: 0,
        totalImages: 0,
        successRate: 0,
        categoryStats: {}
      });
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        // Get total generations and success rate
        const { data: requests, error: requestsError } = await supabase
          .from('image_requests')
          .select('status, category')
          .eq('user_id', user.id);

        if (requestsError) {
          console.error('Error fetching requests:', requestsError);
          return;
        }

        // Get total images generated
        const { data: images, error: imagesError } = await supabase
          .from('generated_images')
          .select('id')
          .in('image_request_id', requests?.map(r => r.id) || []);

        if (imagesError) {
          console.error('Error fetching images:', imagesError);
          return;
        }

        const totalGenerations = requests?.length || 0;
        const completedRequests = requests?.filter(r => r.status === 'completed').length || 0;
        const totalImages = images?.length || 0;
        const successRate = totalGenerations > 0 ? Math.round((completedRequests / totalGenerations) * 100) : 0;

        // Calculate category stats
        const categoryStats: { [key: string]: number } = {};
        requests?.forEach(request => {
          if (request.category) {
            categoryStats[request.category] = (categoryStats[request.category] || 0) + 1;
          }
        });

        setStats({
          totalGenerations,
          totalImages,
          successRate,
          categoryStats
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading };
};

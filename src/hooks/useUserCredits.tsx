
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserCredits = () => {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setCredits(0);
      setLoading(false);
      return;
    }

    const fetchCredits = async () => {
      try {
        const { data, error } = await supabase
          .from('credits')
          .select('amount')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching credits:', error);
          return;
        }

        const totalCredits = data?.reduce((sum, credit) => sum + credit.amount, 0) || 0;
        setCredits(totalCredits);
      } catch (error) {
        console.error('Error fetching credits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, [user]);

  return { credits, loading };
};

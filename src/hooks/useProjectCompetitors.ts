
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import type { Competitor } from '@/lib/types';

export const useProjectCompetitors = (projectId: string) => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchCompetitors = async () => {
    if (!user?.id || !projectId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('competitors')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching competitors:', error);
        toast.error('Failed to load competitors');
        return;
      }

      setCompetitors(data?.competitors || []);
    } catch (error) {
      console.error('Error fetching competitors:', error);
      toast.error('Failed to load competitors');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompetitors = async (updatedCompetitors: Competitor[]) => {
    if (!user?.id) {
      toast.error('You must be logged in to update competitors');
      return false;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          competitors: updatedCompetitors,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating competitors:', error);
        toast.error('Failed to update competitors');
        return false;
      }

      setCompetitors(updatedCompetitors);
      toast.success('Competitors updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating competitors:', error);
      toast.error('Failed to update competitors');
      return false;
    }
  };

  const addCompetitor = (competitor: Competitor) => {
    const updatedCompetitors = [...competitors, competitor];
    return updateCompetitors(updatedCompetitors);
  };

  const updateCompetitor = (competitorId: string, updates: Partial<Competitor>) => {
    const updatedCompetitors = competitors.map(comp =>
      comp.id === competitorId ? { ...comp, ...updates } : comp
    );
    return updateCompetitors(updatedCompetitors);
  };

  const removeCompetitor = (competitorId: string) => {
    const updatedCompetitors = competitors.filter(comp => comp.id !== competitorId);
    return updateCompetitors(updatedCompetitors);
  };

  useEffect(() => {
    fetchCompetitors();
  }, [user?.id, projectId]);

  return {
    competitors,
    isLoading,
    addCompetitor,
    updateCompetitor,
    removeCompetitor,
    refetchCompetitors: fetchCompetitors,
  };
};

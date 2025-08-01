
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
      // First try to get from normalized table
      const { data: normalizedData, error: normalizedError } = await supabase
        .from('project_competitors')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (normalizedError) {
        console.error('Error fetching competitors from normalized table:', normalizedError);
        toast.error('Failed to load competitors');
        return;
      }

      // Convert normalized data to Competitor format
      if (normalizedData && normalizedData.length > 0) {
        const competitorsData: Competitor[] = normalizedData.map(comp => ({
          id: comp.id,
          name: comp.name,
          website: comp.website || '',
          description: comp.description || '',
          isAiGenerated: comp.is_ai_generated || false,
        }));
        setCompetitors(competitorsData);
        return;
      }

      // Fallback: Check if data exists in JSONB format (legacy)
      const { data: legacyData, error: legacyError } = await supabase
        .from('projects')
        .select('competitors')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (legacyError) {
        console.error('Error fetching legacy competitors:', legacyError);
        setCompetitors([]);
        return;
      }

      // Parse legacy JSONB data
      const competitorsData = Array.isArray(legacyData?.competitors) ? legacyData.competitors as Competitor[] : [];
      setCompetitors(competitorsData);
    } catch (error) {
      console.error('Error fetching competitors:', error);
      toast.error('Failed to load competitors');
    } finally {
      setIsLoading(false);
    }
  };

  const addCompetitor = async (competitor: Competitor) => {
    if (!user?.id) {
      toast.error('You must be logged in to add competitors');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('project_competitors')
        .insert({
          project_id: projectId,
          name: competitor.name,
          website: competitor.website || '',
          description: competitor.description || '',
          is_ai_generated: competitor.isAiGenerated || false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding competitor:', error);
        toast.error('Failed to add competitor');
        return false;
      }

      const newCompetitor: Competitor = {
        id: data.id,
        name: data.name,
        website: data.website || '',
        description: data.description || '',
        isAiGenerated: data.is_ai_generated || false,
      };

      setCompetitors(prev => [...prev, newCompetitor]);
      toast.success('Competitor added successfully');
      return true;
    } catch (error) {
      console.error('Error adding competitor:', error);
      toast.error('Failed to add competitor');
      return false;
    }
  };

  const updateCompetitor = async (competitorId: string, updates: Partial<Competitor>) => {
    if (!user?.id) {
      toast.error('You must be logged in to update competitors');
      return false;
    }

    try {
      const { error } = await supabase
        .from('project_competitors')
        .update({
          name: updates.name,
          website: updates.website,
          description: updates.description,
          is_ai_generated: updates.isAiGenerated,
        })
        .eq('id', competitorId)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error updating competitor:', error);
        toast.error('Failed to update competitor');
        return false;
      }

      setCompetitors(prev => prev.map(comp =>
        comp.id === competitorId ? { ...comp, ...updates } : comp
      ));
      toast.success('Competitor updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating competitor:', error);
      toast.error('Failed to update competitor');
      return false;
    }
  };

  const removeCompetitor = async (competitorId: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to remove competitors');
      return false;
    }

    try {
      const { error } = await supabase
        .from('project_competitors')
        .delete()
        .eq('id', competitorId)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error removing competitor:', error);
        toast.error('Failed to remove competitor');
        return false;
      }

      setCompetitors(prev => prev.filter(comp => comp.id !== competitorId));
      toast.success('Competitor removed successfully');
      return true;
    } catch (error) {
      console.error('Error removing competitor:', error);
      toast.error('Failed to remove competitor');
      return false;
    }
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

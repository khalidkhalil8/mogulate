import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import type { Feature } from '@/lib/types';

export const useProjectFeatures = (projectId: string) => {
  const { user } = useAuth();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeatures = async () => {
    if (!user?.id || !projectId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_features')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching features:', error);
        toast.error('Failed to load features');
        return;
      }

      const formattedFeatures: Feature[] = data?.map(feature => ({
        id: feature.id,
        title: feature.title,
        description: feature.description || '',
        status: feature.status as 'Planned' | 'In Progress' | 'Done',
        priority: feature.priority as 'Low' | 'Medium' | 'High'
      })) || [];

      setFeatures(formattedFeatures);
    } catch (error) {
      console.error('Error in fetchFeatures:', error);
      toast.error('Failed to load features');
    } finally {
      setIsLoading(false);
    }
  };

  const addFeature = async (feature: Omit<Feature, 'id'>) => {
    if (!user?.id || !projectId) return false;

    try {
      const { data, error } = await supabase
        .from('project_features')
        .insert({
          project_id: projectId,
          title: feature.title,
          description: feature.description,
          status: feature.status,
          priority: feature.priority
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding feature:', error);
        toast.error('Failed to add feature');
        return false;
      }

      const newFeature: Feature = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        status: data.status as 'Planned' | 'In Progress' | 'Done',
        priority: data.priority as 'Low' | 'Medium' | 'High'
      };

      setFeatures(prev => [...prev, newFeature]);
      toast.success('Feature added successfully');
      return true;
    } catch (error) {
      console.error('Error in addFeature:', error);
      toast.error('Failed to add feature');
      return false;
    }
  };

  const updateFeature = async (featureId: string, updates: Partial<Feature>) => {
    if (!user?.id || !projectId) return false;

    try {
      const { error } = await supabase
        .from('project_features')
        .update({
          title: updates.title,
          description: updates.description,
          status: updates.status,
          priority: updates.priority
        })
        .eq('id', featureId)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error updating feature:', error);
        toast.error('Failed to update feature');
        return false;
      }

      setFeatures(prev => prev.map(feature => 
        feature.id === featureId ? { ...feature, ...updates } : feature
      ));
      toast.success('Feature updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updateFeature:', error);
      toast.error('Failed to update feature');
      return false;
    }
  };

  const removeFeature = async (featureId: string) => {
    if (!user?.id || !projectId) return false;

    try {
      const { error } = await supabase
        .from('project_features')
        .delete()
        .eq('id', featureId)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error removing feature:', error);
        toast.error('Failed to remove feature');
        return false;
      }

      setFeatures(prev => prev.filter(feature => feature.id !== featureId));
      toast.success('Feature removed successfully');
      return true;
    } catch (error) {
      console.error('Error in removeFeature:', error);
      toast.error('Failed to remove feature');
      return false;
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [user?.id, projectId]);

  return {
    features,
    isLoading,
    addFeature,
    updateFeature,
    removeFeature,
    refetchFeatures: fetchFeatures,
  };
};
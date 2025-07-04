
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  idea?: string;
  competitors?: any[];
  market_gaps?: string;
  market_gap_analysis?: any;
  features?: any[];
  validation_plan?: string;
  selected_gap_index?: number;
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
        return;
      }

      const transformedData: Project[] = (data || []).map(item => ({
        ...item,
        competitors: Array.isArray(item.competitors) ? item.competitors : [],
        features: Array.isArray(item.features) ? item.features : [],
        market_gap_analysis: item.market_gap_analysis || undefined,
        selected_gap_index: item.selected_gap_index ?? undefined,
      }));

      setProjects(transformedData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (title: string, idea?: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to create a project');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title,
          idea: idea || '',
          features: [],
          competitors: [],
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        toast.error('Failed to create project');
        return null;
      }

      const transformedProject: Project = {
        ...data,
        competitors: Array.isArray(data.competitors) ? data.competitors : [],
        features: Array.isArray(data.features) ? data.features : [],
        market_gap_analysis: data.market_gap_analysis || undefined,
      };

      setProjects(prev => [transformedProject, ...prev]);
      return transformedProject;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      return null;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    if (!user?.id) {
      toast.error('You must be logged in to update a project');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        toast.error('Failed to update project');
        return null;
      }

      const transformedProject: Project = {
        ...data,
        competitors: Array.isArray(data.competitors) ? data.competitors : [],
        features: Array.isArray(data.features) ? data.features : [],
        market_gap_analysis: data.market_gap_analysis || undefined,
      };

      setProjects(prev => prev.map(p => p.id === projectId ? transformedProject : p));
      return transformedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
      return null;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
        return;
      }

      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user?.id]);

  return {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    refetchProjects: fetchProjects,
  };
};

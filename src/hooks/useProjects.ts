
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
  validation_plan?: string;
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

      // Transform the data to match our Project interface
      const transformedData: Project[] = (data || []).map(item => ({
        ...item,
        competitors: Array.isArray(item.competitors) ? item.competitors : [],
        market_gap_analysis: item.market_gap_analysis || undefined,
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
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        toast.error('Failed to create project');
        return null;
      }

      // Transform the returned data to match our Project interface
      const transformedProject: Project = {
        ...data,
        competitors: Array.isArray(data.competitors) ? data.competitors : [],
        market_gap_analysis: data.market_gap_analysis || undefined,
      };

      setProjects(prev => [transformedProject, ...prev]);
      toast.success('Project created successfully');
      return transformedProject;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
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
    deleteProject,
    refetchProjects: fetchProjects,
  };
};

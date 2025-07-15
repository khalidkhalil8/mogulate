
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface ValidationStep {
  title: string;
  goal: string;
  method: string;
  priority: 'High' | 'Medium' | 'Low';
  isDone: boolean;
  [key: string]: any; // Add index signature to make it Json-compatible
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  idea?: string;
  competitors?: any[];
  features?: any[];
  validation_plan?: ValidationStep[];
  market_analysis?: any;
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authIsLoading } = useAuth();

  const fetchProjects = async () => {
    // Don't fetch if auth is still loading
    if (authIsLoading) {
      console.log('useProjects: Auth is still loading, skipping fetch');
      return;
    }

    if (!user?.id) {
      console.log('useProjects: No user found, setting loading to false');
      setIsLoading(false);
      return;
    }

    try {
      console.log('useProjects: Fetching projects for user:', user.id);
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
        validation_plan: Array.isArray(item.validation_plan) ? item.validation_plan as ValidationStep[] : [],
        market_analysis: item.market_analysis || undefined,
      }));

      console.log('useProjects: Successfully fetched projects:', transformedData.length);
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
        validation_plan: Array.isArray(data.validation_plan) ? data.validation_plan as ValidationStep[] : [],
        market_analysis: data.market_analysis || undefined,
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
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      // Convert validation_plan to proper JSON format
      if (updates.validation_plan) {
        updateData.validation_plan = updates.validation_plan as any;
      }

      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
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
        validation_plan: Array.isArray(data.validation_plan) ? data.validation_plan as ValidationStep[] : [],
        market_analysis: data.market_analysis || undefined,
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
    console.log('useProjects: Effect triggered', { 
      authIsLoading, 
      userId: user?.id,
      hasUser: !!user 
    });
    
    fetchProjects();
  }, [user?.id, authIsLoading]);

  return {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    refetchProjects: fetchProjects,
  };
};

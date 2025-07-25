
import { useState, useEffect, useRef } from 'react';
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
  project_competitors?: any[];
  project_features?: any[];
  project_validation_steps?: ValidationStep[];
  market_analysis?: any;
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authIsLoading } = useAuth();
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitiallyLoaded = useRef(false);
  const lastUserId = useRef<string | null>(null);

  const fetchProjects = async () => {
    // Don't fetch if auth is still loading
    if (authIsLoading) {
      console.log('useProjects: Auth is still loading, skipping fetch');
      return;
    }

    const currentUserId = user?.id || null;

    // If user ID hasn't changed and we've already loaded, skip refetch
    if (currentUserId === lastUserId.current && hasInitiallyLoaded.current) {
      console.log('useProjects: User ID unchanged, skipping refetch');
      return;
    }

    if (!currentUserId) {
      console.log('useProjects: No user found');
      
      // If we've already loaded projects once and user becomes undefined,
      // wait a moment before clearing (could be token refresh)
      if (hasInitiallyLoaded.current && lastUserId.current) {
        console.log('useProjects: User undefined after initial load, waiting before clearing...');
        
        // Clear any existing timeout
        if (clearTimeoutRef.current) {
          clearTimeout(clearTimeoutRef.current);
        }
        
        // Set a timeout to clear projects if user doesn't return
        clearTimeoutRef.current = setTimeout(() => {
          console.log('useProjects: Timeout reached, clearing projects');
          setProjects([]);
          setIsLoading(false);
          lastUserId.current = null;
        }, 1000); // Wait 1 second before clearing
        
        return;
      } else {
        // First time load with no user - set loading to false immediately
        console.log('useProjects: No user on initial load, setting loading to false');
        setProjects([]);
        setIsLoading(false);
        lastUserId.current = null;
        return;
      }
    }

    // Clear any pending clear timeout since we have a user
    if (clearTimeoutRef.current) {
      console.log('useProjects: User found, clearing timeout');
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }

    // Update the last user ID
    lastUserId.current = currentUserId;

    try {
      console.log('useProjects: Fetching projects for user:', currentUserId);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
        return;
      }

      const transformedData: Project[] = (data || []).map(item => ({
        ...item,
        project_competitors: Array.isArray(item.project_competitors) ? item.project_competitors : [],
        project_features: Array.isArray(item.project_features) ? item.project_features : [],
        project_validation_steps: Array.isArray(item.project_validation_steps) ? item.project_validation_steps as ValidationStep[] : [],
        market_analysis: item.market_analysis || undefined,
      }));

      console.log('useProjects: Successfully fetched projects:', transformedData.length);
      setProjects(transformedData);
      hasInitiallyLoaded.current = true;
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
          project_features: [],
          project_competitors: [],
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
        project_competitors: Array.isArray(data.project_competitors) ? data.project_competitors : [],
        project_features: Array.isArray(data.project_features) ? data.project_features : [],
        project_validation_steps: Array.isArray(data.project_validation_steps) ? data.project_validation_steps as ValidationStep[] : [],
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
      
      // Convert validation steps to proper JSON format
      if (updates.project_validation_steps) {
        updateData.project_validation_steps = updates.project_validation_steps as any;
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
        project_competitors: Array.isArray(data.project_competitors) ? data.project_competitors : [],
        project_features: Array.isArray(data.project_features) ? data.project_features : [],
        project_validation_steps: Array.isArray(data.project_validation_steps) ? data.project_validation_steps as ValidationStep[] : [],
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
      hasUser: !!user,
      lastUserId: lastUserId.current
    });
    
    fetchProjects();

    // Cleanup timeout on unmount
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
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


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface FeedbackEntry {
  id: string;
  project_id: string;
  user_id: string;
  date: string;
  feedback_source: string;
  source_username?: string;
  feedback_summary: string;
  created_at: string;
  updated_at: string;
}

export const useFeedbackEntries = (projectId: string) => {
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchFeedbackEntries = async () => {
    if (!user?.id || !projectId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('feedback_entries')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching feedback entries:', error);
        toast.error('Failed to load feedback entries');
        return;
      }

      setFeedbackEntries(data || []);
    } catch (error) {
      console.error('Error fetching feedback entries:', error);
      toast.error('Failed to load feedback entries');
    } finally {
      setIsLoading(false);
    }
  };

  const createFeedbackEntry = async (entry: Omit<FeedbackEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) {
      toast.error('You must be logged in to create feedback entries');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('feedback_entries')
        .insert({
          ...entry,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating feedback entry:', error);
        toast.error('Failed to create feedback entry');
        return null;
      }

      setFeedbackEntries(prev => [data, ...prev]);
      toast.success('Feedback entry added successfully');
      return data;
    } catch (error) {
      console.error('Error creating feedback entry:', error);
      toast.error('Failed to create feedback entry');
      return null;
    }
  };

  const updateFeedbackEntry = async (entryId: string, updates: Partial<FeedbackEntry>) => {
    if (!user?.id) {
      toast.error('You must be logged in to update feedback entries');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('feedback_entries')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', entryId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating feedback entry:', error);
        toast.error('Failed to update feedback entry');
        return null;
      }

      setFeedbackEntries(prev => prev.map(entry => entry.id === entryId ? data : entry));
      toast.success('Feedback entry updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating feedback entry:', error);
      toast.error('Failed to update feedback entry');
      return null;
    }
  };

  const deleteFeedbackEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('feedback_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting feedback entry:', error);
        toast.error('Failed to delete feedback entry');
        return;
      }

      setFeedbackEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast.success('Feedback entry deleted successfully');
    } catch (error) {
      console.error('Error deleting feedback entry:', error);
      toast.error('Failed to delete feedback entry');
    }
  };

  useEffect(() => {
    fetchFeedbackEntries();
  }, [user?.id, projectId]);

  return {
    feedbackEntries,
    isLoading,
    createFeedbackEntry,
    updateFeedbackEntry,
    deleteFeedbackEntry,
    refetchFeedbackEntries: fetchFeedbackEntries,
  };
};

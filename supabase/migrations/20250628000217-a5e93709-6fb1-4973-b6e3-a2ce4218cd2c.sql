
-- Create a table for storing feedback entries
CREATE TABLE public.feedback_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  feedback_source TEXT NOT NULL,
  source_username TEXT,
  feedback_summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own feedback
ALTER TABLE public.feedback_entries ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own feedback entries
CREATE POLICY "Users can view their own feedback entries" 
  ON public.feedback_entries 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own feedback entries
CREATE POLICY "Users can create their own feedback entries" 
  ON public.feedback_entries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own feedback entries
CREATE POLICY "Users can update their own feedback entries" 
  ON public.feedback_entries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own feedback entries
CREATE POLICY "Users can delete their own feedback entries" 
  ON public.feedback_entries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_feedback_entries_project_id ON public.feedback_entries(project_id);
CREATE INDEX idx_feedback_entries_user_id ON public.feedback_entries(user_id);


-- Create a table for storing todo items
CREATE TABLE public.todo_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own todos
ALTER TABLE public.todo_items ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own todos
CREATE POLICY "Users can view their own todos" 
  ON public.todo_items 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own todos
CREATE POLICY "Users can create their own todos" 
  ON public.todo_items 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own todos
CREATE POLICY "Users can update their own todos" 
  ON public.todo_items 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own todos
CREATE POLICY "Users can delete their own todos" 
  ON public.todo_items 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_todo_items_user_project ON public.todo_items(user_id, project_id);
CREATE INDEX idx_todo_items_created_at ON public.todo_items(user_id, project_id, created_at DESC);

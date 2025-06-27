
-- Add features column to projects table to store feature data
ALTER TABLE public.projects 
ADD COLUMN features JSONB DEFAULT '[]'::jsonb;

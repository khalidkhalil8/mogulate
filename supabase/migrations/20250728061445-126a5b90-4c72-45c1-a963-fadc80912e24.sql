
-- Add credits_used column to projects table
ALTER TABLE public.projects ADD COLUMN credits_used INTEGER DEFAULT 0 NOT NULL;

-- Update existing projects to have 0 credits used
UPDATE public.projects SET credits_used = 0 WHERE credits_used IS NULL;

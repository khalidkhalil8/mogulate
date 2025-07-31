-- Create or update tables for complete project setup flow

-- First, check if we need to add any missing columns to the existing projects table
-- The projects table already exists with most fields, but let's ensure it has all needed fields

-- Add status column if it doesn't exist
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Create project_competitors table for storing individual competitors
CREATE TABLE IF NOT EXISTS public.project_competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_features table for storing individual features
CREATE TABLE IF NOT EXISTS public.project_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planned',
  priority TEXT DEFAULT 'medium',
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_validation_steps table for storing individual validation steps
CREATE TABLE IF NOT EXISTS public.project_validation_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  goal TEXT,
  method TEXT,
  priority TEXT DEFAULT 'medium',
  is_done BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_market_gaps table for storing market gap analysis
CREATE TABLE IF NOT EXISTS public.project_market_gaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  gap_text TEXT NOT NULL,
  positioning_suggestion TEXT,
  score DECIMAL(3,2),
  rationale TEXT,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.project_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_validation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_market_gaps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_competitors
CREATE POLICY "Users can view their own project competitors" 
ON public.project_competitors 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_competitors.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create competitors for their own projects" 
ON public.project_competitors 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_competitors.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update competitors for their own projects" 
ON public.project_competitors 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_competitors.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete competitors for their own projects" 
ON public.project_competitors 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_competitors.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Create RLS policies for project_features
CREATE POLICY "Users can view their own project features" 
ON public.project_features 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_features.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create features for their own projects" 
ON public.project_features 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_features.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update features for their own projects" 
ON public.project_features 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_features.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete features for their own projects" 
ON public.project_features 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_features.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Create RLS policies for project_validation_steps
CREATE POLICY "Users can view their own project validation steps" 
ON public.project_validation_steps 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_validation_steps.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create validation steps for their own projects" 
ON public.project_validation_steps 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_validation_steps.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update validation steps for their own projects" 
ON public.project_validation_steps 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_validation_steps.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete validation steps for their own projects" 
ON public.project_validation_steps 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_validation_steps.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Create RLS policies for project_market_gaps
CREATE POLICY "Users can view their own project market gaps" 
ON public.project_market_gaps 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_market_gaps.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create market gaps for their own projects" 
ON public.project_market_gaps 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_market_gaps.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update market gaps for their own projects" 
ON public.project_market_gaps 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_market_gaps.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete market gaps for their own projects" 
ON public.project_market_gaps 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_market_gaps.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_competitors_project_id ON public.project_competitors(project_id);
CREATE INDEX IF NOT EXISTS idx_project_features_project_id ON public.project_features(project_id);
CREATE INDEX IF NOT EXISTS idx_project_validation_steps_project_id ON public.project_validation_steps(project_id);
CREATE INDEX IF NOT EXISTS idx_project_market_gaps_project_id ON public.project_market_gaps(project_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_project_competitors_updated_at
    BEFORE UPDATE ON public.project_competitors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_features_updated_at
    BEFORE UPDATE ON public.project_features
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_validation_steps_updated_at
    BEFORE UPDATE ON public.project_validation_steps
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
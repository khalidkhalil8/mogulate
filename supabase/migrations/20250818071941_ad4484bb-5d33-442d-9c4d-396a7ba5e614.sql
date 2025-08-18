-- Create project_features table to store individual features
CREATE TABLE IF NOT EXISTS public.project_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Planned' CHECK (status IN ('Planned', 'In Progress', 'Done')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.project_features ENABLE ROW LEVEL SECURITY;

-- Create policies for project_features
CREATE POLICY "Users can view features of their own projects" 
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

CREATE POLICY "Users can update features of their own projects" 
ON public.project_features 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_features.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete features of their own projects" 
ON public.project_features 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_features.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_project_features_updated_at
BEFORE UPDATE ON public.project_features
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing features from projects.features JSONB to project_features table
INSERT INTO public.project_features (project_id, title, description, status, priority)
SELECT 
  p.id as project_id,
  feature->>'title' as title,
  COALESCE(feature->>'description', '') as description,
  COALESCE(feature->>'status', 'Planned') as status,
  COALESCE(feature->>'priority', 'Medium') as priority
FROM public.projects p
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(p.features, '[]'::jsonb)) as feature
WHERE jsonb_typeof(p.features) = 'array' 
  AND jsonb_array_length(p.features) > 0
  AND feature->>'title' IS NOT NULL
ON CONFLICT DO NOTHING;
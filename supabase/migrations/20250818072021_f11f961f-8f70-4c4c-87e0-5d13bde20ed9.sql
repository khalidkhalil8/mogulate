-- Migrate existing features from projects.features JSONB to project_features table for this specific project
INSERT INTO public.project_features (project_id, title, description, status, priority)
SELECT 
  p.id as project_id,
  feature->>'title' as title,
  COALESCE(feature->>'description', '') as description,
  CASE 
    WHEN feature->>'status' IS NOT NULL THEN feature->>'status'
    ELSE 'Planned'
  END as status,
  CASE 
    WHEN feature->>'priority' IS NOT NULL THEN feature->>'priority'
    ELSE 'Medium'
  END as priority
FROM public.projects p
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(p.features, '[]'::jsonb)) as feature
WHERE p.id = 'd53ef785-9f5b-4f84-887d-b8e75b93fe00'
  AND jsonb_typeof(p.features) = 'array' 
  AND jsonb_array_length(p.features) > 0
  AND feature->>'title' IS NOT NULL
ON CONFLICT DO NOTHING;
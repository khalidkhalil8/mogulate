
-- Update the feature_waitlists_with_emails view to work with the new email constraint
DROP VIEW IF EXISTS public.feature_waitlists_with_emails;

-- Recreate feature_waitlists_with_emails view with updated logic
CREATE VIEW public.feature_waitlists_with_emails WITH (security_invoker=true) AS
SELECT 
    fw.id,
    fw.user_id,
    fw.email,  -- Email is now always present in the table
    fw.joined_at,
    CASE 
        WHEN fw.user_id IS NOT NULL THEN 'authenticated'
        ELSE 'anonymous'
    END as user_type
FROM public.feature_waitlists fw;

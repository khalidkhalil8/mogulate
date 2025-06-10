
-- Drop and recreate the views with proper security settings
DROP VIEW IF EXISTS public.feature_waitlists_with_emails;
DROP VIEW IF EXISTS public.api_usage_with_emails;
DROP VIEW IF EXISTS public.profiles_complete;

-- Recreate feature_waitlists_with_emails without exposing auth.users data
CREATE VIEW public.feature_waitlists_with_emails WITH (security_invoker=true) AS
SELECT 
    fw.id,
    fw.user_id,
    fw.email,  -- Only use the email stored in the waitlist table
    fw.joined_at,
    CASE 
        WHEN fw.user_id IS NOT NULL THEN 'authenticated'
        ELSE 'anonymous'
    END as user_type
FROM public.feature_waitlists fw;

-- Recreate api_usage_with_emails without exposing auth.users data
CREATE VIEW public.api_usage_with_emails WITH (security_invoker=true) AS
SELECT 
    aul.id,
    aul.user_id,
    p.email,  -- Get email from profiles table instead of auth.users
    aul.timestamp,
    aul.tokens_used,
    aul.api_type,
    aul.function_name
FROM public.api_usage_logs aul
LEFT JOIN public.profiles p ON aul.user_id = p.id;

-- Recreate profiles_complete without exposing auth.users data
CREATE VIEW public.profiles_complete WITH (security_invoker=true) AS
SELECT 
    p.id,
    p.email,
    p.subscription_tier,
    p.stripe_customer_id,
    p.created_at,
    p.subscription_started_at
FROM public.profiles p;

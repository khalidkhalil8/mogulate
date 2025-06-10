
-- Step 1: Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email TEXT;

-- Step 2: Update the handle_new_user function to capture email from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN NEW;
END;
$function$;

-- Step 3: Backfill existing profiles with email data from auth.users
UPDATE public.profiles 
SET email = auth_users.email
FROM auth.users AS auth_users
WHERE profiles.id = auth_users.id 
AND profiles.email IS NULL;

-- Step 4: For feature_waitlists, we need to handle the existing constraint
-- First, let's clear the email field for entries that have a user_id (authenticated users)
-- since we can get the email from the auth.users table via the user_id
UPDATE public.feature_waitlists 
SET email = NULL
WHERE user_id IS NOT NULL;

-- Step 5: Now backfill feature_waitlists with emails from auth.users for existing authenticated entries
-- But we'll do this through our views instead to avoid constraint conflicts

-- Step 6: Create views for easier querying with email information

-- View for feature waitlists with complete email information
CREATE OR REPLACE VIEW public.feature_waitlists_with_emails AS
SELECT 
    fw.id,
    fw.user_id,
    COALESCE(fw.email, au.email) as email,
    fw.joined_at,
    CASE 
        WHEN fw.user_id IS NOT NULL THEN 'authenticated'
        ELSE 'anonymous'
    END as user_type
FROM public.feature_waitlists fw
LEFT JOIN auth.users au ON fw.user_id = au.id;

-- View for API usage logs with email information
CREATE OR REPLACE VIEW public.api_usage_with_emails AS
SELECT 
    aul.id,
    aul.user_id,
    au.email,
    aul.timestamp,
    aul.tokens_used,
    aul.api_type,
    aul.function_name
FROM public.api_usage_logs aul
LEFT JOIN auth.users au ON aul.user_id = au.id;

-- View for complete profiles information
CREATE OR REPLACE VIEW public.profiles_complete AS
SELECT 
    p.id,
    COALESCE(p.email, au.email) as email,
    p.subscription_tier,
    p.stripe_customer_id,
    p.created_at,
    p.subscription_started_at,
    au.created_at as auth_created_at,
    au.last_sign_in_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id;

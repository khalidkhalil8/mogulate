
-- Step 1: Remove the current constraint that prevents authenticated users from storing emails
ALTER TABLE public.feature_waitlists 
DROP CONSTRAINT feature_waitlists_user_or_email_check;

-- Step 2: Backfill missing emails for existing authenticated users
-- Update authenticated entries (those with user_id) to include their email from profiles
UPDATE public.feature_waitlists 
SET email = p.email
FROM public.profiles p
WHERE feature_waitlists.user_id = p.id 
AND feature_waitlists.email IS NULL
AND p.email IS NOT NULL;

-- Step 3: Make email column NOT NULL (this ensures all entries have emails)
ALTER TABLE public.feature_waitlists 
ALTER COLUMN email SET NOT NULL;

-- Step 4: Add a new constraint to ensure data integrity
-- This allows both authenticated (user_id + email) and anonymous (email only) entries
ALTER TABLE public.feature_waitlists 
ADD CONSTRAINT feature_waitlists_email_required 
CHECK (email IS NOT NULL);

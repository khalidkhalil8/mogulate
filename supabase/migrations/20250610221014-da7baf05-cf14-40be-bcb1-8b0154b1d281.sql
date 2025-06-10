
-- Add email column to feature_waitlists table to support anonymous waitlist entries
ALTER TABLE public.feature_waitlists 
ADD COLUMN email TEXT;

-- Update the user_id column to be nullable to support anonymous entries
ALTER TABLE public.feature_waitlists 
ALTER COLUMN user_id DROP NOT NULL;

-- Add a constraint to ensure either user_id or email is provided (but not both null)
ALTER TABLE public.feature_waitlists 
ADD CONSTRAINT feature_waitlists_user_or_email_check 
CHECK (
  (user_id IS NOT NULL AND email IS NULL) OR 
  (user_id IS NULL AND email IS NOT NULL)
);

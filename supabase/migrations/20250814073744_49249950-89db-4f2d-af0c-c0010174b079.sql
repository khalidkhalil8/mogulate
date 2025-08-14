-- Enable leaked password protection in Supabase Auth
-- This requires updating the auth configuration to enable password leak protection
-- Note: This setting is typically configured through the Supabase dashboard under Authentication > Settings

-- Since this is a configuration setting rather than a database schema change,
-- we cannot directly modify it via SQL migration. 
-- However, we can document the required steps:

-- STEPS TO ENABLE LEAKED PASSWORD PROTECTION:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Authentication > Settings  
-- 3. Find "Password Security" section
-- 4. Enable "Leaked Password Protection"
-- 5. This will check passwords against known data breaches using HaveIBeenPwned API

-- For now, we'll create a documentation comment in the database
COMMENT ON SCHEMA public IS 'Security Note: Enable Leaked Password Protection in Supabase Auth dashboard under Authentication > Settings';
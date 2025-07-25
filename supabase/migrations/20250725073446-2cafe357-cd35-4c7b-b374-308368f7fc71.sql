
-- First, let's create the improved schema with better naming and relationships

-- 1. Rename projects table columns for clarity and add missing constraints
ALTER TABLE projects 
  RENAME COLUMN competitors TO project_competitors;

ALTER TABLE projects 
  RENAME COLUMN features TO project_features;

ALTER TABLE projects 
  RENAME COLUMN validation_plan TO project_validation_steps;

-- 2. Add foreign key constraint for user_id in projects table
ALTER TABLE projects 
  ADD CONSTRAINT fk_projects_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Add foreign key constraints for todo_items
ALTER TABLE todo_items 
  ADD CONSTRAINT fk_todo_items_project_id 
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE todo_items 
  ADD CONSTRAINT fk_todo_items_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Add foreign key constraints for feedback_entries
ALTER TABLE feedback_entries 
  ADD CONSTRAINT fk_feedback_entries_project_id 
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE feedback_entries 
  ADD CONSTRAINT fk_feedback_entries_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Add foreign key constraint for api_usage_logs
ALTER TABLE api_usage_logs 
  ADD CONSTRAINT fk_api_usage_logs_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 6. Add foreign key constraint for feature_waitlists
ALTER TABLE feature_waitlists 
  ADD CONSTRAINT fk_feature_waitlists_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 7. Add constraints and indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_todo_items_project_id ON todo_items(project_id);
CREATE INDEX IF NOT EXISTS idx_todo_items_user_id ON todo_items(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_entries_project_id ON feedback_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_feedback_entries_user_id ON feedback_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_timestamp ON api_usage_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_feature_waitlists_user_id ON feature_waitlists(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_waitlists_email ON feature_waitlists(email);

-- 8. Remove unused/deprecated view tables (these appear to be views, not actual tables)
DROP VIEW IF EXISTS api_usage_with_emails;
DROP VIEW IF EXISTS feature_waitlists_with_emails;
DROP VIEW IF EXISTS profiles_complete;

-- 9. Add better column constraints
ALTER TABLE projects 
  ALTER COLUMN title SET NOT NULL;

ALTER TABLE projects 
  ALTER COLUMN user_id SET NOT NULL;

-- Make user_id NOT NULL in feature_waitlists since it should always be linked to a user
ALTER TABLE feature_waitlists 
  ALTER COLUMN user_id SET NOT NULL;

-- 10. Add check constraints for data integrity
ALTER TABLE api_usage_logs 
  ADD CONSTRAINT chk_api_usage_logs_tokens_positive 
  CHECK (tokens_used >= 0);

ALTER TABLE todo_items 
  ADD CONSTRAINT chk_todo_items_title_not_empty 
  CHECK (char_length(trim(title)) > 0);

ALTER TABLE feedback_entries 
  ADD CONSTRAINT chk_feedback_entries_summary_not_empty 
  CHECK (char_length(trim(feedback_summary)) > 0);

ALTER TABLE feature_waitlists 
  ADD CONSTRAINT chk_feature_waitlists_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 11. Add unique constraints where appropriate
ALTER TABLE feature_waitlists 
  ADD CONSTRAINT uq_feature_waitlists_user_email 
  UNIQUE (user_id, email);

-- 12. Update profiles table to be more robust
ALTER TABLE profiles 
  ALTER COLUMN email SET NOT NULL;

ALTER TABLE profiles 
  ADD CONSTRAINT chk_profiles_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE profiles 
  ADD CONSTRAINT chk_profiles_subscription_tier 
  CHECK (subscription_tier IN ('free', 'starter', 'pro'));

-- 13. Add updated_at triggers for all tables that should track updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for tables that have updated_at columns
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todo_items_updated_at 
    BEFORE UPDATE ON todo_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_entries_updated_at 
    BEFORE UPDATE ON feedback_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

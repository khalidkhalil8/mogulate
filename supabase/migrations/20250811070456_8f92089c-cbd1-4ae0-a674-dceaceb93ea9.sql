-- Fix project features persistence and ensure proper normalization
-- Add missing columns and improve structure for better data handling

-- Ensure project_features table has all necessary fields
DO $$ 
BEGIN
    -- Add missing columns to project_features if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_features' AND column_name = 'is_selected') THEN
        ALTER TABLE project_features ADD COLUMN is_selected BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_features' AND column_name = 'is_final') THEN
        ALTER TABLE project_features ADD COLUMN is_final BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Ensure project_validation_steps table has proper structure
DO $$ 
BEGIN
    -- Add missing columns to project_validation_steps if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_validation_steps' AND column_name = 'is_selected') THEN
        ALTER TABLE project_validation_steps ADD COLUMN is_selected BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_validation_steps' AND column_name = 'is_final') THEN
        ALTER TABLE project_validation_steps ADD COLUMN is_final BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Ensure project_market_gaps table has proper selection tracking
DO $$ 
BEGIN
    -- Add missing columns to project_market_gaps if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_market_gaps' AND column_name = 'selected_positioning') THEN
        ALTER TABLE project_market_gaps ADD COLUMN selected_positioning TEXT;
    END IF;
END $$;

-- Create index for better performance
DO $$ 
BEGIN
    -- Create indexes if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_project_features_project_id_selected') THEN
        CREATE INDEX idx_project_features_project_id_selected ON project_features(project_id, is_selected) WHERE is_selected = true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_project_validation_steps_project_id_selected') THEN
        CREATE INDEX idx_project_validation_steps_project_id_selected ON project_validation_steps(project_id, is_selected) WHERE is_selected = true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_project_market_gaps_project_id_selected') THEN
        CREATE INDEX idx_project_market_gaps_project_id_selected ON project_market_gaps(project_id, is_selected) WHERE is_selected = true;
    END IF;
END $$;
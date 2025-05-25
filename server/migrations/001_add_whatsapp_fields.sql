-- Add phone_number and related fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_temporary BOOLEAN DEFAULT false;

-- Add filePath and uploadMethod to cvs table
ALTER TABLE cvs
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS upload_method TEXT DEFAULT 'web';

-- Add recommendations to ATS scores
ALTER TABLE ats_scores
ADD COLUMN IF NOT EXISTS recommendations JSONB;

-- Create a function to add phone_number column if missing
CREATE OR REPLACE FUNCTION add_phone_number_if_missing()
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE users ADD COLUMN phone_number TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT add_phone_number_if_missing();

-- Inform about completed migration
DO $$
BEGIN
    RAISE NOTICE 'WhatsApp integration migration completed successfully';
END $$;
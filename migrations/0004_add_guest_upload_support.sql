-- Add isGuest column to cvs table
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;

-- Make userId nullable in cvs table
ALTER TABLE cvs ALTER COLUMN user_id DROP NOT NULL;
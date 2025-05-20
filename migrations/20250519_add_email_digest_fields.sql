-- Add email digest preference fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS receive_email_digest BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_email_digest_sent TIMESTAMP;
-- Add referral_code column to users table for production deployment
-- This restores the full referral system functionality

ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Generate referral codes for existing users
UPDATE users 
SET referral_code = 'HM' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8))
WHERE referral_code IS NULL;

-- Create index for faster referral code lookups
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- Verify the migration
SELECT COUNT(*) as total_users, 
       COUNT(referral_code) as users_with_referral_codes 
FROM users;
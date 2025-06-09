-- Production Data Cleanup Script for Hire Mzansi
-- This script removes all test data and prepares the database for production

-- Disable foreign key constraints temporarily
SET session_replication_role = replica;

-- Clear all user-generated test data
DELETE FROM referral_rewards;
DELETE FROM referrals;
DELETE FROM user_credits;
DELETE FROM job_matches;
DELETE FROM user_skills;
DELETE FROM sa_profiles;
DELETE FROM notifications;
DELETE FROM cvs;
DELETE FROM job_postings;
DELETE FROM employers;
DELETE FROM users WHERE email NOT LIKE '%admin%';

-- Clear session data
DELETE FROM sessions;

-- Reset sequences for clean IDs in production
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE employers_id_seq RESTART WITH 1;
ALTER SEQUENCE job_postings_id_seq RESTART WITH 1;
ALTER SEQUENCE cvs_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE sa_profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE user_skills_id_seq RESTART WITH 1;
ALTER SEQUENCE job_matches_id_seq RESTART WITH 1;
ALTER SEQUENCE referrals_id_seq RESTART WITH 1;
ALTER SEQUENCE referral_rewards_id_seq RESTART WITH 1;
ALTER SEQUENCE user_credits_id_seq RESTART WITH 1;

-- Re-enable foreign key constraints
SET session_replication_role = DEFAULT;

-- Verify cleanup
SELECT 'users' as table_name, COUNT(*) as remaining_records FROM users
UNION ALL
SELECT 'employers', COUNT(*) FROM employers
UNION ALL
SELECT 'job_postings', COUNT(*) FROM job_postings
UNION ALL
SELECT 'cvs', COUNT(*) FROM cvs
UNION ALL
SELECT 'referrals', COUNT(*) FROM referrals
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions;

-- Production readiness check
SELECT 'Production cleanup completed successfully' as status;
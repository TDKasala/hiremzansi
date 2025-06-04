-- =====================================================
-- CREATE DENIS KASALA AS PLATFORM ADMIN
-- =====================================================
-- Email: deniskasala17@gmail.com
-- Password: @Denis1986
-- Role: admin (full platform access)
-- =====================================================

-- Step 1: Check current table structure and create if needed
-- Create users table with proper schema if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    profile_picture TEXT,
    role TEXT DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    verification_token TEXT,
    verification_token_expiry TIMESTAMP,
    last_login TIMESTAMP,
    reset_token TEXT,
    reset_token_expiry TIMESTAMP,
    receive_email_digest BOOLEAN DEFAULT true,
    last_email_digest_sent TIMESTAMP,
    phone_number TEXT,
    phone_verified BOOLEAN DEFAULT false,
    is_temporary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create sa_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS sa_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
    province TEXT,
    city TEXT,
    bbbee_status TEXT,
    bbbee_level INTEGER,
    nqf_level INTEGER,
    preferred_languages TEXT[],
    industries TEXT[],
    job_types TEXT[],
    whatsapp_enabled BOOLEAN DEFAULT false,
    whatsapp_number TEXT,
    whatsapp_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Remove existing Denis Kasala user if exists
DELETE FROM sa_profiles WHERE user_id IN (
    SELECT id FROM users WHERE email = 'deniskasala17@gmail.com' OR username = 'deniskasala'
);
DELETE FROM users WHERE email = 'deniskasala17@gmail.com' OR username = 'deniskasala';

-- Step 3: Insert Denis Kasala as admin user
-- Password hash for '@Denis1986' generated using scrypt algorithm
INSERT INTO users (
    username,
    password,
    email,
    name,
    role,
    is_active,
    email_verified,
    created_at,
    updated_at
) VALUES (
    'deniskasala',
    'ef5f6a542e8c8a745bc8526a8b514a89956135e0f334bb1ce01837c98b9631b7420e68976e3016d6f30bba0754dac969cccac89ad9cb08774d62f41617e5cf19.34deff6d0ff65a3478d92390a78c327f',
    'deniskasala17@gmail.com',
    'Denis Kasala',
    'admin',
    true,
    true,
    NOW(),
    NOW()
);

-- Step 4: Create SA profile for Denis Kasala
INSERT INTO sa_profiles (
    user_id,
    province,
    city,
    whatsapp_enabled,
    whatsapp_verified,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM users WHERE email = 'deniskasala17@gmail.com'),
    'Gauteng',
    'Johannesburg',
    false,
    false,
    NOW(),
    NOW()
);

-- Step 5: Verification query to confirm creation
SELECT 
    u.id AS user_id,
    u.username,
    u.email,
    u.name,
    u.role,
    u.is_active,
    u.email_verified,
    u.created_at,
    sp.province,
    sp.city,
    sp.whatsapp_enabled
FROM users u
LEFT JOIN sa_profiles sp ON u.id = sp.user_id
WHERE u.email = 'deniskasala17@gmail.com';

-- =====================================================
-- DENIS KASALA ADMIN USER SETUP COMPLETE
-- =====================================================
-- Login Credentials:
-- Email: deniskasala17@gmail.com
-- Password: @Denis1986
-- Role: admin (full platform access)
--
-- The user has been created with:
-- - Admin role for full platform access
-- - Email verified status
-- - Active account status
-- - South African profile (Gauteng, Johannesburg)
-- =====================================================
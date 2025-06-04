-- ===================================================================
-- SQL SCRIPT TO CREATE DENIS KASALA AS PLATFORM ADMIN
-- ===================================================================
-- User Details:
-- Username: deniskasala
-- Email: deniskasala17@gmail.com
-- Password: @Denis1986 (hashed using scrypt with salt)
-- Role: admin (full platform access)
-- ===================================================================

-- Step 1: Check if user already exists and remove if necessary
-- This ensures a clean insert without conflicts
DELETE FROM users WHERE email = 'deniskasala17@gmail.com' OR username = 'deniskasala';

-- Step 2: Insert Denis Kasala as admin user
-- Password hash generated using scrypt algorithm: '@Denis1986'
-- Hash format: {128-char-scrypt-hash}.{32-char-salt}
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

-- Step 3: Create South African profile for admin user
-- This provides additional profile data specific to the SA job market platform
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

-- Step 4: Verification - Display created admin user details
SELECT 
    u.id,
    u.username,
    u.email,
    u.name,
    u.role,
    u.is_active,
    u.email_verified,
    u.created_at,
    sp.province,
    sp.city
FROM users u
LEFT JOIN sa_profiles sp ON u.id = sp.user_id
WHERE u.email = 'deniskasala17@gmail.com';

-- ===================================================================
-- ADMIN USER CREATION COMPLETE
-- ===================================================================
-- Denis Kasala can now log in with:
-- Email: deniskasala17@gmail.com
-- Password: @Denis1986
-- Role: admin (full platform access)
-- ===================================================================
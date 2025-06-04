-- =====================================================
-- CREATE DENIS KASALA AS PLATFORM ADMIN
-- =====================================================
-- Login: deniskasala17@gmail.com
-- Password: @Denis1986
-- =====================================================

-- Remove existing user if exists
DELETE FROM users WHERE email = 'deniskasala17@gmail.com' OR username = 'deniskasala';

-- Create admin user
-- Password hash for '@Denis1986' using scrypt algorithm
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

-- Create SA profile for admin user
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

-- Verify admin user creation
SELECT 
    u.id,
    u.username,
    u.email,
    u.name,
    u.role,
    u.is_active,
    u.email_verified,
    sp.province,
    sp.city
FROM users u
LEFT JOIN sa_profiles sp ON u.id = sp.user_id
WHERE u.email = 'deniskasala17@gmail.com';

-- =====================================================
-- ADMIN ACCESS CREATED
-- Email: deniskasala17@gmail.com
-- Password: @Denis1986
-- Role: admin (full platform access)
-- =====================================================
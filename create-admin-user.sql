-- SQL script to create Denis Kasala as platform admin
-- Password: @Denis1986 (hashed using scrypt with salt)

-- First, check if user already exists and delete if necessary
DELETE FROM users WHERE email = 'deniskasala17@gmail.com' OR username = 'deniskasala';

-- Insert the admin user
-- Note: The password hash below is for '@Denis1986' using scrypt algorithm with salt
-- Hash format: {scrypt_hash}.{salt}
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

-- Get the user ID for creating related records
-- Note: You may need to create additional profile records based on your application requirements

-- Create SA Profile for the admin user (optional, based on your application structure)
INSERT INTO sa_profiles (
    user_id,
    province,
    city,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM users WHERE email = 'deniskasala17@gmail.com'),
    'Gauteng',
    'Johannesburg',
    NOW(),
    NOW()
);

-- Verify the user was created successfully
SELECT 
    id,
    username,
    email,
    name,
    role,
    is_active,
    email_verified,
    created_at
FROM users 
WHERE email = 'deniskasala17@gmail.com';
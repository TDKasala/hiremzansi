import { Pool } from 'pg';
import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function setupAdminUser() {
  // Connect directly to local PostgreSQL database
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    // No password for local development
  });

  try {
    console.log('Connecting to local PostgreSQL database...');
    
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Creating users table...');
      await pool.query(`
        CREATE TABLE users (
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
      `);
    }

    // Check if sa_profiles table exists
    const saProfilesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sa_profiles'
      );
    `);
    
    if (!saProfilesCheck.rows[0].exists) {
      console.log('Creating sa_profiles table...');
      await pool.query(`
        CREATE TABLE sa_profiles (
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
      `);
    }

    // Remove existing admin user if exists
    await pool.query(`
      DELETE FROM users WHERE email = 'deniskasala17@gmail.com' OR username = 'deniskasala';
    `);

    // Hash the password
    const hashedPassword = await hashPassword('@Denis1986');
    console.log('Password hashed successfully');

    // Create admin user
    const userResult = await pool.query(`
      INSERT INTO users (
        username, password, email, name, role, 
        is_active, email_verified, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id;
    `, [
      'deniskasala',
      hashedPassword,
      'deniskasala17@gmail.com',
      'Denis Kasala',
      'admin',
      true,
      true
    ]);

    const userId = userResult.rows[0].id;
    console.log(`Admin user created with ID: ${userId}`);

    // Create SA profile
    await pool.query(`
      INSERT INTO sa_profiles (
        user_id, province, city, whatsapp_enabled, 
        whatsapp_verified, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW());
    `, [userId, 'Gauteng', 'Johannesburg', false, false]);

    console.log('SA profile created successfully');

    // Verify admin user creation
    const verification = await pool.query(`
      SELECT u.id, u.username, u.email, u.name, u.role, u.is_active, 
             u.email_verified, u.created_at, sp.province, sp.city
      FROM users u
      LEFT JOIN sa_profiles sp ON u.id = sp.user_id
      WHERE u.email = 'deniskasala17@gmail.com';
    `);

    console.log('\n=== ADMIN USER CREATED SUCCESSFULLY ===');
    console.log('User Details:', verification.rows[0]);
    console.log('\nLogin Credentials:');
    console.log('Email: deniskasala17@gmail.com');
    console.log('Password: @Denis1986');
    console.log('Role: admin (full platform access)');
    console.log('=======================================\n');

  } catch (error) {
    console.error('Error setting up admin user:', error);
  } finally {
    await pool.end();
  }
}

setupAdminUser().catch(console.error);
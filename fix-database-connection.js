import { Pool } from 'pg';
import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function setupDatabase() {
  // Use the Replit PostgreSQL database URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  console.log('Original DATABASE_URL:', databaseUrl);
  
  // Create a new connection string for the local Replit PostgreSQL
  const localDatabaseUrl = databaseUrl?.replace(/postgresql:\/\/.*/, 'postgresql://postgres@localhost/postgres') || 'postgresql://postgres@localhost/postgres';
  
  const pool = new Pool({
    connectionString: localDatabaseUrl
  });

  try {
    console.log('Testing database connection...');
    await pool.query('SELECT 1');
    console.log('Database connection successful!');
    
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
      console.log('Users table created successfully');
    } else {
      console.log('Users table already exists');
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
      console.log('SA profiles table created successfully');
    } else {
      console.log('SA profiles table already exists');
    }

    // Remove existing Denis Kasala user if exists
    await pool.query(`
      DELETE FROM users WHERE email = 'deniskasala17@gmail.com' OR username = 'deniskasala';
    `);

    // Create Denis Kasala as admin user
    const hashedPassword = await hashPassword('@Denis1986');
    console.log('Password hashed for Denis Kasala');

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
    console.log(`Denis Kasala admin user created with ID: ${userId}`);

    // Create SA profile for Denis
    await pool.query(`
      INSERT INTO sa_profiles (
        user_id, province, city, whatsapp_enabled, 
        whatsapp_verified, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW());
    `, [userId, 'Gauteng', 'Johannesburg', false, false]);

    console.log('SA profile created for Denis Kasala');

    // Verify creation
    const verification = await pool.query(`
      SELECT u.id, u.username, u.email, u.name, u.role, u.is_active, 
             u.email_verified, u.created_at, sp.province, sp.city
      FROM users u
      LEFT JOIN sa_profiles sp ON u.id = sp.user_id
      WHERE u.email = 'deniskasala17@gmail.com';
    `);

    console.log('\n=== ADMIN USER SETUP COMPLETE ===');
    console.log('User Details:', verification.rows[0]);
    console.log('\nLogin Credentials:');
    console.log('Email: deniskasala17@gmail.com');
    console.log('Password: @Denis1986');
    console.log('Role: admin (full platform access)');
    console.log('================================\n');

    // Update environment file to use local database
    const fs = await import('fs');
    const envContent = `DATABASE_URL=${localDatabaseUrl}\n`;
    fs.writeFileSync('.env', envContent);
    console.log('Updated .env file with local database URL');

  } catch (error) {
    console.error('Database setup error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDatabase().catch(console.error);
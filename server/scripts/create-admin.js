require('dotenv').config();
const crypto = require('crypto');
const util = require('util');
const { Pool } = require('pg');

const scryptAsync = util.promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function createAdminUser() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Check if user already exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      ['deniskasala']
    );
    
    if (checkResult.rows.length > 0) {
      // User exists, update password
      const hashedPassword = await hashPassword('Denis2025');
      
      await pool.query(
        'UPDATE users SET password = $1, role = $2, "updatedAt" = $3 WHERE username = $4',
        [hashedPassword, 'admin', new Date(), 'deniskasala']
      );
      
      console.log('Admin user updated successfully!');
    } else {
      // Create new admin user
      const hashedPassword = await hashPassword('Denis2025');
      
      await pool.query(
        'INSERT INTO users (username, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6)',
        ['deniskasala', 'denis@atsboost.co.za', hashedPassword, 'admin', new Date(), new Date()]
      );
      
      console.log('Admin user created successfully!');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser();
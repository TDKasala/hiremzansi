const { Pool } = require('pg');
const crypto = require('crypto');
const util = require('util');

const scryptAsync = util.promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function createAdminUser() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL 
  });
  
  try {
    // Hash the password
    const hashedPassword = await hashPassword('Denis2025');
    console.log('Password has been hashed');
    
    // Update existing user if it exists
    const result = await pool.query(
      `UPDATE users 
       SET password = $1, role = 'admin', updated_at = NOW() 
       WHERE username = 'deniskasala' 
       RETURNING *`,
      [hashedPassword]
    );
    
    if (result.rowCount > 0) {
      console.log('Admin user updated successfully!');
      console.log('Username: deniskasala');
      console.log('Password: Denis2025');
    } else {
      // Create new admin user
      await pool.query(
        `INSERT INTO users (username, email, password, role, created_at, updated_at, is_active, email_verified, receive_email_digest) 
         VALUES ($1, $2, $3, $4, NOW(), NOW(), TRUE, TRUE, TRUE)`,
        ['deniskasala', 'denis@atsboost.co.za', hashedPassword, 'admin']
      );
      console.log('Admin user created successfully!');
      console.log('Username: deniskasala');
      console.log('Password: Denis2025');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser();
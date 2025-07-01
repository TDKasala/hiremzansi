import bcrypt from 'bcrypt';
import pkg from 'pg';
const { Pool } = pkg;

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function createTestUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const hashedPassword = await hashPassword('testpass123');
    
    const result = await pool.query(`
      INSERT INTO users (email, password, name, username, role, "emailVerified")
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET 
        password = EXCLUDED.password
      RETURNING id, email, name, role
    `, [
      'testuser@gmail.com',
      hashedPassword,
      'Test User',
      'testuser',
      'user',
      true
    ]);
    
    console.log('Test user created:', result.rows[0]);
    
    // Also list all users
    const allUsers = await pool.query('SELECT id, email, name, role, "emailVerified" FROM users ORDER BY id');
    console.log('All users in database:');
    allUsers.rows.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Verified: ${user.emailVerified}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
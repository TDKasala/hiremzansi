import bcrypt from "bcrypt";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function createAdminUser() {
  try {
    const email = "deniskasala17@gmail.com";
    const password = "@Deniskasala2025";
    const hashedPassword = await hashPassword(password);

    // First, check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      // Update existing user to admin
      await pool.query(
        `UPDATE users SET 
         password = $1, 
         role = 'admin',
         name = 'Denis Kasala',
         username = 'admin',
         updated_at = NOW()
         WHERE email = $2`,
        [hashedPassword, email]
      );
      console.log("✅ Updated existing user to admin:", email);
    } else {
      // Create new admin user
      await pool.query(
        `INSERT INTO users (
          email, 
          password, 
          username, 
          name, 
          role, 
          is_active,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [email, hashedPassword, "admin", "Denis Kasala", "admin", true]
      );
      console.log("✅ Created new admin user:", email);
    }

    console.log("Admin credentials:");
    console.log("Email:", email);
    console.log("Password:", password);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await pool.end();
  }
}

createAdminUser();
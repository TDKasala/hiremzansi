import { db } from "../db";

async function runMigration() {
  try {
    console.log("Running migration to add email verification fields...");
    
    // Add email verification fields to users table
    await db.execute(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expiry TIMESTAMP;
    `);
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

runMigration();
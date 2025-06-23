import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Test database connection
    await db.select().from(users).limit(1);
    console.log('Database connection successful');
    
    // Check if admin user exists
    const existingAdmin = await db.select()
      .from(users)
      .where(eq(users.email, 'deniskasala17@gmail.com'))
      .limit(1);
    
    if (existingAdmin.length === 0) {
      // Create admin user
      const hashedPassword = '$2b$10$9iSPl9/VpqAUhRSAoSteueFNwN56xPHuHm1GHbb.aupDsbvDu1FsK'; // @Deniskasala2025
      
      await db.insert(users).values({
        username: 'admin',
        email: 'deniskasala17@gmail.com',
        password: hashedPassword,
        name: 'Denis Kasala',
        role: 'admin',
        isActive: true,
        emailVerified: true,
      });
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}
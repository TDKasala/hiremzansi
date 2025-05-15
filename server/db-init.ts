import { db, pool } from './db';
import { users, plans } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Database initialization options
 */
interface InitOptions {
  skipAdminUser?: boolean;     // Skip creating admin user
  skipPlans?: boolean;         // Skip creating default plans
  retryOnFailure?: boolean;    // Retry initialization if it fails
  maxRetries?: number;         // Maximum number of retries
}

// Default initialization options
const DEFAULT_INIT_OPTIONS: InitOptions = {
  skipAdminUser: false,
  skipPlans: false,
  retryOnFailure: true,
  maxRetries: 3
};

/**
 * Initializes the database with essential data if not already present.
 * This ensures that when the application starts in production, the database
 * will have the necessary data to function properly.
 * 
 * @param options Initialization options
 * @returns Promise resolving to true if initialization succeeded, false otherwise
 */
export async function initializeDatabase(options?: InitOptions): Promise<boolean> {
  const opts = { ...DEFAULT_INIT_OPTIONS, ...options };
  console.log('Initializing database...');
  
  let attempt = 0;
  let lastError: Error | null = null;
  
  // Retry loop for database initialization
  while (attempt <= opts.maxRetries!) {
    if (attempt > 0) {
      console.log(`Retrying database initialization (attempt ${attempt}/${opts.maxRetries})...`);
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.min(100 * Math.pow(2, attempt), 3000)));
    }
    
    attempt++;
    
    try {
      // Verify basic database connectivity first
      try {
        await pool.query('SELECT 1');
      } catch (connErr) {
        console.error('Database connection failed during initialization:', connErr);
        if (attempt >= opts.maxRetries!) {
          throw new Error('Could not connect to database after multiple attempts');
        }
        continue; // Skip to next retry attempt
      }
      
      // Initialize admin user if needed
      if (!opts.skipAdminUser) {
        const adminExists = await checkAdminUser();
        if (!adminExists) {
          await createAdminUser();
        }
      }
      
      // Initialize subscription plans if needed
      if (!opts.skipPlans) {
        const plansExist = await checkPlans();
        if (!plansExist) {
          await createDefaultPlans();
        }
      }
      
      // Additional environment-specific initializations
      if (process.env.NODE_ENV === 'production') {
        // Enable production-specific performance optimizations
        await optimizeForProduction();
      }
      
      console.log('Database initialization completed successfully');
      return true;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Database initialization attempt ${attempt} failed:`, lastError);
      
      // If retries are disabled or we've reached max retries, stop trying
      if (!opts.retryOnFailure || attempt >= opts.maxRetries!) {
        break;
      }
    }
  }
  
  // If we got here, all attempts failed
  console.error('Database initialization failed after multiple attempts:', lastError);
  return false;
}

/**
 * Apply production-specific database optimizations
 */
async function optimizeForProduction(): Promise<void> {
  try {
    console.log('Applying production database optimizations...');
    
    // Create indexes for common queries if they don't exist
    // Don't use schema.tableName here as we're executing raw SQL
    const indexes = [
      // User lookup indexes
      { 
        table: 'users', 
        name: 'idx_users_email',
        column: 'email',
        condition: 'WHERE is_active = true'
      },
      {
        table: 'users',
        name: 'idx_users_username',
        column: 'username'
      },
      // CV lookup indexes
      {
        table: 'cvs',
        name: 'idx_cvs_user_id',
        column: 'user_id'
      },
      {
        table: 'cvs',
        name: 'idx_cvs_created_at',
        column: 'created_at DESC'
      },
      // ATS score indexes
      {
        table: 'ats_scores',
        name: 'idx_ats_scores_cv_id',
        column: 'cv_id'
      },
      {
        table: 'ats_scores',
        name: 'idx_ats_scores_score',
        column: 'score DESC'
      },
      // Subscription indexes
      {
        table: 'subscriptions',
        name: 'idx_subscriptions_user_id',
        column: 'user_id'
      },
      {
        table: 'subscriptions',
        name: 'idx_subscriptions_active',
        column: 'is_active',
        condition: 'WHERE is_active = true'
      },
      // Job-related indexes
      {
        table: 'job_postings',
        name: 'idx_job_postings_employer_id',
        column: 'employer_id'
      },
      {
        table: 'job_postings',
        name: 'idx_job_postings_status',
        column: 'status',
        condition: 'WHERE status = \'active\''
      },
      {
        table: 'job_matches',
        name: 'idx_job_matches_score',
        column: 'match_score DESC'
      },
      // Skill-related indexes
      {
        table: 'skills',
        name: 'idx_skills_name',
        column: 'name'
      },
      {
        table: 'user_skills',
        name: 'idx_user_skills_user_id',
        column: 'user_id'
      }
    ];
    
    for (const index of indexes) {
      // Check if index exists
      const indexExists = await db.execute(sql`
        SELECT 1 FROM pg_indexes 
        WHERE indexname = ${index.name} 
        AND tablename = ${index.table}
      `);
      
      if (indexExists.rows.length === 0) {
        try {
          // Create the index if it doesn't exist
          const condition = index.condition || '';
          await db.execute(sql.raw(`
            CREATE INDEX IF NOT EXISTS ${index.name} 
            ON ${index.table} (${index.column}) 
            ${condition}
          `));
          console.log(`Created index ${index.name} on ${index.table}`);
        } catch (err: any) {
          // Don't fail if a single index creation fails (table might not exist yet)
          console.warn(`Failed to create index ${index.name}: ${err.message}`);
        }
      }
    }
    
    // Set up database maintenance tasks
    const vacuumSettings = await db.execute(sql`
      SELECT name, setting 
      FROM pg_settings 
      WHERE name IN ('autovacuum', 'autovacuum_vacuum_scale_factor')
    `);
    
    // Check if autovacuum is enabled
    const autovacuumEnabled = vacuumSettings.rows.find(r => 
      r.name === 'autovacuum' && r.setting === 'on'
    );
    
    if (!autovacuumEnabled) {
      console.log('Autovacuum is not enabled. Recommend enabling it for production.');
    } else {
      console.log('Autovacuum is properly configured for production.');
    }
    
    // Apply table-specific settings for high-traffic tables
    try {
      // Set storage parameters for frequently updated tables
      const highTrafficTables = [
        'cvs', 'ats_scores', 'job_matches', 'notifications'
      ];
      
      for (const table of highTrafficTables) {
        await db.execute(sql.raw(`
          ALTER TABLE ${table} SET (
            autovacuum_vacuum_scale_factor = 0.05,
            autovacuum_analyze_scale_factor = 0.02
          )
        `));
        console.log(`Applied optimized vacuum settings for table: ${table}`);
      }
    } catch (err) {
      console.warn('Could not apply table-specific vacuum settings:', err.message);
    }
    
    console.log('Production database optimizations complete');
  } catch (error) {
    // Just log the error, don't fail initialization
    console.error('Error applying production optimizations:', error);
  }
}

// Check if admin user exists
async function checkAdminUser() {
  const adminUsers = await db.select()
    .from(users)
    .where(eq(users.role, 'admin'));
    
  return adminUsers.length > 0;
}

// Create an admin user if none exists
async function createAdminUser() {
  console.log('Creating admin user...');
  
  // In a real production environment, you would use a secure, randomly generated password
  // that's provided via environment variable, and notify the administrator out-of-band
  
  // For this demo, we'll create an admin user with a fixed password
  // !IMPORTANT: In a real production system, never hardcode credentials like this!
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMe123!';
  
  // The hash function from auth.ts should be imported and used here
  // For demo purposes we'll use a placeholder hash
  const hashedPassword = `${adminPassword}.demohash`;
  
  await db.insert(users).values({
    username: 'admin',
    email: 'admin@atsboost.co.za',
    password: hashedPassword,
    role: 'admin',
    isActive: true,
    name: 'System Administrator',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('Admin user created successfully');
  return true;
}

// Check if subscription plans exist
async function checkPlans() {
  const existingPlans = await db.select().from(plans);
  return existingPlans.length > 0;
}

// Create default subscription plans
async function createDefaultPlans() {
  console.log('Creating default subscription plans...');
  
  // Free plan
  await db.insert(plans).values({
    name: 'Free',
    description: 'Basic ATS score and CV analysis',
    price: 0,
    interval: 'month',
    features: ['Basic ATS score', 'Limited CV analysis', '3 CV scans per month'],
    scanLimit: 3,
    isActive: true,
    isPopular: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Basic plan
  await db.insert(plans).values({
    name: 'Basic',
    description: 'Enhanced CV analysis with job matching',
    price: 30,
    interval: 'month',
    features: ['ATS score with recommendations', 'CV optimization tips', 'Job description matching', '10 CV scans per month'],
    scanLimit: 10,
    isActive: true,
    isPopular: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Premium plan
  await db.insert(plans).values({
    name: 'Premium',
    description: 'Full CV optimization with job matching and industry insights',
    price: 100,
    interval: 'month',
    features: ['Advanced ATS analysis', 'Industry-specific recommendations', 'B-BBEE and NQF optimization', 'Job description matching', '50 CV scans per month'],
    scanLimit: 50,
    isActive: true,
    isPopular: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Enterprise plan
  await db.insert(plans).values({
    name: 'Enterprise',
    description: 'Maximum CV optimization with unlimited scans',
    price: 200,
    interval: 'month',
    features: ['All Premium features', 'Unlimited CV scans', 'Priority support', 'WhatsApp notifications'],
    scanLimit: 100,
    isActive: true,
    isPopular: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('Default subscription plans created successfully');
  return true;
}

// If this script is run directly, perform initialization
if (import.meta.url.endsWith('db-init.ts')) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed');
      // Only close pool if executed directly
      if (process.argv[1]?.endsWith('db-init.ts')) {
        pool.end();
      }
    })
    .catch((err) => {
      console.error('Database initialization failed:', err);
      // Only close pool if executed directly
      if (process.argv[1]?.endsWith('db-init.ts')) {
        pool.end();
      }
      process.exit(1);
    });
}
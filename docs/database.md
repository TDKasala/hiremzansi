# ATSBoost PostgreSQL Database Integration

This document provides an overview of the PostgreSQL database integration for ATSBoost.

## Database Architecture

ATSBoost uses PostgreSQL for data persistence with the following components:

1. **Connection Pool Management**: 
   - Implemented in `server/db-pool.ts`
   - Provides optimized connection pooling for different environments
   - Automatic retry mechanism for transient connection errors

2. **Schema Management**:
   - Database schema defined in `shared/schema.ts` using Drizzle ORM
   - Tables include: users, cvs, ats_scores, sa_profiles, deep_analysis_reports, plans, subscriptions

3. **Migration System**:
   - Located in `migrations/` with timestamp-based versioning
   - Migration tracking in `schema_migrations` table
   - Migration tools in `server/db-migrate.ts`

4. **Database Utilities**:
   - Health checks and diagnostics in `server/db-utils.ts`
   - Schema documentation generator
   - Database initialization in `server/db-init.ts`

## Connection Management

The database connection pool is managed as a singleton to ensure optimal resource usage:

```typescript
// Get the database connection pool
import { getPool } from './db-pool';
const pool = getPool();

// Execute a query with automatic retry
import { executeWithRetry } from './db-pool';
const result = await executeWithRetry(() => pool.query('SELECT NOW()'));
```

## Environment Configuration

Connection pool is configured differently based on the environment:

- **Development**: 10 connections, no SSL, longer timeouts
- **Production**: 20 connections, SSL enabled, shorter timeouts, query limits
- **Testing**: 5 connections, no SSL, very short timeouts

## Data Migration

Database migrations are handled by the migration system:

1. **Creating a migration**:
   ```bash
   npx tsx server/db-migrate.ts create add_new_index
   ```
   This creates a timestamped SQL file in the `migrations/` directory.

2. **Running migrations**:
   ```bash 
   npx tsx server/db-migrate.ts run
   ```
   Migrations are also automatically run on application startup.

## Database Initialization

The database initialization process runs on application startup:

1. Ensures admin user exists
2. Creates default subscription plans if needed
3. Performs database health check

## Health Monitoring

Database health can be monitored through:

1. The `/api/health` endpoint which returns database connection status
2. The `/api/admin/database` endpoint (admin only) which provides detailed database information
3. Database health is checked at application startup

## Indexes

The database uses the following indexes for performance optimization:

1. `idx_cvs_user_id` - For CV lookups by user
2. `idx_ats_scores_cv_id` - For ATS scores by CV
3. `idx_deep_analysis_reports_cv_id` - For deep analysis reports by CV 
4. `idx_subscriptions_user_id` - For subscription lookups by user
5. `idx_sa_profiles_user_id` - For South Africa profile lookups by user
6. `idx_users_email` - For user lookups by email (for login/authentication)
7. `idx_users_reset_token` - For user lookups by reset token (for password reset)

## Production Considerations

For production environments:

1. Ensure `DATABASE_URL` environment variable is set
2. Consider monitoring the PostgreSQL connection pool with external tools
3. Regular database backups should be configured
4. Consider adding read replicas for heavy read workloads

## Development Guidelines

When working with the database:

1. All schema changes should be made through migrations
2. Avoid raw SQL queries when possible, use Drizzle ORM instead
3. Add appropriate indexes for frequently queried fields
4. Set up proper error handling and retry mechanisms for database operations
5. Use the proper transaction support for operations that modify multiple tables
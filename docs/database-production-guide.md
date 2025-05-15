# PostgreSQL Database Guide for Production

This guide outlines the PostgreSQL integration in ATSBoost for production deployments.

## Features

- **Dynamic Connection Pooling**: Automatically scales connection pool based on environment and server capacity
- **Health Monitoring**: Periodic health checks with automatic recovery
- **Graceful Shutdown**: Properly closes connections during application shutdown
- **Migration Safety**: Production-safe migration system with dry-run and force options
- **Performance Optimization**: Automatic index creation for common queries
- **Retry Logic**: Automatic retry for transient database errors

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `DATABASE_SSL` | Force SSL for all environments | `true` in production |
| `DATABASE_DISABLE_SSL` | Disable SSL (not recommended for production) | `false` |
| `MIGRATION_REQUIRE_FORCE` | Require force flag for migrations in production | `false` |
| `ADMIN_INITIAL_PASSWORD` | Initial admin password | `ChangeMe123!` |

## Connection Pool Configuration

The connection pool is configured automatically based on the environment:

- **Development**: 10 connections, 30s idle timeout
- **Testing**: 5 connections, 10s idle timeout
- **Production**: CPU cores * 2 + 1 connections (max 20), 60s idle timeout, automatic recovery

## Database Migrations

Migration files are stored in the `/migrations` directory. They are automatically applied in order based on their timestamp.

### Creating a Migration

```bash
npm run migrate create <migration_name>
```

This creates a timestamped SQL file in the migrations directory.

### Running Migrations

Migrations run automatically at application startup. For manual execution:

```bash
npm run migrate
```

### Production Migration Safety

In production, migrations can be run with additional safety options:

```bash
# Dry run - shows what would be migrated without applying changes
NODE_ENV=production MIGRATION_DRYRUN=true npm run migrate

# Force - required in production with MIGRATION_REQUIRE_FORCE=true
NODE_ENV=production MIGRATION_FORCE=true npm run migrate
```

## Database Initialization

The application automatically initializes the database with essential data:

- Admin user (if none exists)
- Subscription plans (if none exist)
- Performance indexes (in production)

## Health Checks

The database system performs periodic health checks in production:

- Verifies connection status
- Monitors connection pool usage
- Detects long-running queries
- Automatically recovers from connection issues

## Graceful Shutdown

The application handles graceful shutdown of database connections:

- Completes in-flight queries
- Properly closes connections
- Logs shutdown progress

## Performance Monitoring

In production, database performance can be monitored with:

```bash
npm run db:health
```

This provides information on:
- Connection status
- Database size
- Table statistics
- Connection usage
- Long-running queries

## Best Practices

1. Always create migrations for schema changes
2. Test migrations in development before applying to production
3. Keep migration files small and focused
4. Add comments to migration files explaining changes
5. Use the retry utilities for important transactions
6. Set appropriate timeouts for long-running queries

## Troubleshooting

Common issues and solutions:

### Too Many Connections

If you see "too many clients already" errors:
- Check for connection leaks in the application code
- Ensure proper release of database clients
- Consider increasing max_connections in PostgreSQL configuration

### Slow Queries

If you notice slow performance:
- Check for missing indexes
- Look for blocking queries
- Analyze query plans using EXPLAIN ANALYZE

### Migration Failures

If migrations fail:
- Check for syntax errors in migration files
- Verify database permissions
- Run with dry run option to preview changes
- Check logs for specific error messages
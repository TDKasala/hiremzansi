#!/bin/bash

# Database migration script wrapper

# Check for create argument
if [ "$1" == "create" ] && [ ! -z "$2" ]; then
  # Create a new migration
  npx tsx server/db-migrate.ts create "$2"
  exit $?
fi

# Determine environment and migration options
export NODE_ENV=${NODE_ENV:-development}
FORCE_FLAG=""
DRY_RUN=""

# Parse arguments
for arg in "$@"; do
  case $arg in
    --prod|--production)
      export NODE_ENV=production
      ;;
    --force)
      FORCE_FLAG="true"
      ;;
    --dry-run)
      DRY_RUN="true"
      ;;
  esac
done

echo "Running migrations in $NODE_ENV environment"
if [ "$FORCE_FLAG" == "true" ]; then
  echo "FORCE flag enabled - will run migrations in production"
  export MIGRATION_FORCE=true
fi

if [ "$DRY_RUN" == "true" ]; then
  echo "DRY RUN mode - will not apply changes"
  export MIGRATION_DRYRUN=true
fi

# Run migrations
npx tsx server/db-migrate.ts run
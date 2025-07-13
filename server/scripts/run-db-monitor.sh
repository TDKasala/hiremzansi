#!/bin/bash

# Database monitoring script wrapper

# Determine environment
if [ "$1" == "prod" ] || [ "$1" == "production" ]; then
  export NODE_ENV=production
  echo "Running in PRODUCTION mode"
else
  export NODE_ENV=development
  echo "Running in DEVELOPMENT mode"
fi

# Run the monitoring script using tsx
npx tsx server/scripts/db-monitor.ts
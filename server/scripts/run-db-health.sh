#!/bin/bash

# Database health check script wrapper

# Determine environment
if [ "$1" == "prod" ] || [ "$1" == "production" ]; then
  export NODE_ENV=production
  echo "Running health check in PRODUCTION mode"
else
  export NODE_ENV=development
  echo "Running health check in DEVELOPMENT mode"
fi

# Run the health check function from db-utils.ts
npx tsx -e "import { checkDatabaseHealth } from './server/db-utils.ts'; checkDatabaseHealth().then(status => { console.log(JSON.stringify(status, null, 2)); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });"
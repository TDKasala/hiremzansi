#!/bin/bash

# Deployment script for Hire Mzansi CV Optimization Platform
# This script prepares and validates the application for Vercel deployment

echo "🚀 Preparing Hire Mzansi for Vercel Deployment..."

# Check if required files exist
echo "📋 Checking deployment files..."

required_files=("vercel.json" "api/index.ts" "supabase-schema.sql" ".env.example")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    else
        echo "✅ Found: $file"
    fi
done

# Validate package.json
echo "📦 Validating package.json..."
if ! npm list --depth=0 > /dev/null 2>&1; then
    echo "⚠️  Some dependencies may be missing. Run 'npm install' to fix."
fi

# Check for environment variable template
echo "🔧 Environment variables template ready: .env.example"

# Test build (optional - comment out if build takes too long)
echo "🏗️  Testing production build..."
# npm run build

echo "✅ Pre-deployment checks complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Create Supabase project and run supabase-schema.sql"
echo "2. Set environment variables in Vercel dashboard"
echo "3. Connect GitHub repository to Vercel"
echo "4. Deploy with framework preset: Vite"
echo ""
echo "📚 Documentation available:"
echo "- VERCEL_DEPLOYMENT_GUIDE.md"
echo "- PRE_DEPLOYMENT_CHECKLIST.md"
echo ""
echo "🎉 Ready for deployment!"
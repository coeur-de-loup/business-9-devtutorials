#!/bin/bash

# Production Deployment Script
# Usage: ./scripts/deploy-production.sh

set -e

echo "🚀 DevTutorials Production Deployment"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Install with: npm install -g vercel"
    exit 1
fi
echo -e "${GREEN}✅ Vercel CLI installed${NC}"

# Check if git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Not a git repository${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git repository${NC}"

# Check if .env.local exists (for DATABASE_URL)
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo "You may need to set DATABASE_URL for migrations"
fi

echo ""
echo "🏗️  Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"

echo ""
echo "📦 Running database migrations..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not set${NC}"
    echo "Enter your production DATABASE_URL (or press Enter to skip migrations):"
    read -r PROD_DB_URL
    if [ -n "$PROD_DB_URL" ]; then
        export DATABASE_URL="$PROD_DB_URL"
    else
        echo "Skipping migrations..."
        DATABASE_URL=""
    fi
fi

if [ -n "$DATABASE_URL" ]; then
    npx prisma generate
    npx prisma db push
    echo -e "${GREEN}✅ Database migrations complete${NC}"
fi

echo ""
echo "🚀 Deploying to Vercel..."

# Deploy to production
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "🎉 Next steps:"
    echo "1. Test your deployment: https://your-project.vercel.app"
    echo "2. Configure Stripe webhooks: https://dashboard.stripe.com/webhooks"
    echo "3. Monitor logs: https://vercel.com/dashboard"
    echo ""
    echo "📚 Full guide: docs/deployment/production-deployment-guide.md"
else
    echo ""
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check Vercel logs for details: https://vercel.com/dashboard"
    exit 1
fi

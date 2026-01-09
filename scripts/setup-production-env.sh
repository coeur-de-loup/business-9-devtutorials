#!/bin/bash

# Production Environment Setup Script for DevTutorials
# This script automates Vercel environment variable configuration and deployment

set -e  # Exit on error

echo "🚀 DevTutorials Production Environment Setup"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if user is logged in to Vercel
if ! vercel whoami &>/dev/null; then
    echo -e "${RED}❌ Not logged in to Vercel. Please run: vercel login${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Vercel login detected${NC}"
echo ""

# Prompt for environment variables
echo "Please provide the following credentials (see docs/deployment/PRODUCTION_SETUP.md for help):"
echo ""

# Database
read -p "DATABASE_URL (from Neon): " DATABASE_URL
read -p "DIRECT_URL (from Neon): " DIRECT_URL

# Auth
read -p "NEXTAUTH_URL (e.g., https://business9.vercel.app): " NEXTAUTH_URL
read -p "NEXTAUTH_SECRET (generate with: openssl rand -base64 32): " NEXTAUTH_SECRET

# Stripe
read -p "STRIPE_SECRET_KEY (sk_test_...): " STRIPE_SECRET_KEY
read -p "STRIPE_PUBLISHABLE_KEY (pk_test_...): " STRIPE_PUBLISHABLE_KEY
read -p "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_test_...): " NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
read -p "STRIPE_WEBHOOK_SECRET (whsec_...): " STRIPE_WEBHOOK_SECRET
read -p "STRIPE_CONNECT_WEBHOOK_SECRET (whsec_...): " STRIPE_CONNECT_WEBHOOK_SECRET

# Email
read -p "RESEND_API_KEY (re_...): " RESEND_API_KEY

# App
read -p "NEXT_PUBLIC_APP_URL (e.g., https://business9.vercel.app): " NEXT_PUBLIC_APP_URL
read -p "NEXT_PUBLIC_APP_NAME (default: DevTutorials): " NEXT_PUBLIC_APP_NAME
NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME:-DevTutorials}

echo ""
echo "Adding environment variables to Vercel..."
echo ""

# Add environment variables to Vercel
# Note: Vercel CLI doesn't have a non-interactive add command, so we use a workaround
# We'll create a .env file and import it

ENV_FILE=".vercel-env-temp"

cat > $ENV_FILE <<EOF
DATABASE_URL="$DATABASE_URL"
DIRECT_URL="$DIRECT_URL"
NEXTAUTH_URL="$NEXTAUTH_URL"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"
STRIPE_CONNECT_WEBHOOK_SECRET="$STRIPE_CONNECT_WEBHOOK_SECRET"
RESEND_API_KEY="$RESEND_API_KEY"
NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL"
NEXT_PUBLIC_APP_NAME="$NEXT_PUBLIC_APP_NAME"
EOF

echo -e "${YELLOW}⚠️  Adding environment variables to Vercel...${NC}"
echo "You'll need to confirm each one in the Vercel CLI prompts."
echo ""

# Add each variable individually (Vercel CLI will prompt for confirmation)
vercel env add DATABASE_URL production <<< "$DATABASE_URL"
vercel env add DIRECT_URL production <<< "$DIRECT_URL"
vercel env add NEXTAUTH_URL production <<< "$NEXTAUTH_URL"
vercel env add NEXTAUTH_SECRET production <<< "$NEXTAUTH_SECRET"
vercel env add STRIPE_SECRET_KEY production <<< "$STRIPE_SECRET_KEY"
vercel env add STRIPE_PUBLISHABLE_KEY production <<< "$STRIPE_PUBLISHABLE_KEY"
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production <<< "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
vercel env add STRIPE_WEBHOOK_SECRET production <<< "$STRIPE_WEBHOOK_SECRET"
vercel env add STRIPE_CONNECT_WEBHOOK_SECRET production <<< "$STRIPE_CONNECT_WEBHOOK_SECRET"
vercel env add RESEND_API_KEY production <<< "$RESEND_API_KEY"
vercel env add NEXT_PUBLIC_APP_URL production <<< "$NEXT_PUBLIC_APP_URL"
vercel env add NEXT_PUBLIC_APP_NAME production <<< "$NEXT_PUBLIC_APP_NAME"

# Clean up temp file
rm -f $ENV_FILE

echo ""
echo -e "${GREEN}✓ Environment variables added${NC}"
echo ""

# Deploy to production
echo "Deploying to production..."
vercel --prod

echo ""
echo -e "${GREEN}✓ Deployment complete${NC}"
echo ""

# Run database migrations
echo "Running database migrations..."
DATABASE_URL="$DATABASE_URL" npx prisma db push

echo ""
echo -e "${GREEN}✓ Database migrations complete${NC}"
echo ""

echo "============================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Your production site is now ready:"
echo "  URL: $NEXT_PUBLIC_APP_URL"
echo ""
echo "Next steps:"
echo "  1. Visit your site and verify it works"
echo "  2. Test authentication (signup/login)"
echo "  3. Test Stripe checkout"
echo "  4. Check Vercel logs: vercel logs"
echo ""
echo "For testing instructions, see: docs/deployment/PRODUCTION_SETUP.md"
echo "============================================"

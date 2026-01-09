#!/bin/bash

# DevTutorials Project Setup Script

set -e

echo "🚀 Setting up DevTutorials project..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Start Docker services
echo "📦 Starting PostgreSQL and Redis containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U devtutorials > /dev/null 2>&1; do
    sleep 1
done
echo "✅ PostgreSQL is ready!"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local. Please update it with your API keys."
else
    echo "✅ .env.local already exists."
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Push schema to database
echo "🗄️  Pushing database schema..."
npm run db:push

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update .env.local with your API keys (Stripe, Resend, etc.)"
echo "  2. Start development server: npm run dev"
echo "  3. Open http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  - npm run dev          # Start development server"
echo "  - npm run db:studio    # Open Prisma Studio (database GUI)"
echo "  - docker-compose logs  # View database logs"
echo ""

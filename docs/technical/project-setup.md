# DevTutorials Project Setup Guide

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
./scripts/setup.sh
```

This script will:
1. Check Docker is running
2. Start PostgreSQL and Redis containers
3. Create `.env.local` file
4. Generate Prisma client
5. Push database schema

### Option 2: Manual Setup

#### 1. Start Local Services

```bash
docker-compose up -d
```

Verify services are running:
```bash
docker-compose ps
```

Expected output:
```
NAME                    STATUS
devtutorials-postgres   Up (healthy)
devtutorials-redis      Up (healthy)
```

#### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and update:
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- Other API keys are optional for initial development

#### 3. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push
```

#### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Verification Steps

### 1. Check Database Connection

```bash
docker-compose exec postgres psql -U devtutorials -d devtutorials -c "SELECT 1;"
```

Should return:
```
 ?column?
----------
        1
```

### 2. Test Prisma Studio

```bash
npm run db:studio
```

Opens database GUI at `http://localhost:5555`

### 3. Run Tests

```bash
npm run test
```

## Troubleshooting

### Docker Issues

**Problem:** Docker daemon not running
```bash
# Start Docker Desktop application
# Then verify
docker info
```

**Problem:** Port 5432 already in use
```bash
# Check what's using the port
lsof -i :5432

# Kill the process if needed
kill -9 <PID>
```

**Problem:** Container won't start
```bash
# View logs
docker-compose logs postgres

# Restart containers
docker-compose restart
```

### Database Issues

**Problem:** Database connection refused
```bash
# Verify PostgreSQL is ready
docker-compose exec postgres pg_isready -U devtutorials

# Restart PostgreSQL
docker-compose restart postgres
```

**Problem:** Prisma client outdated
```bash
# Regenerate client
npm run db:generate
```

**Problem:** Schema out of sync
```bash
# Reset database (WARNING: Deletes all data)
npm run db:push -- --force-reset
```

### Development Server Issues

**Problem:** Port 3000 in use
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Problem:** Build errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install
```

## Project Structure

```
business_9/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public pages (catalog, home)
│   ├── (auth)/            # Protected pages (dashboard)
│   ├── (creator)/         # Creator dashboard
│   ├── (admin)/           # Admin panel
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client singleton
│   └── env.ts            # Environment variable validation
├── prisma/               # Database
│   └── schema.prisma     # Database schema
├── tests/                # Tests
│   ├── unit/            # Unit tests (Vitest)
│   ├── e2e/             # E2E tests (Playwright)
│   └── setup.ts         # Test configuration
├── public/               # Static assets
│   ├── uploads/         # Local file uploads
│   └── videos/          # Local video storage
├── scripts/              # Utility scripts
│   └── setup.sh         # Project setup script
├── docker-compose.yml    # Local development services
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── vitest.config.ts      # Vitest configuration
```

## Development Workflow

### Creating New Features

1. **Create a new page:**
```bash
# Create file in appropriate route group
# Example: app/(public)/about/page.tsx
```

2. **Create an API route:**
```bash
# Create file in api directory
# Example: app/api/hello/route.ts
```

3. **Modify database schema:**
```bash
# Edit prisma/schema.prisma
# Then push changes
npm run db:push
```

### Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run tests in watch mode
npm run test -- --watch
```

### Database Management

```bash
# View database with Prisma Studio
npm run db:studio

# Create a migration
npm run db:migrate

# Reset database (development only)
npm run db:push -- --force-reset
```

## Environment Variables

### Required for Development

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Secret for NextAuth.js sessions

### Optional for Development

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `STRIPE_SECRET_KEY` - Stripe test mode key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

### Required for Production

All development variables plus:
- `RESEND_API_KEY` - Email service
- `R2_*` - Cloudflare R2 credentials
- `NEXT_PUBLIC_SENTRY_DSN` - Error tracking

## Next Steps

After setup is complete:

1. ✅ **Verify setup** - Visit `http://localhost:3000`
2. 📚 **Review architecture** - Read `docs/technical/architecture.md`
3. 🔐 **Set up authentication** - Configure NextAuth.js
4. 🗄️ **Seed database** - Add sample data
5. 🚀 **Build features** - Start with tutorial catalog

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create migration |
| `docker-compose up -d` | Start containers |
| `docker-compose logs` | View container logs |
| `docker-compose down` | Stop containers |

## Getting Help

- 📖 Read `docs/technical/architecture.md` for system design
- 📖 Read `docs/technical/tech-stack.md` for technology choices
- 🔍 Check existing beads with `bd list`
- 🐛 Create bug report with `bd create "Bug: ..." -t bug -p 1`

---

**Setup completed:** [Date]
**Verified by:** [Your Name]

# DevTutorials - Project Infrastructure

## Overview

DevTutorials is a marketplace for intermediate developer tutorials (6mo-2yr experience). This project uses a modern Next.js 14 stack with PostgreSQL, Prisma, and TypeScript.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + React 18
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL 15 with Prisma ORM
- **Authentication:** NextAuth.js v5
- **Styling:** Tailwind CSS
- **Payment:** Stripe Connect
- **Email:** Resend
- **Testing:** Vitest + Playwright
- **Deployment:** Vercel (production) / Docker Compose (local)

## Project Structure

```
business_9/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public pages
│   ├── (auth)/            # Protected pages
│   ├── (creator)/         # Creator dashboard
│   ├── (admin)/           # Admin panel
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility libraries
├── prisma/               # Database schema and migrations
├── tests/                # Unit and E2E tests
├── public/               # Static assets
├── docker-compose.yml    # Local development services
└── docs/                 # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Local Services

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5432 and Redis on port 6379.

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL` - Should already be set to `postgresql://devtutorials:devtutorials@localhost:5432/devtutorials`
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

### 4. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or create migration (production)
npm run db:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests (Vitest)
- `npm run test:e2e` - Run E2E tests (Playwright)
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database (dev)
- `npm run db:migrate` - Create and run migration
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Database Management

### View Database with Prisma Studio

```bash
npm run db:studio
```

Opens Prisma Studio at `http://localhost:5555`

### Reset Database

```bash
npm run db:push -- --force-reset
```

⚠️ **Warning:** This deletes all data!

## Development Workflow

### 1. Make Database Changes

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` (dev) or `npm run db:migrate` (prod)
3. Run `npm run db:generate` to update types

### 2. Create API Routes

Add files to `app/api/` directory. Example:

```typescript
// app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello!' });
}
```

### 3. Create Pages

Add files to `app/` directory. Example:

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return <div>About page</div>;
}
```

## Local Development Services

### PostgreSQL (port 5432)
- User: `devtutorials`
- Password: `devtutorials`
- Database: `devtutorials`

### Redis (port 6379)
- No authentication (local only)

## Testing

### Unit Tests (Vitest)

```bash
npm run test
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy on push to `main` branch

### Environment Variables for Production

Required:
- `DATABASE_URL` - Production PostgreSQL URL (Neon/Supabase)
- `NEXTAUTH_URL` - Production URL (e.g., `https://devtutorials.com`)
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

Optional:
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `RESEND_API_KEY` - Email service
- `NEXT_PUBLIC_SENTRY_DSN` - Error tracking

## Architecture Documentation

See `docs/technical/` for detailed architecture documentation:
- `architecture.md` - System architecture and data flows
- `tech-stack.md` - Technology choices and rationale
- `database-schema.md` - Database design (coming soon)

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart services
docker-compose restart

# View logs
docker-compose logs postgres
```

### Port Already in Use

If port 3000 is in use:
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

## Next Steps

- [ ] Set up authentication with NextAuth.js
- [ ] Create database migrations
- [ ] Build tutorial catalog page
- [ ] Implement Stripe Connect integration
- [ ] Set up video upload/download endpoints

## Support

For issues or questions, see documentation in `docs/` or check existing beads in `bd list`.

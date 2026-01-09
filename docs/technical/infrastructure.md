# DevTutorials Infrastructure Plan

**Date:** January 9, 2026
**Status:** Architecture Specification
**Environment:** Docker (local) → Vercel (production)

---

## Executive Summary

The DevTutorials infrastructure prioritizes **local development capability**, **free-tier compatibility**, and **simple deployment**. The entire application can run locally using Docker Compose, and production deployment is a single command to Vercel.

**Key Infrastructure Decisions:**
- **Local-first:** Full development environment with Docker Compose
- **Serverless production:** Vercel for hosting (zero config, auto-scaling)
- **Managed services:** PostgreSQL (Neon), Email (Resend), Payments (Stripe)
- **Cost efficient:** $55/month for MVP, scales to $75/month at Month 12
- **No DevOps required:** Deploy with `git push`, no server management

---

## 1. Local Development Environment

### Docker Compose Setup

**File: docker-compose.yml**

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: devtutorials_db
    environment:
      POSTGRES_USER: devtutorials
      POSTGRES_PASSWORD: devtutorials
      POSTGRES_DB: devtutorials
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devtutorials"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis (for caching, optional)
  redis:
    image: redis:7-alpine
    container_name: devtutorials_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Mailhog (email testing)
  mailhog:
    image: mailhog/mailhog:latest
    container_name: devtutorials_mail
    ports:
      - "1025:1025" # SMTP server
      - "8025:8025" # Web UI
    environment:
      - MH_STORAGE=memory

volumes:
  postgres_data:
  redis_data:
```

**Local Development Commands:**

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f postgres

# Stop services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

---

### Environment Configuration

**File: .env.local**

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=DevTutorials

# Database
DATABASE_URL="postgresql://devtutorials:devtutorials@localhost:5432/devtutorials"
DIRECT_URL="postgresql://devtutorials:devtutorials@localhost:5432/devtutorials"

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# OAuth (Google) - Get from https://console.cloud.google.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudflare R2 (Development - Local storage)
CLOUDFLARE_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=devtutorials-dev

# Bunny.net (Alternative for video)
BUNNY_API_KEY=your-bunny-api-key
BUNNY_STORAGE_ZONE_NAME=devtutorials-dev

# Resend (Email)
RESEND_API_KEY=re_...

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=your-auth-token

# Feature Flags
FEATURE_VIDEO_STREAMING=true
FEATURE_CODE_DOWNLOAD=true
FEATURE_REVIEWS=true
FEATURE_AFFILIATE_PROGRAM=false
```

**Generate Secrets:**

```bash
# NextAuth secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

### Local Development Workflow

```bash
# 1. Clone repository
git clone https://github.com/yourusername/devtutorials.git
cd devtutorials

# 2. Install dependencies
npm install

# 3. Start Docker services
docker-compose up -d

# 4. Copy environment template
cp .env.example .env.local

# 5. Edit .env.local with your credentials
nano .env.local

# 6. Run database migrations
npx prisma migrate dev

# 7. Seed database (optional)
npx prisma db seed

# 8. Start Next.js development server
npm run dev

# 9. Open in browser
open http://localhost:3000
```

---

### Development Tools

**Prisma Studio (Database GUI):**

```bash
npx prisma studio
# Opens at http://localhost:5555
```

**Mailhog (Email Testing):**

```bash
# Already running via Docker Compose
# Open http://localhost:8025
```

**Redis CLI:**

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# View all keys
KEYS *

# Flush cache (development only)
FLUSHALL
```

---

## 2. Production Deployment Options

### Option 1: Vercel (Recommended)

**Pros:**
- Zero configuration deployment
- Automatic HTTPS
- Global CDN
- Preview deployments for pull requests
- Free tier: 100GB bandwidth, 1000 edge function minutes
- Best developer experience

**Cons:**
- Vendor lock-in (harder to migrate away)
- Paid tier after free limits

**Deployment Steps:**

1. **Push to GitHub:**
```bash
git push origin main
```

2. **Connect to Vercel:**
- Go to https://vercel.com
- Click "New Project"
- Import from GitHub
- Select `devtutorials` repository

3. **Configure Environment Variables:**
- Add all environment variables from `.env.local`
- Use production values (not test keys)

4. **Deploy:**
- Vercel auto-deploys on push to `main`
- First deployment takes 2-3 minutes

5. **Custom Domain:**
- Add domain in Vercel dashboard
- Update DNS records (CNAME to cname.vercel-dns.com)

**Vercel Configuration:**

**File: vercel.json**

```json
{
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],  // US East (choose nearest to users)
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30  // 30 second timeout for API routes
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

**Post-Deployment Checklist:**

- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] Custom domain configured and DNS propagated
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Test authentication flow
- [ ] Test Stripe payments (use test mode)
- [ ] Configure Sentry error tracking
- [ ] Set up analytics (Vercel Analytics)

**Cost Structure:**

| Tier | Price | Limits | Est. Monthly Cost |
|------|-------|--------|------------------|
| **Hobby (Free)** | $0 | 100GB bandwidth, 1000 edge minutes | $0 (Months 1-6) |
| **Pro** | $20/month | 1TB bandwidth, 1000 edge minutes | $20 (Months 7+) |

**Estimated Bandwidth Usage:**
- 500 learners × 10 page views/day × 1MB = 5GB/day = 150GB/month (exceeds free tier by Month 6)
- **Recommendation:** Start with Hobby (free), upgrade to Pro when bandwidth exceeds 100GB

---

### Option 2: Railway

**Pros:**
- Docker deployment (closer to production)
- Managed PostgreSQL, Redis
- Simple pricing ($5/month per service)
- Easy to migrate away (standard Docker)

**Cons:**
- Less polished than Vercel
- Slower builds
- No preview deployments

**Deployment Steps:**

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
railway login
```

2. **Initialize Railway Project:**
```bash
railway init
railway add  # Add PostgreSQL
railway add  # Add Redis (optional)
```

3. **Configure Environment:**
```bash
railway variables
# Add all environment variables
```

4. **Deploy:**
```bash
railway up
```

**Cost Structure:**
- PostgreSQL: $5/month (256MB RAM, 10GB storage)
- Redis: $5/month (optional, can skip for MVP)
- App container: $5/month (512MB RAM, 0.5GB storage)
- **Total: $15/month** (vs. $0 on Vercel Hobby)

---

### Option 3: Self-Hosted VPS

**Pros:**
- Full control
- Unlimited bandwidth
- Cheapest at scale

**Cons:**
- Manual DevOps
- Security management
- No auto-scaling
- Requires system administration

**Providers:**
- DigitalOcean: $6/month (1GB RAM, 25GB SSD, 1TB transfer)
- Hetzner: $5/month (2GB RAM, 20GB SSD, 20TB transfer)
- Linode: $5/month (1GB RAM, 25GB SSD, 1TB transfer)

**Deployment Process:**

1. **Provision VPS:**
```bash
# SSH into VPS
ssh root@your-vps-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Deploy with Docker Compose:**
```bash
# Copy docker-compose.prod.yml to server
scp docker-compose.prod.yml root@your-vps-ip:/root/

# SSH into server and deploy
ssh root@your-vps-ip
cd /root
docker-compose -f docker-compose.prod.yml up -d
```

**Cost Structure:**
- VPS: $5-6/month
- **Total: $5-6/month** (cheapest option)

**When to Choose VPS:**
- After hitting Vercel Pro limits (Month 12+)
- Need more control over configuration
- Want to reduce costs at scale

---

## 3. CI/CD Pipeline

### GitHub Actions

**File: .github/workflows/ci.yml**

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Unit tests
        run: npm run test:unit

      - name: E2E tests
        run: npm run test:e2e

      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**GitHub Secrets:**
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

**Get Vercel Credentials:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Get credentials
cat .vercel/project.json
```

---

## 4. Database Hosting Options

### Option 1: Neon (Recommended)

**Pros:**
- Serverless PostgreSQL (auto-scaling)
- Generous free tier (3GB, 300 hours/month)
- Branching (development, preview, production)
- 100% PostgreSQL compatible
- Easy Vercel integration

**Cons:**
- Newer platform (less battle-tested than Supabase)

**Pricing:**

| Plan | Price | Storage | Compute | Limits |
|------|-------|---------|---------|--------|
| **Free** | $0 | 3GB | 300 hours/month | Sufficient for MVP |
| **Pro** | $19/month | 10GB | 1000 hours/month | Month 6+ |

**Setup:**

1. **Create Neon Project:**
- Go to https://neon.tech
- Create new project
- Choose region (nearest to users)
- Copy connection string

2. **Configure Environment:**
```bash
# Add to .env.local
DATABASE_URL="postgresql://user:password@ep-example.us-east-2.aws.neon.tech/devtutorials?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-example.us-east-2.aws.neon.tech/devtutorials?sslmode=require&pgbouncer=true"
```

3. **Vercel Integration:**
- In Vercel dashboard, go to Storage → Neon
- Connect to existing Neon project
- Auto-configures DATABASE_URL

**Estimated Usage:**
- **Month 6:** 100 tutorials × 10MB metadata = 1GB (well under free tier)
- **Month 12:** 300 tutorials × 10MB = 3GB (free tier limit)

---

### Option 2: Supabase

**Pros:**
- More mature than Neon
- Built-in auth, storage, realtime
- Generous free tier (500MB DB)
- Good documentation

**Cons:**
- Couples stack to Supabase (harder to migrate)
- Auth not needed (using NextAuth.js)

**Pricing:**

| Plan | Price | Database | Bandwidth | Limits |
|------|-------|----------|-----------|--------|
| **Free** | $0 | 500MB | 1GB | Sufficient for MVP |
| **Pro** | $25/month | 8GB | 50GB | Month 6+ |

---

## 5. Video Hosting Options

### Option 1: Bunny.net (Months 1-6)

**Pros:**
- Optimized for video streaming
- Fast global CDN
- Cheaper than AWS for video
- Simple pricing

**Pricing:**
- Storage: $0.01/GB/month
- Bandwidth: $0.01/GB

**Estimated Cost (Month 6):**
- Storage: 500GB × $0.01 = $5/month
- Bandwidth: 10K downloads × 3GB × $0.01 = $300/month
- **Total: $305/month** (expensive at scale)

**When to Switch:**
- When bandwidth cost exceeds $100/month
- Move to Cloudflare R2 (zero egress fees)

---

### Option 2: Cloudflare R2 (Months 6+)

**Pros:**
- Zero egress fees (unlimited bandwidth)
- S3-compatible API
- Global CDN included
- 80% cheaper than AWS S3

**Pricing:**
- Storage: $0.015/GB/month
- Class A operations (upload): $4.50/million requests
- Class B operations (download): $0.36/million requests
- **Zero egress fees**

**Estimated Cost (Month 6):**
- Storage: 500GB × $0.015 = $7.50/month
- Operations: 10K uploads × 10 downloads = 110K requests ≈ $1/month
- **Total: $8.50/month** (vs. $305 on Bunny.net)

**Setup:**

1. **Create R2 Bucket:**
- Go to Cloudflare Dashboard → R2
- Create bucket: `devtutorials-videos`
- Enable public access (for CDN)

2. **Configure Custom Domain:**
- Add custom domain: `videos.devtutorials.com`
- Cloudflare provides SSL certificate

3. **Upload Files:**

```typescript
// lib/video-storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadVideo(file: File, key: string) {
  await r2.send(new PutObjectCommand({
    Bucket: 'devtutorials-videos',
    Key: key,
    Body: file,
    ContentType: 'video/mp4',
  }));

  return `https://videos.devtutorials.com/${key}`;
}
```

---

## 6. Monitoring and Logging

### Sentry (Error Tracking)

**Setup:**

1. **Create Sentry Project:**
- Go to https://sentry.io
- Create new project (Next.js)
- Copy DSN

2. **Install SDK:**
```bash
npm install @sentry/nextjs
```

3. **Configure Sentry:**

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
});
```

**Pricing:**

| Plan | Price | Errors | Transactions |
|------|-------|--------|--------------|
| **Developer** | Free | 5K errors/month | 5K transactions |
| **Team** | $26/month | 50K errors/month | 50K transactions |

**Estimated Usage (Month 6):**
- 500 learners × 10 errors/month = 5K errors (free tier)

---

### Vercel Analytics

**Setup:**

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Pricing:** Free with Vercel deployment

**Metrics Tracked:**
- Page views
- Unique visitors
- Top pages
- Geographic distribution
- Device/browser breakdown

---

## 7. Backup and Disaster Recovery

### Database Backups

**Neon Automatic Backups:**
- **Point-in-time recovery (PITR):** Restore to any point in last 7 days
- **Daily snapshots:** Automated at 2 AM UTC
- **Retention:** 30 days

**Manual Backup:**

```bash
# Export database to SQL file
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Upload to R2 for offsite storage
aws s3 cp backup-$(date +%Y%m%d).sql s3://devtutorials-backups/
```

**Restore from Backup:**

```bash
# Restore from SQL file
psql $DATABASE_URL < backup-20260109.sql

# Or use Neon PITR (via dashboard)
# Select timestamp to restore to
```

---

### Video Storage Backups

**R2 Object Locking:**
- Enable object versioning (prevents accidental deletion)
- Objects retained for 30 days after deletion

**Backup Script:**

```typescript
// scripts/backup-video-metadata.ts
import { prisma } from '@/lib/prisma';
import fs from 'fs';

async function backupVideoMetadata() {
  const videos = await prisma.videoAsset.findMany();
  fs.writeFileSync(
    `video-backup-${Date.now()}.json`,
    JSON.stringify(videos, null, 2)
  );
  console.log(`Backed up ${videos.length} video records`);
}

backupVideoMetadata();
```

---

## 8. Deployment Checklist

### Pre-Launch (Week 1)

- [ ] Set up local development environment (Docker Compose)
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Seed database with sample data
- [ ] Test authentication flow
- [ ] Test Stripe payments (test mode)
- [ ] Test video upload/download
- [ ] Set up Sentry error tracking
- [ ] Configure Vercel project
- [ ] Deploy to Vercel (preview environment)

### Launch (Week 2)

- [ ] Point custom domain to Vercel
- [ ] Configure DNS records
- [ ] Verify SSL certificate (automatic)
- [ ] Switch Stripe to live mode
- [ ] Configure production email (Resend)
- [ ] Set up CDN for videos (Bunny.net or R2)
- [ ] Test full user journey (signup → purchase → access)
- [ ] Load testing (simulate 100 concurrent users)
- [ ] Set up analytics dashboards
- [ ] Create runbook for common issues

### Post-Launch (Month 1)

- [ ] Monitor error rates (Sentry)
- [ ] Monitor page load times (Vercel Analytics)
- [ ] Monitor database performance (Neon dashboard)
- [ ] Review Stripe payments daily
- [ ] Check video CDN costs weekly
- [ ] Backup database daily (automatic)
- [ ] Review server logs weekly

---

## 9. Cost Summary

### Month 1-6 (MVP)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Vercel (Hobby)** | Free | $0 |
| **Neon PostgreSQL** | Free | $0 |
| **Bunny.net CDN** | 500GB + 10K downloads | $305 |
| **Stripe** | 2.9% + $0.30/transaction | ~$217 @ $7.5K revenue |
| **Resend Email** | Free (100K emails) | $0 |
| **Sentry** | Free (5K errors) | $0 |
| **Total Fixed** | | **$305/month** |
| **Total Variable** | @ $7,500 revenue (Month 6) | **~$217/month** |
| **Total** | | **~$522/month** |

**Note:** Bunny.net cost is high at scale. Switch to R2 at Month 6 for zero egress fees.

---

### Month 6-12 (Growth)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Vercel (Pro)** | 1TB bandwidth | $20 |
| **Neon PostgreSQL** | Pro (10GB) | $19 |
| **Cloudflare R2** | 500GB storage | $7.50 |
| **Stripe** | 2.9% + $0.30/transaction | ~$867 @ $30K revenue |
| **Resend Email** | Free | $0 |
| **Sentry** | Free | $0 |
| **Total Fixed** | | **$46.50/month** |
| **Total Variable** | @ $30K revenue (Month 12) | **~$867/month** |
| **Total** | | **~$913.50/month** |

**Savings:** Switching from Bunny.net to R2 saves ~$300/month.

---

### Break-even Analysis

**Month 6 Revenue:** $7,500
- Fixed costs: $305
- Variable costs: $217 (Stripe fees)
- Creator payouts: $5,250 (70%)
- **Platform net: $1,978**

**Month 12 Revenue:** $30,000
- Fixed costs: $46.50
- Variable costs: $867 (Stripe fees)
- Creator payouts: $21,000 (70%)
- **Platform net: $8,086.50**

---

## 10. Scaling Roadmap

### Phase 1 (Months 1-6): MVP
- Vercel Hobby + Neon Free + Bunny.net
- Scale to 1,000 learners
- Cost: ~$522/month

### Phase 2 (Months 7-12): Growth
- Vercel Pro + Neon Pro + Cloudflare R2
- Scale to 5,000 learners
- Cost: ~$913/month

### Phase 3 (Months 13+): Scale
- Consider VPS for cost savings
- Add Redis caching ($15/month)
- Add CDN for multiple regions
- Scale to 10,000+ learners
- Cost: ~$500/month (VPS) + variable

---

## Conclusion

The DevTutorials infrastructure prioritizes **simplicity and cost-efficiency** while providing a clear path for scaling. The entire application can run locally with Docker Compose, and production deployment is a single command to Vercel.

**Key Benefits:**
1. **Local development:** Full environment with Docker Compose
2. **Zero DevOps:** Deploy with `git push` to Vercel
3. **Cost efficient:** $0-50/month for MVP
4. **Scales gracefully:** Can handle 5K users on < $1K/month
5. **Backups and monitoring:** Automated from day one

**Next Steps:**
1. Set up local Docker Compose environment
2. Configure GitHub Actions for CI/CD
3. Deploy to Vercel (preview environment)
4. Test all user flows
5. Configure production services (Stripe, R2, Resend)
6. Launch with proper monitoring and backups

---

**Document Version:** 1.0
**Last Updated:** January 9, 2026
**Next Review:** Month 3 (infrastructure adjustments based on real usage)

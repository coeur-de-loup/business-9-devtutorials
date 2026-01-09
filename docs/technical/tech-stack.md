# DevTutorials Technology Stack

**Date:** January 9, 2026
**Status:** Architecture Specification
**Architecture Principle:** Simplicity > Complexity

---

## Executive Summary

DevTutorials uses a **monolithic Next.js architecture** for maximum simplicity, developer productivity, and cost efficiency. This stack prioritizes solo maintainability, local development capability, and free-tier compatibility to align with the "NO MONEY without explicit approval" constraint.

**Key Stack Decisions:**
- **Frontend + Backend:** Next.js 14 (App Router) - Single framework for everything
- **Database:** PostgreSQL with Prisma ORM - Type-safe database access
- **Authentication:** NextAuth.js v5 (Auth.js) - Built into Next.js, self-hosted
- **Video Hosting:** Local development → Cloudflare R2/Bunny.net (production, 80% cheaper than AWS)
- **Payment Processing:** Stripe Connect - Marketplace-ready payment splits
- **File Storage:** Local → Cloudflare R2 (S3-compatible, 80% cheaper than AWS)
- **Email:** Resend - 100K free emails/month, $0.002/email after
- **Deployment:** Docker Compose (local) → Vercel/Railway/VPS (production, free tiers)

**Estimated MVP Infrastructure Cost: $0-50/month** (after free tiers exhausted)

---

## 1. Frontend Framework

### Selection: **Next.js 14 (App Router)**

**Rationale:**
- **Unified stack:** Frontend + backend API routes in one codebase
- **Server components by default:** Better performance, less JavaScript
- **Built-in optimization:** Image optimization, font optimization, routing
- **TypeScript-first:** Type safety across entire application
- **Vercel deployment:** Free tier with generous limits (100GB bandwidth/month)
- **Solo-friendly:** One developer can manage entire stack
- **Battle-tested:** Used by Netflix, TikTok, Uber, thousands of startups

**Alternatives Considered:**

| Alternative | Why Rejected |
|-------------|--------------|
| **React + Express** | Requires managing two separate codebases, more complexity |
| **Vue + Nuxt** | Smaller ecosystem than React, harder to find developers if needed |
| **SvelteKit** | Smaller ecosystem, fewer battle-tested examples |
| **Remix** | Good alternative, but Next.js has larger ecosystem and better free hosting on Vercel |

**Local Development:**
```bash
npm run dev  # Runs on http://localhost:3000
```

**Production Deployment:**
- **Option 1:** Vercel (recommended) - Free tier, zero config
- **Option 2:** Railway - $5/month after free tier
- **Option 3:** Self-hosted VPS - $5/month (DigitalOcean, Hetzner)

**Cost Structure:**
- **Development:** $0 (local)
- **Production (Vercel Free):** $0/month (100GB bandwidth)
- **Production (Vercel Pro):** $20/month (1TB bandwidth, 1000 edge functions minutes)

---

## 2. Backend Approach

### Selection: **Next.js API Routes (App Router)**

**Rationale:**
- **Monolithic architecture:** No separate backend service to manage
- **Server actions:** Built-in form handling and mutations
- **Type safety:** Shared TypeScript types across frontend/backend
- **Deployment:** Deploy entire app (frontend + backend) as one unit
- **Performance:** Serverless functions scale automatically
- **Simplicity:** No backend server to maintain

**Architecture Pattern:**
```typescript
// app/api/tutorials/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const tutorials = await prisma.tutorial.findMany();
  return NextResponse.json(tutorials);
}

export async function POST(request: Request) {
  const data = await request.json();
  const tutorial = await prisma.tutorial.create({ data });
  return NextResponse.json(tutorial, { status: 201 });
}
```

**Alternatives Considered:**

| Alternative | Why Rejected |
|-------------|--------------|
| **Express.js** | Requires separate backend deployment, more infrastructure |
| **NestJS** | Over-engineering for MVP, larger learning curve |
| **tRPC** | Great for type safety, but adds complexity, API routes sufficient |
| **Supabase** | Good, but Next.js API routes give more control and are free-tier friendly |

**Local Development:**
- Included in Next.js dev server (port 3000)

**Production Deployment:**
- Same as Next.js frontend (deployed together)

**Cost Structure:**
- **Free tier:** Vercel Hobby plan includes 1000 edge function minutes/month
- **Paid:** $0.50-$1.00 per 1000 minutes after free tier
- **Estimated usage:** 10K API requests/day ≈ $10-20/month (after free tier)

---

## 3. Database

### Selection: **PostgreSQL with Prisma ORM**

**Rationale:**
- **Relational data:** Marketplace model requires strong relationships (users, tutorials, purchases)
- **ACID compliance:** Critical for payment transactions and revenue splits
- **JSON support:** Store flexible metadata (tutorial curriculum, creator bio)
- **Full-text search:** Built-in search for tutorial catalog
- **Prisma ORM:** Type-safe database access, auto-generated types, great DX
- **Free tier options:** Supabase, Neon, Railway offer generous free PostgreSQL hosting

**Alternatives Considered:**

| Alternative | Why Rejected |
|-------------|--------------|
| **MySQL** | PostgreSQL has better JSON support and full-text search |
| **MongoDB** | No ACID for complex transactions (purchases, revenue splits) |
| **SQLite** | Not suitable for production, doesn't scale well |
| **Supabase (as backend)** | Good, but using Prisma + PostgreSQL gives more control and portability |

**Schema Design Approach:**
```typescript
// prisma/schema.prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  role          Role      @default(STUDENT)
  tutorials     Tutorial[]
  purchases     Purchase[]
  createdAt     DateTime  @default(now())
}

model Tutorial {
  id          String    @id @default(cuid())
  title       String
  price       Int
  creatorId   String
  creator     User      @relation(fields: [creatorId])
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
}
```

**Local Development:**
```bash
# Option 1: Docker Compose (recommended)
docker-compose up -d db  # Runs PostgreSQL on localhost:5432

# Option 2: Local PostgreSQL
brew install postgresql
brew services start postgresql
```

**Production Deployment Options:**

| Option | Price | Limits | Notes |
|--------|-------|--------|-------|
| **Supabase** | Free | 500MB DB, 1GB bandwidth | Best free tier, includes auth |
| **Neon** | Free | 3GB storage, 300 hours/month | Serverless PostgreSQL, auto-scaling |
| **Railway** | $5/month | 1GB storage | Simple, good DX |
| **Vercel Postgres** | $0.30/GB | Pay per usage | Integrated with Vercel deployment |

**Recommended: Neon (Free Tier)**
- 3GB storage (sufficient for MVP: 100 tutorials × 10MB metadata)
- 300 compute hours/month (sufficient for 1K learners)
- Auto-scaling (pay only for usage)
- Branching for development

**Cost Structure:**
- **Development:** $0 (Docker Compose or local PostgreSQL)
- **Production (Neon Free):** $0/month (Months 1-6)
- **Production (Neon Pro):** $19/month (Months 7+, includes 10GB storage, 1000 hours)

---

## 4. Authentication

### Selection: **NextAuth.js v5 (Auth.js)**

**Rationale:**
- **Built for Next.js:** Seamless integration with App Router
- **Self-hosted:** No third-party auth service dependency
- **OAuth providers:** Built-in support for Google, GitHub, Discord
- **Credentials auth:** Email/password support with bcrypt
- **Session management:** JWT or database sessions (your choice)
- **Type safety:** Full TypeScript support
- **Free:** No API call limits or costs

**Alternatives Considered:**

| Alternative | Why Rejected |
|-------------|--------------|
| **Clerk** | Free tier limited to 5K users, then $0.03/user/month = $150/month at 5K users |
| **Supabase Auth** | Good, but couples entire stack to Supabase |
| **Auth0** | Expensive after free tier (7K users), $23/month for basic plan |
| **Firebase Auth** | Google lock-in, harder to self-host |

**Implementation Approach:**
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

export const { handlers, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });
        return user ? user : null;
      }
    })
  ],
  session: { strategy: 'jwt' }, // or 'database'
});
```

**Local Development:**
- Uses environment variables for OAuth provider credentials
- Can use mock OAuth providers for local testing

**Production Deployment:**
- Requires Google OAuth app setup (free)
- Or use email/password with bcrypt (self-contained)

**Cost Structure:**
- **Development:** $0
- **Production:** $0 (self-hosted, no external service)

---

## 5. Video Hosting

### Selection: **Local Development → Cloudflare R2 (Production)**

**Rationale:**
- **Cost efficiency:** R2 is 80% cheaper than AWS S3 ($0.015/GB vs $0.023/GB)
- **Zero egress fees:** No download bandwidth costs (critical for video)
- **S3-compatible:** Drop-in replacement with standard SDKs
- **Global CDN:** Included with R2, fast video delivery worldwide
- **Local development:** Serve videos from local filesystem during development

**Alternatives Considered:**

| Alternative | Why Rejected |
|-------------|--------------|
| **AWS S3 + CloudFront** | Expensive egress fees ($0.085/GB), adds up quickly with video |
| **Vimeo** | Good quality, but costs $300-900/year for moderate usage |
| **Mux** | Excellent video streaming, but $0.005/minute streamed = expensive at scale |
| **AWS CloudFront only** | Still expensive egress fees, R2 is better price |
| **YouTube (unlisted)** | Against ToS, can be taken down, not professional |

**Video Storage Estimates:**
- **Average tutorial:** 3-5 hours video
- **File size (1080p):** ~1GB per hour
- **Tutorial size:** 3-5GB
- **100 tutorials:** 300-500GB storage

**Local Development:**
```typescript
// lib/video-storage.ts
export async function getVideoUrl(tutorialId: string, lessonId: string) {
  if (process.env.NODE_ENV === 'development') {
    return `/videos/${tutorialId}/${lessonId}.mp4`; // Local filesystem
  }
  return `https://videos.devtutorials.com/${tutorialId}/${lessonId}.mp4`; // R2
}
```

**Production Deployment:**

**Phase 1 (Months 1-6): Bunny.net**
- **Cost:** $0.01/GB storage + $0.01/GB bandwidth
- **100 tutorials (500GB):** $5/month storage + $50/month bandwidth (10K downloads) = $55/month
- **Why:** Specialized in video streaming, better pricing than R2 for video

**Phase 2 (Months 6-12): Cloudflare R2**
- **Cost:** $0.015/GB storage (zero egress fees)
- **100 tutorials (500GB):** $7.50/month storage + $0 bandwidth = $7.50/month
- **Why:** Cheapest option at scale, zero egress fees = unlimited downloads

**Streaming Approach:**
- Use HTTP range requests (native in modern browsers)
- Or integrate Video.js or Plyr for better player UI
- No transcoding required (upload as H.264/AAC, browser-compatible)

**Cost Structure:**
- **Development:** $0 (local filesystem)
- **Production (Bunny.net - Months 1-6):** $55/month (500GB + 10K downloads)
- **Production (R2 - Months 6+):** $7.50/month (500GB storage, unlimited bandwidth)

---

## 6. Payment Processing

### Selection: **Stripe Connect (Express Accounts)**

**Rationale:**
- **Marketplace-ready:** Built-in support for platform fees and payouts
- **70/30 split:** Automatic fund distribution (70% to creator, 30% to platform)
- **Express accounts:** Creators get Stripe accounts without KYC burden on platform
- **Compliance:** Stripe handles tax reporting (1099-K), PCI compliance
- **International:** Supports creators worldwide
- **Developer experience:** Excellent documentation, SDKs, test mode

**Alternatives Considered:**

| Alternative | Why Rejected |
|-------------|--------------|
| **PayPal Marketplace** | Poor developer experience, higher fees (3.49% + $0.49) |
| **Paddle** | Good for SaaS, but overkill for marketplace |
| **Gumroad** | Not white-label, users redirected to Gumroad checkout |
| **Custom payment processing** | Requires PCI compliance, too complex for solo founder |

**Implementation Approach:**
```typescript
// app/api/purchase/route.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
  const { tutorialId, userId } = await request.json();
  const tutorial = await prisma.tutorial.findUnique({ where: { id: tutorialId } });

  const session = await stripe.checkout.sessions.create({
    payment_intent_data: {
      application_fee_amount: tutorial.price * 0.30, // 30% platform fee
      transfer_data: {
        destination: tutorial.creator.stripeAccountId, // Creator's Stripe account
      },
    },
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: tutorial.title },
        unit_amount: tutorial.price * 100, // Convert to cents
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tutorials/${tutorialId}`,
  });

  return Response.json({ url: session.url });
}
```

**Local Development:**
- Stripe test mode (free)
- Test card numbers for local testing

**Production Deployment:**
- Stripe Connect Express (creators complete onboarding to receive payments)
- Platform fee: 2.9% + $0.30 per transaction (Stripe fee, not platform fee)
- Platform keeps 30% of tutorial price (after Stripe fee)

**Cost Structure:**
- **Development:** $0 (Stripe test mode)
- **Production:**
  - **Stripe fee:** 2.9% + $0.30 per transaction (industry standard)
  - **Platform revenue:** 30% of tutorial price
  - **Example:** $19 tutorial sale
    - Stripe fee: $0.85 (2.9% + $0.30)
    - Platform fee: $5.70 (30%)
    - Creator payout: $12.45 (70% - Stripe fee)

---

## 7. File Storage

### Selection: **Local → Cloudflare R2 (S3-Compatible)**

**Rationale:**
- **Non-video files:** Code repositories, PDFs, images, assets
- **Same as video storage:** Use R2 for consistency (or Bunny.net)
- **Cheaper than S3:** 80% cost savings
- **Zero egress fees:** No download costs
- **Small files:** <1GB typically, negligible storage cost

**Use Cases:**
- **Code repositories:** ZIP files of tutorial source code
- **Starter templates:** Project templates learners download
- **Course assets:** Images, diagrams, supplementary materials
- **Creator uploads:** Profile images, tutorial thumbnails

**Local Development:**
```typescript
// lib/storage.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = process.env.NODE_ENV === 'production'
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })
  : null; // Use local filesystem in dev

export async function uploadFile(file: File, key: string) {
  if (process.env.NODE_ENV === 'development') {
    // Save to local filesystem
    const buffer = await file.arrayBuffer();
    await fs.writeFile(`./uploads/${key}`, Buffer.from(buffer));
    return `/uploads/${key}`;
  }

  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: file,
  }));
  return `https://assets.devtutorials.com/${key}`;
}
```

**Production Deployment:**
- **Cloudflare R2:** $0.015/GB storage, zero egress
- **Estimated usage:** 10GB (code repositories + assets) = $0.15/month

**Cost Structure:**
- **Development:** $0 (local filesystem)
- **Production:** $0.15/month (10GB storage, negligible)

---

## 8. Email Service

### Selection: **Resend**

**Rationale:**
- **Developer experience:** Best DX for transactional email
- **Free tier:** 100K emails/month (sufficient for MVP)
- **Reliability:** Built on SendGrid infrastructure
- **Templates:** React-based email templates
- **Analytics:** Open/click tracking included

**Use Cases:**
- **Welcome emails:** New user onboarding
- **Purchase receipts:** Tutorial purchase confirmation
- **Creator payouts:** Monthly earning summaries
- **Content freshness alerts:** "Tutorial you viewed is expiring soon"
- **Marketing:** Weekly tutorial highlights, creator spotlights

**Alternatives Considered:**

| Alternative | Why Rejected |
|-------------|--------------|
| **SendGrid** | Free tier only 100 emails/day, requires credit card |
| **Mailgun** | Free tier 5K emails/month, less than Resend |
| **AWS SES** | Complex setup, sandbox mode restrictions |
| **Postmark** | Expensive: $15/month for 10K emails |
| **Mock (Mailhog)** | Good for development, but need real email for production |

**Implementation Approach:**
```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPurchaseEmail(email: string, tutorialTitle: string) {
  await resend.emails.send({
    from: 'DevTutorials <noreply@devtutorials.com>',
    to: email,
    subject: `You purchased "${tutorialTitle}"`,
    template: 'purchase-receipt', // Pre-built template
  });
}
```

**Local Development:**
- Resend test mode (emails sent to test inbox)
- Or use Mailhog for local email testing

**Production Deployment:**
- Resend free tier: 100K emails/month
- Email types: Welcome (1 per user), Purchase (1 per purchase), Weekly digest (1 per user/week)

**Estimated Usage (Month 6):**
- 1K users × 1 welcome email = 1K emails
- 500 purchases × 1 receipt = 500 emails
- 1K users × 4 weekly digests = 4K emails
- **Total:** 5.5K emails/month (well under 100K free tier)

**Cost Structure:**
- **Development:** $0 (Resend test mode)
- **Production:** $0/month (Months 1-12, under 100K emails/month)
- **Production (Month 12+):** $20/month (100K-500K emails tier)

---

## 9. Deployment Strategy

### Selection: **Docker Compose (Local) → Vercel (Production)**

**Rationale:**
- **Local development:** Docker Compose for reproducible environment
- **Production deployment:** Vercel for zero-config deployment, free tier
- **CI/CD:** GitHub Actions for testing, automatic deployment on merge
- **Rollback:** One-click rollback in Vercel dashboard
- **Previews:** Automatic preview URLs for pull requests

**Local Development (Docker Compose):**

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: devtutorials
      POSTGRES_PASSWORD: devtutorials
      POSTGRES_DB: devtutorials
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

```bash
docker-compose up -d  # Start all services
npm run dev           # Start Next.js on port 3000
```

**Production Deployment Options:**

| Option | Price | Pros | Cons |
|--------|-------|------|------|
| **Vercel (Hobby)** | Free | Zero-config, best DX, previews | 100GB bandwidth, 1000 edge function minutes |
| **Vercel (Pro)** | $20/month | 1TB bandwidth, 1000 edge minutes | Paid |
| **Railway** | $5/month | Simple, supports Docker | Less mature than Vercel |
| **Self-hosted VPS** | $5/month | Full control, unlimited bandwidth | Manual setup, no previews |

**Recommended: Vercel Hobby (Months 1-6) → Vercel Pro (Months 7+)**

**Deployment Checklist:**
1. Push to GitHub
2. GitHub Actions run tests
3. On merge to main, Vercel auto-deploys
4. Prisma migrations run automatically
5. Environment variables configured in Vercel dashboard

**CI/CD Pipeline (GitHub Actions):**

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

**Cost Structure:**
- **Development:** $0 (Docker Compose, local)
- **Production (Vercel Hobby):** $0/month (Months 1-6, 100GB bandwidth)
- **Production (Vercel Pro):** $20/month (Months 7+, 1TB bandwidth, 1000 edge minutes)

---

## 10. Monitoring and Error Tracking

### Selection: **Sentry (Error Tracking) + Vercel Analytics**

**Rationale:**
- **Sentry:** Best-in-class error tracking, free tier (5K errors/month)
- **Vercel Analytics:** Built into Vercel, real user monitoring (RUM)
- **Simple setup:** No infrastructure to manage
- **Actionable alerts:** Email/Slack notifications for critical errors

**Alternatives Considered:**

| Alternative | Why Rejected |
|-------------|--------------|
| **Datadog** | Expensive: $15/host/month, overkill for MVP |
| **New Relic** | Expensive, complex setup |
| **Rollbar** | Good alternative, but Sentry has better free tier |
| **Custom logging** | Possible, but Sentry provides better context and grouping |

**Implementation:**
```typescript
// app/layout.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
});
```

**Cost Structure:**
- **Development:** $0 (Sentry dev mode)
- **Production:** $0/month (Months 1-12, 5K errors/month free tier)
- **Production (Month 12+):** $26/month (50K errors/month)

---

## 11. Testing Framework

### Selection: **Vitest + Testing Library + Playwright**

**Rationale:**
- **Vitest:** Fast unit testing, native TypeScript, Jest-compatible API
- **Testing Library:** Best practices for testing React components
- **Playwright:** E2E testing, cross-browser, reliable
- **Integrated:** All work seamlessly with Next.js

**Alternatives Considered:**

| Alternative | Why Rejected |
|-------------|--------------|
| **Jest** | Slower than Vitest, requires more config |
| **Cypress** | E2E only, heavier than Playwright |
| **Mocha + Chai** | Less modern than Vitest |

**Testing Strategy:**
```typescript
// Unit test: __tests__/lib/prisma.test.ts
import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('User creation', () => {
  it('creates a user with valid email', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' }
    });
    expect(user.email).toBe('test@example.com');
  });
});

// Component test: components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

// E2E test: e2e/purchase.spec.ts
import { test, expect } from '@playwright/test';

test('user can purchase tutorial', async ({ page }) => {
  await page.goto('/tutorials/react-basics');
  await page.click('text=Purchase for $19');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="card"]', '4242 4242 4242 4242');
  await page.click('text=Complete Purchase');
  await expect(page).toHaveURL('/success');
});
```

**Cost Structure:**
- **Development:** $0 (local testing)

---

## 12. Overall Cost Summary

### MVP Infrastructure (Months 1-6)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Next.js (Vercel Hobby)** | Free | $0 |
| **PostgreSQL (Neon Free)** | Free | $0 |
| **Authentication (NextAuth)** | Self-hosted | $0 |
| **Video Hosting (Bunny.net)** | 500GB + 10K downloads | $55 |
| **Payment Processing (Stripe)** | Pay-per-use | 2.9% + $0.30/transaction |
| **File Storage (R2)** | 10GB | $0.15 |
| **Email (Resend)** | 100K emails | $0 |
| **Error Tracking (Sentry)** | 5K errors | $0 |
| **CI/CD (GitHub Actions)** | 2000 minutes/month | $0 |
| **Total (Fixed)** | | **$55.15/month** |
| **Transaction Fees** | @ $7,500 revenue (Month 6) | ~$217/month (2.9% + $0.30 × 500 sales) |

**Total MVP Cost: $55/month fixed + ~$217 variable = ~$272/month**

### Month 7-12 (Scaling)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Next.js (Vercel Pro)** | 1TB bandwidth | $20 |
| **PostgreSQL (Neon Pro)** | 10GB + 1000 hours | $19 |
| **Video Hosting (R2)** | 500GB, zero egress | $7.50 |
| **Other services** | Same as MVP | $28.65 |
| **Total (Fixed)** | | **$75.15/month** |
| **Transaction Fees** | @ $30K revenue (Month 12) | ~$867/month |

**Total Month 12: $75/month fixed + ~$867 variable = ~$942/month**

### Break-even Analysis

**Month 6 Revenue: $7,500**
- Fixed costs: $55
- Variable costs: $217 (Stripe fees)
- Creator payouts: $5,250 (70%)
- **Platform net: $1,978** (covers remaining costs)

**Month 12 Revenue: $30,000**
- Fixed costs: $75
- Variable costs: $867 (Stripe fees)
- Creator payouts: $21,000 (70%)
- **Platform net: $8,058** (covers costs + salaries)

---

## 13. Technology Choices Rationale Summary

### Why This Stack is Solo-Maintainable

1. **Single codebase:** Next.js handles frontend + backend, no context switching
2. **TypeScript everywhere:** One language, type safety across entire stack
3. **Proven technologies:** Battle-tested, extensive documentation, StackOverflow answers
4. **Free tier friendly:** Entire MVP can run on free tiers or <$100/month
5. **Simple deployment:** `git push` → Vercel deploys (no DevOps needed)
6. **Good DX:** Fast development iterations, hot reload, great tooling

### Why This Stack Scales to Month 6-12

1. **Vercel Pro:** Handles 1TB bandwidth (sufficient for 5K-10K users)
2. **Neon PostgreSQL:** Auto-scales compute, 10GB storage (sufficient for 500 tutorials)
3. **R2/Bunny.net:** Cheap video delivery at scale (zero egress fees)
4. **Stripe Connect:** Handles thousands of transactions, automatic payouts
5. **Serverless functions:** Auto-scale without manual configuration

### When to Reconsider (Month 12+)

1. **Video costs exceed $100/month** → Consider self-hosted streaming server
2. **PostgreSQL hits 10GB** → Upgrade to Neon Pro ($49/month for 100GB)
3. **Vercel bandwidth exceeds 1TB** → Consider CDN + VPS deployment
4. **API response times slow** → Add Redis caching ($15/month)
5. **Need real-time features** → Add Pusher or Ably ($25-100/month)

---

## Conclusion

The DevTutorials technology stack prioritizes **simplicity, cost-efficiency, and solo maintainability** while supporting the business requirements of a two-sided marketplace with video delivery.

**Key Advantages:**
- **Low cost:** MVP runs on free tiers + $55/month for video hosting
- **Fast development:** One developer can build entire MVP in 4-6 weeks
- **Scales gracefully:** Can handle 1K users on $272/month total infrastructure
- **Proven tech:** Next.js, PostgreSQL, Stripe used by thousands of successful startups

**Next Steps:**
1. Set up local development environment (Docker Compose + Next.js)
2. Configure Prisma with PostgreSQL schema
3. Integrate NextAuth.js for authentication
4. Set up Stripe Connect for marketplace payments
5. Implement video upload/download endpoints
6. Deploy to Vercel and test with sample content

---

**Document Version:** 1.0
**Last Updated:** January 9, 2026
**Next Review:** Month 6 (post-launch scaling review)

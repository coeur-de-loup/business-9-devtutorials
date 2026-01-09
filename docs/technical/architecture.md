# DevTutorials System Architecture

**Date:** January 9, 2026
**Status:** Architecture Specification
**Architecture Pattern:** Monolithic with Modular Components

---

## Executive Summary

DevTutorials uses a **monolithic Next.js architecture** designed for simplicity, solo maintainability, and cost efficiency. The system is organized as a single application with clear separation between presentation, business logic, and data layers.

**Key Architectural Decisions:**
- **Monolithic over microservices:** Single codebase, shared database, simpler deployment
- **Server-side rendering:** Better SEO, faster initial page loads
- **API-first internally:** Next.js API routes for all mutations
- **Separation of concerns:** Clean layering (UI → API → Services → Database)
- **Security by design:** Authentication, authorization, input validation at every layer

---

## 1. System Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Browser (Learners, Creators, Admins)                           │
│  - React Server Components                                       │
│  - Client Components (interactive)                               │
│  - Next.js App Router                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Next.js Application (Vercel/Railway/VPS)                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Frontend (App Router)                                 │    │
│  │  - /app/(public)/    - Public pages (catalog, home)    │    │
│  │  - /app/(auth)/      - Protected pages (dashboard)     │    │
│  │  - /app/(creator)/   - Creator dashboard               │    │
│  │  - /app/(admin)/     - Admin panel                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                         ↓ API Calls                             │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  API Routes (app/api/)                                 │    │
│  │  - /api/auth/*      - NextAuth endpoints               │    │
│  │  - /api/tutorials/* - Tutorial CRUD                    │    │
│  │  - /api/purchases/* - Purchase flow                    │    │
│  │  - /api/creators/*  - Creator dashboard endpoints      │    │
│  │  - /api/admin/*     - Admin operations                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                         ↓ Service Layer                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Business Logic (lib/services/)                        │    │
│  │  - tutorialService.ts    - Tutorial operations         │    │
│  │  - purchaseService.ts    - Payment processing          │    │
│  │  - creatorService.ts     - Creator management          │    │
│  │  - videoService.ts       - Video upload/streaming      │    │
│  │  - emailService.ts       - Transactional emails        │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                    ↓                               ↓
┌─────────────────────────────┐    ┌──────────────────────────────┐
│  EXTERNAL SERVICES          │    │  DATA LAYER                   │
├─────────────────────────────┤    ├──────────────────────────────┤
│  Stripe (Payments)          │    │  PostgreSQL (Neon/Supabase)   │
│  Cloudflare R2 (Files)      │    │  - users                      │
│  Bunny.net (Video)          │    │  - tutorials                  │
│  Resend (Email)             │    │  - purchases                  │
│  Sentry (Error Tracking)    │    │  - creator_earnings           │
└─────────────────────────────┘    │  - reviews                    │
                                    │  - video_assets               │
                                    └──────────────────────────────┘
```

### Key Components

**1. Presentation Layer (Frontend)**
- **Server Components:** Pre-rendered HTML for SEO, fast initial load
- **Client Components:** Interactive UI (video player, forms, dashboards)
- **Route Organization:** Route groups for access control `(public)`, `(auth)`, `(creator)`, `(admin)`

**2. API Layer (Backend)**
- **REST API:** Standard HTTP methods (GET, POST, PUT, DELETE)
- **Authentication:** NextAuth.js session management
- **Validation:** Zod schemas for request/response validation
- **Error handling:** Consistent error responses across all endpoints

**3. Service Layer (Business Logic)**
- **Encapsulation:** Business rules separated from API routes
- **Reusability:** Services used by multiple API endpoints
- **Testing:** Easy to unit test business logic in isolation

**4. Data Layer (Database)**
- **ORM:** Prisma for type-safe database access
- **Migrations:** Version-controlled schema changes
- **Relationships:** Foreign keys, indexes, constraints

---

## 2. User Journey Flows

### Journey 1: Learner Browsing and Purchasing

```
┌──────────────┐
│ 1. Browse    │ User lands on homepage or tutorial catalog
│  Catalog     │ Server-rendered page with pagination/filters
└──────────────┘
        ↓
┌──────────────┐
│ 2. View      │ User clicks tutorial card → detail page
│  Tutorial    │ - Video preview (first 5 minutes free)
│  Detail      │ - Curriculum, requirements, creator bio
└──────────────┘     - Reviews/ratings
        ↓
┌──────────────┐
│ 3. Click     │ User clicks "Purchase for $19"
│  "Purchase"  │ → Checks auth (redirect to login if not)
└──────────────┘
        ↓
┌──────────────┐
│ 4. Create    │ POST /api/purchases
│  Purchase    │ - Validate user has not purchased before
│  Intent      │ - Call Stripe: Create Checkout Session
└──────────────┘     - Return Stripe Checkout URL
        ↓
┌──────────────┐
│ 5. Stripe    │ User redirected to Stripe-hosted checkout
│  Checkout    │ - Enter payment details
│              │ - Stripe handles 3D Secure, fraud detection
└──────────────┘
        ↓
┌──────────────┐
│ 6. Payment   │ Stripe processes payment
│  Success     │ - Transfer 70% to creator's Stripe account
│  Webhook     │ - Transfer 30% to platform Stripe account
│              │ - Send webhook to /api/stripe/webhook
└──────────────┘
        ↓
┌──────────────┐
│ 7. Record    │ Webhook handler:
│  Purchase    │ - Create purchase record in database
│  in DB       │ - Update creator earnings
└──────────────┘     - Send purchase confirmation email
        ↓
┌──────────────┐
│ 8. Redirect  │ User redirected to /success?session_id=...
│  to Success  │ - Show purchase confirmation
│  Page        │ - Link to tutorial content
└──────────────┘
        ↓
┌──────────────┐
│ 9. Access    │ User navigates to /my-tutorials
│  Content     │ - List purchased tutorials
│              │ - Click to view full video lessons
└──────────────┘
```

**Security Considerations:**
- **Authentication check:** Verify user owns tutorial before showing content
- **Idempotency:** Prevent duplicate purchases (unique constraint on user_id + tutorial_id)
- **Webhook signature:** Verify Stripe webhook signature to prevent fraud
- **URL access control:** Video URLs should be signed or require session validation

---

### Journey 2: Creator Uploading Tutorial

```
┌──────────────┐
│ 1. Login     │ Creator logs in (NextAuth)
│  as Creator  │ Role check: user.role === 'CREATOR'
└──────────────┘
        ↓
┌──────────────┐
│ 2. Navigate  │ Click "Create Tutorial" in dashboard
│  to Creator  │ → /creator/tutorials/new
│  Dashboard   │
└──────────────┘
        ↓
┌──────────────┐
│ 3. Fill      │ Multi-step form:
│  Tutorial    │ Step 1: Metadata (title, description, price, tags)
│  Metadata    │ Step 2: Curriculum (lesson titles, durations)
└──────────────┘     Step 3: Upload videos
        ↓
┌──────────────┐
│ 4. Upload    │ For each video file:
│  Videos      │ - Client uploads to Bunny.net/R2 via presigned URL
│              │ - Server stores video metadata in database
└──────────────┘     - Progress bar shows upload status
        ↓
┌──────────────┐
│ 5. Upload    │ Upload ZIP file of source code
│  Code Files  │ - Store in R2 under /code-repos/{tutorial_id}/
│              │ - Unzip and verify structure
└──────────────┘
        ↓
┌──────────────┐
│ 6. Submit    │ Click "Submit for Review"
│  for Review  │ - Change tutorial.status to 'PENDING_REVIEW'
└──────────────┘     - Send notification to admin email
        ↓
┌──────────────┐
│ 7. Admin     │ Admin receives email + dashboard alert
│  Review      │ → /admin/tutorials/pending
│              │ - Review tutorial metadata, videos, code
└──────────────┘
        ↓
┌──────────────┐
│ 8. Admin     │ Admin decision:
│  Decision    │ - Approve: status = 'PUBLISHED', email creator
│              │ - Reject: status = 'REJECTED', email with feedback
└──────────────┘
        ↓
┌──────────────┐
│ 9. Tutorial  │ If approved:
│  Published   │ - Appears in public catalog
│              │ - Creator can view sales, earnings in dashboard
└──────────────┘
```

**Security Considerations:**
- **Role-based access:** Only users with `role: 'CREATOR'` can access `/creator/*`
- **File upload limits:** Max file size (e.g., 5GB per video), virus scanning
- **Content validation:** Verify video formats (MP4, WebM), code repository structure
- **Rate limiting:** Prevent abuse of upload bandwidth

---

### Journey 3: Admin Approval Workflow

```
┌──────────────┐
│ 1. Admin     │ Admin logs in (role: 'ADMIN')
│  Login       │ → /admin/dashboard
└──────────────┘
        ↓
┌──────────────┐
│ 2. View      │ See "Pending Reviews" count
│  Pending     │ → /admin/tutorials/pending
│  Tutorials   │ List of tutorials with status = 'PENDING_REVIEW'
└──────────────┘
        ↓
┌──────────────┐
│ 3. Review    │ Click tutorial → detail view
│  Tutorial    │ - Watch video preview
│              │ - Check curriculum structure
└──────────────┘     - Verify code quality
        ↓
┌──────────────┐
│ 4. Vet       │ If first-time creator:
│  Creator     │ - Verify 5+ years experience (LinkedIn, GitHub)
│              │ - Check for plagiarism (compare to existing tutorials)
└──────────────┘
        ↓
┌──────────────┐
│ 5. Approve   │ Click "Approve" → POST /api/admin/tutorials/{id}/approve
│  or Reject   │ - Update tutorial.status
└──────────────┘     - Add admin_notes for rejection reason
        ↓
┌──────────────┐
│ 6. Notify    │ Send email to creator:
│  Creator     │ - Approved: "Your tutorial is live!"
│              │ - Rejected: "Please fix these issues: ..."
└──────────────┘
        ↓
┌──────────────┐
│ 7. Update    │ Update creator vetting status:
│  Creator     │ - First approval: creator.vetted = true
│  Status      │ - Future tutorials auto-approved if vetted
└──────────────┘
```

**Security Considerations:**
- **Admin-only routes:** Middleware checks `user.role === 'ADMIN'`
- **Audit trail:** Log all admin actions (who approved what, when)
- **Reversion capability:** Ability to unpublish tutorials if issues found later

---

### Journey 4: Video Streaming and Content Delivery

```
┌──────────────┐
│ 1. User      │ User clicks "Watch Tutorial"
│  Requests    │ GET /api/tutorials/{id}/lessons
│  Lesson List │ - Verify user has purchased tutorial
└──────────────┘
        ↓
┌──────────────┐
│ 2. Server    │ Server returns lesson metadata:
│  Returns     │ - title, duration, order
│  Lesson Data │ - video_url (signed URL or token-based)
└──────────────┘
        ↓
┌──────────────┐
│ 3. Video     │ Frontend initializes video player
│  Player      │ (Video.js, Plyr, or native <video>)
│  Loads       │ - Requests video from CDN (Bunny.net/R2)
└──────────────┘
        ↓
┌──────────────┐
│ 4. CDN       │ CDN delivers video with:
│  Delivers    │ - HTTP range requests (chunked streaming)
│  Video       │ - Gzip compression
│              │ - Caching headers (Cache-Control: public, max-age=31536000)
└──────────────┘
        ↓
┌──────────────┐
│ 5. Progress  │ Every 30 seconds, client sends progress:
│  Tracking    │ POST /api/tutorials/{id}/progress
│              │ - lesson_id, timestamp, completed (boolean)
└──────────────┘
        ↓
┌──────────────┐
│ 6. Server    │ Server saves progress:
│  Saves       │ - Update or create user_progress record
│  Progress    │ - Mark lesson as completed if finished
└──────────────┘
        ↓
┌──────────────┐
│ 7. Completion │ When all lessons completed:
│  Celebration │ - Update tutorial completion count
│              │ - Send "Congratulations" email
└──────────────┘
```

**Security Considerations:**
- **Signed URLs:** Video URLs expire after 1 hour, prevent hotlinking
- **Rate limiting:** Prevent abuse of video bandwidth (max 3 simultaneous streams per user)
- **Geo-blocking:** Optional (some creators may restrict by region)
- **DRM:** Not required for MVP (optional for future)

---

## 3. Data Flow Architecture

### Request Flow (Read Path)

```
1. Browser Request
   ↓
2. Next.js App Router (Server Component)
   ↓
3. Middleware (Authentication check)
   ↓
4. Page Component
   ↓
5. Service Layer (Business Logic)
   ↓
6. Prisma ORM
   ↓
7. PostgreSQL Database
   ↓
8. Return data (reverse order)
```

**Example: Fetching tutorial catalog**

```typescript
// 1. Browser: User visits /tutorials
// 2. Next.js: app/tutorials/page.tsx (Server Component)

import { prisma } from '@/lib/prisma';
import { TutorialList } from './TutorialList';

export default async function TutorialsPage() {
  // 5. Service layer (inline for simplicity)
  const tutorials = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      creator: { select: { name: true, avatar: true } },
      _count: { select: { purchases: true, reviews: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // 6. Render component with data
  return <TutorialList tutorials={tutorials} />;
}
```

### Request Flow (Write Path)

```
1. Browser Action (form submit, button click)
   ↓
2. Client Component (onClick handler)
   ↓
3. fetch('/api/endpoint', { method: 'POST' })
   ↓
4. Next.js API Route
   ↓
5. Middleware (Authentication + Authorization check)
   ↓
6. Validation (Zod schema)
   ↓
7. Service Layer (Business Logic)
   ↓
8. Prisma ORM (Transaction)
   ↓
9. PostgreSQL Database
   ↓
10. Return response (JSON)
```

**Example: Purchasing a tutorial**

```typescript
// 1. Client Component: "Purchase" button
// components/PurchaseButton.tsx

'use client';
import { useState } from 'react';

export function PurchaseButton({ tutorialId }: { tutorialId: string }) {
  const [loading, setLoading] = useState(false);

  async function handlePurchase() {
    setLoading(true);
    try {
      // 3. API call
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorialId }),
      });

      const { url } = await response.json();
      window.location.href = url; // Redirect to Stripe
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return <button onClick={handlePurchase} disabled={loading}>
    {loading ? 'Processing...' : 'Purchase for $19'}
  </button>;
}

// 4. API Route
// app/api/purchases/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { z } from 'zod';

const purchaseSchema = z.object({
  tutorialId: z.string().cuid(),
});

export async function POST(request: NextRequest) {
  // 5. Authentication check
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 6. Validation
  const body = await request.json();
  const { tutorialId } = purchaseSchema.parse(body);

  // 7. Service layer (business logic)
  const tutorial = await prisma.tutorial.findUnique({
    where: { id: tutorialId },
    include: { creator: true },
  });

  if (!tutorial || tutorial.status !== 'PUBLISHED') {
    return NextResponse.json({ error: 'Tutorial not found' }, { status: 404 });
  }

  // Check if already purchased
  const existingPurchase = await prisma.purchase.findUnique({
    where: {
      userId_tutorialId: {
        userId: session.user.id,
        tutorialId,
      },
    },
  });

  if (existingPurchase) {
    return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
  }

  // 8. Create Stripe Checkout Session
  const stripeSession = await stripe.checkout.sessions.create({
    payment_intent_data: {
      application_fee_amount: Math.round(tutorial.price * 0.30 * 100),
      transfer_data: {
        destination: tutorial.creator.stripeAccountId,
      },
    },
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: tutorial.title },
        unit_amount: tutorial.price * 100,
      },
      quantity: 1,
    }],
    mode: 'payment',
    metadata: { userId: session.user.id, tutorialId },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tutorials/${tutorialId}`,
  });

  // 10. Return checkout URL
  return NextResponse.json({ url: stripeSession.url });
}
```

---

## 4. Security Architecture

### Authentication Flow

```
1. User clicks "Login"
   ↓
2. Redirect to /api/auth/signin
   ↓
3. User selects provider (Google or Email/Password)
   ↓
4. OAuth flow OR credentials validation
   ↓
5. NextAuth creates session (JWT or database)
   ↓
6. Set session cookie (httpOnly, secure, sameSite)
   ↓
7. Redirect to dashboard
```

**Session Management:**
- **Strategy:** JWT (stateless) for simplicity
- **Token:** Contains user.id, user.role, email
- **Expiry:** 30 days (refresh token on activity)
- **Storage:** httpOnly cookie (XSS-resistant)

### Authorization Flow

```
1. User requests protected resource
   ↓
2. Middleware extracts session from cookie
   ↓
3. Check if session exists
   ↓
4. Check if user.role has required permission
   ↓
5. If authorized: proceed to request handler
   ↓
6. If unauthorized: return 401/403
```

**Role-Based Access Control (RBAC):**

```typescript
// middleware.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isCreatorRoute = req.nextUrl.pathname.startsWith('/creator');
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

  // Public routes: allow
  if (!isOnDashboard && !isCreatorRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // Protected routes: check auth
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Creator routes: check role
  if (isCreatorRoute && req.auth.user.role !== 'CREATOR' && req.auth.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Admin routes: check role
  if (isAdminRoute && req.auth.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Data Protection

**1. Input Validation:**
- **Zod schemas:** Validate all user input (API routes, forms)
- **SQL injection prevention:** Prisma ORM (parameterized queries)
- **XSS prevention:** React escapes HTML by default

**2. File Upload Security:**
- **File type validation:** Only allow allowed MIME types
- **File size limits:** Max 5GB per video, 100MB for code repos
- **Virus scanning:** Optional (ClamAV for production)
- **Presigned URLs:** Expiring URLs for direct uploads to R2

**3. Payment Security:**
- **PCI compliance:** Stripe handles card data (never touches our servers)
- **Webhook signatures:** Verify Stripe webhook signatures
- **Idempotency:** Prevent duplicate payments

**4. API Security:**
- **Rate limiting:** Prevent abuse (100 requests/minute per user)
- **CORS:** Restrict to frontend domain only
- **CSRF protection:** Built into Next.js API routes

---

## 5. Scalability Considerations

### Current Scale (Months 1-6)

**Target:**
- 500-1,000 learners
- 50-100 tutorials
- 20-30 creators

**Bottlenecks:**
- **Video bandwidth:** 10K downloads × 3GB = 30TB/month (handled by Bunny.net CDN)
- **Database queries:** PostgreSQL handles 1K concurrent users easily
- **API response times:** Serverless functions scale automatically

### Month 6-12 Scale

**Target:**
- 2,000-5,000 learners
- 100-300 tutorials
- 50-100 creators

**Potential Issues:**
- **Database connection limits:** Neon free tier (300 hours) → upgrade to Pro
- **API latency:** Add Redis caching for frequently accessed data (tutorial catalog)
- **Video costs:** 50K downloads × 3GB = 150TB/month → consider R2 for zero egress fees

### Optimization Strategies

**1. Caching (Month 6+)**
```typescript
// Before: Database query for every page load
const tutorials = await prisma.tutorial.findMany();

// After: Cache for 5 minutes
const cached = await redis.get('tutorials:catalog');
if (cached) return JSON.parse(cached);

const tutorials = await prisma.tutorial.findMany();
await redis.set('tutorials:catalog', JSON.stringify(tutorials), 'EX', 300);
return tutorials;
```

**2. Database Indexing (Day 1)**
```sql
-- Index frequently queried columns
CREATE INDEX idx_tutorials_status ON tutorials(status);
CREATE INDEX idx_tutorials_creator ON tutorials(creator_id);
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_tutorial ON purchases(tutorial_id);

-- Composite index for admin dashboard
CREATE INDEX idx_tutorials_status_created ON tutorials(status, created_at DESC);
```

**3. CDN Caching (Day 1)**
```typescript
// Cache video URLs for 1 year
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const tutorial = await prisma.tutorial.findUnique({ where: { id: params.id } });

  return NextResponse.json(tutorial, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
    },
  });
}
```

**4. Video Optimization (Month 3+)**
- **Adaptive bitrate:** Generate multiple quality levels (480p, 720p, 1080p)
- **Lazy loading:** Load next lesson metadata while watching current lesson
- **Preloading:** Preload next 30 seconds of video (configurable)

---

## 6. Monitoring and Observability

### Error Tracking (Sentry)

```typescript
// app/layout.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event) {
    // Filter out sensitive data
    if (event.request?.headers) {
      delete event.request.headers['cookie'];
      delete event.request.headers['authorization'];
    }
    return event;
  },
});
```

### Performance Monitoring (Vercel Analytics)

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

### Custom Metrics (Database)

```typescript
// lib/metrics.ts
export async function recordPageView(tutorialId: string) {
  await prisma.pageView.create({
    data: { tutorialId, timestamp: new Date() },
  });
}

export async function getDailyStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [views, purchases, signups] = await Promise.all([
    prisma.pageView.count({ where: { timestamp: { gte: today } } }),
    prisma.purchase.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
  ]);

  return { views, purchases, signups };
}
```

### Logging

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify({ level: 'info', message, ...meta }));
    } else {
      console.log('[INFO]', message, meta);
    }
  },
  error: (message: string, error?: Error) => {
    if (process.env.NODE_ENV === 'production') {
      console.error(JSON.stringify({
        level: 'error',
        message,
        error: error?.stack,
      }));
    } else {
      console.error('[ERROR]', message, error);
    }
  },
};
```

---

## 7. Deployment Architecture

### Development Environment

```
Developer's Machine
├── Docker Compose
│   ├── PostgreSQL (port 5432)
│   └── Redis (port 6379)
├── Next.js Dev Server (port 3000)
└── Local file storage (./uploads/videos)
```

**Commands:**
```bash
docker-compose up -d           # Start PostgreSQL and Redis
npm run dev                     # Start Next.js (port 3000)
npx prisma studio              # Database GUI (port 5555)
```

### Production Environment (Vercel)

```
Vercel Infrastructure
├── Edge Network (Global CDN)
│   ├── Static assets (images, fonts, JS bundles)
│   └── Edge functions (API routes)
├── Serverless Functions
│   ├── API routes (auto-scaling)
│   └── Image optimization
└── External Services
    ├── Neon PostgreSQL
    ├── Stripe
    ├── Bunny.net (CDN)
    └── Resend (Email)
```

**Deployment Flow:**
1. Push to GitHub (`git push origin main`)
2. GitHub Actions run tests
3. On merge to main: Vercel auto-deploys
4. Prisma migrations run automatically
5. New version live in <2 minutes

### Database Migration Strategy

```bash
# Development
npx prisma migrate dev --name add_tutorial_table

# Production (via Vercel CLI)
vercel env pull .env.local
npx prisma migrate deploy

# Or automatic via Vercel integration
# Vercel runs `prisma migrate deploy` on every deployment
```

**Rollback Strategy:**
- **Vercel:** One-click rollback to previous deployment
- **Database:** Migration rollback (manual, for emergencies only)

---

## 8. Technology-Specific Patterns

### Next.js App Router Patterns

**Server Components (Default):**
```typescript
// app/tutorials/page.tsx
import { prisma } from '@/lib/prisma';

export default async function TutorialsPage() {
  const tutorials = await prisma.tutorial.findMany(); // Runs on server
  return <TutorialList tutorials={tutorials} />;
}
```

**Client Components (Interactive):**
```typescript
// 'use client';
import { useState } from 'react';

export function PurchaseButton() {
  const [loading, setLoading] = useState(false);
  return <button onClick={handlePurchase}>Purchase</button>;
}
```

**Server Actions (Form Handling):**
```typescript
// app/actions.ts
'use server';
import { prisma } from '@/lib/prisma';

export async function createTutorial(formData: FormData) {
  const title = formData.get('title') as string;
  const tutorial = await prisma.tutorial.create({ data: { title } });
  return tutorial;
}

// Usage in component:
// <form action={createTutorial}>
//   <input name="title" />
//   <button type="submit">Create</button>
// </form>
```

### Prisma Patterns

**Transaction for Payment:**
```typescript
await prisma.$transaction(async (tx) => {
  // Create purchase record
  const purchase = await tx.purchase.create({
    data: { userId, tutorialId, amount: tutorial.price }
  });

  // Update creator earnings
  await tx.creatorEarning.create({
    data: {
      creatorId: tutorial.creatorId,
      tutorialId,
      amount: tutorial.price * 0.70
    }
  });

  return purchase;
});
```

### Error Handling Patterns

**Consistent Error Responses:**
```typescript
// lib/errors.ts
export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## Conclusion

The DevTutorials architecture prioritizes **simplicity and solo maintainability** while providing a clear path for scaling. The monolithic Next.js approach reduces operational complexity, and the clean separation of concerns ensures the codebase remains maintainable as features are added.

**Key Architectural Benefits:**
1. **Single codebase:** Frontend + backend in one repo
2. **Type safety:** TypeScript + Prisma provide end-to-end types
3. **Serverless scaling:** Vercel handles infrastructure automatically
4. **Clear security layers:** Auth → RBAC → Validation → Business logic
5. **Observable:** Error tracking, analytics, logging from day one

**Next Steps:**
1. Set up project structure with Next.js 14
2. Configure Prisma with database schema
3. Implement authentication with NextAuth.js
4. Build tutorial catalog and detail pages
5. Integrate Stripe Connect for payments
6. Set up video upload/download endpoints
7. Deploy to Vercel and test with sample data

---

**Document Version:** 1.0
**Last Updated:** January 9, 2026
**Next Review:** Month 6 (post-launch architecture review)

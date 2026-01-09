# DevTutorials Database Schema

**Date:** January 9, 2026
**Status:** Architecture Specification
**Database:** PostgreSQL 15
**ORM:** Prisma

---

## Executive Summary

The DevTutorials database schema is designed to support a two-sided marketplace with video content delivery, payment processing, and creator revenue tracking. The schema prioritizes data integrity, query performance, and auditability.

**Key Design Principles:**
- **Relational integrity:** Foreign keys with cascade rules
- **Audit trail:** created_at, updated_at timestamps on all tables
- **Soft deletes:** deleted_at for recoverable deletions
- **Indexes:** Strategic indexing for query performance
- **UUIDs:** Public-facing IDs for security and scalability

---

## 1. Entity-Relationship Diagram (Text Format)

```
┌─────────────┐
│   User      │
├─────────────┤
│ id (PK)     │───┐
│ email       │   │ 1
│ role        │   │
│ name        │   │
│ avatar      │   │
│ stripeAccountId│ │
│ vetted      │   │
│ createdAt   │   │
│ updatedAt   │   │
└─────────────┘   │
                  │
                  │ has many
                  │
        ┌─────────┴─────────────────────────────────┐
        │                                           │
        │ 1                                         │ 1
        ▼                                           ▼
┌──────────────┐                            ┌──────────────┐
│   Tutorial   │                            │   Purchase   │
├──────────────┤                            ├──────────────┤
│ id (PK)      │───┐                         │ id (PK)      │
│ title        │   │                         │ userId (FK)  │───┐
│ description  │   │ 1                       │ tutorialId   │   │
│ price        │   │                         │ amount       │   │
│ creatorId    │───┘                         │ stripePaymentId│
│ status       │                            │ createdAt    │   │
│ tier         │                            │              │   │
│ publishedAt  │                            │              │   │
│ lastUpdatedAt│                            │              │   │
│ createdAt    │                            └──────────────┘   │
│ updatedAt    │                                                │ belongs to
└──────────────┘                                                │
        │                                                      │
        │ has many                                             │ M
        │                                                      │
        ▼                                                      ▼
┌──────────────┐                                    ┌──────────────┐
│   Lesson     │                                    │CreatorEarning│
├──────────────┤                                    ├──────────────┤
│ id (PK)      │                                    │ id (PK)      │
│ tutorialId   │                                    │ creatorId    │
│ title        │                                    │ tutorialId   │
│ duration     │                                    │ amount       │
│ videoUrl     │                                    │ status       │
│ order        │                                    │ paidAt       │
│ createdAt    │                                    │ createdAt    │
└──────────────┘                                    └──────────────┘

        │
        │ has many
        │
        ▼
┌──────────────┐
│UserProgress  │
├──────────────┤
│ id (PK)      │
│ userId       │
│ lessonId     │
│ completed    │
│ watchTime    │
│ lastWatchedAt│
│ createdAt    │
│ updatedAt    │
└──────────────┘

Other tables:
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    Review    │      │  VideoAsset  │      │ CodeRepo     │
├──────────────┤      ├──────────────┤      ├──────────────┤
│ id (PK)      │      │ id (PK)      │      │ id (PK)      │
│ tutorialId   │      │ tutorialId   │      │ tutorialId   │
│ userId       │      │ lessonId     │      │ url          │
│ rating       │      │ storageKey   │      │ size         │
│ comment      │      │ size         │      │ createdAt    │
│ createdAt    │      │ duration     │      └──────────────┘
└──────────────┘      │ createdAt    │
                      └──────────────┘
```

---

## 2. Complete Schema Definition

### User Table

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  avatar          String?   // URL to avatar image
  role            Role      @default(STUDENT)
  stripeAccountId String?   @unique // Stripe Connect account ID
  vetted          Boolean   @default(false) // For creators: approved by admin
  bio             String?   @db.Text // Creator bio
  website         String?   // Creator website/portfolio
  github          String?   // Creator GitHub profile
  linkedin        String?   // Creator LinkedIn profile

  // Relations
  tutorials       Tutorial[] // Created tutorials
  purchases       Purchase[]
  reviews         Review[]
  progress        UserProgress[]

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime? // Soft delete

  @@index([email])
  @@index([role])
  @@map("users")
}

enum Role {
  STUDENT
  CREATOR
  ADMIN
}
```

**Rationale:**
- **CUID IDs:** Collision-resistant, URL-safe, non-sequential (prevents enumeration)
- **Stripe Connect:** Each creator has connected Stripe account for payouts
- **Vetted flag:** Admin must vet creator before tutorials are auto-approved
- **Soft delete:** Keep user data for audit purposes

---

### Tutorial Table

```prisma
model Tutorial {
  id              String    @id @default(cuid())
  title           String
  slug            String    @unique // URL-friendly: "build-rest-api-nodejs"
  description     String    @db.Text
  price           Int       // In cents: $19 = 1900
  tier            TutorialTier
  status          TutorialStatus @default(DRAFT)

  // Relationships
  creatorId       String
  creator         User      @relation(fields: [creatorId], references: [id], onDelete: Cascade)

  // Metadata
  level           DifficultyLevel @default(INTERMEDIATE)
  category        String    // "React", "Node.js", "Python"
  tags            String[]  // ["web-development", "backend", "api"]
  language        String    @default("JavaScript") // Programming language
  prerequisites   String[]  // ["Basic JavaScript", "HTML/CSS"]

  // Curriculum
  durationHours   Int       @default(0) // Total duration in hours
  lessonCount     Int       @default(0) // Number of lessons

  // Freshness tracking
  publishedAt     DateTime?
  lastUpdatedAt   DateTime  @default(now()) // For 6-month freshness guarantee
  expiresAt       DateTime? // Calculated: publishedAt + 6 months

  // Media
  thumbnailUrl    String?   // Tutorial cover image
  previewVideoUrl String?   // Free preview video (first 5 minutes)

  // Engagement
  viewCount       Int       @default(0)
  purchaseCount   Int       @default(0)
  avgRating       Decimal?  @db.Decimal(2, 1) // 4.5 = 4.5
  reviewCount     Int       @default(0)

  // Admin notes
  adminNotes      String?   @db.Text // Rejection feedback, review notes

  // Relations
  lessons         Lesson[]
  purchases       Purchase[]
  reviews         Review[]
  codeRepo        CodeRepo?
  videoAssets     VideoAsset[]

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  @@index([creatorId])
  @@index([status])
  @@index([slug])
  @@index([category])
  @@index([status, publishedAt]) // For admin dashboard
  @@index([expiresAt]) // For freshness cleanup
  @@map("tutorials")
}

enum TutorialTier {
  QUICK_SKILL    // 1-2 hours, $9
  STANDARD       // 3-5 hours, $19
  DEEP_DIVE      // 6-10 hours, $29
}

enum TutorialStatus {
  DRAFT              // Creator working on it
  PENDING_REVIEW     // Submitted for approval
  PUBLISHED          // Live on platform
  REJECTED           // Admin rejected, needs changes
  EXPIRED            // 6-month freshness lapsed
  ARCHIVED           // Removed by creator or admin
}

enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}
```

**Rationale:**
- **Slug field:** SEO-friendly URLs (e.g., /tutorials/build-rest-api-nodejs)
- **Price in cents:** Avoid floating-point math errors
- **Freshness tracking:** `expiresAt` automatically calculated as `publishedAt + 6 months`
- **Status workflow:** Draft → Pending Review → Published → Expired
- **Denormalized counts:** `purchaseCount`, `reviewCount` cached for performance

---

### Lesson Table

```prisma
model Lesson {
  id              String    @id @default(cuid())
  title           String
  description     String?   @db.Text

  // Relationships
  tutorialId      String
  tutorial        Tutorial  @relation(fields: [tutorialId], references: [id], onDelete: Cascade)

  // Metadata
  order           Int       // Lesson order: 1, 2, 3...
  durationMinutes Int       @default(0)

  // Content
  videoUrl        String?   // CDN URL or presigned URL
  videoSize       BigInt?   // In bytes

  // Resources
  resources       Json?     // {"links": [{"title": "Docs", "url": "..."}]}

  // Relations
  videoAsset      VideoAsset?
  progress        UserProgress[]

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  @@index([tutorialId])
  @@index([tutorialId, order]) // For fetching lessons in order
  @@map("lessons")
}
```

**Rationale:**
- **Order field:** Explicit lesson ordering (not implicit from ID)
- **Video URL:** Can be CDN URL or presigned R2 URL
- **JSON resources:** Flexible field for links, downloads, notes

---

### Purchase Table

```prisma
model Purchase {
  id              String    @id @default(cuid())

  // Relationships
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tutorialId      String
  tutorial        Tutorial  @relation(fields: [tutorialId], references: [id], onDelete: Cascade)

  // Payment details
  amount          Int       // In cents: $19 = 1900
  currency        String    @default("usd")
  stripePaymentId String    @unique // Stripe Payment Intent ID
  stripeSessionId String?   @unique // Stripe Checkout Session ID

  // Revenue split
  platformFee     Int       // 30% of amount
  creatorAmount   Int       // 70% of amount

  // Status
  status          PurchaseStatus @default(COMPLETED)

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([userId, tutorialId]) // Prevent duplicate purchases
  @@index([userId])
  @@index([tutorialId])
  @@index([createdAt])
  @@map("purchases")
}

enum PurchaseStatus {
  PENDING     // Payment processing
  COMPLETED   // Payment successful
  FAILED      // Payment failed
  REFUNDED    // Refunded by platform
}
```

**Rationale:**
- **Unique constraint:** Prevent duplicate purchases (one user cannot buy same tutorial twice)
- **Revenue split tracking:** Record platform fee and creator amount at purchase time
- **Stripe IDs:** Store for reconciliation and refunds

---

### CreatorEarning Table

```prisma
model CreatorEarning {
  id              String    @id @default(cuid())

  // Relationships
  creatorId       String
  creator         User?     @relation("CreatorEarnings", fields: [creatorId], references: [id], onDelete: Cascade)
  tutorialId      String
  tutorial        Tutorial  @relation(fields: [tutorialId], references: [id], onDelete: Cascade)

  // Amount
  amount          Int       // In cents: 70% of purchase price
  currency        String    @default("usd")

  // Payment status
  status          PayoutStatus @default(PENDING)

  // Payout details
  stripeTransferId String?  @unique // Stripe Transfer ID
  paidAt          DateTime?

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([creatorId, status]) // For creator dashboard (pending payouts)
  @@index([tutorialId])
  @@map("creator_earnings")
}

enum PayoutStatus {
  PENDING     // Awaiting payout
  PROCESSING  // Payout in progress
  PAID        // Successfully paid
  FAILED      // Payout failed
}
```

**Rationale:**
- **One record per purchase:** Every tutorial purchase creates a CreatorEarning record
- **Payout batching:** Aggregate pending earnings by creator for monthly payouts
- **Stripe Transfer:** Track Stripe transfer ID for reconciliation

---

### Review Table

```prisma
model Review {
  id              String    @id @default(cuid())

  // Relationships
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tutorialId      String
  tutorial        Tutorial  @relation(fields: [tutorialId], references: [id], onDelete: Cascade)

  // Rating
  rating          Int       // 1-5 stars
  comment         String?   @db.Text

  // Moderation
  flagged         Boolean   @default(false)
  adminApproved   Boolean   @default(true)

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([userId, tutorialId]) // One review per user per tutorial
  @@index([tutorialId])
  @@index([rating])
  @@map("reviews")
}
```

**Rationale:**
- **Unique constraint:** One review per user per tutorial
- **Moderation:** Flagged reviews require admin approval before showing

---

### UserProgress Table

```prisma
model UserProgress {
  id              String    @id @default(cuid())

  // Relationships
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  lessonId        String
  lesson          Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  // Progress
  completed       Boolean   @default(false)
  watchTimeSeconds Int      @default(0)
  lastWatchedAt   DateTime  @default(now())

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([userId, lessonId]) // One progress record per user per lesson
  @@index([userId])
  @@index([lessonId])
  @@map("user_progress")
}
```

**Rationale:**
- **Watch time tracking:** Track how much of each lesson user has watched
- **Completion flag:** Mark lessons as completed (for progress bars)

---

### VideoAsset Table

```prisma
model VideoAsset {
  id              String    @id @default(cuid())

  // Relationships
  tutorialId      String
  tutorial        Tutorial  @relation(fields: [tutorialId], references: [id], onDelete: Cascade)
  lessonId        String?   @unique // If lesson-specific, otherwise null (intro video)

  // Storage
  storageKey      String    // R2/Bunny.net storage key
  storageProvider StorageProvider @default(R2)
  url             String?   // CDN URL (may be presigned/signed)

  // Metadata
  size            BigInt    // File size in bytes
  duration        Int?      // Duration in seconds
  width           Int?      // Video width
  height          Int?      // Video height
  format          String?   // "mp4", "webm"

  // Transcoding
  status          VideoStatus @default(UPLOADING)
  transcodingJobs Json?     // Array of transcoding job IDs

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([tutorialId])
  @@index([lessonId])
  @@map("video_assets")
}

enum StorageProvider {
  LOCAL       // Development
  R2          // Cloudflare R2 (production)
  BUNNY       // Bunny.net CDN (alternative)
}

enum VideoStatus {
  UPLOADING    // Upload in progress
  PROCESSING   // Transcoding/thumbnail generation
  READY        // Ready for streaming
  ERROR        // Upload/processing failed
}
```

**Rationale:**
- **Separate from lessons:** Store video metadata separately (lessons have one video, but tutorial may have intro/outro)
- **Storage tracking:** Track where video is stored (local vs. production)
- **Transcoding status:** Track if video is ready for streaming

---

### CodeRepo Table

```prisma
model CodeRepo {
  id              String    @id @default(cuid())

  // Relationships
  tutorialId      String    @unique // One code repo per tutorial
  tutorial        Tutorial  @relation(fields: [tutorialId], references: [id], onDelete: Cascade)

  // Storage
  storageKey      String    // R2 storage key
  url             String    // Download URL (presigned)
  size            BigInt    // File size in bytes

  // Metadata
  format          String    @default("zip") // "zip", "tar.gz"
  checksum        String?   // SHA-256 checksum

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@map("code_repos")
}
```

**Rationale:**
- **One per tutorial:** Tutorial includes working code (starter + final solution)
- **Checksum:** Verify file integrity

---

## 3. Indexes for Performance

### Strategic Indexes

```sql
-- Tutorial catalog (frequently accessed)
CREATE INDEX idx_tutorials_published ON tutorials(status, publishedAt DESC)
  WHERE status = 'PUBLISHED';

-- Tutorial search
CREATE INDEX idx_tutorials_search ON tutorials(status, category, avgRating DESC)
  WHERE status = 'PUBLISHED';

-- Freshness tracking
CREATE INDEX idx_tutorials_expiring ON tutorials(status, expiresAt)
  WHERE status = 'PUBLISHED' AND expiresAt < NOW() + INTERVAL '30 days';

-- Creator dashboard
CREATE INDEX idx_tutorials_creator_status ON tutorials(creatorId, status);

-- User purchases
CREATE INDEX idx_purchases_user_date ON purchases(userId, createdAt DESC);

-- Creator earnings (pending payouts)
CREATE INDEX idx_earnings_creator_pending ON creator_earnings(creatorId, status)
  WHERE status = 'PENDING';

-- Reviews (moderation)
CREATE INDEX idx_reviews_flagged ON reviews(flagged, adminApproved)
  WHERE flagged = true;

-- User progress (continue watching)
CREATE INDEX idx_progress_user_watching ON user_progress(userId, lastWatchedAt DESC)
  WHERE completed = false;
```

### Composite Indexes for Common Queries

```sql
-- Tutorial detail page + reviews
CREATE INDEX idx_tutorial_detail ON tutorials(id)
  INCLUDE (title, description, price, tier, creatorId, avgRating);

-- Lesson list for tutorial
CREATE INDEX idx_lessons_tutorial_order ON lessons(tutorialId, "order");
```

---

## 4. Sample Queries

### Query 1: Tutorial Catalog (Public)

```typescript
// Fetch published tutorials with pagination
async function getTutorials(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const tutorials = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      creator: {
        select: { name: true, avatar: true, bio: true }
      },
      _count: {
        select: { purchases: true, reviews: true }
      }
    },
    orderBy: { publishedAt: 'desc' },
    skip,
    take: limit,
  });

  const total = await prisma.tutorial.count({
    where: { status: 'PUBLISHED' }
  });

  return { tutorials, total, page, pages: Math.ceil(total / limit) };
}
```

### Query 2: Tutorial Detail Page

```typescript
// Fetch tutorial with lessons and creator info
async function getTutorialDetail(slug: string, userId?: string) {
  const tutorial = await prisma.tutorial.findUnique({
    where: { slug },
    include: {
      creator: {
        select: { name: true, avatar: true, bio: true, website: true }
      },
      lessons: {
        orderBy: { order: 'asc' },
        select: { id: true, title: true, description: true, durationMinutes: true }
      },
      reviews: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, avatar: true } }
        }
      }
    }
  });

  if (!tutorial) return null;

  // Check if user has purchased
  let hasPurchased = false;
  if (userId) {
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_tutorialId: { userId, tutorialId: tutorial.id }
      }
    });
    hasPurchased = !!purchase;
  }

  return { ...tutorial, hasPurchased };
}
```

### Query 3: Creator Dashboard (Earnings)

```typescript
// Fetch creator's total earnings and pending payouts
async function getCreatorEarnings(creatorId: string) {
  const [totalEarnings, pendingPayouts, recentSales] = await Promise.all([
    // Total earnings (all time)
    prisma.creatorEarning.aggregate({
      where: { creatorId, status: 'PAID' },
      _sum: { amount: true }
    }),

    // Pending payouts
    prisma.creatorEarning.findMany({
      where: { creatorId, status: 'PENDING' },
      include: {
        tutorial: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),

    // Recent sales
    prisma.purchase.findMany({
      where: {
        tutorial: { creatorId }
      },
      include: {
        user: { select: { name: true, email: true } },
        tutorial: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  const pendingTotal = pendingPayouts.reduce((sum, e) => sum + e.amount, 0);

  return {
    totalEarnings: totalEarnings._sum.amount || 0,
    pendingPayouts: pendingPayouts,
    pendingTotal,
    recentSales
  };
}
```

### Query 4: User's Purchased Tutorials

```typescript
// Fetch all tutorials user has purchased with progress
async function getUserPurchases(userId: string) {
  const purchases = await prisma.purchase.findMany({
    where: { userId, status: 'COMPLETED' },
    include: {
      tutorial: {
        include: {
          creator: { select: { name: true } },
          lessons: {
            orderBy: { order: 'asc' },
            select: { id: true, title: true, durationMinutes: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch progress for all lessons
  const lessonIds = purchases.flatMap(p => p.tutorial.lessons.map(l => l.id));
  const progress = await prisma.userProgress.findMany({
    where: {
      userId,
      lessonId: { in: lessonIds }
    }
  });

  // Map progress to lessons
  const progressMap = new Map(progress.map(p => [p.lessonId, p]));

  // Attach progress to each lesson
  return purchases.map(purchase => ({
    ...purchase,
    tutorial: {
      ...purchase.tutorial,
      lessons: purchase.tutorial.lessons.map(lesson => ({
        ...lesson,
        progress: progressMap.get(lesson.id)
      }))
    }
  }));
}
```

### Query 5: Admin Dashboard (Pending Reviews)

```typescript
// Fetch tutorials pending admin review
async function getPendingReviews() {
  const pending = await prisma.tutorial.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: {
      creator: {
        select: { name: true, email: true, vetted: true }
      },
      lessons: {
        orderBy: { order: 'asc' },
        select: { title: true, durationMinutes: true }
      },
      videoAssets: {
        select: { size: true, status: true }
      },
      _count: {
        select: { lessons: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  // Fetch creator's tutorial count (for vetting decision)
  const tutorialsWithCreatorStats = await Promise.all(
    pending.map(async (tutorial) => {
      const creatorTutorialCount = await prisma.tutorial.count({
        where: { creatorId: tutorial.creatorId, status: 'PUBLISHED' }
      });

      return {
        ...tutorial,
        creator: {
          ...tutorial.creator,
          publishedTutorialCount: creatorTutorialCount
        }
      };
    })
  );

  return tutorialsWithCreatorStats;
}
```

### Query 6: Freshness Tracking (Expiring Tutorials)

```typescript
// Fetch tutorials expiring in next 30 days
async function getExpiringTutorials() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiring = await prisma.tutorial.findMany({
    where: {
      status: 'PUBLISHED',
      expiresAt: { lte: thirtyDaysFromNow }
    },
    include: {
      creator: {
        select: { name: true, email: true }
      },
      _count: {
        select: { purchases: true }
      }
    },
    orderBy: { expiresAt: 'asc' }
  });

  return expiring;
}
```

---

## 5. Database Migration Strategy

### Prisma Migrations

**Create initial schema:**
```bash
npx prisma migrate dev --name init
```

**Subsequent migrations:**
```bash
npx prisma migrate dev --name add_tutorial_tier
```

**Production migrations:**
```bash
npx prisma migrate deploy
```

### Seed Data

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@devtutorials.com' },
    update: {},
    create: {
      email: 'admin@devtutorials.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create sample categories
  const categories = ['React', 'Node.js', 'Python', 'TypeScript', 'Go'];

  console.log({ admin, categories });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

**Run seed:**
```bash
npx prisma db seed
```

---

## 6. Data Integrity Constraints

### Check Constraints

```sql
-- Price must be positive
ALTER TABLE tutorials ADD CONSTRAINT check_positive_price CHECK (price > 0);

-- Rating must be 1-5
ALTER TABLE reviews ADD CONSTRAINT check_rating_range CHECK (rating >= 1 AND rating <= 5);

-- Platform fee + creator amount = total
ALTER TABLE purchases ADD CONSTRAINT check_revenue_split CHECK (
  platform_fee + creator_amount = amount
);

-- Tutorial tier price validation
ALTER TABLE tutorials ADD CONSTRAINT check_tier_price CHECK (
  (tier = 'QUICK_SKILL' AND price BETWEEN 500 AND 1000) OR -- $5-10
  (tier = 'STANDARD' AND price BETWEEN 1500 AND 2500) OR  -- $15-25
  (tier = 'DEEP_DIVE' AND price BETWEEN 2500 AND 4000)    -- $25-40
);
```

### Cascade Rules

```prisma
// When user is deleted, delete their content
User {
  tutorials    Tutorial[] @relation(onDelete: Cascade)
  purchases    Purchase[] @relation(onDelete: Cascade)
  reviews      Review[]   @relation(onDelete: Cascade)
}

// When tutorial is deleted, delete lessons and earnings
Tutorial {
  lessons         Lesson[]   @relation(onDelete: Cascade)
  creatorEarnings CreatorEarning[] @relation(onDelete: Cascade)
}
```

---

## 7. Backup and Recovery Strategy

### Backup Strategy

**Development:**
- Docker volumes: Automatic backup on host machine
- Prisma migrations: Version-controlled in git

**Production (Neon PostgreSQL):**
- **Automatic backups:** Neon provides 7-day point-in-time recovery (PITR)
- **Daily snapshots:** Automated daily backups at 2 AM UTC
- **Retention:** 30 days

**Export backups manually:**
```bash
# Dump database to SQL file
pg_dump -h neon-db-url -U user -d devtutorials > backup.sql

# Or use Prisma
npx prisma db push --accept-data-loss # Only in emergencies
```

### Recovery Strategy

**Point-in-time recovery:**
```sql
-- Restore to specific point in time
-- (Via Neon dashboard or API)
```

**From backup:**
```bash
# Restore from SQL dump
psql -h localhost -U user -d devtutorials < backup.sql
```

---

## 8. Database Connection Management

### Connection Pooling

**Development:**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations
}
```

**Production (Neon):**
- **Serverless driver:** Neon provides `@neondatabase/serverless` for edge functions
- **Connection pooling:** Managed by Neon (no config needed)

### Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/devtutorials"

# Production (Neon)
DATABASE_URL="postgresql://user:password@ep-example.us-east-2.aws.neon.tech/devtutorials?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-example.us-east-2.aws.neon.tech/devtutorials?sslmode=require&pgbouncer=true"
```

---

## Conclusion

The DevTutorials database schema provides a robust foundation for a two-sided marketplace with video content delivery, payment processing, and creator revenue tracking. The design prioritizes data integrity, query performance, and auditability while maintaining flexibility for future enhancements.

**Key Features:**
1. **Relational integrity:** Foreign keys ensure data consistency
2. **Audit trail:** Timestamps track all changes
3. **Freshness tracking:** Automatic expiration enforcement
4. **Revenue split tracking:** Transparent 70/30 split accounting
5. **Performance optimization:** Strategic indexes for common queries

**Next Steps:**
1. Initialize Prisma schema
2. Run initial migration
3. Seed database with sample data
4. Implement CRUD service layer
5. Set up backup strategy

---

**Document Version:** 1.0
**Last Updated:** January 9, 2026
**Next Review:** Month 3 (schema adjustments based on real usage)

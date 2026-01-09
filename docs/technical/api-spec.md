# DevTutorials API Specification

**Date:** January 9, 2026
**Status:** Architecture Specification
**API Type:** REST
**Base URL:** `https://api.devtutorials.com/api` (development: `http://localhost:3000/api`)

---

## Executive Summary

The DevTutorials API is a RESTful API built with Next.js API Routes, providing endpoints for user authentication, tutorial management, payment processing, and admin operations. All endpoints use JSON for request/response bodies and follow HTTP semantics.

**API Design Principles:**
- **RESTful:** Standard HTTP methods (GET, POST, PUT, DELETE)
- **Stateless:** Each request contains all necessary information
- **Versioned:** `/api/v1/` prefix (for future compatibility)
- **Authenticated:** JWT-based authentication via NextAuth.js
- **Validated:** Request/response validation with Zod schemas

---

## 1. Authentication

### Endpoints

#### POST /api/auth/signin
**Description:** Sign in with OAuth provider or email/password

**Request Body:**
```json
{
  "provider": "google" | "credentials",
  "email": string,
  "password": string // Only for credentials
}
```

**Response (200):**
```json
{
  "user": {
    "id": "clx123abc",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STUDENT"
  },
  "session": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires": "2026-02-09T00:00:00Z"
  }
}
```

**Error Responses:**
- `400` - Invalid credentials
- `401` - Authentication failed
- `500` - Server error

---

#### POST /api/auth/signout
**Description:** Sign out current user

**Authentication:** Required

**Response (200):**
```json
{
  "message": "Signed out successfully"
}
```

---

#### POST /api/auth/signup
**Description:** Register new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "clx123abc",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STUDENT"
  }
}
```

**Validation:**
- Email must be valid format
- Password: min 8 characters, 1 uppercase, 1 lowercase, 1 number
- Name: required, max 100 characters

**Error Responses:**
- `400` - Validation error (email already exists, weak password)
- `500` - Server error

---

## 2. Tutorials

### Public Endpoints

#### GET /api/tutorials
**Description:** List published tutorials with pagination and filtering

**Query Parameters:**
```
page: number = 1          // Page number
limit: number = 20        // Items per page (max 100)
category: string          // Filter by category (React, Node.js, etc.)
tier: "QUICK_SKILL" | "STANDARD" | "DEEP_DIVE"  // Filter by tier
level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" // Filter by difficulty
sort: "newest" | "popular" | "rating" | "price_asc" | "price_desc"
search: string           // Full-text search
```

**Response (200):**
```json
{
  "tutorials": [
    {
      "id": "clx456def",
      "title": "Build a REST API with Node.js",
      "slug": "build-rest-api-nodejs",
      "description": "Learn to build production-ready REST APIs...",
      "price": 1900,
      "tier": "STANDARD",
      "level": "INTERMEDIATE",
      "category": "Node.js",
      "thumbnailUrl": "https://cdn.devtutorials.com/thumbnails/tutorial.jpg",
      "durationHours": 4,
      "lessonCount": 12,
      "creator": {
        "id": "clx789ghi",
        "name": "Jane Smith",
        "avatar": "https://cdn.devtutorials.com/avatars/jane.jpg",
        "vetted": true
      },
      "stats": {
        "viewCount": 1234,
        "purchaseCount": 89,
        "avgRating": 4.7,
        "reviewCount": 23
      },
      "publishedAt": "2026-01-01T00:00:00Z",
      "expiresAt": "2026-07-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

**Caching:** Cache-Control: `public, s-maxage=300, stale-while-revalidate=600`

---

#### GET /api/tutorials/:slug
**Description:** Get tutorial details by slug

**Response (200):**
```json
{
  "id": "clx456def",
  "title": "Build a REST API with Node.js",
  "slug": "build-rest-api-nodejs",
  "description": "Learn to build production-ready REST APIs...",
  "price": 1900,
  "tier": "STANDARD",
  "level": "INTERMEDIATE",
  "category": "Node.js",
  "tags": ["backend", "api", "nodejs"],
  "prerequisites": ["Basic JavaScript", "HTML/CSS"],
  "thumbnailUrl": "https://cdn.devtutorials.com/thumbnails/tutorial.jpg",
  "previewVideoUrl": "https://cdn.devtutorials.com/previews/tutorial.mp4",
  "durationHours": 4,
  "lessonCount": 12,
  "creator": {
    "id": "clx789ghi",
    "name": "Jane Smith",
    "avatar": "https://cdn.devtutorials.com/avatars/jane.jpg",
    "bio": "Senior backend developer at TechCorp...",
    "website": "https://janesmith.dev",
    "vetted": true
  },
  "stats": {
    "viewCount": 1234,
    "purchaseCount": 89,
    "avgRating": 4.7,
    "reviewCount": 23
  },
  "curriculum": [
    {
      "id": "lesson1",
      "title": "Introduction to REST APIs",
      "description": "Learn what REST APIs are and when to use them",
      "durationMinutes": 15,
      "order": 1,
      "isFree": true
    },
    {
      "id": "lesson2",
      "title": "Setting up Node.js",
      "description": "Install and configure Node.js for development",
      "durationMinutes": 20,
      "order": 2,
      "isFree": false
    }
  ],
  "reviews": [
    {
      "id": "rev1",
      "rating": 5,
      "comment": "Excellent tutorial! Very clear explanations.",
      "user": {
        "name": "John Doe",
        "avatar": "https://cdn.devtutorials.com/avatars/john.jpg"
      },
      "createdAt": "2026-01-05T00:00:00Z"
    }
  ],
  "hasPurchased": false, // Included if user authenticated
  "publishedAt": "2026-01-01T00:00:00Z",
  "expiresAt": "2026-07-01T00:00:00Z"
}
```

**Error Responses:**
- `404` - Tutorial not found

**Caching:** Cache-Control: `public, s-maxage=3600, stale-while-revalidate=7200`

---

#### GET /api/tutorials/:slug/lessons
**Description:** Get full lesson list (requires purchase)

**Authentication:** Required (must have purchased tutorial)

**Response (200):**
```json
{
  "lessons": [
    {
      "id": "lesson1",
      "title": "Introduction to REST APIs",
      "description": "Learn what REST APIs are and when to use them",
      "durationMinutes": 15,
      "order": 1,
      "videoUrl": "https://cdn.devtutorials.com/videos/lesson1.m3u8",
      "resources": {
        "links": [
          {
            "title": "REST API Documentation",
            "url": "https://restfulapi.net/"
          }
        ],
        "downloads": [
          {
            "title": "Slide Deck",
            "url": "https://cdn.devtutorials.com/resources/lesson1-slides.pdf"
          }
        ]
      },
      "progress": {
        "completed": true,
        "watchTimeSeconds": 890,
        "lastWatchedAt": "2026-01-08T15:30:00Z"
      }
    }
  ]
}
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Has not purchased tutorial
- `404` - Tutorial not found

---

#### GET /api/tutorials/:slug/lessons/:lessonId/video
**Description:** Get signed video URL for streaming

**Authentication:** Required (must have purchased tutorial)

**Query Parameters:**
```
expires: number = 3600  // URL expiry in seconds (max 86400 = 24 hours)
```

**Response (200):**
```json
{
  "videoUrl": "https://cdn.devtutorials.com/videos/lesson1.m3u8?signature=...",
  "expiresAt": "2026-01-09T01:00:00Z",
  "headers": {
    "Content-Type": "application/x-mpegURL",
    "Cache-Control": "public, max-age=3600"
  }
}
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Has not purchased tutorial
- `404` - Lesson not found

**Rate Limiting:** 10 requests per minute per user per lesson

---

#### GET /api/tutorials/:slug/code
**Description:** Download tutorial code repository

**Authentication:** Required (must have purchased tutorial)

**Response (302):** Redirect to presigned download URL

**Error Responses:**
- `401` - Not authenticated
- `403` - Has not purchased tutorial
- `404` - Code repo not found

---

### Creator Endpoints

#### POST /api/creator/tutorials
**Description:** Create new tutorial (draft)

**Authentication:** Required (role: CREATOR or ADMIN)

**Request Body:**
```json
{
  "title": "Build a REST API with Node.js",
  "description": "Learn to build production-ready REST APIs...",
  "price": 1900,
  "tier": "STANDARD",
  "level": "INTERMEDIATE",
  "category": "Node.js",
  "tags": ["backend", "api", "nodejs"],
  "prerequisites": ["Basic JavaScript", "HTML/CSS"]
}
```

**Validation:**
- Title: required, min 10 characters, max 200 characters
- Description: required, min 50 characters, max 5000 characters
- Price: must match tier pricing (QUICK_SKILL: $5-10, STANDARD: $15-25, DEEP_DIVE: $25-40)
- Category: required, must be from predefined list

**Response (201):**
```json
{
  "id": "clx456def",
  "title": "Build a REST API with Node.js",
  "slug": "build-rest-api-nodejs",
  "status": "DRAFT",
  "createdAt": "2026-01-09T00:00:00Z"
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Not authenticated
- `403` - Not a creator
- `500` - Server error

---

#### PUT /api/creator/tutorials/:id
**Description:** Update tutorial metadata

**Authentication:** Required (must be tutorial creator or admin)

**Request Body:** Same as POST /api/creator/tutorials

**Response (200):** Returns updated tutorial

**Error Responses:**
- `400` - Validation error
- `401` - Not authenticated
- `403` - Not tutorial creator
- `404` - Tutorial not found

---

#### POST /api/creator/tutorials/:id/lessons
**Description:** Add lesson to tutorial

**Authentication:** Required (must be tutorial creator or admin)

**Request Body:**
```json
{
  "title": "Introduction to REST APIs",
  "description": "Learn what REST APIs are...",
  "durationMinutes": 15,
  "order": 1,
  "resources": {
    "links": [
      {
        "title": "REST API Documentation",
        "url": "https://restfulapi.net/"
      }
    ]
  }
}
```

**Response (201):**
```json
{
  "id": "lesson1",
  "title": "Introduction to REST APIs",
  "status": "UPLOADING",
  "uploadUrl": "https://upload.devtutorials.com/lessons/lesson1?signature=...",
  "expiresAt": "2026-01-09T01:00:00Z"
}
```

**Video Upload Flow:**
1. POST /api/creator/tutorials/:id/lessons - Create lesson metadata
2. Receive presigned upload URL
3. PUT {uploadUrl} - Upload video file directly to R2/Bunny.net
4. POST /api/creator/tutorials/:id/lessons/:lessonId/complete - Mark upload complete

---

#### POST /api/creator/tutorials/:id/cover-image
**Description:** Upload tutorial cover image

**Authentication:** Required (must be tutorial creator or admin)

**Request:** multipart/form-data
```
file: image file (max 5MB, formats: jpg, png, webp)
```

**Response (200):**
```json
{
  "thumbnailUrl": "https://cdn.devtutorials.com/thumbnails/tutorial.jpg"
}
```

---

#### POST /api/creator/tutorials/:id/code-repo
**Description:** Upload code repository (ZIP file)

**Authentication:** Required (must be tutorial creator or admin)

**Request:** multipart/form-data
```
file: ZIP file (max 100MB)
```

**Response (201):**
```json
{
  "id": "repo1",
  "size": 5242880,
  "uploadUrl": "https://upload.devtutorials.com/repo.zip?signature=...",
  "expiresAt": "2026-01-09T01:00:00Z"
}
```

---

#### POST /api/creator/tutorials/:id/submit
**Description:** Submit tutorial for review

**Authentication:** Required (must be tutorial creator or admin)

**Preconditions:**
- Tutorial status must be DRAFT
- Must have at least 1 lesson
- Must have cover image
- Must have code repository

**Response (200):**
```json
{
  "id": "clx456def",
  "status": "PENDING_REVIEW",
  "submittedAt": "2026-01-09T00:00:00Z"
}
```

**Email Notification:** Admin receives email with tutorial details

**Error Responses:**
- `400` - Tutorial not ready for submission (missing required fields)
- `403` - Not tutorial creator
- `404` - Tutorial not found

---

#### GET /api/creator/dashboard
**Description:** Get creator dashboard data

**Authentication:** Required (role: CREATOR or ADMIN)

**Response (200):**
```json
{
  "stats": {
    "totalEarnings": 125000, // In cents ($1,250)
    "pendingPayouts": 45000, // $450
    "totalSales": 85,
    "totalTutorials": 5,
    "publishedTutorials": 3
  },
  "pendingPayouts": [
    {
      "id": "earn1",
      "tutorialId": "clx456def",
      "tutorialTitle": "Build a REST API with Node.js",
      "amount": 1300, // $13 (70% of $19)
      "createdAt": "2026-01-05T00:00:00Z"
    }
  ],
  "recentSales": [
    {
      "id": "purchase1",
      "tutorialTitle": "Build a REST API with Node.js",
      "amount": 1900, // $19
      "creatorAmount": 1300, // $13 (70%)
      "purchasedAt": "2026-01-08T15:30:00Z",
      "buyer": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "tutorials": [
    {
      "id": "clx456def",
      "title": "Build a REST API with Node.js",
      "status": "PUBLISHED",
      "stats": {
        "sales": 45,
        "earnings": 58500, // $585
        "avgRating": 4.7,
        "reviewCount": 12
      }
    }
  ]
}
```

---

## 3. Purchases

#### POST /api/purchases
**Description:** Purchase tutorial (create Stripe Checkout session)

**Authentication:** Required

**Request Body:**
```json
{
  "tutorialId": "clx456def"
}
```

**Validation:**
- Tutorial must exist and be published
- User must not have already purchased this tutorial

**Response (200):**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/...",
  "sessionId": "cs_test_123"
}
```

**Flow:**
1. User receives Stripe Checkout URL
2. Redirect to Stripe-hosted checkout page
3. User completes payment
4. Stripe redirects to success_url or cancel_url
5. Webhook handler records purchase in database
6. User redirected to /success page

**Error Responses:**
- `400` - Already purchased, tutorial not found, tutorial not published
- `401` - Not authenticated
- `500` - Server error

---

#### POST /api/purchases/webhook
**Description:** Stripe webhook handler

**Authentication:** Stripe signature verification

**Request Headers:**
```
stripe-signature: signature from Stripe
```

**Request Body:** Stripe webhook event (varies by event type)

**Events Handled:**
- `checkout.session.completed` - Payment successful
- `checkout.session.async_payment_succeeded` - Async payment succeeded
- `checkout.session.async_payment_failed` - Async payment failed

**Response (200):** Empty response

**Webhook Processing:**
1. Verify Stripe signature
2. Parse event type
3. Process event (create purchase, update earnings)
4. Send confirmation email to buyer
5. Return 200 OK

**Security:** Signature verification critical to prevent fraud

**Error Responses:**
- `400` - Invalid signature
- `500` - Server error

---

#### GET /api/purchases
**Description:** Get user's purchase history

**Authentication:** Required

**Query Parameters:**
```
page: number = 1
limit: number = 20
```

**Response (200):**
```json
{
  "purchases": [
    {
      "id": "purchase1",
      "tutorial": {
        "id": "clx456def",
        "title": "Build a REST API with Node.js",
        "slug": "build-rest-api-nodejs",
        "thumbnailUrl": "https://cdn.devtutorials.com/thumbnails/tutorial.jpg"
      },
      "amount": 1900,
      "purchasedAt": "2026-01-05T00:00:00Z",
      "completedAt": null, // When all lessons completed
      "progress": {
        "lessonsCompleted": 8,
        "totalLessons": 12,
        "percentage": 67
      }
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

## 4. Reviews

#### POST /api/tutorials/:slug/reviews
**Description:** Submit review for tutorial

**Authentication:** Required (must have purchased tutorial)

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent tutorial! Very clear explanations."
}
```

**Validation:**
- Rating: required, integer 1-5
- Comment: optional, max 1000 characters

**Response (201):**
```json
{
  "id": "rev1",
  "rating": 5,
  "comment": "Excellent tutorial! Very clear explanations.",
  "user": {
    "name": "John Doe",
    "avatar": "https://cdn.devtutorials.com/avatars/john.jpg"
  },
  "createdAt": "2026-01-09T00:00:00Z"
}
```

**Error Responses:**
- `400` - Validation error, already reviewed
- `401` - Not authenticated
- `403` - Has not purchased tutorial
- `404` - Tutorial not found

---

#### GET /api/tutorials/:slug/reviews
**Description:** Get reviews for tutorial

**Query Parameters:**
```
page: number = 1
limit: number = 10
sort: "recent" | "oldest" | "highest" | "lowest"
```

**Response (200):**
```json
{
  "reviews": [
    {
      "id": "rev1",
      "rating": 5,
      "comment": "Excellent tutorial!",
      "user": {
        "name": "John Doe",
        "avatar": "https://cdn.devtutorials.com/avatars/john.jpg"
      },
      "createdAt": "2026-01-09T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 23,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

**Caching:** Cache-Control: `public, s-maxage=600`

---

## 5. Admin Endpoints

#### GET /api/admin/tutorials/pending
**Description:** Get tutorials pending review

**Authentication:** Required (role: ADMIN)

**Response (200):**
```json
{
  "tutorials": [
    {
      "id": "clx456def",
      "title": "Build a REST API with Node.js",
      "slug": "build-rest-api-nodejs",
      "description": "...",
      "price": 1900,
      "tier": "STANDARD",
      "creator": {
        "id": "clx789ghi",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "vetted": true,
        "publishedTutorialCount": 5
      },
      "stats": {
        "lessonCount": 12,
        "durationHours": 4,
        "totalVideoSize": 2147483648 // 2GB
      },
      "submittedAt": "2026-01-05T00:00:00Z"
    }
  ],
  "count": 3
}
```

---

#### POST /api/admin/tutorials/:id/approve
**Description:** Approve tutorial for publication

**Authentication:** Required (role: ADMIN)

**Request Body:**
```json
{
  "notes": "Great tutorial! Approved for publication."
}
```

**Response (200):**
```json
{
  "id": "clx456def",
  "status": "PUBLISHED",
  "publishedAt": "2026-01-09T00:00:00Z",
  "expiresAt": "2026-07-09T00:00:00Z"
}
```

**Side Effects:**
- Update tutorial status to PUBLISHED
- Send approval email to creator
- Set expiresAt to publishedAt + 6 months

**Error Responses:**
- `404` - Tutorial not found
- `400` - Tutorial not in PENDING_REVIEW status

---

#### POST /api/admin/tutorials/:id/reject
**Description:** Reject tutorial

**Authentication:** Required (role: ADMIN)

**Request Body:**
```json
{
  "reason": "Video quality is poor. Please re-record with better audio.",
  "allowResubmit": true
}
```

**Response (200):**
```json
{
  "id": "clx456def",
  "status": "REJECTED",
  "rejectedAt": "2026-01-09T00:00:00Z"
}
```

**Side Effects:**
- Update tutorial status to REJECTED
- Save rejection reason in adminNotes
- Send rejection email to creator

---

#### POST /api/admin/creators/:id/vet
**Description:** Vet creator (auto-approve future tutorials)

**Authentication:** Required (role: ADMIN)

**Request Body:**
```json
{
  "vetted": true,
  "notes": "Verified 5+ years experience via LinkedIn"
}
```

**Response (200):**
```json
{
  "id": "clx789ghi",
  "name": "Jane Smith",
  "vetted": true,
  "vettedAt": "2026-01-09T00:00:00Z"
}
```

---

#### POST /api/admin/payouts
**Description:** Process monthly payouts to creators

**Authentication:** Required (role: ADMIN)

**Request Body:**
```json
{
  "month": 1,   // January
  "year": 2026
}
```

**Response (200):**
```json
{
  "payouts": [
    {
      "creatorId": "clx789ghi",
      "creatorName": "Jane Smith",
      "stripeAccountId": "acct_123",
      "totalAmount": 45000, // $450
      "tutorialCount": 3,
      "transferId": "tr_123"
    }
  ],
  "totalPaidOut": 150000, // $1,500
  "platformFee": 64286    // $642.86 (30%)
}
```

**Side Effects:**
- Calculate pending earnings for each creator
- Create Stripe transfers to creator accounts
- Update CreatorEarning records to PAID status
- Send payout confirmation emails

**Error Responses:**
- `400` - Payouts already processed for this month
- `500` - Stripe transfer failed

---

## 6. User Progress

#### POST /api/tutorials/:slug/progress
**Description:** Update lesson progress

**Authentication:** Required (must have purchased tutorial)

**Request Body:**
```json
{
  "lessonId": "lesson1",
  "watchTimeSeconds": 890,
  "completed": false
}
```

**Response (200):**
```json
{
  "lessonId": "lesson1",
  "watchTimeSeconds": 890,
  "completed": false,
  "lastWatchedAt": "2026-01-09T00:00:00Z"
}
```

**Rate Limiting:** 1 request per minute per lesson per user

---

#### GET /api/tutorials/:slug/progress
**Description:** Get user's progress for tutorial

**Authentication:** Required (must have purchased tutorial)

**Response (200):**
```json
{
  "tutorialId": "clx456def",
  "overall": {
    "lessonsCompleted": 8,
    "totalLessons": 12,
    "percentage": 67,
    "totalWatchTimeSeconds": 14400
  },
  "lessons": [
    {
      "lessonId": "lesson1",
      "title": "Introduction to REST APIs",
      "completed": true,
      "watchTimeSeconds": 900,
      "lastWatchedAt": "2026-01-08T15:30:00Z"
    }
  ]
}
```

---

## 7. Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details (validation errors, etc.)
  }
}
```

**Common HTTP Status Codes:**

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request (validation error, invalid data) |
| 401  | Unauthorized (not authenticated) |
| 403  | Forbidden (not authorized) |
| 404  | Not Found |
| 429  | Too Many Requests (rate limit exceeded) |
| 500  | Internal Server Error |

---

## 8. Rate Limiting

**Default Rate Limit:** 100 requests per minute per IP address

**Stricter Limits:**
- **Authentication endpoints:** 10 requests per minute per IP
- **Video streaming endpoints:** 10 requests per minute per user
- **Progress tracking:** 1 request per minute per user per lesson

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641763200
```

**Rate Limit Exceeded Response (429):**
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## 9. API Versioning

**Current Version:** v1

**Version URL Pattern:** `/api/v1/{resource}`

**Future versions:** `/api/v2/{resource}` (backward compatible)

**Deprecation Policy:**
- Minimum 6 months notice before deprecation
- Deprecated endpoints return `X-Deprecated: true` header
- Sunset date included in response headers

---

## 10. Authentication/Authorization

**Authentication Method:** NextAuth.js JWT tokens

**Authorization Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Token Payload:**
```json
{
  "user": {
    "id": "clx123abc",
    "email": "user@example.com",
    "role": "STUDENT"
  },
  "exp": 1641763200
}
```

**Role-Based Access Control (RBAC):**

| Role | Access Level |
|------|--------------|
| STUDENT | Browse tutorials, purchase, view purchased content |
| CREATOR | All STUDENT permissions + create/edit own tutorials |
| ADMIN | All permissions + approve/reject tutorials, vet creators, process payouts |

---

## Conclusion

The DevTutorials API provides a comprehensive RESTful interface for a two-sided tutorial marketplace. All endpoints are authenticated (where appropriate), validated, and rate-limited to ensure security and performance.

**Key Features:**
1. **RESTful design:** Standard HTTP methods and status codes
2. **JWT authentication:** Stateless, scalable auth via NextAuth.js
3. **Input validation:** Zod schemas for all requests
4. **Error handling:** Consistent error response format
5. **Rate limiting:** Prevent abuse and ensure fair usage
6. **Webhook support:** Stripe webhooks for payment processing

**Next Steps:**
1. Implement NextAuth.js configuration
2. Create API route handlers for each endpoint
3. Add Zod validation schemas
4. Implement error handling middleware
5. Set up rate limiting
6. Test with Postman/Insomnia
7. Deploy and monitor with Sentry

---

**Document Version:** 1.0
**Last Updated:** January 9, 2026
**Next Review:** Month 3 (API adjustments based on real usage)

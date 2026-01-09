# Test Plan - DevTutorials Marketplace

**Date:** January 9, 2026
**Bead:** business_9-14
**Status:** In Progress

---

## Overview

This document outlines the comprehensive testing strategy for the DevTutorials marketplace functionality, including payment processing, purchase flow, and user experience.

## Testing Scope

### 1. Payment Calculation Tests
- **Status:** ✅ Already implemented (tests/purchaseService.test.ts)
- **Coverage:**
  - Creator share calculation (70%)
  - Platform fee calculation (30%)
  - Revenue split validation
  - Edge cases (odd amounts, rounding)

### 2. Purchase Service Unit Tests
**File:** `lib/services/purchaseService.ts`

**Test Cases:**
- ✅ createPurchaseIntent() - Success path
- ❌ createPurchaseIntent() - Tutorial not found
- ❌ createPurchaseIntent() - Tutorial not published
- ❌ createPurchaseIntent() - Duplicate purchase
- ❌ createPurchaseIntent() - Creator account not configured
- ✅ processSuccessfulPayment() - Atomic transaction
- ✅ userOwnsTutorial() - Access verification
- ✅ getUserPurchases() - Purchase history
- ✅ getCreatorEarnings() - Earnings summary

### 3. API Endpoint Tests
**Files:**
- `app/api/purchases/route.ts` (POST, GET)
- `app/api/stripe/webhook/route.ts` (POST)

**POST /api/purchases Tests:**
- ✅ Valid purchase request → 201 + checkout URL
- ❌ Unauthenticated user → 401
- ❌ Invalid tutorial ID → 404
- ❌ Tutorial not published → 400
- ❌ Already purchased → 400
- ❌ Creator account missing → 500
- ✅ Request schema validation

**GET /api/purchases Tests:**
- ✅ Valid request → 200 + purchase list
- ❌ Unauthenticated → 401
- ✅ Empty purchase history → 200 + empty array

**POST /api/stripe/webhook Tests:**
- ✅ Valid checkout.session.completed → 200 + records created
- ✅ Idempotent webhook (duplicate) → 200 + no duplicates
- ❌ Invalid webhook signature → 401
- ❌ Missing webhook secret → 500
- ✅ Webhook for non-existent session → graceful handling

### 4. Component Tests
**Files:**
- `components/PurchaseButton.tsx`
- `app/success/page.tsx`
- `app/my-tutorials/page.tsx`

**PurchaseButton Tests:**
- ✅ Renders button correctly
- ✅ Shows loading state during API call
- ✅ Handles errors gracefully
- ✅ Redirects to Stripe on success
- ✅ Disabled when already purchased

**Success Page Tests:**
- ✅ Verifies session from URL param
- ✅ Displays purchase confirmation
- ✅ Shows tutorial details
- ✅ Handles invalid/expired sessions
- ✅ Links to tutorial content

**My Tutorials Page Tests:**
- ✅ Lists purchased tutorials
- ✅ Shows empty state
- ✅ Links to tutorial content
- ✅ Filters by purchase date

### 5. Integration Tests
**End-to-End Purchase Flow:**

**Scenario 1: Successful Purchase**
1. User navigates to tutorial page
2. Clicks "Purchase" button
3. API creates checkout session
4. User redirected to Stripe
5. Completes payment with test card
6. Webhook receives confirmation
7. Database records created
8. User redirected to /success
9. Tutorial appears in /my-tutorials

**Scenario 2: Duplicate Purchase Attempt**
1. User purchases tutorial
2. Attempts to purchase again
3. System rejects with error message
4. User directed to /my-tutorials

**Scenario 3: Purchase Unpublished Tutorial**
1. Creator unpublishes tutorial
2. User attempts purchase
3. System rejects with "not available" error

### 6. Security Tests
- Webhook signature verification
- Authentication required for all endpoints
- SQL injection prevention (Prisma ORM)
- Authorization checks (user owns tutorial)
- CSRF protection (Next.js built-in)

### 7. Performance Tests
- API response times < 500ms
- Database query optimization
- Concurrent purchase handling
- Webhook processing throughput

### 8. Edge Cases & Error Handling
- Network timeout during checkout creation
- Stripe API downtime
- Database connection failure
- Concurrent webhook events
- Race conditions (duplicate purchases)

---

## Test Environment Setup

### Prerequisites
```bash
# Install dependencies
npm install

# Setup test database
cp .env.example .env.test
# Configure test database URL

# Run migrations
npx prisma migrate deploy

# Seed test data
npm run test:seed
```

### Environment Variables Required
```bash
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/devtutorials_test"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=test-secret
NEXTAUTH_URL=http://localhost:3000
```

---

## Testing Tools

- **Unit Tests:** Vitest
- **Integration Tests:** Vitest + Supertest
- **E2E Tests:** Playwright
- **API Testing:** Supertest
- **Coverage:** Vitest Coverage
- **Mocking:** Vitest VI + Stripe Test Mode

---

## Success Criteria

### Must Pass (Blocking)
- ✅ All unit tests pass (payment calculations)
- ✅ Purchase service logic tests pass
- ✅ API endpoint tests pass
- ✅ Webhook handler tests pass
- ✅ Security tests pass
- ✅ Test coverage > 80%

### Should Pass (Non-Blocking)
- Integration tests pass
- E2E purchase flow succeeds
- Performance benchmarks met

---

## Test Execution Plan

### Phase 1: Unit Tests (1-2 hours)
1. Expand payment calculation tests (if needed)
2. Write purchase service tests
3. Write API endpoint tests
4. Write webhook handler tests
5. Run and verify all pass

### Phase 2: Integration Tests (2-3 hours)
1. Setup test database with fixtures
2. Write end-to-end purchase flow test
3. Write duplicate purchase prevention test
4. Write error scenario tests
5. Run and verify all pass

### Phase 3: E2E Tests (2-3 hours)
1. Write Playwright tests for UI components
2. Write full purchase journey test
3. Test error UI states
4. Test loading states
5. Run and verify all pass

### Phase 4: Security & Performance (1 hour)
1. Run security test suite
2. Benchmark API endpoints
3. Test webhook signature verification
4. Document findings

---

## Current Status

### Completed
- ✅ Payment calculation tests (tests/purchaseService.test.ts)

### In Progress
- 🔄 Test plan creation
- 🔄 Unit test expansion

### Next Steps
1. Write purchase service unit tests
2. Write API endpoint tests
3. Write webhook handler tests
4. Create integration test suite
5. Run full test suite
6. Generate validation report

---

## Issues Found (During Testing)

*To be populated during testing*

---

## Recommendations

*To be populated after testing*


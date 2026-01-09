# Manual Testing Checklist - Stripe Purchase Flow

**Date:** January 9, 2026
**Bead:** business_9-24
**Purpose:** Complete manual verification of Stripe purchase flow

---

## Setup Checklist

### Prerequisites

- [ ] Dev server running: `npm run dev` on http://localhost:3000
- [ ] Database running with test data
- [ ] Stripe CLI installed and logged in: `stripe login`
- [ ] Webhook forwarding active: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] Webhook secret copied to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] Test user account created and logged in
- [ ] Test tutorial created with `stripeAccountId` set

### Test Data Required

**Test Tutorial:**
- ID: `test-tutorial-id`
- Title: "Test Tutorial for E2E"
- Price: $19.00 (1900 cents)
- Status: `PUBLISHED`
- Creator has valid `stripeAccountId`

**Test User:**
- Email: `test@example.com`
- Logged into dev account
- Has not purchased test tutorial yet

---

## Test Scenarios

### 1. Successful Purchase Flow

**Steps:**

1. [ ] Navigate to http://localhost:3000/tutorials/test-tutorial-id
2. [ ] Verify tutorial details display correctly
3. [ ] Verify "Purchase" button is visible and enabled
4. [ ] Click "Purchase" button
5. [ ] Verify button shows loading state
6. [ ] Verify redirect to Stripe Checkout URL

**Stripe Checkout Verification:**

7. [ ] Verify Stripe checkout page loads
8. [ ] Verify correct amount displayed ($19.00)
9. [ ] Verify tutorial name/description visible
10. [ ] Enter email: `test@example.com`
11. [ ] Enter card number: `4242 4242 4242 4242`
12. [ ] Enter expiry: `12/34`
13. [ ] Enter CVC: `123`
14. [ ] Enter name: `Test User`
15. [ ] Enter country: `United States`
16. [ ] Enter ZIP: `12345`
17. [ ] Click "Pay" button
18. [ ] Wait for payment processing
19. [ ] Verify redirect to: `/success?session_id=cs_test_...`

**Success Page Verification:**

20. [ ] Verify success message displays
21. [ ] Verify tutorial details shown
22. [ ] Verify purchase amount displayed
23. [ ] Click "Watch Tutorial" button
24. [ ] Verify tutorial content is accessible
25. [ ] Navigate to `/my-tutorials`
26. [ ] Verify purchased tutorial appears in list

**Database Verification:**

27. [ ] Check Purchase record created:
   ```sql
   SELECT * FROM "Purchase" WHERE "stripeSessionId" = 'cs_test_...';
   ```
28. [ ] Verify purchase amount: 1900 cents
29. [ ] Verify userId matches test user
30. [ ] Verify tutorialId matches test tutorial
31. [ ] Check CreatorEarning record created:
   ```sql
   SELECT * FROM "CreatorEarning" WHERE "purchaseId" = '...';
   ```
32. [ ] Verify creator amount: 1330 cents (70% of $19.00)
33. [ ] Verify paidOut: false

**Webhook Verification:**

34. [ ] Check Stripe CLI output shows webhook received
35. [ ] Verify webhook type: `checkout.session.completed`
36. [ ] Verify webhook processed successfully (no errors in server logs)

**Result:** ✅ PASS / ❌ FAIL

---

### 2. Duplicate Purchase Prevention

**Steps:**

1. [ ] Ensure user already owns test tutorial (from Test 1)
2. [ ] Navigate to tutorial page
3. [ ] Verify "Purchase" button is NOT visible
4. [ ] Verify "You already own this tutorial" message displays
5. [ ] Click "My Tutorials" or similar link
6. [ ] Verify tutorial appears in purchased list

**API Verification:**

7. [ ] Attempt POST /api/purchases with same tutorialId
   ```bash
   curl -X POST http://localhost:3000/api/purchases \
     -H "Content-Type: application/json" \
     -d '{"tutorialId":"test-tutorial-id"}'
   ```
8. [ ] Verify response: 400 Bad Request
9. [ ] Verify error message: "You already own this tutorial"

**Result:** ✅ PASS / ❌ FAIL

---

### 3. Purchase Unpublished Tutorial

**Steps:**

1. [ ] Create unpublished tutorial in database:
   ```sql
   INSERT INTO "Tutorial" (
     id, title, description, price, tier, status,
     "creatorId", "videoUrl", duration
   ) VALUES (
     'unpublished-tutorial-id',
     'Unpublished Tutorial',
     'Should not be purchasable',
     1900,
     'INTERMEDIATE',
     'DRAFT',  -- Not PUBLISHED
     'test-user-id',
     'https://example.com/video.mp4',
     3600
   );
   ```
2. [ ] Attempt to access: /tutorials/unpublished-tutorial-id
3. [ ] Verify 404 or "Not Found" message

**API Verification:**

4. [ ] Attempt purchase via API:
   ```bash
   curl -X POST http://localhost:3000/api/purchases \
     -H "Content-Type: application/json" \
     -d '{"tutorialId":"unpublished-tutorial-id"}'
   ```
5. [ ] Verify response: 404 Not Found or 400 Bad Request
6. [ ] Verify error message: "Tutorial not found" or "Tutorial not available"

**Result:** ✅ PASS / ❌ FAIL

---

### 4. Purchase Without Authentication

**Steps:**

1. [ ] Sign out: http://localhost:3000/api/auth/signout
2. [ ] Clear cookies/localStorage
3. [ ] Attempt to access purchase API:
   ```bash
   curl -X POST http://localhost:3000/api/purchases \
     -H "Content-Type: application/json" \
     -d '{"tutorialId":"test-tutorial-id"}'
   ```
4. [ ] Verify response: 401 Unauthorized
5. [ ] Verify error message: "Authentication required"

**UI Verification:**

6. [ ] Navigate to tutorial page while signed out
7. [ ] Verify "Purchase" button redirects to login
8. [ ] Or verify button is disabled/not visible

**Result:** ✅ PASS / ❌ FAIL

---

### 5. Failed Payment (Declined Card)

**Steps:**

1. [ ] Ensure test user is logged in
2. [ ] Navigate to tutorial page
3. [ ] Click "Purchase" button
4. [ ] At Stripe checkout, use declined card: `4000 0000 0000 0002`
5. [ ] Fill out rest of form with valid data
6. [ ] Click "Pay" button
7. [ ] Verify payment fails on Stripe page
8. [ ] Verify error message displayed
9. [ ] Verify NOT redirected to success page

**Database Verification:**

10. [ ] Check no Purchase record created:
    ```sql
    SELECT * FROM "Purchase" WHERE "userId" = 'test-user-id' AND "tutorialId" = 'test-tutorial-id';
    ```
11. [ ] Verify no CreatorEarning record created

**Result:** ✅ PASS / ❌ FAIL

---

### 6. Insufficient Funds

**Steps:**

1. [ ] Navigate to tutorial page
2. [ ] Click "Purchase" button
3. [ ] At Stripe checkout, use card: `4000 0000 0000 9995` (insufficient funds)
4. [ ] Fill out rest of form
5. [ ] Click "Pay" button
6. [ ] Verify payment fails
7. [ ] Verify appropriate error message

**Result:** ✅ PASS / ❌ FAIL

---

### 7. Invalid Session ID on Success Page

**Steps:**

1. [ ] Navigate to: `/success?session_id=invalid_session_id`
2. [ ] Verify error message displayed
3. [ ] Verify "Invalid or expired session" message
4. [ ] Verify tutorial details NOT shown
5. [ ] Verify "Watch Tutorial" button NOT shown

**Result:** ✅ PASS / ❌ FAIL

---

### 8. Webhook Signature Verification

**Steps:**

1. [ ] Stop `stripe listen` if running
2. [ ] Send fake webhook to endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/stripe/webhook \
     -H "Content-Type: application/json" \
     -d '{"type":"checkout.session.completed","data":{"object":{"id":"fake"}}}'
   ```
3. [ ] Verify response: 401 Unauthorized or 400 Bad Request
4. [ ] Verify error: "Invalid webhook signature"
5. [ ] Check server logs for signature verification error

**Result:** ✅ PASS / ❌ FAIL

---

### 9. Concurrent Purchase Attempts

**Steps:**

1. [ ] Reset database (delete existing purchases)
2. [ ] Open two browser windows to same tutorial
3. [ ] Click "Purchase" in both windows simultaneously
4. [ ] Complete both Stripe checkouts
5. [ ] Verify only ONE purchase record created
6. [ ] Verify second request fails with "already purchased"

**Result:** ✅ PASS / ❌ FAIL

---

### 10. My Tutorials Page - Empty State

**Steps:**

1. [ ] Create fresh user with no purchases
2. [ ] Log in as new user
3. [ ] Navigate to: `/my-tutorials`
4. [ ] Verify "No tutorials purchased yet" message
5. [ ] Verify browse tutorials link/button visible

**Result:** ✅ PASS / ❌ FAIL

---

### 11. My Tutorials Page - With Purchases

**Steps:**

1. [ ] Ensure user has 2-3 purchased tutorials
2. [ ] Navigate to: `/my-tutorials`
3. [ ] Verify all purchased tutorials listed
4. [ ] Verify tutorial details correct (title, price, purchase date)
5. [ ] Click on tutorial card
6. [ ] Verify redirects to tutorial content
7. [ ] Verify content is accessible

**Result:** ✅ PASS / ❌ FAIL

---

### 12. Revenue Split Calculation

**Steps:**

1. [ ] Complete a purchase for $19.00 tutorial
2. [ ] Query database records:
   ```sql
   SELECT amount FROM "Purchase" WHERE "stripeSessionId" = 'cs_test_...';
   SELECT amount FROM "CreatorEarning" WHERE "purchaseId" = '...';
   ```
3. [ ] Verify Purchase amount: 1900 cents
4. [ ] Verify CreatorEarning amount: 1330 cents (70%)
5. [ ] Calculate platform fee: 1900 - 1330 = 570 cents (30%)

**Repeat for other price tiers:**

6. [ ] $9.00 tutorial:
   - Creator: 630 cents (70%)
   - Platform: 270 cents (30%)
7. [ ] $29.00 tutorial:
   - Creator: 2030 cents (70%)
   - Platform: 870 cents (30%)

**Result:** ✅ PASS / ❌ FAIL

---

### 13. Purchase Button States

**Loading State:**

1. [ ] Click "Purchase" button
2. [ ] Verify button shows loading spinner/text
3. [ ] Verify button is disabled during loading
4. [ ] Verify button re-enables after redirect

**Disabled State (Already Purchased):**

5. [ ] Navigate to already-purchased tutorial
6. [ ] Verify button not visible OR shows "Purchased"
7. [ ] Verify "You already own this" message

**Result:** ✅ PASS / ❌ FAIL

---

### 14. Stripe Checkout - Form Validation

**Steps:**

1. [ ] Click "Purchase" button
2. [ ] At Stripe checkout, leave fields empty
3. [ ] Click "Pay" button
4. [ ] Verify validation errors for required fields
5. [ ] Fill invalid card number: `1234`
6. [ ] Verify "Invalid card number" error
7. [ ] Fill invalid expiry: `12/20` (past date)
8. [ ] Verify "Invalid expiry" error

**Result:** ✅ PASS / ❌ FAIL

---

### 15. Session Expiry Handling

**Steps:**

1. [ ] Complete purchase, note session_id
2. [ ] Manually mark Purchase as deleted in DB:
   ```sql
   DELETE FROM "Purchase" WHERE "stripeSessionId" = 'cs_test_...';
   ```
3. [ ] Navigate to: `/success?session_id=cs_test_...`
4. [ ] Verify error message: "Purchase not found"
5. [ ] Verify appropriate error handling

**Result:** ✅ PASS / ❌ FAIL

---

## Test Results Summary

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Successful Purchase Flow | ⬜ Pass / ❌ Fail | |
| 2 | Duplicate Purchase Prevention | ⬜ Pass / ❌ Fail | |
| 3 | Purchase Unpublished Tutorial | ⬜ Pass / ❌ Fail | |
| 4 | Purchase Without Authentication | ⬜ Pass / ❌ Fail | |
| 5 | Failed Payment (Declined) | ⬜ Pass / ❌ Fail | |
| 6 | Insufficient Funds | ⬜ Pass / ❌ Fail | |
| 7 | Invalid Session ID | ⬜ Pass / ❌ Fail | |
| 8 | Webhook Signature Verification | ⬜ Pass / ❌ Fail | |
| 9 | Concurrent Purchase Attempts | ⬜ Pass / ❌ Fail | |
| 10 | My Tutorials - Empty State | ⬜ Pass / ❌ Fail | |
| 11 | My Tutorials - With Purchases | ⬜ Pass / ❌ Fail | |
| 12 | Revenue Split Calculation | ⬜ Pass / ❌ Fail | |
| 13 | Purchase Button States | ⬜ Pass / ❌ Fail | |
| 14 | Stripe Form Validation | ⬜ Pass / ❌ Fail | |
| 15 | Session Expiry Handling | ⬜ Pass / ❌ Fail | |

**Overall Result:** ⬜ ALL PASS / ❌ SOME FAILURES

---

## Issues Found

### Critical Issues (Blocking Launch)
- *None found*

### High Priority (Must Fix Before Launch)
- *None found*

### Medium Priority (Should Fix Soon)
- *None found*

### Low Priority (Nice to Have)
- *None found*

---

## Tester Notes

**Date Tested:** _______________

**Tester Name:** _______________

**Environment:**
- Dev Server URL: _______________
- Database: _______________
- Stripe Account: Test Mode ✅ / Live Mode ❌
- Stripe CLI Version: _______________

**General Observations:**

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

**Recommendations:**

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

---

## Sign-Off

**Test Execution:** ⬜ Complete / ❌ Incomplete

**Passed:** _____ / 15 tests

**Failed:** _____ / 15 tests

**Ready for Launch:** ⬜ Yes / ❌ No

**Tester Signature:** _______________

**Date:** _______________

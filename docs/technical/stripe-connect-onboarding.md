# Stripe Connect Onboarding Implementation

## Overview

This document describes the Stripe Connect onboarding flow for creators on DevTutorials. Creators must connect their Stripe accounts to receive payments for tutorial sales.

## Architecture

### Flow Diagram

```
Creator clicks "Connect Stripe"
    ↓
POST /api/stripe/connect/onboarding
    ↓
Create Stripe Express Account (if new)
    ↓
Generate Onboarding Link
    ↓
Redirect to Stripe-hosted onboarding
    ↓
Creator completes verification
    ↓
Stripe redirects to /creator/stripe/success
    ↓
Verify account details_submitted
    ↓
Update database (if needed)
    ↓
Redirect to creator dashboard
```

### Webhook Flow

```
Stripe event → POST /api/stripe/connect/webhook
    ↓
Verify signature
    ↓
Handle event type:
    - account.updated: Onboarding complete
    - account.application.authorized: Account authorized
    - account.application.deauthorized: Account disconnected
    ↓
Update database records
    ↓
Return 200 OK
```

## Database Schema

### User Model Updates

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  // ... other fields
  stripeAccountId   String?   @unique // NEW: Stripe Connect account ID
  // ... relations

  @@index([stripeAccountId])
}
```

**Migration Required:**
```bash
npx prisma migrate dev --name add_stripe_account_id_to_user
```

## API Endpoints

### 1. Initiate Onboarding

**Endpoint:** `POST /api/stripe/connect/onboarding`

**Authentication:** Required (user must be CREATOR or ADMIN)

**Request Body:**
```json
{}
```

**Success Response (200):**
```json
{
  "url": "https://connect.stripe.com/setup/s/...",
  "accountId": "acct_1234567890",
  "isNew": true
}
```

**Error Responses:**
- `401` - Authentication required
- `403` - User is not a creator
- `404` - User not found
- `400` - Account already connected (with account status)
- `500` - Server error

**Logic:**
1. Verify user authentication and role
2. Check if user already has `stripeAccountId`
   - If yes: Retrieve account, create new onboarding link
   - If no: Create new Stripe Express account
3. Store `stripeAccountId` on User model
4. Generate onboarding link with refresh/return URLs
5. Return onboarding URL

### 2. Check Account Status

**Endpoint:** `GET /api/stripe/connect/onboarding`

**Authentication:** Required

**Success Response (200):**
```json
{
  "connected": true,
  "accountId": "acct_1234567890",
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "detailsSubmitted": true
}
```

**Not Connected (200):**
```json
{
  "connected": false,
  "chargesEnabled": false,
  "payoutsEnabled": false,
  "detailsSubmitted": false
}
```

**Logic:**
1. Verify user authentication
2. Check if `stripeAccountId` exists on User model
3. Retrieve account status from Stripe API
4. Return account capabilities

### 3. Stripe Connect Webhook

**Endpoint:** `POST /api/stripe/connect/webhook`

**Authentication:** Stripe webhook signature verification

**Headers:**
```
stripe-signature: <signature>
```

**Events Handled:**
- `account.updated` - Creator completed onboarding
- `account.application.authorized` - User authorized account
- `account.application.deauthorized` - User disconnected account

**Success Response (200):**
```json
{
  "received": true
}
```

**Error Responses:**
- `400` - Invalid signature
- `500` - Server error

**Logic:**
1. Extract `stripe-signature` header
2. Verify signature with `STRIPE_CONNECT_WEBHOOK_SECRET`
3. Parse event type
4. Execute event-specific handler:
   - `account.updated`: Log account status, optionally notify creator
   - `account.application.authorized`: Log authorization
   - `account.application.deauthorized`: Log disconnection, optionally nullify `stripeAccountId`
5. Return success

## Client Components

### StripeConnectButton

**File:** `components/creator/StripeConnectButton.tsx`

**Features:**
- One-click onboarding initiation
- Loading states with spinner
- Error handling and display
- Account already connected detection
- Stripe branding (logo + color scheme)

**Usage:**
```tsx
import { StripeConnectButton } from '@/components/creator/StripeConnectButton';

export default function CreatorDashboard() {
  return (
    <div>
      <h1>Creator Dashboard</h1>
      <StripeConnectButton />
    </div>
  );
}
```

**Props:** None

**State:**
- `loading: boolean` - During API call
- `error: string | null` - Error message display

**Behavior:**
1. On click: POST to `/api/stripe/connect/onboarding`
2. On success: `window.location.href = data.url` (redirect to Stripe)
3. On error: Display error message below button

## Pages

### Success Page

**Route:** `/creator/stripe/success`

**Query Parameters:**
- `account` - Stripe account ID

**Behavior:**
1. Verify user authentication
2. Retrieve `account` from query params
3. Fetch account status from Stripe API
4. If `details_submitted = true`:
   - Redirect to `/creator/dashboard?stripe=success&charges_enabled=true&payouts_enabled=true`
5. If `details_submitted = false`:
   - Redirect to `/creator/dashboard?stripe=incomplete`
6. On error: Redirect to `/creator/dashboard?stripe=error`

### Refresh Page

**Route:** `/creator/stripe/refresh`

**Query Parameters:**
- `account` - Stripe account ID (optional)

**Behavior:**
1. Redirect to `/creator/dashboard?stripe=expired`
2. Creator must click "Connect Stripe" button again to get new link

## Stripe Configuration

### Environment Variables

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...                 # Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_...             # Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_...                # Webhook secret for payment events

# Stripe Connect
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...        # Webhook secret for Connect events
STRIPE_PLATFORM_CLIENT_ID=ca_...               # Platform client ID (optional)
```

### Stripe Dashboard Setup

#### 1. Create Stripe Connect Platform

1. Go to Stripe Dashboard → Developers → Connect
2. Click "Get started" or "Create platform"
3. Select platform type: **Express**
4. Configure platform settings:
   - Platform name: "DevTutorials"
   - Platform business: "Online Learning Platform"
   - Support email: your@email.com
   - Redirect URLs:
     - Production: `https://devtutorials.com/creator/stripe/success`
     - Development: `http://localhost:3000/creator/stripe/success`

#### 2. Configure Webhooks

1. Go to Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://devtutorials.com/api/stripe/connect/webhook`
   - Development: `http://localhost:3000/api/stripe/connect/webhook` (use Stripe CLI)
3. Select events to listen for:
   - `account.updated`
   - `account.application.authorized`
   - `account.application.deauthorized`
4. Copy webhook signing secret to `STRIPE_CONNECT_WEBHOOK_SECRET`

#### 3. Test Webhook Locally

```bash
# Forward local webhook to Stripe
stripe listen --forward-to localhost:3000/api/stripe/connect/webhook

# This will display a webhook secret for testing
# Use this as STRIPE_CONNECT_WEBHOOK_SECRET in .env.local
```

## Creator Revenue Flow

### Onboarding Complete

Once creator completes Stripe Connect onboarding:

```
Creator Account Status:
- details_submitted: true
- charges_enabled: true
- payouts_enabled: true
```

### Payment Splitting

When a customer purchases a tutorial:

```
Purchase Price: $19.00
    ↓
Stripe Checkout processes payment
    ↓
Payment split automatically:
    - Creator (70%): $13.30 → creator's Stripe account
    - Platform (30%): $5.70 → platform's Stripe account
    ↓
Creator earnings recorded in database
    ↓
Creator can withdraw via Stripe Dashboard
```

### Payouts

- **Automatic:** Stripe automatically creates payouts for available balances
- **Schedule:** Daily (default) or configurable in Stripe Dashboard
- **Delay:** 2-7 days (depending on account settings)
- **Minimum:** No minimum (Stripe defaults apply)

Creator payouts are handled entirely by Stripe. DevTutorials platform:
- Records earnings in `CreatorEarning` table
- Sets `paidOut: false` initially
- Updates to `paidOut: true` when webhook confirms payout (optional)

## Testing

### Local Development

1. **Create test Stripe account:**
   ```bash
   curl https://api.stripe.com/v1/test_helpers/test_clocks \
     -u sk_test_...: \
     -d "virtual_account[country]=US"
   ```

2. **Test onboarding flow:**
   - Start dev server: `npm run dev`
   - Start Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/connect/webhook`
   - Navigate to creator dashboard
   - Click "Connect Stripe Account"
   - Complete test onboarding flow

3. **Test webhook events:**
   ```bash
   # Trigger account.updated event
   stripe trigger account.updated
   ```

### Test Cards

Use Stripe test cards for onboarding:
- **SSN:** `0000` (US test SSN)
- **Bank Account:** Use Stripe test routing/account numbers
- See: https://stripe.com/docs/connect/testing

### Edge Cases to Test

1. ✅ Creator already has connected account
2. ✅ Onboarding link expired (redirect to refresh)
3. ✅ Creator abandons onboarding (returns to dashboard later)
4. ✅ Creator disconnects account (webhook handling)
5. ✅ Account rejected (Stripe verification fails)
6. ✅ Multiple creators onboarding simultaneously

## Security Considerations

### Webhook Signature Verification

CRITICAL: Always verify webhook signatures to prevent fraudulent events:

```typescript
const event = constructWebhookEvent(
  payload,
  signature,
  process.env.STRIPE_CONNECT_WEBHOOK_SECRET
);
```

### Authentication

All endpoints require authentication:
- Onboarding initiation: User must be CREATOR or ADMIN
- Status check: Any authenticated user
- Webhook: Signature verification only (no user session)

### Account Linking Security

- Each user can only link ONE Stripe account (`stripeAccountId` is unique)
- Account ownership verified by checking user ID
- Cannot transfer Stripe accounts between users

### Data Validation

- Validate `stripeAccountId` format (starts with `acct_`)
- Check account capabilities before enabling features
- Handle Stripe API errors gracefully

## Troubleshooting

### Issue: "No Stripe signature" on webhook

**Cause:** Missing `stripe-signature` header

**Solution:**
1. Check Stripe webhook endpoint configuration
2. Ensure webhook is active in Stripe Dashboard
3. Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/connect/webhook`

### Issue: Account onboarding not completing

**Cause:** Creator verification failed or incomplete

**Solution:**
1. Check Stripe Dashboard for account status
2. Verify all required information submitted
3. Check for verification errors (identity, business, etc.)
4. Use Stripe test accounts to avoid real verification

### Issue: "Account already connected" error

**Cause:** Creator already has `stripeAccountId` on User model

**Solution:**
1. Check account status: GET /api/stripe/connect/onboarding
2. If `payoutsEnabled = false`, create new onboarding link
3. If `payoutsEnabled = true`, account is ready

### Issue: Webhook not receiving events

**Cause:** Webhook endpoint misconfigured

**Solution:**
1. Verify webhook URL in Stripe Dashboard
2. Check webhook secret matches environment variable
3. Ensure server is publicly accessible (ngrok for local)
4. Check Stripe webhook delivery logs

## Next Steps

### Required for Production

1. ✅ Add `stripeAccountId` to User schema (DONE)
2. ⏳ Run database migration: `npx prisma migrate deploy`
3. ⏳ Set up production Stripe Connect platform
4. ⏳ Configure production webhook endpoint
5. ⏳ Add `STRIPE_CONNECT_WEBHOOK_SECRET` to production environment
6. ⏳ Update redirect URLs in Stripe Dashboard

### Optional Enhancements

1. **Account Dashboard:** Show creator's Stripe account status, balance, recent payouts
2. **Payout History:** Fetch and display payout history from Stripe API
3. **Tax Information:** Collect W-9/W-8BEN forms before onboarding
4. **Multi-Country:** Support creators outside US (currently US-only)
5. **Stripe OAuth:** Full OAuth flow with account selection
6. **Verification Status:** Show detailed verification status (under review, needs info, etc.)

## Files Created

```
app/api/stripe/connect/onboarding/route.ts    - Onboarding initiation & status check
app/api/stripe/connect/webhook/route.ts       - Webhook event handler
app/creator/stripe/success/page.tsx            - Onboarding success page
app/creator/stripe/refresh/page.tsx            - Onboarding refresh page
components/creator/StripeConnectButton.tsx     - Onboarding button component
prisma/schema.prisma                           - Added stripeAccountId field
docs/technical/stripe-connect-onboarding.md    - This documentation
```

## References

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Express Accounts](https://stripe.com/docs/connect/express-accounts)
- [Account Links](https://stripe.com/docs/api/account_links)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Testing Connect](https://stripe.com/docs/connect/testing)

## Summary

✅ Stripe Connect onboarding flow fully implemented
✅ API endpoints for onboarding initiation and status checking
✅ Webhook handler for account updates
✅ UI component for one-click onboarding
✅ Database schema updated with `stripeAccountId`
✅ Comprehensive documentation
✅ Local testing instructions
✅ Security best practices

**Production Readiness:** 🟡 Requires database migration and Stripe Connect platform setup

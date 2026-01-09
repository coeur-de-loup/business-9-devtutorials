# Production Environment Setup Guide

## Overview

This guide will help you set up the production environment for DevTutorials using **free tiers** (total cost: $0/month).

## Prerequisites

You'll need to create free accounts for these services (no credit card required for free tiers):

1. **Neon Database** - https://neon.tech (2 min signup)
2. **Resend Email** - https://resend.com (2 min signup)
3. **Stripe** - https://stripe.com (3 min signup, test mode)

## Step 1: Neon Database Setup (5 minutes)

### 1.1 Create Account
1. Go to https://neon.tech
2. Click "Sign Up" (use email/GitHub)
3. Verify email if required

### 1.2 Create Project
1. Click "Create Project"
2. Project name: `devtutorials`
3. Region: Choose closest to your users (default: US East)
4. Click "Create Project"

### 1.3 Get Connection Strings
After project creation, you'll see connection details. Save these:

```bash
# Copy these values (found in Neon dashboard)
DATABASE_URL="postgresql://[user]:[password]@ep-[xxx].aws.neon.tech/devtutorials?sslmode=require"
DIRECT_URL="postgresql://[user]:[password]@ep-[xxx].aws.neon.tech/devtutorials?sslmode=require&pgbouncer=true"
```

**Free Tier Limits**: 3GB storage, 300 hours/month
**Cost**: $0/month

---

## Step 2: Resend Email Setup (5 minutes)

### 2.1 Create Account
1. Go to https://resend.com
2. Click "Sign Up"
3. Verify email

### 2.2 Get API Key
1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name: `DevTutorials Production`
4. Copy the API key:

```bash
RESEND_API_KEY="re_[xxxxxxxx]"
```

**Free Tier Limits**: 100K emails/month
**Cost**: $0/month

---

## Step 3: Stripe Setup (5 minutes)

### 3.1 Create Account
1. Go to https://stripe.com
2. Click "Start now" → "Test mode"
3. Complete signup

### 3.2 Get API Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. You'll see these keys:

```bash
# Publishable key (starts with pk_test_)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Secret key (starts with sk_test_)
STRIPE_SECRET_KEY="sk_test_..."
```

### 3.3 Configure Webhooks
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://[your-vercel-url]/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the webhook secret:

```bash
STRIPE_WEBHOOK_SECRET="whsec_..."
```

7. Repeat for Stripe Connect webhook:
   - Endpoint URL: `https://[your-vercel-url]/api/webhooks/stripe-connect`
   - Events: Select all "Connect" events
   - Secret:

```bash
STRIPE_CONNECT_WEBHOOK_SECRET="whsec_..."
```

**Test Mode**: Free, no processing fees
**Cost**: $0/month (until you switch to live mode)

---

## Step 4: Generate NextAuth Secret (1 minute)

Run this command in your terminal:

```bash
openssl rand -base64 32
```

Save the output:

```bash
NEXTAUTH_SECRET="[generated-secret]"
```

---

## Step 5: Configure Vercel Environment Variables (5 minutes)

### 5.1 Get Your Vercel URL
Your production URL will be: `https://business9.vercel.app`

Or check in Vercel dashboard for custom domain if set.

### 5.2 Add Environment Variables

Option A: Using Vercel CLI (Recommended)
```bash
# Database
vercel env add DATABASE_URL production
# Paste your DATABASE_URL from Step 1

vercel env add DIRECT_URL production
# Paste your DIRECT_URL from Step 1

# Auth
vercel env add NEXTAUTH_URL production
# Enter: https://business9.vercel.app

vercel env add NEXTAUTH_SECRET production
# Paste from Step 4

# Stripe
vercel env add STRIPE_SECRET_KEY production
# Paste from Step 3

vercel env add STRIPE_PUBLISHABLE_KEY production
# Paste from Step 3

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# Paste from Step 3

vercel env add STRIPE_WEBHOOK_SECRET production
# Paste webhook secret from Step 3

vercel env add STRIPE_CONNECT_WEBHOOK_SECRET production
# Paste connect webhook secret from Step 3

# Email
vercel env add RESEND_API_KEY production
# Paste from Step 2

# App
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://business9.vercel.app

vercel env add NEXT_PUBLIC_APP_NAME production
# Enter: DevTutorials
```

Option B: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select `business9` project
3. Go to Settings → Environment Variables
4. Add each variable (select "Production", "Preview", and "Development" environments)
5. Use the table below:

| Name | Value | Environments |
|------|-------|--------------|
| DATABASE_URL | From Step 1 | Prod, Prev, Dev |
| DIRECT_URL | From Step 1 | Prod, Prev, Dev |
| NEXTAUTH_URL | https://business9.vercel.app | Prod, Prev, Dev |
| NEXTAUTH_SECRET | From Step 4 | Prod, Prev, Dev |
| STRIPE_SECRET_KEY | sk_test_... | Prod, Prev, Dev |
| STRIPE_PUBLISHABLE_KEY | pk_test_... | Prod, Prev, Dev |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | pk_test_... | Prod, Prev, Dev |
| STRIPE_WEBHOOK_SECRET | whsec_... | Prod, Prev, Dev |
| STRIPE_CONNECT_WEBHOOK_SECRET | whsec_... | Prod, Prev, Dev |
| RESEND_API_KEY | re_... | Prod, Prev, Dev |
| NEXT_PUBLIC_APP_URL | https://business9.vercel.app | Prod, Prev, Dev |
| NEXT_PUBLIC_APP_NAME | DevTutorials | Prod, Prev, Dev |

---

## Step 6: Redeploy to Production (2 minutes)

```bash
# Trigger a new deployment with environment variables
vercel --prod
```

Wait for deployment to complete (~1-2 minutes).

---

## Step 7: Run Database Migrations (2 minutes)

```bash
# Push database schema to production
DATABASE_URL="postgresql://[user]:[password]@ep-[xxx].aws.neon.tech/devtutorials?sslmode=require" \
npx prisma db push
```

You should see:
```
✔ Database URL obtained from the "--from-migration" flag
✔ Schema pushed 1 migration to the database
```

---

## Step 8: Verify Deployment (5 minutes)

### 8.1 Check Homepage
- Open: https://business9.vercel.app
- ✅ Page loads without errors
- ✅ Styling looks correct
- ✅ Navigation works

### 8.2 Check Vercel Logs
```bash
vercel logs
```
- ✅ No error messages
- ✅ No missing environment variable warnings

### 8.3 Test Authentication
1. Click "Sign In"
2. Create account
3. ✅ Sign up works
4. ✅ Email verification arrives (check Spam folder)
5. ✅ Can log in

### 8.4 Test Stripe
1. Browse to a tutorial
2. Click purchase
3. ✅ Stripe checkout loads
4. ✅ Can complete test purchase (use: 4242 4242 4242 4242)

### 8.5 Check Neon Dashboard
- Go to Neon dashboard
- ✅ Tables created (User, Tutorial, Purchase, etc.)
- ✅ Data appears when you sign up/purchase

---

## Troubleshooting

### Build Fails
```bash
# Test build locally
npm run build

# Clear Vercel cache
vercel build --force
```

### Database Connection Error
- Verify DATABASE_URL in Vercel
- Check Neon dashboard (is database active?)
- Ensure `?sslmode=require` is in connection string

### Stripe Webhook Fails
- Verify webhook endpoint URL matches Vercel URL
- Check webhook secret is correct
- Test webhook in Stripe Dashboard → Webhooks → Click endpoint → Send test webhook

### Email Not Arriving
- Check Resend dashboard (logs all emails)
- Verify RESEND_API_KEY in Vercel
- Check Spam folder
- Test with Resend's playground: https://resend.com/api-keys

### Auth Fails
- Verify NEXTAUTH_URL matches your Vercel domain
- Check NEXTAUTH_SECRET is set
- Clear browser cookies and try again

---

## Cost Summary

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel | 100GB bandwidth, 100GB-hrs serverless | $0/month |
| Neon | 3GB storage, 300 hours | $0/month |
| Resend | 100K emails/month | $0/month |
| Stripe | Test mode | $0/month |
| **Total** | | **$0/month** |

---

## Next Steps After Deployment

1. ✅ Test all user flows
2. ✅ Monitor Vercel logs for 24 hours
3. ✅ Set up custom domain (optional)
4. ✅ Switch Stripe to live mode (when ready to accept real payments)
5. ✅ Set up monitoring (optional: Sentry for error tracking)

---

## Security Checklist

- ✅ No API keys in code
- ✅ All secrets in Vercel environment variables
- ✅ Database connection uses SSL
- ✅ NEXTAUTH_SECRET is strong (32+ characters)
- ✅ Stripe webhooks verified with secret
- ✅ Resend API key has minimum required permissions

---

## Support

If you encounter issues:
1. Check Vercel logs: `vercel logs`
2. Check Neon dashboard: https://neon.tech
3. Check Stripe dashboard: https://dashboard.stripe.com/test
4. Check Resend dashboard: https://resend.com
5. See full documentation: `docs/deployment/`

---

## One-Command Setup (After Account Creation)

Once you have all the credentials from steps 1-4, run this automated script:

```bash
# See scripts/setup-production-env.sh
./scripts/setup-production-env.sh
```

This will automatically:
- Add all environment variables to Vercel
- Trigger deployment
- Run database migrations
- Verify deployment

Estimated total time: **30 minutes** (including account creation)

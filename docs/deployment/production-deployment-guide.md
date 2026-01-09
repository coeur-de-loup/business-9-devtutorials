# Production Deployment Guide

**Date:** January 9, 2026
**Status:** Deployment Configuration
**Environment:** Free Tiers Only (No Cost)

---

## Executive Summary

This guide provides step-by-step instructions for deploying DevTutorials to production using **free tiers only**. The deployment uses Vercel for hosting, Neon for PostgreSQL, and integrates with Stripe, Resend, and Cloudflare R2.

**Total Monthly Cost: $0** (using free tiers)

**Deployment Time: 30-45 minutes**

---

## Prerequisites

Before starting deployment, ensure you have:

- [ ] GitHub account with repository created
- [ ] Vercel account (free tier)
- [ ] Neon account (free tier)
- [ ] Stripe account (test mode for now)
- [ ] Resend account (free tier)
- [ ] Cloudflare account (free tier, optional for R2)
- [ ] Node.js 18+ installed locally
- [ ] Git installed locally

---

## Step 1: Prepare Database (Neon)

### 1.1 Create Neon Project

1. Go to https://neon.tech
2. Sign up / Log in
3. Click "New Project"
4. Configure:
   - **Project name:** devtutorials
   - **Database name:** devtutorials
   - **Region:** Choose nearest to your users (e.g., US East)
5. Click "Create Project"
6. Copy the **Connection String** (format: `postgresql://user:password@ep-xxx.aws.neon.tech/devtutorials?sslmode=require`)

### 1.2 Get Direct URL

In Neon dashboard:
1. Go to your project
2. Copy the **Connection string** (same as above)
3. Add `&pgbouncer=true` to the end for DIRECT_URL
4. Example:
   ```
   DATABASE_URL="postgresql://user:password@ep-xxx.aws.neon.tech/devtutorials?sslmode=require"
   DIRECT_URL="postgresql://user:password@ep-xxx.aws.neon.tech/devtutorials?sslmode=require&pgbouncer=true"
   ```

**Cost: $0/month** (Free tier: 3GB storage, 300 hours/month)

---

## Step 2: Prepare Vercel Deployment

### 2.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 2.2 Login to Vercel

```bash
vercel login
```

### 2.3 Link Project

```bash
cd /path/to/devtutorials
vercel link
```

Follow the prompts:
- **Set up and deploy?** Y
- **Which scope?** Your username
- **Link to existing project?** N
- **Project name:** devtutorials
- **In which directory is your code?** . (current directory)
- **Want to override settings?** N

### 2.4 Get Vercel Credentials for GitHub Actions

After linking, get your credentials:

```bash
cat .vercel/project.json
```

You'll see:
```json
{
  "orgId": "team_xxxxx",
  "projectId": "prj_xxxxx"
}
```

### 2.5 Create Vercel API Token

1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: "GitHub Actions"
4. Scope: Full Account
5. Copy the token

### 2.6 Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your orgId from project.json
- `VERCEL_PROJECT_ID`: Your projectId from project.json

**Cost: $0/month** (Free tier: 100GB bandwidth, 1000 edge function minutes)

---

## Step 3: Configure Environment Variables

### 3.1 Generate Secrets

```bash
# Generate NextAuth secret
openssl rand -base64 32
```

### 3.2 Add Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add each variable:

**Required Variables:**

```bash
# Application
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEXT_PUBLIC_APP_NAME=DevTutorials

# Database (from Step 1)
DATABASE_URL=postgresql://user:password@ep-xxx.aws.neon.tech/devtutorials?sslmode=require
DIRECT_URL=postgresql://user:password@ep-xxx.aws.neon.tech/devtutorials?sslmode=require&pgbouncer=true

# NextAuth
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=<generated-from-openssl>

# Stripe (Test Mode - Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Connect Webhook (test mode)
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...

# Resend (Get from https://resend.com/api-keys)
RESEND_API_KEY=re_...
```

**Optional Variables (can add later):**

```bash
# Google OAuth (Optional - Get from https://console.cloud.google.com)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cloudflare R2 (Optional - for file storage)
CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=devtutorials-files

# Sentry (Optional - Get from https://sentry.io)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_PROJECT_ID=
```

### 3.3 Choose Environment

- **Production:** All environments
- **Preview:** All environments (for PR previews)
- **Development:** All environments (for local development)

**Recommendation:** Select all three for each variable

---

## Step 4: Deploy to Vercel

### 4.1 Push to GitHub

```bash
git add .
git commit -m "Configure production deployment"
git push origin main
```

### 4.2 Automatic Deployment

Once you push to main branch:
1. GitHub Actions will run tests (from `.github/workflows/ci.yml`)
2. If tests pass, Vercel will auto-deploy
3. Monitor deployment at https://vercel.com/dashboard

### 4.3 Manual Deployment (Optional)

If you want to deploy immediately:

```bash
vercel --prod
```

### 4.4 Verify Deployment

1. Go to your Vercel URL: `https://your-project.vercel.app`
2. Check:
   - [ ] Homepage loads
   - [ ] No console errors
   - [ ] Database migrations ran successfully (check Vercel logs)

**Expected First Deployment Time:** 2-3 minutes

---

## Step 5: Run Database Migrations

### 5.1 Access Neon Database

You have two options:

**Option A: Run migrations locally (production database)**

```bash
# Set DATABASE_URL to production database
export DATABASE_URL="postgresql://user:password@ep-xxx.aws.neon.tech/devtutorials?sslmode=require"

# Generate Prisma client
npx prisma generate

# Push schema to production database
npx prisma db push
```

**Option B: Use Neon Dashboard SQL Editor**

1. Go to Neon Dashboard → SQL Editor
2. Copy the schema from `prisma/schema.prisma`
3. Convert to SQL or use Prisma migrate command

**Recommended: Option A (push from local)**

### 5.2 Verify Database Schema

In Neon Dashboard:
1. Go to "Tables"
2. Verify tables exist:
   - User
   - Tutorial
   - Lesson
   - VideoAsset
   - Purchase
   - CreatorEarning
   - Waitlist

---

## Step 6: Configure Stripe Webhooks

### 6.1 Create Webhook Endpoint (Test Mode)

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Configure:
   - **Endpoint URL:** `https://your-project.vercel.app/api/stripe/webhook`
   - **Events to listen to:** Select these events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
4. Click "Add endpoint"
5. Copy the **Signing Secret** (starts with `whsec_...`)

### 6.2 Add Webhook Secret to Vercel

1. Go to Vercel → Settings → Environment Variables
2. Update `STRIPE_WEBHOOK_SECRET` with the signing secret
3. Redeploy (or wait for next deployment)

### 6.3 Create Stripe Connect Webhook (for creator payouts)

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Configure:
   - **Endpoint URL:** `https://your-project.vercel.app/api/stripe/connect/webhook`
   - **Events:**
     - `account.updated`
     - `account.application.authorized`
     - `account.application.deauthorized`
4. Copy the **Signing Secret**
5. Add `STRIPE_CONNECT_WEBHOOK_SECRET` to Vercel environment variables

---

## Step 7: Test Production Deployment

### 7.1 Core Functionality Tests

Open `https://your-project.vercel.app` and test:

**Homepage:**
- [ ] Landing page loads
- [ ] Email capture form works (subscribe to waitlist)
- [ ] Navigation links work

**Authentication:**
- [ ] Sign up / Login works
- [ ] OAuth (if configured) works
- [ ] Session persists across pages

**Creator Dashboard:**
- [ ] Can create tutorial
- [ ] Can add lessons
- [ ] Can upload video (if R2 configured) or see placeholder

**Purchase Flow:**
- [ ] Stripe Checkout loads (test mode)
- [ ] Purchase completes successfully
- [ ] "My Tutorials" shows purchased content

**My Tutorials:**
- [ ] Can view purchased tutorials
- [ ] Video player works (or placeholder)
- [ ] Download code button works (if implemented)

### 7.2 Stripe Test Mode Testing

Use Stripe test cards:
- **Success:** `4242 4242 4242 4242` (any future expiry, any CVC)
- **Failure:** `4000 0000 0000 0002` (card declined)
- **Requires auth:** `4000 0025 0000 3155` (requires 3D secure)

### 7.3 Monitor Logs

Check Vercel logs:
1. Go to Vercel Dashboard → your project → "Logs"
2. Look for errors or warnings
3. Check API route logs

---

## Step 8: Custom Domain (Optional)

### 8.1 Purchase Domain

**Free Options:**
- Use `.vercel.app` subdomain (free, already configured)
- Freenom (free TLDs like .tk, .ml) - NOT recommended

**Paid Options:**
- Namecheap: $8-12/year
- Google Domains: $8-12/year
- Cloudflare Registrar: $8-10/year (at cost)

**Note:** Prompt requires explicit approval before spending money.

### 8.2 Configure Custom Domain in Vercel

1. Go to Vercel → Settings → Domains
2. Add your domain: `devtutorials.com`
3. Choose option:
   - **Recommended:** Add A records (Vercel provides instructions)
   - **Or:** CNAME to cname.vercel-dns.com

### 8.3 Update Environment Variables

After DNS propagates (usually 5-30 minutes):

1. Update in Vercel:
   - `NEXT_PUBLIC_APP_URL=https://devtutorials.com`
   - `NEXTAUTH_URL=https://devtutorials.com`

2. Update Stripe webhooks:
   - Add new endpoint for `https://devtutorials.com/api/stripe/webhook`
   - Update `STRIPE_WEBHOOK_SECRET` in Vercel

3. Redeploy

---

## Step 9: Post-Deployment Checklist

### 9.1 Security

- [ ] Environment variables are set (NOT hardcoded in code)
- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.production.local` is in `.gitignore`
- [ ] No secrets in git history
- [ ] Webhook signatures are verified
- [ ] Authentication is required for protected routes

### 9.2 Performance

- [ ] Homepage loads in < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Images are optimized
- [ ] Database queries are optimized

### 9.3 Monitoring

- [ ] Set up Sentry (optional but recommended)
- [ ] Enable Vercel Analytics (automatic)
- [ ] Check Vercel logs daily for first week

### 9.4 Backup

- [ ] Neon automatic backups are enabled (default)
- [ ] Database export script works (optional)

### 9.5 Documentation

- [ ] Update README with deployment instructions
- [ ] Document environment variables
- [ ] Create runbook for common issues

---

## Step 10: Switch from Test to Live (When Ready)

⚠️ **WARNING:** Only do this when you've thoroughly tested in test mode

### 10.1 Get Stripe Live Keys

1. Go to https://dashboard.stripe.com/apikeys (not test mode)
2. Copy live keys:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`

### 10.2 Update Vercel Environment Variables

Update in Vercel → Settings → Environment Variables:
- `STRIPE_SECRET_KEY`: `sk_live_...`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_live_...`

### 10.3 Recreate Webhooks in Live Mode

1. Go to https://dashboard.stripe.com/webhooks (not test mode)
2. Create webhooks for live endpoints
3. Update `STRIPE_WEBHOOK_SECRET` in Vercel

### 10.4 Test Live Payment

Make a small test purchase ($1-2) to verify:
- Payment processes
- Webhooks fire
- Database records created
- Email sent (if configured)

---

## Troubleshooting

### Issue: Build fails with "Module not found"

**Solution:**
```bash
# Locally test build
npm run build

# Fix any missing dependencies
npm install <missing-package>

# Commit and push
git add package.json package-lock.json
git commit -m "Fix missing dependencies"
git push
```

### Issue: Database connection fails

**Solution:**
1. Verify DATABASE_URL is correct in Vercel
2. Check Neon database is active
3. Test connection locally:
   ```bash
   psql $DATABASE_URL
   ```

### Issue: Stripe webhook returns "401 Unauthorized"

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` is set in Vercel
2. Check webhook endpoint URL matches Stripe dashboard
3. Test webhook signature verification locally

### Issue: Environment variables not working

**Solution:**
1. Check variable names match exactly (case-sensitive)
2. Ensure variables are set for all environments (Production, Preview, Development)
3. Redeploy after adding variables

### Issue: Deployment is slow

**Solution:**
- First deployment takes 2-3 minutes (normal)
- Subsequent deployments take 1-2 minutes
- If > 5 minutes, check for:
  - Large dependencies
  - Slow database migrations
  - External API calls during build

---

## Cost Breakdown (Free Tiers)

| Service | Tier | Cost | Limits |
|---------|------|------|--------|
| **Vercel (Hobby)** | Free | $0/month | 100GB bandwidth, 1000 edge minutes |
| **Neon PostgreSQL** | Free | $0/month | 3GB storage, 300 hours/month |
| **Resend Email** | Free | $0/month | 100K emails/month |
| **Stripe (Test)** | Free | $0/month | Unlimited test transactions |
| **GitHub Actions** | Free | $0/month | 2000 minutes/month |
| **Total** | | **$0/month** | Sufficient for MVP launch |

**When to Upgrade (Month 6+):**
- Vercel Pro: $20/month (1TB bandwidth)
- Neon Pro: $19/month (10GB storage, 1000 hours)
- Stripe Live Mode: Pay-per-use (2.9% + $0.30/transaction)

---

## Scaling Considerations

### Month 1-6 (MVP)
- Free tiers sufficient
- Scale to 1,000 users
- Handle 100 tutorials

### Month 7-12 (Growth)
- Upgrade to Vercel Pro ($20/month)
- Upgrade to Neon Pro ($19/month)
- Scale to 5,000 users
- Handle 500 tutorials

### Month 13+ (Scale)
- Consider VPS for cost savings
- Add Redis caching ($15/month)
- Optimize video delivery with R2
- Scale to 10,000+ users

---

## Support and Resources

**Documentation:**
- Vercel: https://vercel.com/docs
- Neon: https://neon.tech/docs
- Stripe: https://stripe.com/docs
- Prisma: https://www.prisma.io/docs

**Community:**
- Vercel Discord: https://vercel.com/discord
- Neon Discord: https://discord.gg/Neon
- Stack Overflow: Tag questions with `vercel`, `neon`, `stripe`

**Monitoring:**
- Vercel Dashboard: https://vercel.com/dashboard
- Neon Dashboard: https://neon.tech/dashboard
- Stripe Dashboard: https://dashboard.stripe.com

---

## Conclusion

You now have a production deployment of DevTutorials running on **free tiers only**. The application is:

✅ Deployed to Vercel (global CDN, automatic HTTPS)
✅ Using Neon PostgreSQL (serverless, auto-scaling)
✅ Integrated with Stripe (test mode ready)
✅ Configured for email (Resend)
✅ Ready for custom domain (when you purchase one)
✅ Monitoring via Vercel Analytics and logs

**Next Steps:**
1. Test all functionality thoroughly
2. Set up Sentry for error tracking (optional)
3. Configure custom domain (optional)
4. Switch Stripe to live mode (when ready)
5. Launch to users!

**Estimated Time to Complete:** 30-45 minutes

**Total Monthly Cost:** $0 (using free tiers)

---

**Document Version:** 1.0
**Last Updated:** January 9, 2026
**Next Review:** Month 3 (post-launch scaling review)

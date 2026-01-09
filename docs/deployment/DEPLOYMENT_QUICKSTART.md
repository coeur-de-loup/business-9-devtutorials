# Production Deployment Quickstart

**Deploy in 15 minutes** using free tiers.

---

## Prerequisites

- GitHub repo
- Vercel account (free)
- Neon account (free)
- Stripe account (free test mode)

---

## Step 1: Database (Neon) - 5 min

1. Go to https://neon.tech
2. Create project → Copy connection string
3. Save `DATABASE_URL` and `DIRECT_URL`

```bash
# Example:
DATABASE_URL="postgresql://user:pass@ep-xxx.aws.neon.tech/devtutorials?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.aws.neon.tech/devtutorials?sslmode=require&pgbouncer=true"
```

---

## Step 2: Vercel Setup - 5 min

```bash
# Install CLI
npm install -g vercel

# Login & link
vercel login
vercel link

# Deploy
vercel --prod
```

---

## Step 3: Environment Variables - 3 min

In Vercel Dashboard → Settings → Environment Variables, add:

```bash
# Database (from Step 1)
DATABASE_URL=<your-neon-connection-string>
DIRECT_URL=<your-neon-direct-url>

# Auth (generate with: openssl rand -base64 32)
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=<generated-secret>

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...

# Email (get from https://resend.com/api-keys)
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEXT_PUBLIC_APP_NAME=DevTutorials
```

**Select all environments:** Production, Preview, Development

---

## Step 4: Database Migration - 2 min

```bash
# Push schema to production
DATABASE_URL="postgresql://user:pass@ep-xxx.aws.neon.tech/devtutorials?sslmode=require" npx prisma db push
```

---

## Step 5: Verify - 1 min

1. Open `https://your-project.vercel.app`
2. Check homepage loads
3. Check Vercel logs for errors

---

## Cost: $0/month

All services use free tiers:
- Vercel: 100GB bandwidth
- Neon: 3GB storage, 300 hours
- Resend: 100K emails
- Stripe: Free test mode

---

## Full Guide

See `docs/deployment/production-deployment-guide.md` for detailed instructions.

---

## Troubleshooting

**Build fails?**
```bash
npm run build  # Test locally
```

**Database connection fails?**
- Verify DATABASE_URL in Vercel
- Check Neon dashboard

**Stripe webhook fails?**
- Verify STRIPE_WEBHOOK_SECRET
- Check endpoint URL matches Stripe dashboard

---

## Next Steps

- [ ] Test purchase flow (Stripe test mode)
- [ ] Configure webhooks (see full guide)
- [ ] Set up custom domain (optional)
- [ ] Switch to Stripe live mode (when ready)

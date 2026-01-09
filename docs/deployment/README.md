# Deployment Documentation

This directory contains comprehensive deployment guides for DevTutorials.

---

## Quick Links

- **[Quickstart Guide](./DEPLOYMENT_QUICKSTART.md)** - Deploy in 15 minutes
- **[Full Production Guide](./production-deployment-guide.md)** - Complete deployment instructions
- **[Infrastructure Overview](../technical/infrastructure.md)** - Architecture and cost breakdown

---

## Deployment Options

### 1. Vercel (Recommended)

**Best for:** MVP launch, rapid iteration, zero DevOps

**Cost:** Free tier (Months 1-6), then $20/month

**Pros:**
- Zero configuration
- Automatic HTTPS
- Global CDN
- Preview deployments
- Best developer experience

**Cons:**
- Vendor lock-in
- Paid tier after free limits

**Guide:** [Full Production Guide](./production-deployment-guide.md)

---

### 2. Railway

**Best for:** Docker deployment, closer to production

**Cost:** $15/month ($5/month per service: app, database, Redis)

**Pros:**
- Docker deployment
- Managed services
- Easy to migrate away

**Cons:**
- Less polished than Vercel
- Slower builds
- No preview deployments

**See:** [Infrastructure - Option 2: Railway](../technical/infrastructure.md#option-2-railway)

---

### 3. Self-Hosted VPS

**Best for:** Cost optimization at scale, full control

**Cost:** $5-6/month (DigitalOcean, Hetzner, Linode)

**Pros:**
- Cheapest at scale
- Full control
- Unlimited bandwidth (some providers)

**Cons:**
- Manual DevOps
- Security management
- No auto-scaling

**See:** [Infrastructure - Option 3: Self-Hosted VPS](../technical/infrastructure.md#option-3-self-hosted-vps)

---

## Environment Variables

### Required for Production

All deployments require these environment variables:

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CONNECT_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."

# Application
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_APP_NAME="DevTutorials"
```

**See:** `.env.production.example` for complete list

---

## Database Migration

### Prisma Migration

After deployment, run database migrations:

```bash
# Push schema to production database
DATABASE_URL="postgresql://..." npx prisma db push

# Or run migrations (if using migrate dev)
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

**Verification:**
- Check database tables exist in Neon/Railway/VPS dashboard
- Verify all tables created (User, Tutorial, Lesson, Purchase, etc.)

---

## Stripe Webhook Configuration

### Required Webhooks

Configure in Stripe Dashboard (Test Mode → Live Mode):

**Payment Webhook:**
- URL: `https://your-domain.com/api/stripe/webhook`
- Events:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`

**Connect Webhook:**
- URL: `https://your-domain.com/api/stripe/connect/webhook`
- Events:
  - `account.updated`
  - `account.application.authorized`
  - `account.application.deauthorized`

**See:** [Production Guide - Step 6](./production-deployment-guide.md#step-6-configure-stripe-webhooks)

---

## CI/CD Pipeline

### GitHub Actions (Vercel)

Automatic deployment on push to `main` branch:

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
jobs:
  test:
    # Run tests
  deploy:
    # Deploy to Vercel
```

**Required GitHub Secrets:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

**See:** [Production Guide - Step 2.6](./production-deployment-guide.md#26-add-github-secrets)

---

## Monitoring & Logging

### Vercel Deployment

**Logs:**
- Vercel Dashboard → Project → Logs
- Real-time logs for API routes
- Error tracking

**Analytics:**
- Vercel Analytics (automatic)
- Page views, visitors, top pages

### Self-Hosted Deployment

**Logs:**
- Journalctl: `sudo journalctl -u devtutorials -f`
- Docker logs: `docker-compose logs -f app`

**Monitoring:**
- Sentry for error tracking
- Uptime monitoring (Pingdom, UptimeRobot)

---

## Backup & Disaster Recovery

### Database Backups

**Neon:**
- Automatic point-in-time recovery (7 days)
- Daily snapshots (30-day retention)
- Manual export via SQL Editor

**Self-Hosted:**
```bash
# Daily cron job
0 2 * * * pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

**See:** [Infrastructure - Backups](../technical/infrastructure.md#7-backup-and-disaster-recovery)

---

## Scaling Roadmap

### Phase 1 (Months 1-6): MVP
- **Hosting:** Vercel Hobby (Free)
- **Database:** Neon Free (3GB)
- **Video:** Bunny.net ($55/month)
- **Cost:** $55/month fixed
- **Capacity:** 1,000 users, 100 tutorials

### Phase 2 (Months 7-12): Growth
- **Hosting:** Vercel Pro ($20/month)
- **Database:** Neon Pro ($19/month)
- **Video:** Cloudflare R2 ($7.50/month)
- **Cost:** $75/month fixed
- **Capacity:** 5,000 users, 500 tutorials

### Phase 3 (Months 13+): Scale
- **Hosting:** VPS ($5-6/month)
- **Database:** Self-hosted PostgreSQL (included in VPS)
- **Video:** Cloudflare R2 ($7.50/month)
- **Cost:** $13/month fixed
- **Capacity:** 10,000+ users

**See:** [Infrastructure - Scaling Roadmap](../technical/infrastructure.md#10-scaling-roadmap)

---

## Troubleshooting

### Common Issues

**Build fails:**
- Check `npm run build` locally
- Verify all dependencies installed
- Check Vercel build logs

**Database connection fails:**
- Verify DATABASE_URL is correct
- Check database is active
- Test connection locally with `psql`

**Stripe webhook fails:**
- Verify webhook secret is set
- Check endpoint URL matches Stripe
- Test webhook signature verification

**Environment variables not working:**
- Check variable names exactly match
- Ensure set for all environments (Production, Preview, Development)
- Redeploy after adding variables

**See:** [Production Guide - Troubleshooting](./production-deployment-guide.md#troubleshooting)

---

## Cost Summary

### MVP (Months 1-6)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel (Hobby) | Free | $0 |
| Neon PostgreSQL | Free | $0 |
| Bunny.net CDN | 500GB | $55 |
| Resend Email | Free | $0 |
| Stripe | Test mode | $0 |
| **Total** | | **$55/month** |

### Growth (Months 7-12)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel (Pro) | 1TB | $20 |
| Neon PostgreSQL | 10GB | $19 |
| Cloudflare R2 | 500GB | $7.50 |
| Resend Email | Free | $0 |
| Stripe | 2.9% + $0.30 | Variable |
| **Total** | | **$46.50/month + Stripe fees** |

**See:** [Infrastructure - Cost Summary](../technical/infrastructure.md#9-cost-summary)

---

## Support Resources

**Documentation:**
- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)

**Community:**
- [Vercel Discord](https://vercel.com/discord)
- [Neon Discord](https://discord.gg/Neon)
- [Stack Overflow](https://stackoverflow.com)

**Monitoring:**
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Neon Dashboard](https://neon.tech/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com)

---

## Next Steps

1. **Choose deployment option** → Vercel recommended for MVP
2. **Follow quickstart guide** → Deploy in 15 minutes
3. **Configure environment variables** → Database, Auth, Stripe
4. **Run database migrations** → Push schema to production
5. **Test deployment** → Verify all functionality works
6. **Configure webhooks** → Stripe payment fulfillment
7. **Set up monitoring** → Sentry error tracking (optional)
8. **Launch!** → Switch Stripe to live mode

---

**Last Updated:** January 9, 2026
**Version:** 1.0

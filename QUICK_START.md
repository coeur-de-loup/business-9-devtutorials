# DevTutorials - Quick Start Guide

## 🚀 Quick Start for Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Generate NextAuth secret
openssl rand -base64 32

# 4. Update .env.local with:
#    - NEXTAUTH_SECRET (from step 3)
#    - DATABASE_URL (SQLite for local: file:./dev.db)
#    - NEXTAUTH_URL (http://localhost:3000)

# 5. Initialize database
npx prisma generate
npx prisma db push

# 6. Run development server
npm run dev
```

Visit `http://localhost:3000`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📦 Building for Production

```bash
# Build production bundle
npm run build

# Test production build locally
npm start
```

## 🚀 Deployment to Vercel

### Prerequisites (15 minutes)
1. **Neon Database** - https://neon.tech (free tier)
2. **Stripe** - https://stripe.com (test mode, free)
3. **Resend** - https://resend.com (free tier)

### Deploy (20 minutes)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Link project
vercel link

# 4. Add environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add RESEND_API_KEY production

# 5. Deploy
vercel --prod

# 6. Run database migrations
DATABASE_URL="your-production-db-url" npx prisma db push
```

### Post-Deployment

- Configure Stripe webhooks (see docs/deployment/DEPLOYMENT_QUICKSTART.md)
- Test checkout flow
- Test email delivery
- Verify all functionality

## 📚 Documentation

- [Full Documentation](docs/README.md)
- [Deployment Guide](docs/deployment/DEPLOYMENT_QUICKSTART.md)
- [API Documentation](docs/api/README.md)
- [Testing Guide](docs/testing/TESTING_GUIDE.md)

## 🆘 Troubleshooting

### Database Issues
```bash
# Reset database
rm prisma/dev.db
npx prisma db push
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Environment Variables
```bash
# Check current environment variables
vercel env ls
```

## 💡 Development Tips

1. **Use SQLite for local development** - faster and simpler
2. **Test in Chrome Incognito** - avoids auth state issues
3. **Check Vercel logs** - `vercel logs`
4. **Monitor Stripe test events** - dashboard > events > test mode

## 🎯 Key Features

- ✅ User authentication (NextAuth.js)
- ✅ Tutorial marketplace (list, search, purchase)
- ✅ Stripe checkout (test mode)
- ✅ Creator Stripe Connect onboarding
- ✅ Waitlist signup
- ✅ Email notifications (Resend)
- ✅ Responsive design
- ✅ 80+ tests

## 📊 Project Stats

- **Code**: 10,000+ lines
- **Tests**: 80+ tests
- **Documentation**: 60,000+ words
- **Deployment**: Vercel + Neon + Stripe + Resend
- **Cost**: $0/month (free tiers)

## 🤝 Support

For issues or questions, see the [full documentation](docs/README.md) or check the [deployment guide](docs/deployment/DEPLOYMENT_QUICKSTART.md).

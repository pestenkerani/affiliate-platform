# 🚀 Production Deployment Guide

## 📋 Prerequisites

- Node.js 18+ 
- pnpm package manager
- Vercel account (free tier available)
- PostgreSQL database (Supabase, Railway, or Vercel Postgres)
- Domain name (optional)

## 🎯 Quick Deploy to Vercel

### 1. Prepare Environment Variables

Copy `env.example` to `.env.local` and fill in your production values:

```bash
cp env.example .env.local
```

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for authentication
- `NEXT_PUBLIC_BASE_URL` - Your production domain
- `IKAS_API_KEY` - Your Ikas API key
- `STRIPE_SECRET_KEY` - Stripe secret key for payments

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from `env.example`

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Recommended)

1. Go to Vercel dashboard
2. Select your project
3. Go to Storage tab
4. Create Postgres database
5. Copy connection string to `DATABASE_URL`

### Option 2: Supabase (Free)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string

### Option 3: Railway

1. Go to [railway.app](https://railway.app)
2. Create PostgreSQL service
3. Copy connection string

### Database Migration

After setting up PostgreSQL:

```bash
# Update Prisma schema for PostgreSQL
# Edit prisma/schema.prisma:
# datasource db {
#   provider = "postgresql"
#   url      = env("DATABASE_URL")
# }

# Generate Prisma client
pnpm prisma generate

# Push schema to database
pnpm prisma db push

# Seed database (optional)
pnpm prisma db seed
```

## 🔧 Production Optimizations

### 1. Enable PWA (Optional)

Edit `next.config.js`:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: false, // Enable for production
})

module.exports = withPWA({
  // your config
})
```

### 2. Configure Domain

1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain
5. Update DNS records

### 3. SSL Certificate

Vercel automatically provides SSL certificates for all domains.

## 📊 Monitoring Setup

### 1. Vercel Analytics

1. Go to Vercel dashboard
2. Select your project
3. Go to Analytics tab
4. Enable Web Analytics

### 2. Sentry Error Tracking

1. Go to [sentry.io](https://sentry.io)
2. Create new project
3. Add `SENTRY_DSN` to environment variables

### 3. Google Analytics

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create new property
3. Add `GOOGLE_ANALYTICS_ID` to environment variables

## 🔒 Security Checklist

- [ ] All environment variables set
- [ ] Database connection secured
- [ ] API keys rotated
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Input validation active

## 🚀 Performance Optimization

### 1. Image Optimization

Next.js automatically optimizes images. Use:
```jsx
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority
/>
```

### 2. Caching Strategy

- API responses cached for 5-10 minutes
- Static assets cached by CDN
- Database queries optimized

### 3. Bundle Analysis

```bash
# Analyze bundle size
pnpm build
# Check .next/analyze/ for detailed report
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🆘 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check TypeScript errors
   - Verify all dependencies installed
   - Check environment variables

2. **Database Connection**
   - Verify `DATABASE_URL` format
   - Check database accessibility
   - Run Prisma migrations

3. **API Errors**
   - Check API key validity
   - Verify CORS settings
   - Check rate limits

### Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## 📈 Scaling Considerations

### When to Scale

- **Traffic**: >1000 daily active users
- **Database**: >10GB data
- **API**: >10,000 requests/hour

### Scaling Options

1. **Vercel Pro Plan** ($20/month)
   - Higher limits
   - Priority support
   - Advanced analytics

2. **Database Scaling**
   - Connection pooling
   - Read replicas
   - Caching layer

3. **CDN Optimization**
   - Global edge locations
   - Automatic optimization
   - Real-time analytics

## 🎉 Success!

Your affiliate marketing platform is now live! 

**Next Steps:**
1. Test all features
2. Set up monitoring
3. Configure analytics
4. Plan marketing strategy
5. Monitor performance

**Production URL:** https://your-project.vercel.app
**Admin Dashboard:** https://your-project.vercel.app/affiliate



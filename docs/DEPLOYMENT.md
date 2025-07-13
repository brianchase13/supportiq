# SupportIQ Production Deployment Guide

## Overview

This guide covers the complete production deployment of SupportIQ, including environment setup, database configuration, Stripe integration, and monitoring.

## Prerequisites

- Vercel account with Pro plan (for cron jobs)
- Supabase project with PostgreSQL database
- Stripe account with webhook configuration
- OpenAI API key
- Domain name (optional but recommended)

## 1. Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
INTERNAL_API_TOKEN=your_internal_api_token

# Email Configuration (Optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_EMAIL=noreply@your-domain.com

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn
```

### Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add all the environment variables listed above
4. Set the environment to "Production" for all variables

## 2. Database Setup

### Supabase Configuration

1. **Create Supabase Project**
   ```bash
   # Run the database schema migrations
   psql -h your-supabase-host -U postgres -d postgres -f lib/supabase/schema.sql
   psql -h your-supabase-host -U postgres -d postgres -f lib/supabase/trial-schema.sql
   psql -h your-supabase-host -U postgres -d postgres -f lib/supabase/subscription-schema.sql
   ```

2. **Enable Row Level Security (RLS)**
   - All tables have RLS policies configured
   - Service role key is required for admin operations

3. **Database Connection Pooling**
   - Configure connection pooling in Supabase dashboard
   - Set pool size to 10-20 connections
   - Enable connection pooling for better performance

### Database Backups

1. **Enable Point-in-Time Recovery**
   ```sql
   -- Enable PITR in Supabase dashboard
   -- Set retention period to 7 days minimum
   ```

2. **Automated Backups**
   - Supabase provides daily automated backups
   - Configure backup retention policy
   - Test backup restoration process

## 3. Stripe Configuration

### Webhook Setup

1. **Create Webhook Endpoint**
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhooks`
   - Select events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

2. **Get Webhook Secret**
   - Copy the webhook signing secret
   - Add to environment variables as `STRIPE_WEBHOOK_SECRET`

### Product Configuration

1. **Create Products and Prices**
   ```bash
   # Use Stripe CLI or dashboard to create:
   # - Starter Plan ($99/month, $89/year)
   # - Growth Plan ($299/month, $269/year)
   # - Enterprise Plan ($899/month, $809/year)
   ```

2. **Update Price IDs**
   - Update price IDs in `app/api/stripe/checkout/route.ts`
   - Test checkout flow with test cards

## 4. Vercel Deployment

### Initial Deployment

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login and link project
   vercel login
   vercel link
   ```

2. **Deploy to Production**
   ```bash
   # Deploy to production
   vercel --prod
   ```

### Domain Configuration

1. **Add Custom Domain**
   - Go to Vercel dashboard > Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Verify certificate is active

### Cron Jobs Setup

1. **Configure Cron Jobs**
   ```json
   // vercel.json
   {
     "crons": [
       {
         "path": "/api/cron/trial-expiration",
         "schedule": "0 9 * * *"
       },
       {
         "path": "/api/cron/daily-analysis",
         "schedule": "0 2 * * *"
       }
     ]
   }
   ```

## 5. Monitoring and Analytics

### Error Tracking

1. **Sentry Integration**
   ```bash
   # Install Sentry SDK
   npm install @sentry/nextjs

   # Configure in next.config.ts
   const { withSentryConfig } = require('@sentry/nextjs');
   ```

2. **Error Boundaries**
   - Implement error boundaries in React components
   - Monitor error rates and types

### Performance Monitoring

1. **Vercel Analytics**
   - Enable Vercel Analytics in dashboard
   - Monitor Core Web Vitals
   - Track user interactions

2. **Database Monitoring**
   - Monitor query performance in Supabase
   - Set up alerts for slow queries
   - Track connection pool usage

## 6. Security Configuration

### API Security

1. **Rate Limiting**
   - Implement rate limiting on API routes
   - Configure limits based on user tier

2. **CORS Configuration**
   - Configure CORS headers in `vercel.json`
   - Restrict origins to your domain

3. **Authentication**
   - Ensure all admin routes require authentication
   - Implement proper role-based access control

### Data Protection

1. **Encryption**
   - All data encrypted at rest in Supabase
   - HTTPS enforced for all communications
   - Sensitive data encrypted in database

2. **Backup Security**
   - Encrypted backups in Supabase
   - Access logs for backup operations

## 7. Testing Checklist

### Pre-Deployment Tests

- [ ] All API endpoints return correct responses
- [ ] Stripe webhook events are processed correctly
- [ ] Trial system works as expected
- [ ] AI processing functions properly
- [ ] Database migrations run successfully
- [ ] Environment variables are properly set

### Post-Deployment Tests

- [ ] Test checkout flow with Stripe test cards
- [ ] Verify webhook events are received
- [ ] Test trial expiration handling
- [ ] Verify admin dashboard functionality
- [ ] Test error handling and logging
- [ ] Performance testing under load

## 8. Maintenance and Updates

### Regular Maintenance

1. **Database Maintenance**
   ```sql
   -- Run weekly
   VACUUM ANALYZE;
   REINDEX DATABASE supportiq;
   ```

2. **Security Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Regular security audits

3. **Performance Optimization**
   - Monitor slow queries
   - Optimize database indexes
   - Review and optimize API endpoints

### Backup Strategy

1. **Automated Backups**
   - Daily automated backups in Supabase
   - Weekly manual backup verification
   - Monthly backup restoration tests

2. **Disaster Recovery**
   - Document recovery procedures
   - Test recovery process quarterly
   - Maintain recovery runbooks

## 9. Troubleshooting

### Common Issues

1. **Webhook Failures**
   ```bash
   # Check webhook logs in Stripe dashboard
   # Verify webhook secret is correct
   # Test webhook endpoint manually
   ```

2. **Database Connection Issues**
   ```bash
   # Check connection pool settings
   # Verify environment variables
   # Monitor connection limits
   ```

3. **AI Processing Failures**
   ```bash
   # Check OpenAI API key and limits
   # Monitor API response times
   # Verify rate limiting configuration
   ```

### Support Resources

- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Stripe Documentation: https://stripe.com/docs
- Next.js Documentation: https://nextjs.org/docs

## 10. Go-Live Checklist

### Final Verification

- [ ] All environment variables configured
- [ ] Database schema deployed and tested
- [ ] Stripe webhooks configured and tested
- [ ] Domain and SSL certificate active
- [ ] Monitoring and alerting configured
- [ ] Backup procedures tested
- [ ] Team trained on admin dashboard
- [ ] Documentation updated
- [ ] Support procedures established

### Launch Day

1. **Monitor closely for first 24 hours**
2. **Check all system metrics**
3. **Verify customer onboarding flow**
4. **Test payment processing**
5. **Monitor error rates and performance**

## Support

For deployment issues or questions:
- Check the troubleshooting section above
- Review application logs in Vercel dashboard
- Contact the development team
- Refer to the documentation links provided 
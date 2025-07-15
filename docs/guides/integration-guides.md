# SupportIQ Integration Guides

## 🗄️ 1. Supabase Setup

### Step 1: Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "New Project"
3. Choose your organization
4. Enter project name: "SupportIQ"
5. Enter database password (save this!)
6. Choose region closest to your users
7. Click "Create new project"

### Step 2: Get API Keys
1. Wait for project to be ready (~2 minutes)
2. Go to Settings → API
3. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (click "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Database Setup
1. Go to SQL Editor
2. Run these files in order:
   ```sql
   -- Copy and paste each file content:
   -- 1. lib/supabase/schema.sql
   -- 2. lib/supabase/trial-schema.sql
   -- 3. lib/supabase/subscription-schema.sql
   -- 4. lib/supabase/analytics-schema.sql
   -- 5. lib/supabase/deflection-schema.sql
   -- 6. lib/supabase/queue-schema.sql
   ```

---

## 🤖 2. OpenAI Setup

### Step 1: Get API Key
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create account
3. Click "+ Create new secret key"
4. Name: "SupportIQ Production"
5. Copy the key (starts with `sk-`)
6. Add to `.env.local`: `OPENAI_API_KEY=sk-...`

### Step 2: Verify Credits
1. Go to [platform.openai.com/usage](https://platform.openai.com/usage)
2. Ensure you have at least $10 in credits
3. Monitor usage after deployment

---

## 💳 3. Stripe Setup

### Step 1: Create Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up and complete business verification
3. **Stay in TEST MODE initially**

### Step 2: Get API Keys
1. Go to Developers → API Keys
2. Copy:
   - **Secret key** → `STRIPE_SECRET_KEY`
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Step 3: Create Products
1. Go to Products → Create Product
2. Create these products:

**Starter Plan:**
- Name: SupportIQ Starter
- Monthly: $149.00
- Yearly: $1,341.00 ($134.10/mo)

**Growth Plan:**
- Name: SupportIQ Growth  
- Monthly: $449.00
- Yearly: $4,041.00 ($404.10/mo)

**Enterprise Plan:**
- Name: SupportIQ Enterprise
- Monthly: $1,249.00
- Yearly: $11,241.00 ($1,124.10/mo)

### Step 4: Configure Webhooks
1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://supportiq.vercel.app/api/stripe/webhooks`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy signing secret → `STRIPE_WEBHOOK_SECRET`

---

## 💬 4. Intercom Setup

### Step 1: Create Developer App
1. Go to [app.intercom.com/a/developer-signup](https://app.intercom.com/a/developer-signup)
2. Sign in or create account
3. Go to Developer Hub → Your Apps → New App
4. Choose "Build an app"
5. App Name: "SupportIQ Integration"
6. Description: "AI-powered support analytics"

### Step 2: Get App Credentials
1. In app settings → Basic Information
2. Copy:
   - **Client ID** → `INTERCOM_CLIENT_ID`
   - **Client Secret** → `INTERCOM_CLIENT_SECRET`

### Step 3: Configure OAuth
1. Go to Authentication
2. Add redirect URL: `https://supportiq.vercel.app/api/auth/intercom/callback`
3. Add permissions:
   - Read conversations
   - Read users
   - Read admins
4. Save settings

### Step 4: Configure Webhooks
1. Go to Webhooks
2. Webhook URL: `https://supportiq.vercel.app/api/webhooks/intercom`
3. Select topics:
   - `conversation.user.created`
   - `conversation.user.replied`
   - `conversation.admin.replied`
   - `conversation.admin.closed`
4. Copy webhook secret → `INTERCOM_WEBHOOK_SECRET`

---

## 📧 5. Email Setup (Optional)

### Resend.com Setup
1. Go to [resend.com](https://resend.com)
2. Sign up and verify domain
3. Get API key → `RESEND_API_KEY`
4. Set `FROM_EMAIL=noreply@supportiq.vercel.app`

---

## 📊 6. Analytics Setup (Optional)

### PostHog Setup
1. Go to [posthog.com](https://posthog.com)
2. Create account and project
3. Get project API key → `NEXT_PUBLIC_POSTHOG_KEY`

### Sentry Setup
1. Go to [sentry.io](https://sentry.io)
2. Create account and project
3. Get DSN → `NEXT_PUBLIC_SENTRY_DSN`

---

## 🚀 7. Deployment Checklist

### Before Deploying:
- [ ] All API keys obtained and added to `.env.local`
- [ ] Database migrations completed
- [ ] Stripe products created
- [ ] Intercom app configured
- [ ] Webhooks set up

### After Deploying:
- [ ] Test user signup flow
- [ ] Test Intercom connection
- [ ] Test Stripe payment (use test card: 4242 4242 4242 4242)
- [ ] Verify webhook delivery
- [ ] Monitor error rates

### Production Switch:
- [ ] Switch Stripe to live mode
- [ ] Update all environment variables with live keys
- [ ] Test complete user journey
- [ ] Monitor performance metrics

---

## 🆘 Troubleshooting

### Common Issues:

**Webhook Signature Errors:**
- Ensure webhook secrets match exactly
- Check for trailing spaces in environment variables
- Verify webhook URL includes full domain

**OAuth Redirect Errors:**
- Exact URL match required (including trailing slashes)
- Update both development and production URLs
- Clear browser cookies and retry

**Database Connection Issues:**
- Verify Supabase project is active
- Check API keys are correct
- Ensure RLS policies are configured

**Stripe Payment Failures:**
- Use test cards in test mode
- Verify webhook endpoint is accessible
- Check Stripe dashboard for error logs 
# 🚀 SupportIQ Quick Setup Guide

## Current Status: 6/16 Required Integrations Configured

You have the authentication keys auto-generated! Now let's complete the remaining integrations.

---

## 📋 Step-by-Step Setup

### 1️⃣ Supabase Setup (3 variables needed)

**Get your Supabase keys:**
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click on your project (or create one named "SupportIQ")
3. Go to Settings → API
4. Copy these values to your `.env.local`:

```bash
# Replace these in .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Set up database:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the entire `setup-database.sql` file
3. Click "Run" to create all tables

### 2️⃣ OpenAI Setup (1 variable needed)

**Get your OpenAI key:**
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "+ Create new secret key"
3. Name it "SupportIQ"
4. Copy the key (starts with `sk-`)
5. Replace in `.env.local`:
```bash
OPENAI_API_KEY=sk-your_actual_key_here
```

### 3️⃣ Stripe Setup (3 variables needed)

**Get your Stripe keys:**
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure you're in TEST MODE
3. Go to Developers → API Keys
4. Copy these to `.env.local`:
```bash
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

**Set up webhooks:**
1. Go to Stripe Dashboard → Webhooks
2. Click "Add endpoint"
3. URL: `https://supportiq.vercel.app/api/stripe/webhooks`
4. Select events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
5. Copy signing secret to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

### 4️⃣ Intercom Setup (3 variables needed)

**Create Intercom App:**
1. Go to [app.intercom.com/a/developer-signup](https://app.intercom.com/a/developer-signup)
2. Sign in or create account
3. Go to Developer Hub → Your Apps → New App
4. Choose "Build an app"
5. App Name: "SupportIQ Integration"
6. After creating, go to Basic Information and copy:
```bash
INTERCOM_CLIENT_ID=your_actual_client_id_here
INTERCOM_CLIENT_SECRET=your_actual_client_secret_here
```

**Configure OAuth:**
1. In app settings → Authentication
2. Add redirect URL: `https://supportiq.vercel.app/api/auth/intercom/callback`
3. Add permissions: Read conversations, Read users, Read admins

**Configure Webhooks:**
1. In app settings → Webhooks
2. Webhook URL: `https://supportiq.vercel.app/api/webhooks/intercom`
3. Select topics: `conversation.user.created`, `conversation.user.replied`
4. Copy webhook secret to `.env.local`:
```bash
INTERCOM_WEBHOOK_SECRET=your_actual_webhook_secret_here
```

---

## ✅ Verification Commands

After updating `.env.local`, run these commands:

```bash
# Check your setup
node check-setup.js

# If all green, deploy to Vercel
./deploy-env.sh
```

---

## 🚀 Deployment

Once all integrations show ✅ green:

```bash
# Deploy to Vercel
vercel --prod
```

---

## 🧪 Testing

After deployment:
1. Visit https://supportiq.vercel.app
2. Sign up with a test email
3. Connect Intercom when prompted
4. Test payment with Stripe test card: `4242 4242 4242 4242`

---

## 🆘 Need Help?

**Common Issues:**
- **Webhook errors**: Make sure URLs match exactly
- **OAuth errors**: Clear browser cookies and retry
- **Database errors**: Run the SQL setup in Supabase

**Quick Fixes:**
```bash
# Test your setup
node check-setup.js

# View your current config
cat .env.local

# Get help with specific service
cat integration-guides.md
```

---

## 📊 Progress Tracker

- [x] Authentication (3/3) ✅
- [ ] Database (0/3) ❌
- [ ] OpenAI (0/1) ❌  
- [ ] Stripe (0/3) ❌
- [ ] Intercom (1/4) ⚠️
- [x] Application (2/2) ✅

**Total: 6/16 required integrations configured** 
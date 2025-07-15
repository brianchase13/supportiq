#!/bin/bash

echo "🔧 Setting up SupportIQ environment variables..."
echo ""

# Generate secure keys automatically
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 16)
INTERNAL_API_TOKEN=$(openssl rand -hex 32)
WEBHOOK_SECRET=$(openssl rand -hex 32)

# Backup existing .env.local
if [ -f .env.local ]; then
    cp .env.local .env.local.backup
    echo "✅ Backed up existing .env.local to .env.local.backup"
fi

# Create the complete environment file
cat > .env.local << EOL
# SupportIQ Environment Configuration
# Generated on $(date)

# Database (Supabase) - REQUIRED
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key_here

# Authentication - AUTO-GENERATED
NEXTAUTH_URL=https://supportiq.vercel.app
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
WEBHOOK_SECRET=$WEBHOOK_SECRET

# OpenAI Configuration - REQUIRED
OPENAI_API_KEY=sk-your_openai_key_here

# Stripe Configuration - REQUIRED
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Intercom Configuration - REQUIRED
INTERCOM_CLIENT_ID=your_intercom_client_id_here
INTERCOM_CLIENT_SECRET=your_intercom_client_secret_here
INTERCOM_REDIRECT_URI=https://supportiq.vercel.app/api/auth/intercom/callback
INTERCOM_WEBHOOK_SECRET=your_intercom_webhook_secret_here

# Application Configuration
NEXT_PUBLIC_APP_URL=https://supportiq.vercel.app
INTERNAL_API_TOKEN=$INTERNAL_API_TOKEN
SKIP_ENV_VALIDATION=true

# Email Configuration (Optional)
RESEND_API_KEY=re_your_resend_key_here
FROM_EMAIL=noreply@supportiq.vercel.app

# Analytics & Monitoring (Optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_SENTRY_DSN=https://your_sentry_dsn_here

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100

# Environment
NODE_ENV=production
EOL

echo "✅ Environment template created!"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Edit .env.local and replace all 'your_*_here' values with your actual keys"
echo "2. Run: ./check-setup.js to verify your configuration"
echo "3. Run: ./deploy-env.sh to deploy to Vercel"
echo ""
echo "🔑 AUTO-GENERATED KEYS:"
echo "   NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo "   ENCRYPTION_KEY: $ENCRYPTION_KEY"
echo "   INTERNAL_API_TOKEN: $INTERNAL_API_TOKEN"
echo "   WEBHOOK_SECRET: $WEBHOOK_SECRET"
echo ""
echo "These keys are already in your .env.local file!" 
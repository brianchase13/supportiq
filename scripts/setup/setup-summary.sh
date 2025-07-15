#!/bin/bash

echo "🚀 SupportIQ Setup Summary";
echo "==========================\n";

echo "📊 CURRENT STATUS:";
echo "==================";

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "✅ .env.local file exists";
else
    echo "❌ .env.local file missing - run ./setup-env.sh first";
    exit 1;
fi

# Count configured vs missing variables
total_required=0;
configured=0;
missing=0;

# Check each required variable
required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "OPENAI_API_KEY"
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    "INTERCOM_CLIENT_ID"
    "INTERCOM_CLIENT_SECRET"
    "INTERCOM_WEBHOOK_SECRET"
);

for var in "${required_vars[@]}"; do
    total_required=$((total_required + 1));
    if grep -q "^${var}=" .env.local && ! grep -q "^${var}=.*your_.*_here\|^${var}=.*sk-your_\|^${var}=.*pk_test_your_" .env.local; then
        configured=$((configured + 1));
    else
        missing=$((missing + 1));
    fi;
done;

echo "📈 Progress: ${configured}/${total_required} required integrations configured";
echo "";

if [ $missing -eq 0 ]; then
    echo "🎉 ALL INTEGRATIONS CONFIGURED!";
    echo "You can now deploy to Vercel.";
    echo "";
    echo "Next steps:";
    echo "1. Run: ./deploy-env.sh";
    echo "2. Run: vercel --prod";
    echo "3. Test your live application";
else
    echo "⚠️  ${missing} INTEGRATIONS STILL NEEDED:";
    echo "";
    
    # Show what's missing
    if grep -q "your_supabase_url_here\|your_supabase_anon_key_here\|your_supabase_service_key_here" .env.local; then
        echo "❌ Supabase - Get keys from https://supabase.com/dashboard";
    fi;
    
    if grep -q "sk-your_openai_key_here" .env.local; then
        echo "❌ OpenAI - Get key from https://platform.openai.com/api-keys";
    fi;
    
    if grep -q "sk_test_your_stripe_key_here\|pk_test_your_publishable_key_here\|whsec_your_webhook_secret_here" .env.local; then
        echo "❌ Stripe - Get keys from https://dashboard.stripe.com/developers";
    fi;
    
    if grep -q "your_intercom_client_id_here\|your_intercom_client_secret_here\|your_intercom_webhook_secret_here" .env.local; then
        echo "❌ Intercom - Get keys from https://app.intercom.com/a/developer-signup";
    fi;
    
    echo "";
    echo "📝 Follow the step-by-step guide:";
    echo "cat quick-setup.md";
    echo "";
    echo "🔍 Check your current setup:";
    echo "node check-setup.js";
fi;

echo "";
echo "📁 FILES CREATED:";
echo "================";
echo "✅ setup-env.sh - Environment setup script";
echo "✅ check-setup.js - Setup verification tool";
echo "✅ deploy-env.sh - Vercel deployment helper";
echo "✅ setup-database.sql - Complete database schema";
echo "✅ integration-guides.md - Detailed service guides";
echo "✅ quick-setup.md - Step-by-step instructions";
echo "";

echo "🔗 USEFUL LINKS:";
echo "================";
echo "• Supabase: https://supabase.com/dashboard";
echo "• OpenAI: https://platform.openai.com/api-keys";
echo "• Stripe: https://dashboard.stripe.com/developers";
echo "• Intercom: https://app.intercom.com/a/developer-signup";
echo "• Vercel: https://vercel.com/dashboard/supportiq/settings/environment-variables";
echo "";

echo "💡 PRO TIPS:";
echo "============";
echo "• Use the check-setup.js tool after each integration";
echo "• Keep your .env.local.backup file safe";
echo "• Test in development before switching to production";
echo "• Monitor your API usage after deployment"; 
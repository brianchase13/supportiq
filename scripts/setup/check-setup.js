#!/usr/bin/env node

console.log("🔍 SupportIQ Setup Checker");
console.log("========================\n");

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const required = {
  "Database (Supabase)": {
    "NEXT_PUBLIC_SUPABASE_URL": "Get from Supabase Dashboard → Settings → API",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "Get from Supabase Dashboard → Settings → API",
    "SUPABASE_SERVICE_ROLE_KEY": "Get from Supabase Dashboard → Settings → API"
  },
  "Authentication": {
    "NEXTAUTH_URL": "Should be https://supportiq.vercel.app",
    "NEXTAUTH_SECRET": "Auto-generated",
    "ENCRYPTION_KEY": "Auto-generated"
  },
  "OpenAI": {
    "OPENAI_API_KEY": "Get from platform.openai.com/api-keys"
  },
  "Stripe": {
    "STRIPE_SECRET_KEY": "Get from Stripe Dashboard → Developers → API Keys",
    "STRIPE_WEBHOOK_SECRET": "Get from Stripe Dashboard → Webhooks",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "Get from Stripe Dashboard → Developers → API Keys"
  },
  "Intercom": {
    "INTERCOM_CLIENT_ID": "Get from Intercom Developer Hub → Your Apps",
    "INTERCOM_CLIENT_SECRET": "Get from Intercom Developer Hub → Your Apps",
    "INTERCOM_REDIRECT_URI": "Should be https://supportiq.vercel.app/api/auth/intercom/callback",
    "INTERCOM_WEBHOOK_SECRET": "Get from Intercom App → Webhooks"
  },
  "Application": {
    "NEXT_PUBLIC_APP_URL": "Should be https://supportiq.vercel.app",
    "INTERNAL_API_TOKEN": "Auto-generated"
  }
};

const optional = {
  "Email": {
    "RESEND_API_KEY": "Get from resend.com for email functionality",
    "FROM_EMAIL": "Should be noreply@supportiq.vercel.app"
  },
  "Analytics": {
    "NEXT_PUBLIC_POSTHOG_KEY": "Get from posthog.com for analytics",
    "NEXT_PUBLIC_SENTRY_DSN": "Get from sentry.io for error tracking"
  }
};

let totalRequired = 0;
let totalOptional = 0;
let missingRequired = 0;
let missingOptional = 0;

console.log("📋 REQUIRED INTEGRATIONS:");
console.log("=========================");

for (const [category, vars] of Object.entries(required)) {
  console.log(`\n${category}:`);
  for (const [varName, instruction] of Object.entries(vars)) {
    totalRequired++;
    const value = process.env[varName];
    const isPlaceholder = value && (value.includes('your_') || value.includes('sk-your_') || value.includes('pk_test_your_'));
    
    if (!value || isPlaceholder) {
      console.log(`  ❌ ${varName} - ${instruction}`);
      missingRequired++;
    } else {
      console.log(`  ✅ ${varName} - Set`);
    }
  }
}

console.log("\n📊 OPTIONAL INTEGRATIONS:");
console.log("=========================");

for (const [category, vars] of Object.entries(optional)) {
  console.log(`\n${category}:`);
  for (const [varName, instruction] of Object.entries(vars)) {
    totalOptional++;
    const value = process.env[varName];
    const isPlaceholder = value && value.includes('your_');
    
    if (!value || isPlaceholder) {
      console.log(`  ⚠️  ${varName} - ${instruction} (Optional)`);
      missingOptional++;
    } else {
      console.log(`  ✅ ${varName} - Set`);
    }
  }
}

console.log("\n📈 SUMMARY:");
console.log("===========");
console.log(`Required: ${totalRequired - missingRequired}/${totalRequired} configured`);
console.log(`Optional: ${totalOptional - missingOptional}/${totalOptional} configured`);

if (missingRequired === 0) {
  console.log("\n🎉 ALL REQUIRED INTEGRATIONS ARE CONFIGURED!");
  console.log("You can now deploy to Vercel with: ./deploy-env.sh");
} else {
  console.log(`\n⚠️  ${missingRequired} REQUIRED INTEGRATIONS MISSING`);
  console.log("Please complete the setup before deploying.");
}

console.log("\n🔗 QUICK LINKS:");
console.log("===============");
console.log("• Supabase: https://supabase.com/dashboard");
console.log("• OpenAI: https://platform.openai.com/api-keys");
console.log("• Stripe: https://dashboard.stripe.com/developers");
console.log("• Intercom: https://app.intercom.com/a/developer-signup");
console.log("• Vercel: https://vercel.com/dashboard/supportiq/settings/environment-variables");

if (missingRequired > 0) {
  console.log("\n📝 NEXT STEPS:");
  console.log("==============");
  console.log("1. Get your API keys from the services above");
  console.log("2. Edit .env.local and replace placeholder values");
  console.log("3. Run this checker again: node check-setup.js");
  console.log("4. Deploy when all required integrations are green ✅");
} 
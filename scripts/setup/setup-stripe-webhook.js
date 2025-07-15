require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const Stripe = require('stripe');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey || stripeSecretKey.includes('your_stripe_key_here')) {
  console.error('❌ STRIPE_SECRET_KEY not set in .env.local');
  process.exit(1);
}

const stripe = Stripe(stripeSecretKey);

const WEBHOOK_ENDPOINT = 'https://supportiq.vercel.app/api/stripe/webhooks';
const WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed'
];

async function setupWebhook() {
  console.log('🔗 Setting up Stripe webhook for SupportIQ...\n');

  try {
    // Check if webhook already exists
    const existingWebhooks = await stripe.webhookEndpoints.list({ limit: 100 });
    const existingWebhook = existingWebhooks.data.find(webhook => webhook.url === WEBHOOK_ENDPOINT);

    let webhookSecret;

    if (existingWebhook) {
      console.log('ℹ️  Webhook already exists, getting signing secret...');
      webhookSecret = existingWebhook.secret;
      console.log(`✅ Found existing webhook: ${existingWebhook.id}`);
    } else {
      console.log('Creating new webhook for SupportIQ...');
      const webhook = await stripe.webhookEndpoints.create({
        url: WEBHOOK_ENDPOINT,
        enabled_events: WEBHOOK_EVENTS,
        description: 'SupportIQ webhook for subscription and payment events',
        metadata: {
          app: 'supportiq',
          environment: 'production'
        }
      });
      
      webhookSecret = webhook.secret;
      console.log(`✅ Created webhook: ${webhook.id}`);
    }

    // Update .env.local with the webhook secret
    const envPath = '.env.local';
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace the webhook secret placeholder
    const webhookSecretRegex = /STRIPE_WEBHOOK_SECRET=.*/;
    if (webhookSecretRegex.test(envContent)) {
      envContent = envContent.replace(webhookSecretRegex, `STRIPE_WEBHOOK_SECRET=${webhookSecret}`);
    } else {
      // Add if it doesn't exist
      envContent += `\nSTRIPE_WEBHOOK_SECRET=${webhookSecret}`;
    }
    
    fs.writeFileSync(envPath, envContent);

    console.log('\n🎉 Stripe webhook setup completed!');
    console.log('\n📊 WEBHOOK DETAILS:');
    console.log('===================');
    console.log(`Endpoint: ${WEBHOOK_ENDPOINT}`);
    console.log(`Secret: ${webhookSecret.substring(0, 20)}...`);
    console.log(`Events: ${WEBHOOK_EVENTS.length} events configured`);
    
    console.log('\n📋 CONFIGURED EVENTS:');
    WEBHOOK_EVENTS.forEach(event => {
      console.log(`  ✅ ${event}`);
    });

    console.log('\n✅ Environment updated with webhook secret');
    console.log('\n🔍 Next steps:');
    console.log('1. Run: node check-setup.js');
    console.log('2. Deploy to Vercel to activate webhook');
    console.log('3. Test with Stripe test card: 4242 4242 4242 4242');

  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message);
    if (error.type === 'StripeInvalidRequestError') {
      console.log('\n💡 This might be because:');
      console.log('   - Your Stripe account needs verification');
      console.log('   - You\'re in test mode but trying to use production URL');
      console.log('   - The webhook URL is not accessible yet');
    }
    process.exit(1);
  }
}

setupWebhook(); 
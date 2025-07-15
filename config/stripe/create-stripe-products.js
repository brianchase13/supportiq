require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const Stripe = require('stripe');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey || stripeSecretKey.includes('your_stripe_key_here')) {
  console.error('❌ STRIPE_SECRET_KEY not set in .env.local');
  process.exit(1);
}

const stripe = Stripe(stripeSecretKey);

const plans = [
  {
    name: 'SupportIQ Starter',
    description: 'AI-powered support analytics that pay for themselves. Perfect for growing teams looking to reduce ticket volume and improve response times with intelligent automation.',
    prices: [
      { nickname: 'Starter Monthly', amount: 14900, interval: 'month', key: 'starter_monthly' },
      { nickname: 'Starter Yearly', amount: 134100, interval: 'year', key: 'starter_yearly' },
    ],
  },
  {
    name: 'SupportIQ Growth',
    description: 'Advanced AI insights and predictive analytics for scaling support teams. Learn patterns, predict issues, and automate responses before tickets are created.',
    prices: [
      { nickname: 'Growth Monthly', amount: 44900, interval: 'month', key: 'growth_monthly' },
      { nickname: 'Growth Yearly', amount: 404100, interval: 'year', key: 'growth_yearly' },
    ],
  },
  {
    name: 'SupportIQ Enterprise',
    description: 'Enterprise-grade support intelligence with custom AI training, white-label solutions, and dedicated success management. For organizations serious about support excellence.',
    prices: [
      { nickname: 'Enterprise Monthly', amount: 124900, interval: 'month', key: 'enterprise_monthly' },
      { nickname: 'Enterprise Yearly', amount: 1124100, interval: 'year', key: 'enterprise_yearly' },
    ],
  },
];

(async () => {
  const priceIds = {};
  for (const plan of plans) {
    // Check if product exists
    let product = (await stripe.products.list({ limit: 100 })).data.find(p => p.name === plan.name);
    if (!product) {
      product = await stripe.products.create({ 
        name: plan.name, 
        description: plan.description,
        metadata: {
          category: 'support_analytics',
          ai_powered: 'true',
          expert_grade: 'true'
        }
      });
      console.log(`✅ Created product: ${plan.name}`);
    } else {
      // Update existing product with new description
      await stripe.products.update(product.id, { 
        description: plan.description,
        metadata: {
          category: 'support_analytics',
          ai_powered: 'true',
          expert_grade: 'true'
        }
      });
      console.log(`ℹ️  Updated product: ${plan.name}`);
    }
    for (const price of plan.prices) {
      // Check if price exists for this product, amount, and interval
      const existing = (await stripe.prices.list({ product: product.id, limit: 100 })).data.find(
        p => p.unit_amount === price.amount && p.recurring && p.recurring.interval === price.interval
      );
      if (existing) {
        priceIds[price.key] = existing.id;
        console.log(`ℹ️  Price already exists: ${price.nickname} (${existing.id})`);
      } else {
        const created = await stripe.prices.create({
          product: product.id,
          unit_amount: price.amount,
          currency: 'usd',
          recurring: { interval: price.interval },
          nickname: price.nickname,
          metadata: {
            plan_type: price.key.split('_')[0],
            billing_cycle: price.interval,
            ai_powered: 'true'
          }
        });
        priceIds[price.key] = created.id;
        console.log(`✅ Created price: ${price.nickname} (${created.id})`);
      }
    }
  }
  fs.writeFileSync('stripe-prices.json', JSON.stringify(priceIds, null, 2));
  console.log('\n🎉 All products and prices set up with expert positioning!');
  console.log('\n💰 SUPPORTIQ PRICE IDs:');
  console.log('=======================');
  Object.entries(priceIds).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  console.log('\n📊 Products are now configured with:');
  console.log('✅ Expert-grade descriptions');
  console.log('✅ AI-powered positioning');
  console.log('✅ ROI-focused messaging');
  console.log('✅ Metadata for analytics');
})(); 
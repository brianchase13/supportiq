#!/bin/bash

echo "💳 Automated Stripe Setup for SupportIQ"
echo "=======================================\n"

# Check if Stripe CLI is logged in
if ! stripe config --list | grep -q "api_key"; then
    echo "❌ Stripe CLI not logged in. Please run 'stripe login' first."
    echo "Then run this script again."
    exit 1
fi

echo "✅ Stripe CLI authenticated"
echo "📊 Connected to: $(stripe config --list | grep "display_name" | cut -d'=' -f2 | tr -d ' ')"
echo ""

# Get API keys
echo "🔑 Getting API keys..."
STRIPE_SECRET_KEY=$(stripe config --list | grep "test_mode_api_key" | cut -d'=' -f2 | tr -d ' ')
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$(stripe config --list | grep "test_mode_pub_key" | cut -d'=' -f2 | tr -d ' ')

if [ -z "$STRIPE_SECRET_KEY" ] || [ -z "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" ]; then
    echo "❌ Could not retrieve API keys from Stripe CLI"
    exit 1
fi

echo "✅ API keys retrieved (Test Mode)"
echo ""

# Create products first
echo "📦 Creating SupportIQ products..."
echo "Creating SupportIQ Starter product..."
STARTER_PRODUCT=$(stripe products create --name="SupportIQ Starter" --description="AI-powered support analytics for growing teams" | grep '^id' | awk '{print $2}')

echo "Creating SupportIQ Growth product..."
GROWTH_PRODUCT=$(stripe products create --name="SupportIQ Growth" --description="Advanced support analytics for scaling teams" | grep '^id' | awk '{print $2}')

echo "Creating SupportIQ Enterprise product..."
ENTERPRISE_PRODUCT=$(stripe products create --name="SupportIQ Enterprise" --description="Enterprise-grade support analytics with custom features" | grep '^id' | awk '{print $2}')

# Create prices for each product
echo "Creating SupportIQ Starter (Monthly)..."
STARTER_MONTHLY_PRICE=$(stripe prices create --product="$STARTER_PRODUCT" --unit-amount=14900 --currency=usd --recurring-interval=month | grep '^id' | awk '{print $2}')

echo "Creating SupportIQ Starter (Yearly)..."
STARTER_YEARLY_PRICE=$(stripe prices create --product="$STARTER_PRODUCT" --unit-amount=134100 --currency=usd --recurring-interval=year | grep '^id' | awk '{print $2}')

echo "Creating SupportIQ Growth (Monthly)..."
GROWTH_MONTHLY_PRICE=$(stripe prices create --product="$GROWTH_PRODUCT" --unit-amount=44900 --currency=usd --recurring-interval=month | grep '^id' | awk '{print $2}')

echo "Creating SupportIQ Growth (Yearly)..."
GROWTH_YEARLY_PRICE=$(stripe prices create --product="$GROWTH_PRODUCT" --unit-amount=404100 --currency=usd --recurring-interval=year | grep '^id' | awk '{print $2}')

echo "Creating SupportIQ Enterprise (Monthly)..."
ENTERPRISE_MONTHLY_PRICE=$(stripe prices create --product="$ENTERPRISE_PRODUCT" --unit-amount=124900 --currency=usd --recurring-interval=month | grep '^id' | awk '{print $2}')

echo "Creating SupportIQ Enterprise (Yearly)..."
ENTERPRISE_YEARLY_PRICE=$(stripe prices create --product="$ENTERPRISE_PRODUCT" --unit-amount=1124100 --currency=usd --recurring-interval=year | grep '^id' | awk '{print $2}')

echo "✅ SupportIQ products created"
echo ""

# Set up webhook
echo "🔗 Setting up webhook..."
WEBHOOK_ENDPOINT="https://supportiq.vercel.app/api/stripe/webhooks"

# Check if webhook already exists
EXISTING_WEBHOOK=$(stripe webhooks list | grep "$WEBHOOK_ENDPOINT" | awk '{print $2}')

if [ -n "$EXISTING_WEBHOOK" ]; then
    echo "Webhook already exists, getting signing secret..."
    WEBHOOK_SECRET=$(stripe webhooks list | grep -A 5 "$EXISTING_WEBHOOK" | grep 'secret' | awk '{print $2}')
else
    echo "Creating new webhook for SupportIQ..."
    WEBHOOK_SECRET=$(stripe webhooks create --url="$WEBHOOK_ENDPOINT" --events=checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed | grep 'secret' | awk '{print $2}')
fi

echo "✅ Webhook configured"
echo ""

# Update .env.local
echo "📝 Updating .env.local..."
sed -i '' "s|STRIPE_SECRET_KEY=sk_test_your_stripe_key_here|STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY|" .env.local
sed -i '' "s|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY|" .env.local
sed -i '' "s|STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here|STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET|" .env.local

echo "✅ Environment variables updated"
echo ""

# Update price IDs in the code
echo "💰 Updating price IDs in code..."
cat > stripe-prices.json << EOF
{
  "starter_monthly": "$STARTER_MONTHLY_PRICE",
  "starter_yearly": "$STARTER_YEARLY_PRICE",
  "growth_monthly": "$GROWTH_MONTHLY_PRICE",
  "growth_yearly": "$GROWTH_YEARLY_PRICE",
  "enterprise_monthly": "$ENTERPRISE_MONTHLY_PRICE",
  "enterprise_yearly": "$ENTERPRISE_YEARLY_PRICE"
}
EOF

echo "✅ Price IDs saved to stripe-prices.json"
echo ""
echo "🎉 SupportIQ Stripe setup completed!"
echo ""
echo "📊 SUMMARY:"
echo "==========="
echo "✅ Using SupportIQ Stripe account"
echo "✅ API Keys configured (Test Mode)"
echo "✅ SupportIQ products created"
echo "✅ Webhook configured"
echo "✅ Environment variables updated"
echo ""
echo "💰 SUPPORTIQ PRICE IDs:"
echo "======================="
echo "Starter Monthly: $STARTER_MONTHLY_PRICE"
echo "Starter Yearly: $STARTER_YEARLY_PRICE"
echo "Growth Monthly: $GROWTH_MONTHLY_PRICE"
echo "Growth Yearly: $GROWTH_YEARLY_PRICE"
echo "Enterprise Monthly: $ENTERPRISE_MONTHLY_PRICE"
echo "Enterprise Yearly: $ENTERPRISE_YEARLY_PRICE"
echo ""
echo "🔍 Next steps:"
echo "1. Run: node check-setup.js"
echo "2. Update price IDs in your code if needed"
echo "3. Test with Stripe test card: 4242 4242 4242 4242"
echo "4. Switch to live mode when ready for production"
echo ""
echo "💡 Note: Products are created in TEST MODE"
echo "   Switch to live mode in Stripe dashboard when ready for real payments" 
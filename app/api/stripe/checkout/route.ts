import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/client';
import { apiLimiter, checkRateLimit } from '@/lib/rate-limit';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

const CheckoutRequestSchema = z.object({
  planId: z.enum(['starter', 'growth', 'enterprise']),
  billingCycle: z.enum(['monthly', 'yearly']).optional().default('monthly'),
  returnUrl: z.string().url().optional(),
  ticketVolume: z.number().min(0).optional(),
  projectedSavings: z.number().min(0).optional(),
  isTrialConversion: z.boolean().optional().default(false),
  trialEndDate: z.string().optional(),
});

// Dynamic pricing based on ticket volume and ROI - Expert-Grade Support Analytics
const PRICING_TIERS = {
  starter: {
    monthly: { price: 14900, priceId: 'price_1RksivG0iVv5fC3s1g8dt8sc' }, // $149
    yearly: { price: 134100, priceId: 'price_1RksiwG0iVv5fC3sBSPJ4Np1' }, // $1,341 (10% off)
    maxTickets: 1000,
    features: [
      'AI-Powered Ticket Analysis',
      'Smart Deflection Engine', 
      'Real-time Analytics Dashboard',
      'Email Support',
      'ROI Calculator'
    ],
    description: 'Perfect for growing teams. AI-powered support analytics that pay for themselves through ticket deflection and improved response times.',
  },
  growth: {
    monthly: { price: 44900, priceId: 'price_1RksiwG0iVv5fC3sV3R5JhJ8' }, // $449
    yearly: { price: 404100, priceId: 'price_1RksixG0iVv5fC3sBicbG5Hv' }, // $4,041 (10% off)
    maxTickets: 10000,
    features: [
      'Advanced AI Insights & Predictions',
      'Custom Knowledge Base Generation',
      'Priority Support & Onboarding',
      'Custom Integrations (Slack, Teams)',
      'Team Performance Analytics',
      'Predictive Ticket Routing'
    ],
    description: 'For scaling support teams. Advanced AI that learns your patterns and predicts issues before they become tickets.',
  },
  enterprise: {
    monthly: { price: 124900, priceId: 'price_1RksiyG0iVv5fC3s1bMq3ELj' }, // $1,249
    yearly: { price: 1124100, priceId: 'price_1RksiyG0iVv5fC3smkrQ9ZIQ' }, // $11,241 (10% off)
    maxTickets: 999999,
    features: [
      'Enterprise AI with Custom Training',
      'White-label Solutions',
      'Dedicated Success Manager',
      'Custom Development & API Access',
      'Advanced Security & Compliance',
      'Multi-workspace Management'
    ],
    description: 'Enterprise-grade support intelligence. Custom AI models trained on your data with dedicated support and white-label options.',
  },
};

export async function POST(request: NextRequest) {
  try {
    const cookieStore = request.cookies;
    const user = await auth.getUser(cookieStore); const userId = user?.id;
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await apiLimiter.checkLimit(clientIP, 'stripe_checkout');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validationResult = CheckoutRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { planId, billingCycle, returnUrl, ticketVolume, projectedSavings, isTrialConversion, trialEndDate } = validationResult.data;

    // Get user information
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate dynamic pricing and ROI
    const pricingInfo = calculateDynamicPricing(planId, billingCycle, ticketVolume, projectedSavings);
    
    // Get or create Stripe customer
    const stripeCustomer = await getOrCreateStripeCustomer(userData);

    // Prepare checkout session configuration
    const checkoutConfig: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: pricingInfo.priceId, // Use actual Stripe price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        userId,
        planId,
        billingCycle,
        ticketVolume: ticketVolume?.toString() || '0',
        projectedSavings: projectedSavings?.toString() || '0',
        roiMultiplier: pricingInfo.roiMultiplier.toString(),
        isTrialConversion: isTrialConversion.toString(),
      },
      subscription_data: {
        metadata: {
          userId,
          planId,
          billingCycle,
          isTrialConversion: isTrialConversion.toString(),
        },
      },
      // Custom fields to capture additional info
      custom_fields: [
        {
          key: 'company_size',
          label: { type: 'custom', custom: 'Company Size' },
          type: 'dropdown',
          dropdown: {
            options: [
              { label: '1-10 employees', value: 'small' },
              { label: '11-50 employees', value: 'medium' },
              { label: '51-200 employees', value: 'large' },
              { label: '200+ employees', value: 'enterprise' },
            ],
          },
        },
        {
          key: 'monthly_tickets',
          label: { type: 'custom', custom: 'Monthly Ticket Volume' },
          type: 'numeric',
          numeric: {},
          optional: true,
        },
      ],
      // The magic: Show ROI in checkout
      custom_text: {
        submit: {
          message: `💰 ROI Calculator: You'll save ${pricingInfo.monthlySavings}/month. SupportIQ costs ${pricingInfo.monthlyPrice}/month. That's ${pricingInfo.roiMultiplier}x ROI!`,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    };

    // Add trial_end for trial conversions
    if (isTrialConversion && trialEndDate) {
      checkoutConfig.subscription_data!.trial_end = Math.floor(new Date(trialEndDate).getTime() / 1000);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(checkoutConfig);

    // Store checkout session for tracking
    await supabaseAdmin
      .from('checkout_sessions')
      .insert({
        user_id: userId,
        session_id: session.id,
        plan_id: planId,
        billing_cycle: billingCycle,
        amount: pricingInfo.price,
        projected_savings: projectedSavings,
        ticket_volume: ticketVolume,
        roi_multiplier: pricingInfo.roiMultiplier,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      pricing: pricingInfo,
    });

  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout creation failed' },
      { status: 500 }
    );
  }
}

function calculateDynamicPricing(
  planId: string,
  billingCycle: string,
  ticketVolume?: number,
  projectedSavings?: number
) {
  const plan = PRICING_TIERS[planId as keyof typeof PRICING_TIERS];
  const pricing = plan[billingCycle as keyof typeof plan] as { price: number; priceId: string };
  
  // Calculate ROI messaging
  const monthlyPrice = Math.round(pricing.price / 100);
  const yearlyMultiplier = billingCycle === 'yearly' ? 12 : 1;
  const annualPrice = monthlyPrice * yearlyMultiplier;
  
  let roiMultiplier = 0;
  let monthlySavings = '$0';
  let description = plan.description || `${plan.features.join(', ')}`;
  
  if (projectedSavings && projectedSavings > 0) {
    const monthlySavingsAmount = Math.round(projectedSavings / 12);
    monthlySavings = `$${monthlySavingsAmount.toLocaleString()}`;
    roiMultiplier = Math.round((monthlySavingsAmount / monthlyPrice) * 10) / 10;
    
    description = `Save ${monthlySavings}/month with AI-powered ticket deflection. ${plan.description}`;
  }
  
  return {
    price: pricing.price,
    priceId: pricing.priceId, // Return the actual Stripe price ID
    monthlyPrice: `$${Math.round(pricing.price / 100)}`,
    annualPrice: `$${Math.round(pricing.price * yearlyMultiplier / 100)}`,
    roiMultiplier,
    monthlySavings,
    description,
    features: plan.features,
  };
}

async function getOrCreateStripeCustomer(userData: any) {
  // Check if user already has a Stripe customer ID
  if (userData.stripe_customer_id) {
    try {
      const customer = await stripe.customers.retrieve(userData.stripe_customer_id);
      if (!customer.deleted) {
        return customer;
      }
    } catch (error) {
      console.error('Error retrieving Stripe customer:', error);
    }
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: userData.email,
    name: userData.name || userData.email,
    metadata: {
      userId: userData.id,
      clerksUserId: userData.id,
    },
  });

  // Update user record with Stripe customer ID
  await supabaseAdmin
    .from('users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userData.id);

  return customer;
}

// GET endpoint for pricing information
export async function GET(request: NextRequest) {
  try {
    const cookieStore = request.cookies;
    const user = await auth.getUser(cookieStore); const userId = user?.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const ticketVolume = parseInt(url.searchParams.get('ticketVolume') || '0');
    const projectedSavings = parseInt(url.searchParams.get('projectedSavings') || '0');

    // Calculate pricing for all tiers
    const pricingData = Object.entries(PRICING_TIERS).map(([planId, plan]) => {
      const monthlyPricing = calculateDynamicPricing(planId, 'monthly', ticketVolume, projectedSavings);
      const yearlyPricing = calculateDynamicPricing(planId, 'yearly', ticketVolume, projectedSavings);
      
      return {
        planId,
        name: planId.charAt(0).toUpperCase() + planId.slice(1),
        features: plan.features,
        maxTickets: plan.maxTickets,
        monthly: monthlyPricing,
        yearly: yearlyPricing,
        recommended: planId === 'growth', // Growth plan is recommended
      };
    });

    // Add ROI messaging
    const roiMessage = projectedSavings > 0 
      ? `💰 Based on your ticket volume, you could save $${Math.round(projectedSavings / 12).toLocaleString()}/month`
      : '📊 Connect your support tool to see your personalized ROI';

    return NextResponse.json({
      pricing: pricingData,
      roiMessage,
      ticketVolume,
      projectedSavings,
    });

  } catch (error) {
    console.error('Pricing fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing' },
      { status: 500 }
    );
  }
}
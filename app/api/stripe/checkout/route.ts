import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/client';
import { apiLimiter, checkRateLimit } from '@/lib/rate-limit';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const CheckoutRequestSchema = z.object({
  planId: z.enum(['starter', 'growth', 'enterprise']),
  billingCycle: z.enum(['monthly', 'yearly']).optional().default('monthly'),
  returnUrl: z.string().url().optional(),
  ticketVolume: z.number().min(0).optional(),
  projectedSavings: z.number().min(0).optional(),
});

// Dynamic pricing based on ticket volume and ROI
const PRICING_TIERS = {
  starter: {
    monthly: { price: 14900, priceId: 'price_starter_monthly' }, // $149
    yearly: { price: 13410, priceId: 'price_starter_yearly' }, // $134.10 (10% off)
    maxTickets: 1000,
    features: ['Basic Analytics', 'Ticket Deflection', 'Email Support'],
  },
  growth: {
    monthly: { price: 44900, priceId: 'price_growth_monthly' }, // $449
    yearly: { price: 40410, priceId: 'price_growth_yearly' }, // $404.10 (10% off)
    maxTickets: 10000,
    features: ['Advanced Analytics', 'AI Insights', 'Priority Support', 'Custom Integrations'],
  },
  enterprise: {
    monthly: { price: 124900, priceId: 'price_enterprise_monthly' }, // $1,249
    yearly: { price: 112410, priceId: 'price_enterprise_yearly' }, // $1,124.10 (10% off)
    maxTickets: 999999,
    features: ['Everything', 'White-label', 'Dedicated Support', 'Custom Development'],
  },
};

export async function POST(request: NextRequest) {
  try {
    const user = await auth.getUser(); const userId = user?.id;
    const clientIP = request.ip || 'unknown';

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(apiLimiter, clientIP);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.msBeforeNext 
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validationResult = CheckoutRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { planId, billingCycle, returnUrl, ticketVolume, projectedSavings } = validationResult.data;

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
    const stripeCustomer = await getOrCreateStripeCustomer(user);

    // Create checkout session with ROI messaging
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `SupportIQ ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
              description: pricingInfo.description,
              images: ['https://yourdomain.com/logo.png'],
            },
            unit_amount: pricingInfo.price,
            recurring: {
              interval: billingCycle === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        userId,
        planId,
        billingCycle,
        ticketVolume: ticketVolume?.toString() || '0',
        projectedSavings: projectedSavings?.toString() || '0',
        roiMultiplier: pricingInfo.roiMultiplier.toString(),
      },
      subscription_data: {
        metadata: {
          userId,
          planId,
          billingCycle,
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
          numeric: {
            minimum: 0,
            maximum: 100000,
          },
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
    });

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
  let description = `${plan.features.join(', ')}`;
  
  if (projectedSavings && projectedSavings > 0) {
    const monthlySavingsAmount = Math.round(projectedSavings / 12);
    monthlySavings = `$${monthlySavingsAmount.toLocaleString()}`;
    roiMultiplier = Math.round((monthlySavingsAmount / monthlyPrice) * 10) / 10;
    
    description = `Save ${monthlySavings}/month with AI-powered ticket deflection. ${plan.features.join(', ')}`;
  }
  
  // Dynamic pricing based on ticket volume (enterprise pricing)
  let adjustedPrice = pricing.price;
  if (ticketVolume && ticketVolume > 50000) {
    adjustedPrice = Math.round(pricing.price * 1.5); // 50% premium for high volume
    description += ' (High Volume Premium)';
  }
  
  return {
    price: adjustedPrice,
    monthlyPrice: `$${Math.round(adjustedPrice / 100)}`,
    annualPrice: `$${Math.round(adjustedPrice * yearlyMultiplier / 100)}`,
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
    const user = await auth.getUser(); const userId = user?.id;
    
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
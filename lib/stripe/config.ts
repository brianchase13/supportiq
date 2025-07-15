// Marc Lou's simple Stripe setup
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

// Marc's pricing strategy: Simple, clear tiers
export const PRICING_PLANS = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    name: 'Starter',
    price: 99,
    features: [
      'Up to 1,000 tickets/month',
      'Basic insights dashboard',
      'Email support',
      '3 team members'
    ]
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    name: 'Professional', 
    price: 299,
    features: [
      'Up to 5,000 tickets/month',
      'Advanced AI insights',
      'Priority support',
      'Unlimited team members',
      'Custom integrations'
    ]
  },
  enterprise: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    name: 'Enterprise',
    price: 899,
    features: [
      'Unlimited tickets',
      'Custom AI models',
      'Dedicated success manager',
      'SLA guarantees',
      'Advanced security'
    ]
  }
} as const

export type PlanKey = keyof typeof PRICING_PLANS
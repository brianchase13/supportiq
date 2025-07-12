/**
 * Marc Lou's proven SaaS patterns for rapid development and scaling
 * Source: Marc Lou's Ship Fast methodology
 */

// 1. Simple Stripe Configuration (Marc Lou's approach)
export const MARC_LOU_STRIPE_CONFIG = {
  // Keep pricing simple - only 3 tiers maximum
  maxPricingTiers: 3,
  
  // Use annual discount strategy
  annualDiscountPercent: 20,
  
  // Marc's proven price points for SaaS
  recommendedPricing: {
    starter: 99,    // Most people's budget sweet spot
    growth: 299,    // 3x increase for serious users
    enterprise: 'custom' // Always custom for enterprise
  },
  
  // Stripe webhook essentials only
  essentialWebhooks: [
    'customer.subscription.created',
    'customer.subscription.updated', 
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed'
  ]
};

// 2. Rapid Development Patterns
export const RAPID_DEV_PATTERNS = {
  // Marc's file structure for speed
  components: {
    maxDepth: 2, // Keep component nesting shallow
    naming: 'kebab-case', // Consistent naming
    coLocation: true // Keep related files together
  },
  
  // API route patterns
  api: {
    prefixes: ['auth', 'stripe', 'analytics', 'billing'],
    responseFormat: {
      success: { data: any, message: string | undefined },
      error: { error: string, code: number | undefined }
    }
  }
};

// 3. Cost Optimization (Marc's strategies)
export const COST_OPTIMIZATION = {
  // OpenAI usage optimization
  ai: {
    model: 'gpt-4o-mini', // Much cheaper than GPT-4
    maxTokens: 1000, // Limit response length
    temperature: 0.1, // Lower temperature for consistent results
    caching: true // Cache similar queries
  },
  
  // Database query optimization
  database: {
    connectionPooling: true,
    queryTimeout: 5000, // 5 second timeout
    indexStrategy: 'essential-only' // Only index what's queried frequently
  },
  
  // Vercel function optimization
  serverless: {
    memory: 1024, // Start with 1GB
    timeout: 10, // 10 second timeout
    regions: ['us-east-1'] // Single region to start
  }
};

// 4. User Onboarding (Marc's conversion tactics)
export const ONBOARDING_PATTERNS = {
  // 5-minute value delivery
  timeToValue: {
    maxMinutes: 5,
    steps: [
      'Sign up (1 min)',
      'Connect platform (2 min)', 
      'See first insights (2 min)'
    ]
  },
  
  // Progressive disclosure
  features: {
    immediate: ['upload', 'basic-insights'],
    week1: ['automation', 'integrations'],
    week2: ['advanced-analytics', 'custom-rules']
  }
};

// 5. Metrics That Matter (Marc's KPIs)
export const SAAS_METRICS = {
  // Primary metrics to track
  primary: [
    'mrr', // Monthly Recurring Revenue
    'churn_rate', // Monthly churn rate
    'ltv', // Customer Lifetime Value
    'cac', // Customer Acquisition Cost
    'time_to_value' // How fast users get value
  ],
  
  // Secondary metrics
  secondary: [
    'daily_active_users',
    'feature_adoption_rate',
    'support_ticket_volume',
    'user_satisfaction_score'
  ]
};

// 6. Marc's Proven Email Sequences
export const EMAIL_SEQUENCES = {
  welcome: [
    { day: 0, subject: 'Welcome! Here\'s how to get started in 5 minutes' },
    { day: 1, subject: 'Did you see your first insights yet?' },
    { day: 3, subject: 'Here\'s how [Company] saved $50K with automation' },
    { day: 7, subject: 'Your free trial expires soon - any questions?' }
  ],
  
  churnPrevention: [
    { trigger: 'low_usage', subject: 'Need help getting more value from SupportIQ?' },
    { trigger: 'cancellation', subject: 'Before you go - one quick question' },
    { trigger: 'win_back', subject: 'We\'ve added features you requested' }
  ]
};

// 7. Feature Flag Strategy (Marc's approach)
export const FEATURE_FLAGS = {
  // Start with simple boolean flags
  flags: {
    'ai-automation': { defaultValue: true, premium: false },
    'advanced-analytics': { defaultValue: false, premium: true },
    'custom-integrations': { defaultValue: false, premium: true },
    'white-label': { defaultValue: false, enterprise: true }
  },
  
  // Gradual rollout strategy
  rollout: {
    beta: 0.05, // 5% of users
    stable: 0.5, // 50% of users
    full: 1.0   // 100% of users
  }
};

// 8. Marc's Security Basics (minimum viable security)
export const SECURITY_ESSENTIALS = {
  rateLimit: {
    api: '100/hour/ip',
    auth: '5/minute/ip',
    upload: '10/hour/user'
  },
  
  validation: {
    input: 'zod', // Use Zod for all input validation
    output: 'sanitize', // Sanitize all outputs
    sql: 'parameterized' // Always use parameterized queries
  },
  
  auth: {
    sessionTimeout: '7d',
    passwordMin: 8,
    mfa: 'optional' // Don't make MFA required initially
  }
};
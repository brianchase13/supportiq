/**
 * Expert-Recommended Monitoring and Analytics Setup
 * Comprehensive tracking for SaaS success metrics
 */

// 1. PostHog Configuration (Expert SaaS Analytics)
export const POSTHOG_CONFIG = {
  // Essential events for SaaS
  events: {
    // User lifecycle
    user: [
      'user_signed_up',
      'user_onboarded', 
      'user_activated',
      'user_churned',
      'user_reactivated'
    ],
    
    // Product engagement
    product: [
      'feature_used',
      'integration_connected',
      'report_generated', 
      'automation_enabled',
      'insight_viewed'
    ],
    
    // Business metrics
    business: [
      'trial_started',
      'trial_converted',
      'subscription_upgraded',
      'payment_failed',
      'support_ticket_saved'
    ]
  },
  
  // Feature flags for gradual rollout
  flags: {
    'new-dashboard': { rollout: 0.1 }, // 10% of users
    'advanced-analytics': { premium: true },
    'ai-improvements': { beta: true },
    'enterprise-features': { enterprise: true }
  },
  
  // Funnel tracking
  funnels: [
    {
      name: 'Trial to Paid',
      steps: ['trial_started', 'integration_connected', 'value_realized', 'trial_converted']
    },
    {
      name: 'User Activation',
      steps: ['user_signed_up', 'profile_completed', 'first_upload', 'first_insight']
    }
  ]
};

// 2. Sentry Configuration (Expert Error Tracking)
export const SENTRY_CONFIG = {
  // Performance monitoring
  performance: {
    tracesSampleRate: 0.1, // 10% of transactions
    profilesSampleRate: 0.1, // 10% of profiles
    beforeSend: 'filter-sensitive-data',
    integrations: ['http', 'postgres', 'redis']
  },
  
  // Error filtering
  errorFiltering: {
    ignore: [
      'ChunkLoadError', // Webpack chunk loading
      'ResizeObserver loop limit exceeded', // Browser quirk
      'Non-Error promise rejection captured' // Caught promises
    ],
    beforeSend: 'scrub-pii', // Remove personal data
    fingerprinting: 'custom-grouping'
  },
  
  // Release tracking
  releases: {
    environment: 'production',
    beforeDeploy: 'create-release',
    afterDeploy: 'mark-deployed',
    sourcemaps: true
  }
};

// 3. Business Intelligence Tracking
export const BUSINESS_METRICS = {
  // SaaS KPIs (Greg Isenberg approved)
  kpis: [
    {
      name: 'Monthly Recurring Revenue (MRR)',
      calculation: 'sum(subscription_value) monthly',
      target: 'growth > 20% monthly',
      alert: 'growth < 5%'
    },
    {
      name: 'Customer Acquisition Cost (CAC)',
      calculation: 'marketing_spend / new_customers',
      target: '< $500',
      alert: '> $1000'
    },
    {
      name: 'Lifetime Value (LTV)',
      calculation: 'avg_revenue_per_user / churn_rate',
      target: 'LTV:CAC > 3:1',
      alert: 'LTV:CAC < 3:1'
    },
    {
      name: 'Churn Rate',
      calculation: 'churned_customers / total_customers',
      target: '< 5% monthly',
      alert: '> 10% monthly'
    }
  ],
  
  // Product metrics
  product: [
    {
      name: 'Time to Value',
      measurement: 'signup to first_insight',
      target: '< 5 minutes', // Gary Tan standard
      alert: '> 10 minutes'
    },
    {
      name: 'Feature Adoption',
      measurement: 'users_using_feature / total_users',
      target: '> 60% for core features',
      alert: '< 30% adoption'
    },
    {
      name: 'Support Deflection',
      measurement: 'automated_resolutions / total_tickets',
      target: '> 85%',
      alert: '< 70%'
    }
  ]
};

// 4. Real User Monitoring (RUM)
export const RUM_CONFIG = {
  // Core Web Vitals
  vitals: {
    lcp: { target: 2500, alert: 4000 }, // Largest Contentful Paint
    fid: { target: 100, alert: 300 },   // First Input Delay
    cls: { target: 0.1, alert: 0.25 },  // Cumulative Layout Shift
    fcp: { target: 1800, alert: 3000 }, // First Contentful Paint
    ttfb: { target: 600, alert: 1800 }  // Time to First Byte
  },
  
  // Custom performance metrics
  custom: {
    timeToInteractive: { target: 3000, alert: 5000 },
    timeToValue: { target: 5000, alert: 10000 },
    apiResponseTime: { target: 200, alert: 1000 },
    errorRate: { target: 0.001, alert: 0.01 }
  },
  
  // Device and network tracking
  context: {
    devices: ['mobile', 'tablet', 'desktop'],
    networks: ['slow-2g', '2g', '3g', '4g'],
    browsers: ['chrome', 'firefox', 'safari', 'edge'],
    regions: ['us-east', 'us-west', 'eu', 'asia']
  }
};

// 5. A/B Testing Framework
export const AB_TESTING = {
  // Pricing page experiments
  pricing: [
    {
      name: 'Pricing Display',
      variants: ['monthly_first', 'annual_first', 'roi_first'],
      metric: 'trial_conversion_rate',
      duration: '2 weeks'
    },
    {
      name: 'Social Proof',
      variants: ['customer_count', 'money_saved', 'time_saved'],
      metric: 'signup_rate',
      duration: '1 week'
    }
  ],
  
  // Landing page experiments
  landing: [
    {
      name: 'Value Proposition',
      variants: ['stop_support', 'save_money', 'save_time'],
      metric: 'demo_requests',
      duration: '2 weeks'
    },
    {
      name: 'CTA Button',
      variants: ['start_trial', 'see_savings', 'get_started'],
      metric: 'click_through_rate',
      duration: '1 week'
    }
  ]
};

// 6. Customer Health Scoring
export const HEALTH_SCORING = {
  // Health score calculation
  factors: [
    { name: 'feature_usage', weight: 30, range: [0, 100] },
    { name: 'login_frequency', weight: 20, range: [0, 100] },
    { name: 'integration_count', weight: 15, range: [0, 100] },
    { name: 'support_tickets', weight: -10, range: [0, 100] },
    { name: 'payment_history', weight: 25, range: [0, 100] },
    { name: 'team_growth', weight: 10, range: [0, 100] }
  ],
  
  // Risk categories
  risk: {
    high: { score: [0, 40], action: 'immediate_intervention' },
    medium: { score: [41, 70], action: 'proactive_outreach' },
    low: { score: [71, 100], action: 'upsell_opportunity' }
  },
  
  // Automated actions
  automation: {
    'score < 30': 'trigger_retention_campaign',
    'score 30-50': 'send_help_resources',
    'score 70-85': 'suggest_upgrade',
    'score > 85': 'request_case_study'
  }
};

// 7. Revenue Attribution
export const REVENUE_ATTRIBUTION = {
  // Channel attribution
  channels: [
    { name: 'organic_search', attribution: 'last_touch' },
    { name: 'paid_search', attribution: 'first_touch' },
    { name: 'social_media', attribution: 'assisted' },
    { name: 'email_marketing', attribution: 'multi_touch' },
    { name: 'referral', attribution: 'direct' }
  ],
  
  // Campaign tracking
  campaigns: {
    utm_parameters: ['source', 'medium', 'campaign', 'term', 'content'],
    attribution_window: '30 days',
    conversion_events: ['trial_start', 'subscription_create', 'upgrade'],
    revenue_tracking: 'subscription_value'
  }
};

// 8. Alert Configuration
export const ALERTS_CONFIG = {
  // Business alerts
  business: [
    {
      name: 'Revenue Drop',
      condition: 'daily_revenue < 80% of 7_day_average',
      severity: 'critical',
      notify: ['founders', 'business_team']
    },
    {
      name: 'Churn Spike',
      condition: 'daily_churn > 200% of weekly_average',
      severity: 'high',
      notify: ['founders', 'customer_success']
    }
  ],
  
  // Technical alerts
  technical: [
    {
      name: 'API Error Rate',
      condition: 'error_rate > 1% over 5_minutes',
      severity: 'high',
      notify: ['engineering', 'on_call']
    },
    {
      name: 'Database Performance',
      condition: 'query_time > 1000ms average over 10_minutes',
      severity: 'medium',
      notify: ['engineering']
    }
  ]
};

// 9. Dashboard Configuration
export const DASHBOARDS = {
  // Executive dashboard
  executive: {
    metrics: ['mrr', 'churn', 'cac', 'ltv', 'active_users'],
    refresh: '1 hour',
    alerts: 'business_critical_only',
    timeframe: '30 days'
  },
  
  // Product dashboard
  product: {
    metrics: ['feature_adoption', 'time_to_value', 'user_engagement'],
    refresh: '15 minutes',
    alerts: 'product_issues',
    timeframe: '7 days'
  },
  
  // Engineering dashboard
  engineering: {
    metrics: ['error_rate', 'response_time', 'uptime', 'deployment_frequency'],
    refresh: '1 minute',
    alerts: 'technical_issues',
    timeframe: '24 hours'
  }
};
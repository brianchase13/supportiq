// SupportIQ Pricing Plans Configuration for Autumn
export const SUPPORTIQ_PLANS = {
  STARTER: {
    id: 'starter-plan',
    name: 'Starter',
    price: 99,
    currency: 'usd',
    interval: 'month',
    description: 'Perfect for small SaaS with basic automation needs',
    features: {
      'support-tickets': { limit: 1000, name: 'Support Tickets' },
      'ai-resolutions': { limit: 950, name: 'AI Auto-Resolutions (95%)' },
      'expert-escalations': { limit: 50, name: 'Expert Escalations' },
      'integrations': { limit: 2, name: 'Platform Integrations' },
      'weekly-insights': { limit: 4, name: 'Weekly Insight Reports' },
      'response-time': { limit: 1, name: 'Average Response Time (minutes)' }
    },
    popular: false
  },
  GROWTH: {
    id: 'growth-plan',
    name: 'Growth',
    price: 299,
    currency: 'usd',
    interval: 'month',
    description: 'For growing companies that need advanced automation',
    features: {
      'support-tickets': { limit: 10000, name: 'Support Tickets' },
      'ai-resolutions': { limit: 9500, name: 'AI Auto-Resolutions (95%)' },
      'expert-escalations': { limit: 500, name: 'Expert Escalations' },
      'integrations': { limit: 5, name: 'Platform Integrations' },
      'weekly-insights': { limit: 4, name: 'Weekly Insight Reports' },
      'response-time': { limit: 0.5, name: 'Average Response Time (minutes)' },
      'priority-support': { limit: 1, name: 'Priority Support' },
      'custom-workflows': { limit: 3, name: 'Custom Automation Workflows' }
    },
    popular: true
  },
  ENTERPRISE: {
    id: 'enterprise-plan',
    name: 'Enterprise',
    price: 'custom',
    currency: 'usd',
    interval: 'month',
    description: 'Custom solution for large organizations',
    features: {
      'support-tickets': { limit: -1, name: 'Unlimited Support Tickets' },
      'ai-resolutions': { limit: -1, name: 'AI Auto-Resolutions (98%)' },
      'expert-escalations': { limit: -1, name: 'Expert Escalations' },
      'integrations': { limit: -1, name: 'All Platform Integrations' },
      'weekly-insights': { limit: 4, name: 'Weekly Insight Reports' },
      'response-time': { limit: 0.25, name: 'Average Response Time (minutes)' },
      'priority-support': { limit: 1, name: '24/7 Priority Support' },
      'custom-workflows': { limit: -1, name: 'Unlimited Custom Workflows' },
      'dedicated-manager': { limit: 1, name: 'Dedicated Customer Success Manager' },
      'custom-integrations': { limit: 1, name: 'Custom API Integrations' },
      'sla': { limit: 1, name: '99.9% SLA Guarantee' }
    },
    popular: false
  }
};

// Usage tracking events
export const USAGE_EVENTS = {
  SUPPORT_TICKET_PROCESSED: 'support-tickets',
  AI_RESOLUTION: 'ai-resolutions',
  EXPERT_ESCALATION: 'expert-escalations',
  INTEGRATION_USED: 'integrations',
  INSIGHT_GENERATED: 'weekly-insights'
} as const;

// Helper functions for Autumn integration
export const getAutumnPlanConfig = (planId: string) => {
  const plan = Object.values(SUPPORTIQ_PLANS).find(p => p.id === planId);
  if (!plan) throw new Error(`Plan ${planId} not found`);
  return plan;
};

export const calculateMonthlySavings = (ticketsProcessed: number, autoResolutionRate: number = 0.95) => {
  const avgCostPerTicket = 12; // $12 average cost per manual ticket
  const ticketsSaved = ticketsProcessed * autoResolutionRate;
  return Math.round(ticketsSaved * avgCostPerTicket);
};

export const calculateROI = (monthlySavings: number, planCost: number) => {
  if (planCost === 0) return 0;
  return Math.round(monthlySavings / planCost);
};
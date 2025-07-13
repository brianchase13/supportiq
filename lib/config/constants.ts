// Configuration constants - NO MORE HARDCODED VALUES
export const APP_CONFIG = {
  // Pricing
  PRICING: {
    STARTER_MONTHLY: 99,
    PRO_MONTHLY: 299,
    ENTERPRISE_MONTHLY: 899,
    TRIAL_DAYS: 14,
  },

  // AI Settings
  AI: {
    DEFAULT_MODEL: 'gpt-4o-mini',
    MAX_TOKENS: 800,
    TEMPERATURE: 0.3,
    CONFIDENCE_THRESHOLD: 0.8,
    MAX_RETRIES: 3,
  },

  // Deflection Settings
  DEFLECTION: {
    DEFAULT_RATE: 0.68, // 68%
    MIN_CONFIDENCE: 0.7,
    MAX_RESPONSE_TIME: 300, // 5 minutes
    AUTO_ESCALATION_THRESHOLD: 0.5,
  },

  // Rate Limits
  RATE_LIMITS: {
    API_REQUESTS_PER_MINUTE: 100,
    AI_ANALYSIS_PER_MINUTE: 20,
    SYNC_REQUESTS_PER_HOUR: 10,
    WEBHOOK_REQUESTS_PER_MINUTE: 50,
  },

  // Business Logic
  BUSINESS: {
    AVERAGE_TICKET_COST: 25, // USD
    AGENT_HOURLY_RATE: 30, // USD
    TARGET_RESPONSE_TIME: 30, // minutes
    TARGET_SATISFACTION: 4.0, // out of 5
    MONEY_BACK_GUARANTEE_DAYS: 30,
    ROI_THRESHOLD: 500, // 500%
  },

  // Database
  DATABASE: {
    MAX_TICKETS_PER_SYNC: 1000,
    BATCH_SIZE: 50,
    RETENTION_DAYS: 365,
  },

  // Security
  SECURITY: {
    SESSION_DURATION_HOURS: 168, // 7 days
    PASSWORD_MIN_LENGTH: 8,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15,
  },

  // Monitoring
  MONITORING: {
    ERROR_ALERT_THRESHOLD: 5,
    PERFORMANCE_ALERT_THRESHOLD: 2000, // ms
    CRISIS_TICKET_THRESHOLD: 50, // tickets per hour
  },
} as const;

// Environment-specific overrides
export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    return {
      ...APP_CONFIG,
      AI: {
        ...APP_CONFIG.AI,
        MAX_TOKENS: 1000, // Higher limits in production
      },
      RATE_LIMITS: {
        ...APP_CONFIG.RATE_LIMITS,
        API_REQUESTS_PER_MINUTE: 200, // Higher limits in production
      },
    };
  }
  
  return APP_CONFIG;
}; 
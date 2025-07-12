/**
 * Expert-Recommended Security Hardening
 * Production-ready security patterns for SaaS applications
 */

// 1. Authentication Security (Better Auth + Expert Patterns)
export const AUTH_SECURITY = {
  // Session management
  sessions: {
    duration: '7 days', // Marc Lou's recommendation
    rotation: 'on_sensitive_action', // Rotate on important actions
    storage: 'httpOnly_secure_cookies', // Secure cookie storage
    invalidation: 'all_devices_on_password_change'
  },
  
  // Password requirements
  passwords: {
    minLength: 8, // Don't make it too hard (Marc Lou)
    requireMix: false, // Don't be annoying
    bcryptRounds: 12, // Balance security/performance
    breachCheck: true, // Check against known breaches
    history: 5 // Prevent reuse of last 5
  },
  
  // Multi-factor authentication
  mfa: {
    required: false, // Optional to start (Marc Lou)
    methods: ['authenticator', 'sms'], // Standard options
    backup_codes: 10, // Recovery codes
    grace_period: '24 hours' // Setup grace period
  }
};

// 2. API Security Hardening
export const API_SECURITY = {
  // Rate limiting (Production-ready)
  rateLimiting: {
    global: '1000/hour/ip', // Global limit
    auth: '5/minute/ip', // Login attempts
    api: '100/minute/user', // Per-user API calls
    upload: '10/hour/user', // File uploads
    expensive: '10/minute/user' // AI analysis calls
  },
  
  // Input validation
  validation: {
    library: 'zod', // Type-safe validation
    sanitization: 'dompurify', // HTML sanitization
    size_limits: {
      json: '1mb',
      file: '10mb',
      csv: '50mb'
    },
    whitelist: 'strict' // Only allow expected fields
  },
  
  // Output security
  output: {
    cors: {
      origin: ['https://supportiq.com', 'https://*.supportiq.com'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000'
    }
  }
};

// 3. Database Security
export const DATABASE_SECURITY = {
  // Row Level Security (RLS)
  rls: {
    enabled: true,
    policies: [
      'users can only see their own data',
      'admins can see all data in their organization',
      'analytics are aggregated and anonymized'
    ]
  },
  
  // Query security
  queries: {
    parameterized: 'always', // Never use string interpolation
    timeout: 30000, // 30 second timeout
    connection_limit: 20, // Max connections
    ssl: 'require' // Always use SSL
  },
  
  // Data encryption
  encryption: {
    at_rest: 'database_level', // Supabase handles this
    in_transit: 'tls_1_3', // Modern TLS
    sensitive_fields: ['email', 'payment_info'], // Field-level encryption
    keys: 'managed_service' // Let Supabase manage keys
  }
};

// 4. Infrastructure Security
export const INFRASTRUCTURE_SECURITY = {
  // Vercel security
  vercel: {
    functions: {
      timeout: 10, // 10 second timeout
      memory: 1024, // 1GB memory limit
      environment: 'isolated', // Function isolation
      secrets: 'environment_variables' // Secure secret storage
    },
    
    domains: {
      https: 'enforced', // Always HTTPS
      hsts: 'enabled', // HTTP Strict Transport Security
      csp: 'strict', // Content Security Policy
      certificates: 'auto_renewal' // Automatic SSL renewal
    }
  },
  
  // Environment separation
  environments: {
    production: {
      debug: false,
      logging: 'errors_only',
      source_maps: false,
      telemetry: 'minimal'
    },
    staging: {
      debug: false,
      logging: 'verbose',
      source_maps: true,
      telemetry: 'full'
    }
  }
};

// 5. Data Privacy & Compliance
export const PRIVACY_COMPLIANCE = {
  // GDPR compliance
  gdpr: {
    data_collection: 'explicit_consent',
    data_retention: '2 years after last activity',
    data_portability: 'json_export',
    right_to_deletion: 'automated_process',
    privacy_policy: 'clear_and_accessible'
  },
  
  // Data minimization
  minimization: {
    collect: 'only_necessary_data',
    store: 'encrypted_sensitive_data',
    process: 'pseudonymized_analytics',
    share: 'never_with_third_parties'
  },
  
  // User rights
  user_rights: {
    access: 'self_service_export',
    rectification: 'user_editable_profile',
    deletion: 'one_click_account_deletion',
    portability: 'standard_format_export'
  }
};

// 6. Monitoring & Incident Response
export const SECURITY_MONITORING = {
  // Security events to track
  events: [
    'failed_login_attempts',
    'password_changes',
    'admin_actions',
    'data_exports',
    'api_key_usage',
    'suspicious_activity'
  ],
  
  // Threat detection
  threats: {
    brute_force: 'rate_limiting + account_lockout',
    sql_injection: 'parameterized_queries + waf',
    xss: 'content_security_policy + sanitization',
    csrf: 'same_site_cookies + csrf_tokens'
  },
  
  // Incident response
  incident_response: {
    detection: 'automated_alerts',
    isolation: 'immediate_account_suspension',
    investigation: 'audit_log_analysis',
    recovery: 'verified_cleanup_process',
    documentation: 'incident_report_required'
  }
};

// 7. Third-party Security
export const THIRD_PARTY_SECURITY = {
  // Vendor assessment
  vendors: {
    soc2: 'required_for_data_processors',
    gdpr: 'compliant_data_processing_agreements',
    encryption: 'in_transit_and_at_rest',
    access: 'principle_of_least_privilege'
  },
  
  // API integrations
  integrations: {
    authentication: 'oauth2_or_api_keys',
    authorization: 'scoped_permissions',
    rate_limiting: 'respect_vendor_limits',
    error_handling: 'graceful_degradation'
  }
};

// 8. Security Testing
export const SECURITY_TESTING = {
  // Automated testing
  automated: [
    'dependency_vulnerability_scanning',
    'sast_static_analysis',
    'dast_dynamic_analysis',
    'container_security_scanning'
  ],
  
  // Manual testing
  manual: [
    'penetration_testing_quarterly',
    'code_review_security_focus',
    'social_engineering_testing',
    'business_logic_testing'
  ],
  
  // Compliance testing
  compliance: [
    'gdpr_compliance_audit',
    'security_policy_review',
    'access_control_verification',
    'data_flow_analysis'
  ]
};

// 9. Security Configuration Checklist
export const SECURITY_CHECKLIST = {
  // Pre-deployment
  pre_deployment: [
    '✓ All secrets in environment variables',
    '✓ No hardcoded credentials in code',
    '✓ HTTPS enforced everywhere',
    '✓ Security headers configured',
    '✓ Rate limiting implemented',
    '✓ Input validation on all endpoints',
    '✓ Database RLS policies active',
    '✓ Error messages sanitized'
  ],
  
  // Production maintenance
  production: [
    '✓ Security updates applied monthly',
    '✓ Access logs reviewed weekly',
    '✓ Vulnerability scans run automatically',
    '✓ Incident response plan tested',
    '✓ Backup and recovery verified',
    '✓ Security training for team',
    '✓ Third-party security assessments',
    '✓ Compliance audits scheduled'
  ]
};

// 10. Emergency Response
export const EMERGENCY_RESPONSE = {
  // Security incident response
  incident_types: {
    data_breach: {
      response_time: '< 1 hour',
      actions: ['isolate_system', 'assess_scope', 'notify_authorities'],
      notification: 'regulatory_and_customers'
    },
    service_disruption: {
      response_time: '< 15 minutes',
      actions: ['switch_to_backup', 'investigate_cause', 'communicate_status'],
      notification: 'customers_and_stakeholders'
    },
    unauthorized_access: {
      response_time: '< 30 minutes',
      actions: ['revoke_access', 'change_credentials', 'audit_activity'],
      notification: 'internal_team_first'
    }
  },
  
  // Communication plan
  communication: {
    internal: 'security_team_chat + email',
    customers: 'status_page + email_notifications',
    authorities: 'legal_team_coordinates',
    media: 'ceo_or_designated_spokesperson_only'
  }
};
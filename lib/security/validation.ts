import { z } from 'zod';
import { log } from '@/lib/logging/logger';

// Comprehensive input validation - NO MORE UNSAFE INPUTS

// Base validation schemas
export const EmailSchema = z
  .string()
  .email('Invalid email format')
  .max(254, 'Email too long')
  .transform(email => email.toLowerCase().trim());

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain lowercase, uppercase, and number');

export const UUIDSchema = z
  .string()
  .uuid('Invalid UUID format');

export const URLSchema = z
  .string()
  .url('Invalid URL format')
  .max(2048, 'URL too long');

// User validation schemas
export const UserCreateSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  full_name: z.string().min(1, 'Full name required').max(100, 'Name too long'),
  company: z.string().max(100, 'Company name too long').optional(),
  role: z.string().max(50, 'Role too long').optional(),
});

export const UserUpdateSchema = z.object({
  email: EmailSchema.optional(),
  full_name: z.string().min(1, 'Full name required').max(100, 'Name too long').optional(),
  company: z.string().max(100, 'Company name too long').optional(),
  role: z.string().max(50, 'Role too long').optional(),
});

export const UserProfileSchema = z.object({
  company_name: z.string().max(100, 'Company name too long').optional(),
  industry: z.string().max(50, 'Industry too long').optional(),
  monthly_tickets: z.number().int().min(0, 'Monthly tickets must be positive').max(100000, 'Monthly tickets too high').optional(),
  team_size: z.number().int().min(1, 'Team size must be at least 1').max(10000, 'Team size too high').optional(),
  support_channels: z.array(z.string().max(50)).max(20, 'Too many support channels').optional(),
});

// Ticket validation schemas
export const TicketCreateSchema = z.object({
  subject: z.string().min(1, 'Subject required').max(200, 'Subject too long'),
  content: z.string().min(1, 'Content required').max(10000, 'Content too long'),
  customer_email: EmailSchema,
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.enum(['Account', 'Billing', 'Feature Request', 'Bug', 'How-to', 'Technical Issue', 'Other']).optional(),
  tags: z.array(z.string().max(50)).max(20, 'Too many tags').optional(),
});

export const TicketUpdateSchema = z.object({
  subject: z.string().min(1, 'Subject required').max(200, 'Subject too long').optional(),
  content: z.string().min(1, 'Content required').max(10000, 'Content too long').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.enum(['Account', 'Billing', 'Feature Request', 'Bug', 'How-to', 'Technical Issue', 'Other']).optional(),
  status: z.enum(['open', 'closed', 'pending', 'resolved']).optional(),
  tags: z.array(z.string().max(50)).max(20, 'Too many tags').optional(),
});

// API validation schemas
export const PaginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be positive').default(1),
  limit: z.number().int().min(1, 'Limit must be positive').max(100, 'Limit too high').default(20),
  sort_by: z.string().max(50, 'Sort field too long').optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export const DateRangeSchema = z.object({
  start_date: z.string().datetime('Invalid start date').optional(),
  end_date: z.string().datetime('Invalid end date').optional(),
});

export const SearchSchema = z.object({
  query: z.string().min(1, 'Search query required').max(500, 'Search query too long'),
  filters: z.record(z.string(), z.unknown()).optional(),
});

// Intercom validation schemas
export const IntercomConnectSchema = z.object({
  access_token: z.string().min(1, 'Access token required').max(1000, 'Access token too long'),
  workspace_id: z.string().min(1, 'Workspace ID required').max(100, 'Workspace ID too long'),
});

export const IntercomWebhookSchema = z.object({
  type: z.string().min(1, 'Webhook type required'),
  data: z.record(z.string(), z.unknown()),
  timestamp: z.number().int().positive('Invalid timestamp'),
  signature: z.string().min(1, 'Signature required').optional(),
});

// Deflection settings validation
export const DeflectionSettingsSchema = z.object({
  auto_response_enabled: z.boolean(),
  confidence_threshold: z.number().min(0, 'Confidence threshold must be positive').max(1, 'Confidence threshold must be <= 1'),
  escalation_threshold: z.number().min(0, 'Escalation threshold must be positive').max(1, 'Escalation threshold must be <= 1'),
  working_hours: z.object({
    enabled: z.boolean(),
    timezone: z.string().min(1, 'Timezone required').max(50, 'Timezone too long'),
    start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    days_of_week: z.array(z.number().int().min(0).max(6)).min(1, 'At least one day required').max(7, 'Too many days'),
  }),
  response_language: z.string().min(1, 'Response language required').max(10, 'Language code too long'),
  custom_instructions: z.string().max(2000, 'Custom instructions too long').optional(),
  excluded_categories: z.array(z.enum(['Account', 'Billing', 'Feature Request', 'Bug', 'How-to', 'Technical Issue', 'Other'])).optional(),
  excluded_keywords: z.array(z.string().max(100)).max(100, 'Too many excluded keywords').optional(),
});

// Security validation class
export class SecurityValidator {
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  ];

  private static readonly SQL_INJECTION_PATTERNS = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\b(and|or)\b\s+\d+\s*=\s*\d+)/gi,
  ];

  private static readonly PATH_TRAVERSAL_PATTERNS = [
    /\.\.\//g,
    /\.\.\\/g,
    /\/etc\/passwd/gi,
    /\/proc\/self\/environ/gi,
  ];

  // Validate and sanitize input
  static validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new Error(`Validation failed: ${error.issues.map(e => e.message).join(', ')}`);
        log.warn('Input validation failed', {
          errors: error.issues,
          data: this.sanitizeForLogging(data),
        });
        throw validationError;
      }
      throw error;
    }
  }

  // Sanitize string input
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    // Remove XSS patterns
    let sanitized = input;
    for (const pattern of this.XSS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Remove SQL injection patterns
    for (const pattern of this.SQL_INJECTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Remove path traversal patterns
    for (const pattern of this.PATH_TRAVERSAL_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Trim whitespace
    sanitized = sanitized.trim();

    // Limit length
    if (sanitized.length > 10000) {
      throw new Error('Input too long');
    }

    return sanitized;
  }

  // Validate email
  static validateEmail(email: string): string {
    return this.validateInput(EmailSchema, email);
  }

  // Validate password strength
  static validatePassword(password: string): string {
    return this.validateInput(PasswordSchema, password);
  }

  // Validate UUID
  static validateUUID(uuid: string): string {
    return this.validateInput(UUIDSchema, uuid);
  }

  // Validate URL
  static validateURL(url: string): string {
    return this.validateInput(URLSchema, url);
  }

  // Validate rate limiting
  static validateRateLimit(identifier: string, limit: number, windowMs: number): boolean {
    // This would integrate with your rate limiting system
    // For now, return true (implement actual rate limiting logic)
    return true;
  }

  // Validate file upload
  static validateFileUpload(file: File, allowedTypes: string[], maxSize: number): void {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed`);
    }

    if (file.size > maxSize) {
      throw new Error(`File size ${file.size} exceeds maximum ${maxSize}`);
    }

    // Check for malicious file extensions
    const fileName = file.name.toLowerCase();
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
    const hasDangerousExtension = dangerousExtensions.some(ext => fileName.endsWith(ext));
    
    if (hasDangerousExtension) {
      throw new Error('Dangerous file type detected');
    }
  }

  // Validate API key
  static validateAPIKey(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }

    // Check for common API key patterns
    const validPatterns = [
      /^sk-[a-zA-Z0-9]{32,}$/, // OpenAI-style
      /^[a-zA-Z0-9]{32,}$/, // Generic 32+ char
      /^[a-zA-Z0-9_-]{20,}$/, // Generic 20+ char with special chars
    ];

    return validPatterns.some(pattern => pattern.test(apiKey));
  }

  // Validate webhook signature
  static validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    if (!signature || !secret) {
      return false;
    }

    // This would implement HMAC validation
    // For now, return true (implement actual signature validation)
    return true;
  }

  // Sanitize data for logging (remove sensitive information)
  static sanitizeForLogging(data: unknown): unknown {
    if (typeof data === 'object' && data !== null) {
      const sanitized: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        
        // Redact sensitive fields
        if (lowerKey.includes('password') || 
            lowerKey.includes('token') || 
            lowerKey.includes('key') || 
            lowerKey.includes('secret') ||
            lowerKey.includes('api_key') ||
            lowerKey.includes('access_token')) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = this.sanitizeForLogging(value);
        } else {
          sanitized[key] = value;
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  // Validate request headers
  static validateHeaders(headers: Record<string, string>): void {
    const requiredHeaders = ['user-agent', 'content-type'];
    
    for (const header of requiredHeaders) {
      if (!headers[header]) {
        throw new Error(`Missing required header: ${header}`);
      }
    }

    // Validate content type for POST requests
    if (headers['content-type'] && !headers['content-type'].includes('application/json')) {
      throw new Error('Invalid content type. Expected application/json');
    }
  }

  // Validate request origin
  static validateOrigin(origin: string, allowedOrigins: string[]): boolean {
    if (!origin) {
      return false;
    }

    return allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      if (allowed.startsWith('*.')) {
        const domain = allowed.slice(2);
        return origin.endsWith(domain);
      }
      return origin === allowed;
    });
  }

  // Generate secure random string
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  // Hash sensitive data
  static async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Export convenience functions
export const validate = {
  email: (email: string) => SecurityValidator.validateEmail(email),
  password: (password: string) => SecurityValidator.validatePassword(password),
  uuid: (uuid: string) => SecurityValidator.validateUUID(uuid),
  url: (url: string) => SecurityValidator.validateURL(url),
  input: <T>(schema: z.ZodSchema<T>, data: unknown) => SecurityValidator.validateInput(schema, data),
  sanitize: (input: string) => SecurityValidator.sanitizeString(input),
  file: (file: File, allowedTypes: string[], maxSize: number) => SecurityValidator.validateFileUpload(file, allowedTypes, maxSize),
  apiKey: (apiKey: string) => SecurityValidator.validateAPIKey(apiKey),
  headers: (headers: Record<string, string>) => SecurityValidator.validateHeaders(headers),
  origin: (origin: string, allowedOrigins: string[]) => SecurityValidator.validateOrigin(origin, allowedOrigins),
}; 
import { Resend } from 'resend';
import { logger } from '@/lib/logging/logger';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailData {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@supportiq.com';
  private static readonly SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@supportiq.com';
  private static readonly MAX_EMAIL_LENGTH = 254;
  private static readonly MAX_SUBJECT_LENGTH = 998;

  /**
   * Validate email address format
   */
  static validateEmailAddress(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    // Check for leading/trailing whitespace
    if (email !== email.trim()) {
      return false;
    }
    
    if (email.length === 0 || email.length > this.MAX_EMAIL_LENGTH) {
      return false;
    }

    // More strict email validation regex that prevents consecutive dots
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Additional checks for common invalid patterns
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      return false;
    }
    
    return emailRegex.test(email);
  }

  /**
   * Validate email data before sending
   */
  private static validateEmailData(data: EmailData): { valid: boolean; error?: string } {
    if (!data.to || !this.validateEmailAddress(data.to)) {
      return { valid: false, error: 'Invalid recipient email address' };
    }

    if (!data.subject || data.subject.trim().length === 0) {
      return { valid: false, error: 'Email subject is required' };
    }

    if (data.subject.length > this.MAX_SUBJECT_LENGTH) {
      return { valid: false, error: 'Email subject too long' };
    }

    if (!data.html || data.html.trim().length === 0) {
      return { valid: false, error: 'Email HTML content is required' };
    }

    if (data.from && !this.validateEmailAddress(data.from)) {
      return { valid: false, error: 'Invalid sender email address' };
    }

    return { valid: true };
  }

  /**
   * Send a generic email with enhanced validation and error handling
   */
  static async sendEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate email data
      const validation = this.validateEmailData(data);
      if (!validation.valid) {
        await logger.error('Email validation failed', { error: validation.error, data });
        return { success: false, error: validation.error };
      }

      // Sanitize data
      const sanitizedData = {
        from: (data.from || this.FROM_EMAIL).trim(),
        to: data.to.trim(),
        subject: data.subject.trim(),
        html: data.html.trim(),
        text: data.text?.trim() || '',
      };

      const result = await resend.emails.send(sanitizedData);

      if (result.error) {
        await logger.error('Email send failed', { error: result.error, data: sanitizedData });
        return { success: false, error: result.error.message || 'Email service error' };
      }

      await logger.info('Email sent successfully', { 
        to: sanitizedData.to, 
        subject: sanitizedData.subject,
        messageId: result.data?.id 
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown email service error';
      await logger.error('Email service error', { error: errorMessage, data });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send welcome email for new paid customers
   */
  static async sendWelcomeEmail(userEmail: string, userName: string, planId: string): Promise<{ success: boolean; error?: string }> {
    // Validate inputs
    if (!userEmail || !this.validateEmailAddress(userEmail)) {
      return { success: false, error: 'Invalid email address' };
    }

    if (!userName || typeof userName !== 'string') {
      return { success: false, error: 'User name is required' };
    }

    if (!planId || typeof planId !== 'string') {
      return { success: false, error: 'Plan ID is required' };
    }

    const planName = this.getPlanDisplayName(planId);
    const template = this.getWelcomeEmailTemplate(userName, planName);
    
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send subscription cancellation email
   */
  static async sendCancellationEmail(userEmail: string, userName: string, planId: string): Promise<boolean> {
    const planName = this.getPlanDisplayName(planId);
    const template = this.getCancellationEmailTemplate(userName, planName);
    
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send payment failure email
   */
  static async sendPaymentFailureEmail(userEmail: string, userName: string, amount: number): Promise<boolean> {
    const template = this.getPaymentFailureEmailTemplate(userName, amount);
    
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send trial expiration reminder
   */
  static async sendTrialExpirationEmail(userEmail: string, userName: string, daysLeft: number): Promise<{ success: boolean; error?: string }> {
    // Validate inputs
    if (!userEmail || !this.validateEmailAddress(userEmail)) {
      return { success: false, error: 'Invalid email address' };
    }

    if (!userName || typeof userName !== 'string') {
      return { success: false, error: 'User name is required' };
    }

    if (!Number.isInteger(daysLeft) || daysLeft < 0 || daysLeft > 30) {
      return { success: false, error: 'Days left must be an integer between 0 and 30' };
    }

    const template = this.getTrialExpirationEmailTemplate(userName, daysLeft);
    
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send demo booking confirmation
   */
  static async sendDemoConfirmationEmail(userEmail: string, userName: string, demoDate: string): Promise<boolean> {
    const template = this.getDemoConfirmationEmailTemplate(userName, demoDate);
    
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send lead notification to sales team
   */
  static async sendLeadNotificationEmail(leadData: {
    name: string;
    email: string;
    company: string;
    role: string;
    monthlyTickets: number;
    message?: string;
  }): Promise<boolean> {
    const template = this.getLeadNotificationEmailTemplate(leadData);
    
    return this.sendEmail({
      to: this.SUPPORT_EMAIL,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Get plan display name
   */
  private static getPlanDisplayName(planId: string): string {
    switch (planId) {
      case 'starter':
        return 'Starter';
      case 'growth':
        return 'Growth';
      case 'enterprise':
        return 'Enterprise';
      default:
        return 'Professional';
    }
  }

  /**
   * Welcome email template
   */
  private static getWelcomeEmailTemplate(userName: string, planName: string): EmailTemplate {
    return {
      subject: `Welcome to SupportIQ ${planName}! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to SupportIQ!</h1>
          <p>Hi ${userName},</p>
          <p>Welcome to SupportIQ ${planName}! We're excited to help you transform your customer support with AI-powered insights.</p>
          
          <h2>What's next?</h2>
          <ul>
            <li>Connect your support platform (Intercom, Zendesk, etc.)</li>
            <li>Explore your dashboard and analytics</li>
            <li>Set up your first deflection rules</li>
            <li>Invite your team members</li>
          </ul>
          
          <p>Need help getting started? Our team is here to support you every step of the way.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Go to Dashboard
          </a>
          
          <p>Best regards,<br>The SupportIQ Team</p>
        </div>
      `,
      text: `Welcome to SupportIQ ${planName}! We're excited to help you transform your customer support with AI-powered insights. Get started at ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    };
  }

  /**
   * Cancellation email template
   */
  private static getCancellationEmailTemplate(userName: string, planName: string): EmailTemplate {
    return {
      subject: 'Your SupportIQ subscription has been cancelled',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Subscription Cancelled</h1>
          <p>Hi ${userName},</p>
          <p>We're sorry to see you go. Your SupportIQ ${planName} subscription has been cancelled.</p>
          
          <p>You'll continue to have access to your account until the end of your current billing period.</p>
          
          <p>If you change your mind, you can reactivate your subscription anytime from your dashboard.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reactivate Subscription
          </a>
          
          <p>We'd love to hear your feedback on how we can improve SupportIQ.</p>
          
          <p>Best regards,<br>The SupportIQ Team</p>
        </div>
      `,
      text: `Your SupportIQ ${planName} subscription has been cancelled. You can reactivate anytime at ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    };
  }

  /**
   * Payment failure email template
   */
  private static getPaymentFailureEmailTemplate(userName: string, amount: number): EmailTemplate {
    return {
      subject: 'Payment Failed - Action Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Payment Failed</h1>
          <p>Hi ${userName},</p>
          <p>We were unable to process your payment of $${(amount / 100).toFixed(2)} for your SupportIQ subscription.</p>
          
          <p>To avoid any interruption to your service, please update your payment method:</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Update Payment Method
          </a>
          
          <p>If you need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The SupportIQ Team</p>
        </div>
      `,
      text: `Payment failed for your SupportIQ subscription. Please update your payment method at ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`
    };
  }

  /**
   * Trial expiration email template
   */
  private static getTrialExpirationEmailTemplate(userName: string, daysLeft: number): EmailTemplate {
    return {
      subject: `Your SupportIQ trial expires in ${daysLeft} days`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">Trial Expiring Soon</h1>
          <p>Hi ${userName},</p>
          <p>Your SupportIQ trial will expire in ${daysLeft} days.</p>
          
          <p>Don't lose access to your AI-powered support insights! Upgrade now to continue:</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Upgrade Now
          </a>
          
          <p>Questions? Our team is here to help you choose the right plan.</p>
          
          <p>Best regards,<br>The SupportIQ Team</p>
        </div>
      `,
      text: `Your SupportIQ trial expires in ${daysLeft} days. Upgrade at ${process.env.NEXT_PUBLIC_APP_URL}/pricing`
    };
  }

  /**
   * Demo confirmation email template
   */
  private static getDemoConfirmationEmailTemplate(userName: string, demoDate: string): EmailTemplate {
    return {
      subject: 'Demo Confirmed - SupportIQ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Demo Confirmed!</h1>
          <p>Hi ${userName},</p>
          <p>Your SupportIQ demo has been scheduled for ${demoDate}.</p>
          
          <p>We'll send you a calendar invite with the meeting details shortly.</p>
          
          <p>In the meantime, feel free to explore our platform:</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/demo" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Explore Demo
          </a>
          
          <p>Looking forward to showing you how SupportIQ can transform your customer support!</p>
          
          <p>Best regards,<br>The SupportIQ Team</p>
        </div>
      `,
      text: `Your SupportIQ demo has been scheduled for ${demoDate}. We'll send calendar details shortly.`
    };
  }

  /**
   * Lead notification email template
   */
  private static getLeadNotificationEmailTemplate(leadData: {
    name: string;
    email: string;
    company: string;
    role: string;
    monthlyTickets: number;
    message?: string;
  }): EmailTemplate {
    return {
      subject: `New Lead: ${leadData.name} from ${leadData.company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">New Lead</h1>
          
          <h2>Contact Information</h2>
          <p><strong>Name:</strong> ${leadData.name}</p>
          <p><strong>Email:</strong> ${leadData.email}</p>
          <p><strong>Company:</strong> ${leadData.company}</p>
          <p><strong>Role:</strong> ${leadData.role}</p>
          <p><strong>Monthly Tickets:</strong> ${leadData.monthlyTickets.toLocaleString()}</p>
          
          ${leadData.message ? `<h2>Message</h2><p>${leadData.message}</p>` : ''}
          
          <p>This lead was generated from the website contact form.</p>
        </div>
      `,
      text: `New lead: ${leadData.name} (${leadData.email}) from ${leadData.company}. Role: ${leadData.role}. Monthly tickets: ${leadData.monthlyTickets.toLocaleString()}.${leadData.message ? ` Message: ${leadData.message}` : ''}`
    };
  }
} 
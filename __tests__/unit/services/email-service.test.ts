import { EmailService } from '@/lib/services/email-service';
import { Resend } from 'resend';

// Mock Resend
jest.mock('resend');
const mockResend = Resend as jest.MockedClass<typeof Resend>;

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateEmailAddress', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        '123@numbers.com',
        'test@subdomain.example.com'
      ];

      validEmails.forEach(email => {
        expect(EmailService.validateEmailAddress(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test@.com',
        'test..test@example.com',
        'test@example..com',
        'test@example.com.',
        '.test@example.com'
      ];

      invalidEmails.forEach(email => {
        expect(EmailService.validateEmailAddress(email)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(EmailService.validateEmailAddress('')).toBe(false);
      expect(EmailService.validateEmailAddress(null as any)).toBe(false);
      expect(EmailService.validateEmailAddress(undefined as any)).toBe(false);
      expect(EmailService.validateEmailAddress('   test@example.com   ')).toBe(false);
    });

    it('should handle very long email addresses', () => {
      const longEmail = 'a'.repeat(255) + '@example.com';
      expect(EmailService.validateEmailAddress(longEmail)).toBe(false);
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const mockSend = jest.fn().mockResolvedValue({ data: { id: 'mock-message-id' } });
      mockResend.prototype.emails = { send: mockSend };

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
        text: 'Test content'
      };

      const result = await EmailService.sendEmail(emailData);

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith({
        from: 'noreply@supportiq.com',
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
        text: 'Test content',
      });
    });

    it('should handle email send failure', async () => {
      const mockSend = jest.fn().mockResolvedValue({ 
        error: { message: 'Email service error' } 
      });
      mockResend.prototype.emails = { send: mockSend };

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      };

      const result = await EmailService.sendEmail(emailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email service error');
    });

    it('should handle invalid email data', async () => {
      const emailData = {
        to: 'invalid-email',
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      };

      const result = await EmailService.sendEmail(emailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid recipient email address');
    });

    it('should handle missing subject', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: '',
        html: '<p>Test content</p>'
      };

      const result = await EmailService.sendEmail(emailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email subject is required');
    });

    it('should handle missing HTML content', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: ''
      };

      const result = await EmailService.sendEmail(emailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email HTML content is required');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      const mockSend = jest.fn().mockResolvedValue({ data: { id: 'mock-message-id' } });
      mockResend.prototype.emails = { send: mockSend };

      const result = await EmailService.sendWelcomeEmail('test@example.com', 'John Doe', 'growth');

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith({
        from: 'noreply@supportiq.com',
        to: 'test@example.com',
        subject: 'Welcome to SupportIQ Growth! 🎉',
        html: expect.stringContaining('Welcome to SupportIQ'),
        text: expect.stringContaining('Welcome to SupportIQ')
      });
    });

    it('should handle invalid email address', async () => {
      const result = await EmailService.sendWelcomeEmail('invalid-email', 'John Doe', 'growth');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email address');
    });

    it('should handle empty email address', async () => {
      const result = await EmailService.sendWelcomeEmail('', 'John Doe', 'growth');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email address');
    });

    it('should handle null email address', async () => {
      const result = await EmailService.sendWelcomeEmail(null as any, 'John Doe', 'growth');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email address');
    });

    it('should handle missing user name', async () => {
      const result = await EmailService.sendWelcomeEmail('test@example.com', '', 'growth');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User name is required');
    });

    it('should handle missing plan ID', async () => {
      const result = await EmailService.sendWelcomeEmail('test@example.com', 'John Doe', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Plan ID is required');
    });
  });

  describe('sendTrialExpirationEmail', () => {
    it('should send trial expiration email successfully', async () => {
      const mockSend = jest.fn().mockResolvedValue({ data: { id: 'mock-message-id' } });
      mockResend.prototype.emails = { send: mockSend };

      const result = await EmailService.sendTrialExpirationEmail('test@example.com', 'John Doe', 3);

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith({
        from: 'noreply@supportiq.com',
        to: 'test@example.com',
        subject: expect.stringContaining('trial expires in 3 days'),
        html: expect.stringContaining('Trial Expiring Soon'),
        text: expect.stringContaining('trial expires in 3 days')
      });
    });

    it('should handle invalid days remaining', async () => {
      const result = await EmailService.sendTrialExpirationEmail('test@example.com', 'John Doe', -1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Days left must be an integer between 0 and 30');
    });

    it('should handle zero days remaining', async () => {
      const mockSend = jest.fn().mockResolvedValue({ data: { id: 'mock-message-id' } });
      mockResend.prototype.emails = { send: mockSend };

      const result = await EmailService.sendTrialExpirationEmail('test@example.com', 'John Doe', 0);

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith({
        from: 'noreply@supportiq.com',
        to: 'test@example.com',
        subject: expect.stringContaining('trial expires in 0 days'),
        html: expect.stringContaining('Trial Expiring Soon'),
        text: expect.stringContaining('trial expires in 0 days')
      });
    });

    it('should handle very high days remaining', async () => {
      const result = await EmailService.sendTrialExpirationEmail('test@example.com', 'John Doe', 31);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Days left must be an integer between 0 and 30');
    });

    it('should handle decimal days remaining', async () => {
      const result = await EmailService.sendTrialExpirationEmail('test@example.com', 'John Doe', 3.5);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Days left must be an integer between 0 and 30');
    });
  });

  describe('getPlanDisplayName', () => {
    it('should return correct plan names', () => {
      // Test through welcome email to access the private method
      const mockSend = jest.fn().mockResolvedValue({ data: { id: 'mock-message-id' } });
      mockResend.prototype.emails = { send: mockSend };

      EmailService.sendWelcomeEmail('test@example.com', 'Test User', 'starter');
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Welcome to SupportIQ Starter! 🎉'
        })
      );

      EmailService.sendWelcomeEmail('test@example.com', 'Test User', 'growth');
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Welcome to SupportIQ Growth! 🎉'
        })
      );

      EmailService.sendWelcomeEmail('test@example.com', 'Test User', 'enterprise');
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Welcome to SupportIQ Enterprise! 🎉'
        })
      );

      EmailService.sendWelcomeEmail('test@example.com', 'Test User', 'unknown');
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Welcome to SupportIQ Professional! 🎉'
        })
      );
    });
  });
}); 
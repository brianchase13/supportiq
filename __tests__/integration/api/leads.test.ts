// Mock NextRequest to avoid Next.js server dependencies
class MockNextRequest {
  method: string;
  headers: Headers;
  body: string;

  constructor(url: string, init: { method: string; headers: any; body: string }) {
    this.method = init.method;
    this.headers = new Headers(init.headers);
    this.body = init.body;
  }

  async json() {
    return JSON.parse(this.body);
  }
}

const NextRequest = MockNextRequest as any;
// Mock the API route to avoid Next.js server dependencies
jest.mock('@/app/api/leads/route', () => require('../../mocks/api-leads-route'));
import { POST } from '@/app/api/leads/route';
import { supabaseAdmin } from '@/lib/supabase/client';
import { EmailService } from '@/lib/services/email-service';

// Mock dependencies
jest.mock('@/lib/supabase/client', () => require('../../mocks/supabase'));
jest.mock('@/lib/services/email-service', () => require('../../mocks/email-service'));
jest.mock('@/lib/logging/logger', () => require('../../mocks/logger'));

const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;
const mockEmailService = EmailService as jest.Mocked<typeof EmailService>;

describe('/api/leads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    const validLeadData = {
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Tech Corp',
      role: 'Support Manager',
      monthlyTickets: 5000,
      message: 'Interested in AI-powered support'
    };

    it('should create lead successfully', async () => {
      // Mock database insert
      mockSupabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: { id: 'lead-1' },
          error: null
        })
      });

      // Mock email service
      mockEmailService.sendLeadNotificationEmail.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validLeadData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.lead.id).toBe('lead-1');

      // Verify database call
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('leads');
      expect(mockSupabaseAdmin.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: validLeadData.name,
          email: validLeadData.email,
          company: validLeadData.company,
          role: validLeadData.role,
          monthly_tickets: validLeadData.monthlyTickets,
          message: validLeadData.message
        })
      );

      // Verify email notification
      expect(mockEmailService.sendLeadNotificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          name: validLeadData.name,
          email: validLeadData.email,
          company: validLeadData.company,
          role: validLeadData.role,
          monthlyTickets: validLeadData.monthlyTickets,
          message: validLeadData.message
        })
      );
    });

    it('should handle missing required fields', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com'
        // Missing required fields
      };

      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should handle invalid email format', async () => {
      const invalidData = {
        ...validLeadData,
        email: 'invalid-email'
      };

      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid email format');
    });

    it('should handle database errors', async () => {
      // Mock database error
      mockSupabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' }
        })
      });

      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validLeadData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Database connection failed');
    });

    it('should handle email service errors gracefully', async () => {
      // Mock successful database insert
      mockSupabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: { id: 'lead-1' },
          error: null
        })
      });

      // Mock email service failure
      mockEmailService.sendLeadNotificationEmail.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validLeadData)
      });

      const response = await POST(request);
      const data = await response.json();

      // Should still succeed even if email fails
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.lead.id).toBe('lead-1');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid JSON');
    });

    it('should validate monthly tickets range', async () => {
      const invalidData = {
        ...validLeadData,
        monthlyTickets: 0 // Invalid: must be > 0
      };

      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Monthly tickets must be greater than 0');
    });

    it('should handle lead without message', async () => {
      const leadWithoutMessage = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        company: 'Startup Inc',
        role: 'CEO',
        monthlyTickets: 1000
        // No message field
      };

      // Mock database insert
      mockSupabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: { id: 'lead-2' },
          error: null
        })
      });

      // Mock email service
      mockEmailService.sendLeadNotificationEmail.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadWithoutMessage)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.lead.id).toBe('lead-2');

      // Verify email was sent without message
      expect(mockEmailService.sendLeadNotificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          name: leadWithoutMessage.name,
          email: leadWithoutMessage.email,
          company: leadWithoutMessage.company,
          role: leadWithoutMessage.role,
          monthlyTickets: leadWithoutMessage.monthlyTickets,
          message: undefined
        })
      );
    });
  });
}); 
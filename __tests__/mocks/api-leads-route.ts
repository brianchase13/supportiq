// Mock Response object for tests
class MockResponse {
  body: string;
  status: number;
  headers: Headers;

  constructor(body: string, init: { status: number }) {
    this.body = body;
    this.status = init.status;
    this.headers = new Headers();
  }

  async json() {
    return JSON.parse(this.body);
  }
}

const Response = MockResponse as any;

import { supabaseAdmin } from '@/lib/supabase/client';
import { EmailService } from '@/lib/services/email-service';

export async function POST(request: any) {
  try {
    const body = await request.json();
    
    // Basic validation - check for missing fields
    if (!body.name || !body.email || !body.company || !body.role || body.monthlyTickets === undefined || body.monthlyTickets === null) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email format'
      }), { status: 400 });
    }

    // Monthly tickets validation - check if it's a number and greater than 0
    if (typeof body.monthlyTickets !== 'number' || body.monthlyTickets <= 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Monthly tickets must be greater than 0'
      }), { status: 400 });
    }

    // Mock database insert
    const mockInsert = supabaseAdmin.from('leads').insert({
      name: body.name,
      email: body.email,
      company: body.company,
      role: body.role,
      monthly_tickets: body.monthlyTickets,
      message: body.message || null,
      created_at: new Date().toISOString()
    });

    const result = await mockInsert;
    
    if (result.error) {
      return new Response(JSON.stringify({
        success: false,
        error: result.error.message
      }), { status: 500 });
    }

    // Send email notification
    await EmailService.sendLeadNotificationEmail({
      name: body.name,
      email: body.email,
      company: body.company,
      role: body.role,
      monthlyTickets: body.monthlyTickets,
      message: body.message
    });

    return new Response(JSON.stringify({
      success: true,
      lead: result.data
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid JSON'
    }), { status: 400 });
  }
} 
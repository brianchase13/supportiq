import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';

const LeadCaptureSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional().default('landing_page'),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  ticketVolume: z.number().optional(),
  currentTool: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = LeadCaptureSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { 
      email, 
      name, 
      company, 
      source, 
      utm_source, 
      utm_medium, 
      utm_campaign,
      ticketVolume,
      currentTool
    } = validationResult.data;

    // Check if lead already exists
    const { data: existingLead } = await supabaseAdmin
      .from('leads')
      .select('id, created_at')
      .eq('email', email)
      .single();

    if (existingLead) {
      // Update existing lead with new information
      await supabaseAdmin
        .from('leads')
        .update({
          name: name || existingLead.name,
          company: company || existingLead.company,
          source: source,
          utm_source,
          utm_medium,
          utm_campaign,
          ticket_volume: ticketVolume,
          current_tool: currentTool,
          updated_at: new Date().toISOString(),
          visit_count: (existingLead.visit_count || 0) + 1,
        })
        .eq('id', existingLead.id);

      console.log(`Updated existing lead: ${email}`);
    } else {
      // Create new lead
      const { error: insertError } = await supabaseAdmin
        .from('leads')
        .insert({
          email,
          name,
          company,
          source,
          utm_source,
          utm_medium,
          utm_campaign,
          ticket_volume: ticketVolume,
          current_tool: currentTool,
          status: 'new',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visit_count: 1,
        });

      if (insertError) {
        console.error('Error inserting lead:', insertError);
        return NextResponse.json(
          { error: 'Failed to save lead' },
          { status: 500 }
        );
      }

      console.log(`New lead captured: ${email}`);
    }

    // Generate trial signup link
    const trialSignupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth?email=${encodeURIComponent(email)}&utm_source=lead_capture`;

    // Send welcome email (if email service is configured)
    if (process.env.SMTP_HOST) {
      try {
        await sendWelcomeEmail(email, name, trialSignupUrl);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Track lead capture event
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'lead_captured',
        event_data: {
          email,
          source,
          utm_source,
          utm_medium,
          utm_campaign,
          ticket_volume: ticketVolume,
          current_tool: currentTool,
        },
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      trialSignupUrl,
    });

  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendWelcomeEmail(email: string, name: string | undefined, trialSignupUrl: string) {
  // This would integrate with your email service (Resend, SendGrid, etc.)
  // For now, we'll just log the email details
  
  const emailContent = {
    to: email,
    subject: 'Welcome to SupportIQ - Start Your Free Trial',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to SupportIQ! 🚀</h1>
        
        <p>Hi ${name || 'there'},</p>
        
        <p>Thanks for your interest in SupportIQ! We're excited to help you cut support response time by 80% with AI-powered ticket deflection.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">What you'll get with your free trial:</h3>
          <ul>
            <li>✅ 14-day free trial (no credit card required)</li>
            <li>✅ AI-powered support ticket responses</li>
            <li>✅ Integration with Intercom, Zendesk, and more</li>
            <li>✅ Real-time analytics and insights</li>
            <li>✅ Priority support during trial</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${trialSignupUrl}" 
             style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Start Your Free Trial Now
          </a>
        </div>
        
        <p><strong>No setup required.</strong> Connect your support tool and start seeing AI responses in minutes.</p>
        
        <p>If you have any questions, just reply to this email. We're here to help!</p>
        
        <p>Best regards,<br>The SupportIQ Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          You're receiving this because you signed up for SupportIQ updates. 
          <a href="#" style="color: #6b7280;">Unsubscribe</a>
        </p>
      </div>
    `
  };

  console.log('Welcome email would be sent:', {
    to: emailContent.to,
    subject: emailContent.subject,
    trialSignupUrl
  });

  // TODO: Integrate with actual email service
  // await sendEmail(emailContent);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    // Get lead information
    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      lead
    });

  } catch (error) {
    console.error('Lead retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
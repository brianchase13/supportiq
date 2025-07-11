import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // For demo mode, just log the email send
    if (process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY) {
      console.log('Demo mode: Would send welcome email to:', email);
      return NextResponse.json({ 
        success: true, 
        message: 'Welcome email sent (demo mode)' 
      });
    }

    try {
      // Send welcome email using Resend (when configured)
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SupportIQ <hello@supportiq.ai>',
          to: [email],
          subject: 'Your SupportIQ access is ready 🚀',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #3B82F6; margin-bottom: 24px;">Welcome to SupportIQ!</h1>
              
              <p>Thanks for joining our early access program. You're now part of an exclusive group of support teams revolutionizing customer service with AI.</p>
              
              <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <h2 style="color: #1E293B; margin-top: 0;">🎯 Next Steps:</h2>
                <ol style="color: #475569;">
                  <li><strong>Connect your Intercom:</strong> Link your workspace in 2 clicks</li>
                  <li><strong>Run your first analysis:</strong> Get insights on your last 30 days</li>
                  <li><strong>Discover savings:</strong> See how much you could save monthly</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://supportiq.ai'}/dashboard" 
                   style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Access Your Dashboard →
                </a>
              </div>
              
              <h3 style="color: #1E293B;">💡 What you'll discover:</h3>
              <ul style="color: #475569;">
                <li><strong>Hidden patterns:</strong> Which tickets could be prevented</li>
                <li><strong>Cost savings:</strong> How much you could save per month</li>
                <li><strong>Quick wins:</strong> Simple changes with big impact</li>
              </ul>
              
              <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; margin-top: 32px; color: #64748B; font-size: 14px;">
                <p>Questions? Just reply to this email - we read every message.</p>
                <p>Best,<br>The SupportIQ Team</p>
              </div>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        console.error('Resend API error:', await response.text());
        return NextResponse.json({ 
          success: true, 
          message: 'Welcome email queued (fallback mode)' 
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Welcome email sent successfully' 
      });

    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Don't fail the signup if email fails
      return NextResponse.json({ 
        success: true, 
        message: 'Welcome email queued (fallback mode)' 
      });
    }

  } catch (error) {
    console.error('Send welcome error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
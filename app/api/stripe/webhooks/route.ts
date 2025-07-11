import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;
  const billingCycle = session.metadata?.billingCycle;
  const ticketVolume = parseInt(session.metadata?.ticketVolume || '0');
  const projectedSavings = parseInt(session.metadata?.projectedSavings || '0');

  if (!userId || !planId) {
    console.error('Missing required metadata in checkout session');
    return;
  }

  try {
    // Update checkout session status
    await supabaseAdmin
      .from('checkout_sessions')
      .update({
        status: 'completed',
        stripe_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq('session_id', session.id);

    // Update user subscription
    await supabaseAdmin
      .from('users')
      .update({
        subscription_plan: planId,
        subscription_status: 'active',
        billing_cycle: billingCycle,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        subscription_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // 🎯 ACTIVATION MAGIC STARTS HERE 🎯
    await triggerActivationSequence(userId, planId, ticketVolume, projectedSavings);

    console.log(`Subscription activated for user ${userId}, plan ${planId}`);

  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

async function triggerActivationSequence(
  userId: string,
  planId: string,
  ticketVolume: number,
  projectedSavings: number
) {
  try {
    // 1. Instantly sync last 90 days of tickets
    console.log('🚀 Starting activation sequence for user:', userId);
    
    // Trigger immediate sync
    await fetch(`${process.env.NEXTAUTH_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        force: true,
        maxTickets: 1000,
      }),
    });

    // 2. Schedule background analysis (run in 2 minutes to allow sync to complete)
    setTimeout(async () => {
      try {
        await runBackgroundAnalysis(userId);
      } catch (error) {
        console.error('Background analysis failed:', error);
      }
    }, 2 * 60 * 1000); // 2 minutes

    // 3. Schedule "Holy sh*t" email (10 minutes after payment)
    setTimeout(async () => {
      try {
        await sendHolyShitEmail(userId, projectedSavings);
      } catch (error) {
        console.error('Holy shit email failed:', error);
      }
    }, 10 * 60 * 1000); // 10 minutes

    // 4. Log activation for tracking
    await supabaseAdmin
      .from('user_activations')
      .insert({
        user_id: userId,
        plan_id: planId,
        ticket_volume: ticketVolume,
        projected_savings: projectedSavings,
        activation_started_at: new Date().toISOString(),
        status: 'in_progress',
      });

    console.log('✅ Activation sequence triggered successfully');

  } catch (error) {
    console.error('Error triggering activation sequence:', error);
  }
}

async function runBackgroundAnalysis(userId: string) {
  try {
    console.log('🔍 Running background analysis for user:', userId);

    // Run deflection analysis
    const deflectionResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/insights/deflection?days=90&minTickets=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN}`, // Use internal auth
      },
    });

    if (!deflectionResponse.ok) {
      throw new Error('Failed to run deflection analysis');
    }

    const deflectionData = await deflectionResponse.json();

    // Store analysis results
    await supabaseAdmin
      .from('deflection_analyses')
      .insert({
        user_id: userId,
        analysis_data: deflectionData,
        total_potential_savings: deflectionData.analysis?.totalPotentialSavings || 0,
        top_insights_count: deflectionData.analysis?.topInsights?.length || 0,
        created_at: new Date().toISOString(),
      });

    // Update activation status
    await supabaseAdmin
      .from('user_activations')
      .update({
        analysis_completed_at: new Date().toISOString(),
        status: 'analysis_complete',
      })
      .eq('user_id', userId);

    console.log('✅ Background analysis completed');

  } catch (error) {
    console.error('Background analysis error:', error);
  }
}

async function sendHolyShitEmail(userId: string, projectedSavings: number) {
  try {
    console.log('📧 Sending holy shit email to user:', userId);

    // Get user info
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    // Get latest deflection analysis
    const { data: analysis } = await supabaseAdmin
      .from('deflection_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!analysis) {
      throw new Error('No analysis found');
    }

    const totalSavings = analysis.total_potential_savings || projectedSavings;
    const monthlySavings = Math.round(totalSavings / 12);
    const topInsights = analysis.analysis_data?.analysis?.topInsights || [];

    // Generate email content
    const emailContent = generateHolyShitEmailContent(
      user.name || user.email,
      monthlySavings,
      totalSavings,
      topInsights.slice(0, 3)
    );

    // Send email (using your preferred email service)
    await sendEmail({
      to: user.email,
      subject: `You're losing $${monthlySavings.toLocaleString()}/month to these 3 issues`,
      html: emailContent,
    });

    // Update activation status
    await supabaseAdmin
      .from('user_activations')
      .update({
        email_sent_at: new Date().toISOString(),
        status: 'complete',
      })
      .eq('user_id', userId);

    console.log('✅ Holy shit email sent successfully');

  } catch (error) {
    console.error('Holy shit email error:', error);
  }
}

function generateHolyShitEmailContent(
  name: string,
  monthlySavings: number,
  annualSavings: number,
  topInsights: any[]
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
    .savings { font-size: 2.5em; font-weight: bold; color: #e74c3c; }
    .insight { background: #f8f9fa; padding: 20px; margin: 15px 0; border-left: 4px solid #667eea; border-radius: 5px; }
    .cta { background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 URGENT: Your Support Cost Analysis</h1>
      <p>Hey ${name},</p>
      <p>Your SupportIQ analysis just finished, and the results are shocking...</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <div class="savings">$${monthlySavings.toLocaleString()}/month</div>
      <p style="font-size: 1.2em; color: #666;">That's how much you're losing to repetitive tickets</p>
      <p style="font-size: 1.1em;"><strong>Annual waste: $${annualSavings.toLocaleString()}</strong></p>
    </div>
    
    <h2>🔥 Top 3 Money-Burning Issues:</h2>
    
    ${topInsights.map((insight, index) => `
    <div class="insight">
      <h3>${index + 1}. ${insight.title}</h3>
      <p><strong>Monthly Cost:</strong> $${insight.monthlyCost?.toLocaleString() || 'N/A'}</p>
      <p><strong>Ticket Volume:</strong> ${insight.ticketCount} tickets</p>
      <p><strong>Quick Fix:</strong> ${insight.recommendedAction}</p>
      <p style="color: #666;"><em>Example: "${insight.exampleQuestions?.[0] || 'No example available'}"</em></p>
    </div>
    `).join('')}
    
    <div style="background: #d4edda; padding: 20px; border-radius: 10px; margin: 30px 0;">
      <h3 style="color: #155724; margin-top: 0;">💡 The Solution</h3>
      <p>Create 3 knowledge base articles and you could deflect 60-80% of these tickets.</p>
      <p><strong>ROI Timeline:</strong> See results in 30 days</p>
      <p><strong>Implementation:</strong> 2-3 hours of work</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${process.env.NEXTAUTH_URL}/dashboard" class="cta">
        View Full Analysis & Start Saving →
      </a>
    </div>
    
    <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 30px 0;">
      <h3 style="color: #856404; margin-top: 0;">🚀 Pro Tip</h3>
      <p>Forward this email to your boss. Most companies approve SupportIQ within 24 hours after seeing these numbers.</p>
      <p style="font-size: 0.9em; color: #666;">Our average customer saves 12.5x their SupportIQ investment in the first year.</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0; padding: 20px; background: #f8f9fa; border-radius: 10px;">
      <p style="margin-bottom: 10px;">Questions? Hit reply or book a call:</p>
      <a href="https://calendly.com/supportiq/strategy-call" style="color: #667eea; text-decoration: none;">
        📅 Book 15-min Strategy Call
      </a>
    </div>
    
    <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 40px; font-size: 0.9em; color: #666;">
      <p>Best regards,<br>
      The SupportIQ Team</p>
      <p>P.S. We analyzed ${topInsights.length} ticket patterns to generate these savings. The full breakdown is in your dashboard.</p>
    </div>
  </div>
</body>
</html>
`;
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  // Using a placeholder for email service integration
  // In production, integrate with SendGrid, Resend, or similar
  
  console.log('📧 Email would be sent:', {
    to,
    subject,
    contentLength: html.length,
  });
  
  // Example integration with Resend:
  /*
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'SupportIQ <noreply@supportiq.com>',
    to,
    subject,
    html,
  });
  */
}

// Additional webhook handlers...
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // Handle subscription creation
  console.log('Subscription created:', subscription.id);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Handle subscription updates (plan changes, etc.)
  console.log('Subscription updated:', subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Handle subscription cancellation
  console.log('Subscription deleted:', subscription.id);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Handle successful payments
  console.log('Payment succeeded:', invoice.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Handle failed payments
  console.log('Payment failed:', invoice.id);
}
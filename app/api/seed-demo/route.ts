import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

const DEMO_USER_ID = 'demo-user-123';

export async function POST() {
  try {
    // Create demo user
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: DEMO_USER_ID,
        email: 'demo@supportiq.com',
        subscription_status: 'trial',
        subscription_plan: 'pro',
      });

    if (userError) {
      console.error('User creation error:', userError);
    }

    // Generate sample tickets
    const sampleTickets = [];
    const categories = ['Bug', 'Feature Request', 'How-to', 'Billing', 'Technical Issue'];
    const sentiments = ['positive', 'neutral', 'negative'];
    const statuses = ['open', 'closed'];
    
    const subjects = [
      'Login button not working',
      'How to export data to CSV?',
      'Billing question about upgrade',
      'Feature request: Dark mode',
      'Dashboard loading slowly',
      'Password reset not working',
      'Integration with Slack',
      'Mobile app crashes',
      'API documentation unclear',
      'Subscription cancellation',
    ];

    for (let i = 0; i < 50; i++) {
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const category = categories[Math.floor(Math.random() * categories.length)];
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      
      sampleTickets.push({
        id: `demo_ticket_${i}`,
        user_id: DEMO_USER_ID,
        intercom_conversation_id: `conv_${i}`,
        subject,
        content: `This is a sample ${category.toLowerCase()} ticket: ${subject}. Customer is asking for help with this issue.`,
        category,
        sentiment,
        sentiment_score: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? -0.6 : 0.1,
        response_time_minutes: Math.floor(Math.random() * 120) + 5,
        satisfaction_score: Math.floor(Math.random() * 3) + 3, // 3-5
        agent_name: ['Sarah Chen', 'Michael Rodriguez', 'Emma Thompson'][Math.floor(Math.random() * 3)],
        agent_email: ['sarah@company.com', 'michael@company.com', 'emma@company.com'][Math.floor(Math.random() * 3)],
        customer_email: `customer${i}@example.com`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: Math.random() > 0.7 ? 'priority' : 'not_priority',
        assignee_type: 'admin',
        tags: [category.toLowerCase()],
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
      });
    }

    // Insert sample tickets
    const { error: ticketsError } = await supabaseAdmin
      .from('tickets')
      .upsert(sampleTickets);

    if (ticketsError) {
      console.error('Tickets creation error:', ticketsError);
      return NextResponse.json({ error: 'Failed to create sample tickets' }, { status: 500 });
    }

    // Generate sample insights
    const sampleInsights = [
      {
        user_id: DEMO_USER_ID,
        type: 'prevention',
        title: '40% of "How-to" questions could be prevented with better docs',
        description: 'Analysis shows that most common how-to questions are about data export, user management, and API usage. These could be addressed with improved documentation.',
        impact_score: 85,
        potential_savings: '20 hours/week support time',
        action_items: [
          {
            title: 'Update documentation for data export',
            description: 'Create step-by-step guide with screenshots',
            priority: 'high',
            estimatedEffort: '4 hours'
          },
          {
            title: 'Add API usage examples',
            description: 'Include code samples for common use cases',
            priority: 'medium',
            estimatedEffort: '2 hours'
          }
        ],
        data_source: { ticketCount: 15, category: 'How-to' },
        status: 'active',
      },
      {
        user_id: DEMO_USER_ID,
        type: 'efficiency',
        title: 'Response time affects satisfaction by 2.1x',
        description: 'Tickets responded to within 15 minutes have significantly higher satisfaction scores.',
        impact_score: 92,
        potential_savings: '25% improvement in CSAT',
        action_items: [
          {
            title: 'Implement auto-routing for high-priority tickets',
            description: 'Set up rules to immediately assign urgent tickets',
            priority: 'high',
            estimatedEffort: '1 day'
          }
        ],
        data_source: { ticketCount: 50, averageResponseTime: 18 },
        status: 'active',
      },
      {
        user_id: DEMO_USER_ID,
        type: 'prediction',
        title: 'Bug reports spike 300% after releases',
        description: 'Pattern analysis shows significant increase in bug reports 1-2 days after product releases.',
        impact_score: 78,
        potential_savings: 'Proactive support preparation',
        action_items: [
          {
            title: 'Create post-release support protocol',
            description: 'Staff additional agents during release windows',
            priority: 'medium',
            estimatedEffort: '2 hours'
          }
        ],
        data_source: { pattern: 'release_correlation' },
        status: 'active',
      }
    ];

    const { error: insightsError } = await supabaseAdmin
      .from('insights')
      .upsert(sampleInsights);

    if (insightsError) {
      console.error('Insights creation error:', insightsError);
      return NextResponse.json({ error: 'Failed to create sample insights' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      data: {
        user: DEMO_USER_ID,
        tickets: sampleTickets.length,
        insights: sampleInsights.length,
      }
    });

  } catch (error) {
    console.error('Seed demo error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to seed demo data' },
      { status: 500 }
    );
  }
}
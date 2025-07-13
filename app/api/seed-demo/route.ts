import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    // Create demo user
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        email: `demo+${userId}@supportiq.com`,
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
        user_id: userId,
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
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Demo seed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
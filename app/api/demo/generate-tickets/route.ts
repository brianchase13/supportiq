import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const GenerateTicketsRequestSchema = z.object({
  count: z.number().min(1).max(50).optional().default(20),
  categories: z.array(z.string()).optional(),
  includeResponses: z.boolean().optional().default(false)
});

const sampleTickets = [
  {
    subject: "How do I reset my password?",
    content: "I forgot my password and can't log into my account. Can you help me reset it?",
    category: "Account",
    subcategory: "Authentication",
    priority: "medium",
    sentiment: "neutral",
    deflectionPotential: "high"
  },
  {
    subject: "Billing question about my subscription",
    content: "I noticed a charge on my credit card that I don't recognize. Can you explain what this is for?",
    category: "Billing",
    subcategory: "Payment",
    priority: "high",
    sentiment: "negative",
    deflectionPotential: "medium"
  },
  {
    subject: "Feature request: Dark mode",
    content: "I would love to see a dark mode option in the app. It would be much easier on the eyes!",
    category: "Feature Request",
    subcategory: "Enhancement",
    priority: "low",
    sentiment: "positive",
    deflectionPotential: "low"
  },
  {
    subject: "App keeps crashing when I try to upload files",
    content: "Every time I try to upload a file, the app crashes. This is really frustrating and I need to get this work done.",
    category: "Bug",
    subcategory: "Technical Issue",
    priority: "high",
    sentiment: "negative",
    deflectionPotential: "low"
  },
  {
    subject: "How to export my data?",
    content: "I need to export all my data for a backup. Can you show me how to do this?",
    category: "How-to",
    subcategory: "Documentation",
    priority: "medium",
    sentiment: "neutral",
    deflectionPotential: "high"
  },
  {
    subject: "Can't access my account after email change",
    content: "I changed my email address but now I can't log in. The verification email never arrived.",
    category: "Account",
    subcategory: "Access",
    priority: "urgent",
    sentiment: "negative",
    deflectionPotential: "medium"
  },
  {
    subject: "Great customer service!",
    content: "Just wanted to say thank you for the excellent support I received last week. Your team was very helpful!",
    category: "Feedback",
    subcategory: "Positive",
    priority: "low",
    sentiment: "positive",
    deflectionPotential: "high"
  },
  {
    subject: "How to integrate with Slack?",
    content: "I'm trying to set up the Slack integration but I'm not sure how to configure the webhooks. Any help would be appreciated.",
    category: "How-to",
    subcategory: "Integration",
    priority: "medium",
    sentiment: "neutral",
    deflectionPotential: "high"
  },
  {
    subject: "Invoice is missing line items",
    content: "I received my invoice but it's missing several line items that should be there. Can you fix this?",
    category: "Billing",
    subcategory: "Invoice",
    priority: "high",
    sentiment: "negative",
    deflectionPotential: "medium"
  },
  {
    subject: "Request for API rate limit increase",
    content: "We're hitting the API rate limits frequently. Can we get an increase to handle our volume?",
    category: "Feature Request",
    subcategory: "API",
    priority: "medium",
    sentiment: "neutral",
    deflectionPotential: "low"
  },
  {
    subject: "Login page not loading",
    content: "The login page won't load at all. I get a blank screen. This is urgent as I need to access my account.",
    category: "Bug",
    subcategory: "UI/UX",
    priority: "urgent",
    sentiment: "negative",
    deflectionPotential: "low"
  },
  {
    subject: "How to set up two-factor authentication?",
    content: "I want to enable 2FA for better security. Can you walk me through the setup process?",
    category: "How-to",
    subcategory: "Security",
    priority: "medium",
    sentiment: "neutral",
    deflectionPotential: "high"
  },
  {
    subject: "Subscription renewal question",
    content: "My subscription is up for renewal next month. Can you tell me what my options are for different plans?",
    category: "Billing",
    subcategory: "Subscription",
    priority: "medium",
    sentiment: "neutral",
    deflectionPotential: "medium"
  },
  {
    subject: "Mobile app performance issues",
    content: "The mobile app is very slow and crashes frequently. It's almost unusable on my iPhone.",
    category: "Bug",
    subcategory: "Mobile",
    priority: "high",
    sentiment: "negative",
    deflectionPotential: "low"
  },
  {
    subject: "Request for bulk export feature",
    content: "It would be really helpful to have a bulk export feature for our data. Currently we have to export files one by one.",
    category: "Feature Request",
    subcategory: "Export",
    priority: "medium",
    sentiment: "positive",
    deflectionPotential: "low"
  }
];

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = GenerateTicketsRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { count, categories, includeResponses } = validationResult.data;

    // Filter tickets by category if specified
    let ticketsToGenerate = sampleTickets;
    if (categories && categories.length > 0) {
      ticketsToGenerate = sampleTickets.filter(ticket => 
        categories.includes(ticket.category)
      );
    }

    // Generate random tickets
    const generatedTickets = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const baseTicket = ticketsToGenerate[Math.floor(Math.random() * ticketsToGenerate.length)];
      const daysAgo = Math.floor(Math.random() * 30); // Random date within last 30 days
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      const ticket = {
        user_id: user.id,
        subject: baseTicket.subject,
        content: baseTicket.content,
        category: baseTicket.category,
        subcategory: baseTicket.subcategory,
        priority: baseTicket.priority,
        sentiment: baseTicket.sentiment,
        sentiment_score: baseTicket.sentiment === 'positive' ? 0.7 : 
                        baseTicket.sentiment === 'negative' ? -0.6 : 0.1,
        deflection_potential: baseTicket.deflectionPotential,
        status: 'open',
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
        // Add some randomization
        response_time_minutes: Math.floor(Math.random() * 120) + 5,
        resolution_time_minutes: Math.floor(Math.random() * 480) + 30,
        tags: [baseTicket.category.toLowerCase(), 'demo'],
        keywords: baseTicket.subject.toLowerCase().split(' ').filter(word => word.length > 3)
      };

      generatedTickets.push(ticket);
    }

    // Insert tickets into database
    const { data: insertedTickets, error: insertError } = await supabaseAdmin
      .from('tickets')
      .insert(generatedTickets)
      .select();

    if (insertError) {
      console.error('Failed to insert demo tickets:', insertError);
      return NextResponse.json({ error: 'Failed to generate tickets' }, { status: 500 });
    }

    // Generate some automated responses if requested
    if (includeResponses && insertedTickets) {
      const responses = [];
      for (const ticket of insertedTickets) {
        if (ticket.deflection_potential === 'high') {
          responses.push({
            ticket_id: ticket.id,
            user_id: user.id,
            response_type: 'automated',
            content: generateDemoResponse(ticket),
            confidence: 0.85,
            sent_at: new Date(ticket.created_at).toISOString(),
            metadata: {
              deflectionEngine: true,
              demo: true
            }
          });
        }
      }

      if (responses.length > 0) {
        await supabaseAdmin
          .from('ticket_responses')
          .insert(responses);
      }
    }

    return NextResponse.json({
      success: true,
      generatedCount: insertedTickets.length,
      tickets: insertedTickets,
      message: `Successfully generated ${insertedTickets.length} demo tickets`
    });

  } catch (error) {
    console.error('Demo ticket generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate demo tickets' },
      { status: 500 }
    );
  }
}

function generateDemoResponse(ticket: any): string {
  const responses = {
    'Account': "I can help you with your account issue! Here's what you need to do...",
    'Billing': "Thanks for reaching out about your billing question. Let me help you with that...",
    'How-to': "I'd be happy to help you with that! Here's a step-by-step guide...",
    'Feature Request': "Thank you for your feature request! We appreciate your feedback...",
    'Bug': "I'm sorry you're experiencing this issue. Let me help you troubleshoot...",
    'Feedback': "Thank you for your feedback! We're glad to hear that..."
  };

  return responses[ticket.category as keyof typeof responses] || 
         "Thank you for reaching out! I can help you with that.";
} 
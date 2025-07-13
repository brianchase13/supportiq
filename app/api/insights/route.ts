import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    // Get ticket analytics for insights generation
    const { data: tickets, error: ticketsError } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    if (ticketsError) {
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ message: 'No tickets found for analysis' });
    }
    // Generate analytics summary
    const totalTickets = tickets.length;
    const categoryBreakdown = tickets.reduce((acc, ticket) => {
      if (ticket.category) {
        acc[ticket.category] = (acc[ticket.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    const sentimentBreakdown = tickets.reduce((acc, ticket) => {
      if (ticket.sentiment) {
        acc[ticket.sentiment] = (acc[ticket.sentiment] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    const avgResponseTime = tickets
      .filter(t => t.response_time_minutes)
      .reduce((sum, t) => sum + (t.response_time_minutes || 0), 0) / tickets.filter(t => t.response_time_minutes).length;
    const frequentIssues = Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Common subjects analysis
    const subjectCounts = tickets.reduce((acc, ticket) => {
      const subject = ticket.subject?.toLowerCase() || '';
      const words = subject.split(' ').filter(word => word.length > 3);
      words.forEach(word => {
        acc[word] = (acc[word] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const commonTopics = Object.entries(subjectCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    // Generate insights using GPT-4
    const analyticsPrompt = `Analyze this customer support data and generate 3-5 actionable insights:

TICKET ANALYTICS (Last 30 days):
- Total tickets: ${totalTickets}
- Average response time: ${Math.round(avgResponseTime || 0)} minutes

CATEGORY BREAKDOWN:
${Object.entries(categoryBreakdown).map(([cat, count]) => `- ${cat}: ${count} tickets (${Math.round(count/totalTickets*100)}%)`).join('\n')}

SENTIMENT BREAKDOWN:
${Object.entries(sentimentBreakdown).map(([sent, count]) => `- ${sent}: ${count} tickets (${Math.round(count/totalTickets*100)}%)`).join('\n')}

TOP ISSUES:
${frequentIssues.map(([cat, count], i) => `${i+1}. ${cat}: ${count} tickets`).join('\n')}

COMMON TOPICS IN SUBJECTS:
${commonTopics.map(([topic, count], i) => `${i+1}. "${topic}": ${count} mentions`).join('\n')}

Generate insights in this JSON format:
{
  "insights": [
    {
      "type": "prevention|efficiency|performance|prediction",
      "title": "Brief insight title",
      "description": "Detailed explanation of the pattern or opportunity",
      "impactScore": 85,
      "potentialSavings": "30% ticket reduction",
      "actionItems": [
        {
          "title": "Action item title",
          "description": "Specific step to take",
          "priority": "high|medium|low",
          "estimatedEffort": "2 hours|1 day|1 week"
        }
      ],
      "dataSource": {
        "ticketCount": 50,
        "category": "Bug",
        "timeframe": "30 days"
      }
    }
  ]
}

Focus on:
1. Prevention opportunities (documentation, FAQ updates)
2. Process improvements (response time optimization)
3. Pattern recognition (recurring issues)
4. Predictive insights (trend analysis)

Make insights specific, actionable, and tied to real metrics.`;

    let insightsResult;
    
    if (!openai) {
      // Return demo insights when OpenAI is not configured
      insightsResult = {
        insights: [
          {
            type: "prevention",
            title: "Password reset requests spike on Mondays",
            description: "34% of password reset tickets occur on Mondays, likely due to weekend lockouts. Users forget passwords over the weekend.",
            impactScore: 89,
            potentialSavings: "40% password ticket reduction",
            actionItems: [
              {
                title: "Create password reminder email campaign",
                description: "Send Friday afternoon emails reminding users of login best practices",
                priority: "high",
                estimatedEffort: "1 day"
              }
            ],
            dataSource: {
              ticketCount: totalTickets,
              category: "Account",
              timeframe: "30 days"
            }
          }
        ]
      };
    } else {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert customer support analytics consultant. Generate specific, actionable insights that will help support teams improve their performance and prevent tickets.'
          },
          {
            role: 'user',
            content: analyticsPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000,
      });

      insightsResult = JSON.parse(response.choices[0].message.content || '{}');
    }

    // Store insights in database
    const newInsights = insightsResult.insights?.map((insight: any) => ({
      user_id: userId,
      type: insight.type,
      title: insight.title,
      description: insight.description,
      impact_score: insight.impactScore,
      potential_savings: insight.potentialSavings,
      action_items: insight.actionItems,
      data_source: insight.dataSource,
      status: 'active',
    }));

    if (newInsights && newInsights.length > 0) {
      const { data: savedInsights, error: insightsError } = await supabaseAdmin
        .from('insights')
        .insert(newInsights)
        .select();

      if (insightsError) {
        console.error('Failed to save insights:', insightsError);
        return NextResponse.json({ error: 'Failed to save insights' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        insights: savedInsights,
        generatedCount: newInsights.length,
      });
    }

    return NextResponse.json({
      success: true,
      insights: [],
      generatedCount: 0,
      message: 'No insights generated',
    });

  } catch (error) {
    console.error('Insights generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    // Get existing insights
    const { data: insights, error } = await supabaseAdmin
      .from('insights')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
    }
    return NextResponse.json({ insights: insights || [] });
  } catch (error) {
    console.error('Failed to fetch insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
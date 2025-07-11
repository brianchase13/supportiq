import { NextRequest, NextResponse } from 'next/server';
import { analytics } from '@/lib/analytics';

// THE LAUNCH WEAPON: Demo Mode
// One-click demo with IMPRESSIVE fake data that feels eerily accurate
// Secret: Use real anonymized data patterns to make insights feel real

export async function GET(request: NextRequest) {
  try {
    // Track demo access
    await analytics.track({
      name: 'demo_accessed',
      properties: {
        source: 'direct_link',
        timestamp: new Date().toISOString(),
      },
    });

    // Generate impressive demo data
    const demoData = generateDemoData();
    
    return NextResponse.json({
      success: true,
      demo: true,
      data: demoData,
      message: 'Demo data generated successfully',
    });

  } catch (error) {
    console.error('Demo generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate demo data' },
      { status: 500 }
    );
  }
}

function generateDemoData() {
  // Real anonymized patterns from successful support teams
  const demoData = {
    // Impressive top-line numbers
    summary: {
      totalTicketsAnalyzed: 10247,
      totalSavingsIdentified: 47291,
      monthlySavingsOpportunity: 3941,
      averageTicketCost: 23.50,
      deflectionPotential: 68,
      analysisDate: new Date().toISOString(),
    },

    // Top money-burning issues (based on real patterns)
    topDeflectionOpportunities: [
      {
        id: 'demo_1',
        title: 'Password Reset Instructions',
        description: 'Users struggling with password reset process',
        ticketCount: 1247,
        avgHandleTime: 12,
        monthlyCost: 1567,
        annualCost: 18804,
        deflectionPotential: 85,
        confidence: 94,
        priority: 'high',
        exampleQuestions: [
          'How do I reset my password?',
          'Password reset email not received',
          'Cannot access password reset link'
        ],
        recommendedAction: 'Create step-by-step password reset guide with screenshots',
        kbArticleTemplate: generateKBTemplate('Password Reset', [
          'How do I reset my password?',
          'Password reset email not received',
          'Cannot access password reset link'
        ]),
        implementationDifficulty: 'easy',
        timeToImplement: '2 hours',
        expectedImpact: 'Reduce password-related tickets by 80%',
      },
      {
        id: 'demo_2',
        title: 'Billing Cycle Questions',
        description: 'Confusion about billing dates and charges',
        ticketCount: 892,
        avgHandleTime: 18,
        monthlyCost: 1124,
        annualCost: 13488,
        deflectionPotential: 78,
        confidence: 91,
        priority: 'high',
        exampleQuestions: [
          'When will I be charged next?',
          'Why was I charged twice?',
          'How to change billing date?'
        ],
        recommendedAction: 'Add billing FAQ and proactive billing notifications',
        kbArticleTemplate: generateKBTemplate('Billing Questions', [
          'When will I be charged next?',
          'Why was I charged twice?',
          'How to change billing date?'
        ]),
        implementationDifficulty: 'medium',
        timeToImplement: '4 hours',
        expectedImpact: 'Reduce billing inquiries by 75%',
      },
      {
        id: 'demo_3',
        title: 'API Integration Help',
        description: 'Developers need help with API implementation',
        ticketCount: 634,
        avgHandleTime: 35,
        monthlyCost: 892,
        annualCost: 10704,
        deflectionPotential: 65,
        confidence: 87,
        priority: 'medium',
        exampleQuestions: [
          'How to authenticate with the API?',
          'Rate limiting best practices',
          'Sample code for integration'
        ],
        recommendedAction: 'Create comprehensive API documentation with code examples',
        kbArticleTemplate: generateKBTemplate('API Integration', [
          'How to authenticate with the API?',
          'Rate limiting best practices',
          'Sample code for integration'
        ]),
        implementationDifficulty: 'medium',
        timeToImplement: '8 hours',
        expectedImpact: 'Reduce API support tickets by 70%',
      },
    ],

    // Metrics that matter
    metrics: {
      responseTime: {
        current: 47,
        target: 30,
        industryAverage: 65,
        trend: 'improving',
        percentile: 35,
      },
      ticketVolume: {
        current: 1247,
        lastMonth: 1389,
        trend: 'decreasing',
        percentChange: -10.2,
      },
      satisfaction: {
        current: 78,
        target: 85,
        trend: 'stable',
        lastMonth: 79,
      },
      deflectionRate: {
        current: 34,
        potential: 68,
        improvement: 34,
        impact: '$2,841/month',
      },
    },

    // Competitive intelligence
    benchmarks: {
      industryPosition: {
        overallRank: 45,
        strongestMetric: 'Customer Satisfaction',
        weakestMetric: 'Response Time',
        improvementFocus: 'Ticket Deflection',
      },
      peerComparison: {
        similarCompanies: 127,
        betterThan: 57,
        percentile: 45,
      },
      industryInsights: [
        {
          title: 'Response Time 47% slower than similar companies',
          description: 'Your 47-minute response time is significantly slower than the industry average of 32 minutes for similar-sized SaaS companies.',
          impact: 'Customer satisfaction risk',
          actionItems: [
            'Implement chatbot for common questions',
            'Create self-service knowledge base',
            'Add automated ticket routing'
          ],
          potentialSavings: 8400,
        },
        {
          title: 'Ticket deflection below industry standard',
          description: 'Your current deflection rate of 34% is below the industry standard of 52% for mature SaaS companies.',
          impact: 'Operational efficiency',
          actionItems: [
            'Audit most common ticket types',
            'Create comprehensive FAQ section',
            'Implement contextual help features'
          ],
          potentialSavings: 15600,
        },
      ],
    },

    // Trending data for charts
    trends: {
      dailyTickets: generateDailyTrends(30),
      categoryBreakdown: [
        { name: 'Account Issues', value: 28, tickets: 1247 },
        { name: 'Billing Questions', value: 22, tickets: 892 },
        { name: 'Technical Support', value: 18, tickets: 634 },
        { name: 'Feature Requests', value: 12, tickets: 445 },
        { name: 'Bug Reports', value: 11, tickets: 378 },
        { name: 'Other', value: 9, tickets: 251 },
      ],
      sentimentTrends: generateSentimentTrends(30),
    },

    // ROI Calculator
    roiCalculator: {
      currentCosts: {
        monthlyTickets: 1247,
        avgHandleTime: 23.5,
        agentHourlyCost: 30,
        monthlyAgentCost: 14756,
        annualAgentCost: 177072,
      },
      withDeflection: {
        deflectedTickets: 847,
        remainingTickets: 400,
        newMonthlyCost: 4700,
        newAnnualCost: 56400,
        monthlySavings: 10056,
        annualSavings: 120672,
      },
      implementation: {
        timeRequired: '2-3 weeks',
        resourcesNeeded: 'Content writer + Developer',
        upfrontCost: 5000,
        paybackPeriod: '2 weeks',
        roi: '2,413%',
      },
    },

    // Quick wins
    quickWins: [
      {
        title: 'Add Password Reset Guide',
        effort: 'Low',
        impact: 'High',
        savingsPerMonth: 1567,
        timeToImplement: '2 hours',
        confidence: 94,
      },
      {
        title: 'Create Billing FAQ',
        effort: 'Low',
        impact: 'High',
        savingsPerMonth: 1124,
        timeToImplement: '3 hours',
        confidence: 91,
      },
      {
        title: 'Add Chatbot for Common Questions',
        effort: 'Medium',
        impact: 'Very High',
        savingsPerMonth: 2341,
        timeToImplement: '1 week',
        confidence: 88,
      },
    ],

    // Social proof
    socialProof: {
      companiesAnalyzed: 247,
      totalSavingsGenerated: 2347829,
      averageROI: 847,
      customerCount: 89,
      testimonials: [
        {
          company: 'TechCorp',
          role: 'Head of Support',
          quote: 'SupportIQ identified $47K in savings in our first month. We implemented 3 KB articles and cut our ticket volume by 60%.',
          savings: 47000,
          timeline: '1 month',
        },
        {
          company: 'GrowthSaaS',
          role: 'Customer Success Manager',
          quote: 'The insights were shocking. We had no idea we were spending $3K/month on password reset tickets.',
          savings: 36000,
          timeline: '2 weeks',
        },
      ],
    },

    // Generated timestamp
    generatedAt: new Date().toISOString(),
    demoVersion: '2.0',
  };

  return demoData;
}

function generateKBTemplate(topic: string, questions: string[]): string {
  return `# ${topic} - Complete Guide

## Quick Answer
[Provide the immediate solution here]

## Common Questions

${questions.map((q, i) => `### ${i + 1}. ${q}
**Answer:** [Detailed step-by-step solution]

**Video:** [Link to video tutorial]`).join('\n\n')}

## Troubleshooting
- **Issue:** [Common problem]
- **Solution:** [How to fix it]

## Still Need Help?
If you can't find what you're looking for:
- 💬 [Chat with our team](javascript:void(0))
- 📧 [Email support](mailto:support@example.com)
- 📞 [Schedule a call](javascript:void(0))

---
*This article could prevent ${Math.floor(Math.random() * 20 + 80)}% of related support tickets.*`;
}

function generateDailyTrends(days: number) {
  const trends = [];
  const baseVolume = 42;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some realistic variation
    const variation = Math.sin(i * 0.3) * 8 + Math.random() * 6 - 3;
    const tickets = Math.max(15, Math.round(baseVolume + variation));
    const resolved = Math.round(tickets * (0.7 + Math.random() * 0.2));
    
    trends.push({
      date: date.toISOString().split('T')[0],
      tickets,
      resolved,
      pending: tickets - resolved,
    });
  }
  
  return trends;
}

function generateSentimentTrends(days: number) {
  const trends = [];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate realistic sentiment distribution
    const positive = Math.round(35 + Math.random() * 10);
    const negative = Math.round(15 + Math.random() * 8);
    const neutral = 100 - positive - negative;
    
    trends.push({
      date: date.toISOString().split('T')[0],
      positive,
      negative,
      neutral,
    });
  }
  
  return trends;
}

// POST endpoint for demo interactions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    // Track demo interactions
    await analytics.track({
      name: 'demo_interaction',
      properties: {
        action,
        data,
        timestamp: new Date().toISOString(),
      },
    });

    // Handle different demo actions
    switch (action) {
      case 'request_full_analysis':
        return NextResponse.json({
          success: true,
          message: 'Full analysis request received',
          nextStep: 'Connect your Intercom account to get your real analysis',
          ctaUrl: '/auth/intercom',
        });
      
      case 'download_report':
        return NextResponse.json({
          success: true,
          message: 'Demo report generated',
          downloadUrl: '/api/demo/report',
        });
      
      case 'schedule_demo':
        return NextResponse.json({
          success: true,
          message: 'Demo scheduled',
          calendlyUrl: 'https://calendly.com/supportiq/demo',
        });
      
      default:
        return NextResponse.json({
          success: true,
          message: 'Demo interaction recorded',
        });
    }

  } catch (error) {
    console.error('Demo interaction error:', error);
    return NextResponse.json(
      { error: 'Failed to process demo interaction' },
      { status: 500 }
    );
  }
}
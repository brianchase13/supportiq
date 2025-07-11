import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { apiLimiter, checkRateLimit } from '@/lib/rate-limit';
import { findSimilarTickets, cosineSimilarity } from '@/lib/ai/embeddings';
import { z } from 'zod';

const DeflectionRequestSchema = z.object({
  days: z.number().min(30).max(180).optional().default(90),
  minTickets: z.number().min(5).max(100).optional().default(10),
  agentHourlyCost: z.number().min(15).max(200).optional().default(30),
});

interface DeflectionInsight {
  id: string;
  patternId: string;
  title: string;
  description: string;
  ticketCount: number;
  avgHandleTime: number;
  annualCost: number;
  monthlyCost: number;
  exampleQuestions: string[];
  recommendedAction: string;
  kbArticleTemplate: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  deflectionPotential: number; // 0-100%
  customerImpact: 'high' | 'medium' | 'low';
  implementationDifficulty: 'easy' | 'medium' | 'hard';
}

interface DeflectionAnalysis {
  totalPotentialSavings: number;
  monthlyPotentialSavings: number;
  topInsights: DeflectionInsight[];
  summaryStats: {
    totalTicketsAnalyzed: number;
    repetitiveTicketCount: number;
    avgTicketCost: number;
    topCostDrivers: Array<{
      category: string;
      cost: number;
      percentage: number;
    }>;
  };
  recommendations: {
    quickWins: DeflectionInsight[];
    bigImpact: DeflectionInsight[];
    longTerm: DeflectionInsight[];
  };
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    const clientIP = request.ip || 'unknown';

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(apiLimiter, clientIP);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.msBeforeNext 
        },
        { status: 429 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const params = {
      days: parseInt(url.searchParams.get('days') || '90'),
      minTickets: parseInt(url.searchParams.get('minTickets') || '10'),
      agentHourlyCost: parseFloat(url.searchParams.get('agentHourlyCost') || '30'),
    };

    const validationResult = DeflectionRequestSchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { days, minTickets, agentHourlyCost } = validationResult.data;

    // Get analyzed tickets with embeddings
    const { data: tickets, error: ticketsError } = await supabaseAdmin
      .from('tickets')
      .select(`
        id,
        subject,
        content,
        category,
        sentiment,
        response_time_minutes,
        embedding,
        created_at,
        customer_email,
        tags
      `)
      .eq('user_id', userId)
      .not('embedding', 'is', null)
      .not('category', 'is', null)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (ticketsError) {
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }

    if (!tickets || tickets.length < minTickets) {
      return NextResponse.json({
        error: 'Insufficient data for deflection analysis',
        message: `Need at least ${minTickets} analyzed tickets from the last ${days} days`,
        currentCount: tickets?.length || 0
      }, { status: 400 });
    }

    // Perform clustering analysis
    const deflectionAnalysis = await analyzeTicketDeflection(
      tickets,
      { days, minTickets, agentHourlyCost }
    );

    return NextResponse.json({
      success: true,
      analysis: deflectionAnalysis,
      generatedAt: new Date().toISOString(),
      parameters: { days, minTickets, agentHourlyCost }
    });

  } catch (error) {
    console.error('Deflection analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}

async function analyzeTicketDeflection(
  tickets: any[],
  params: { days: number; minTickets: number; agentHourlyCost: number }
): Promise<DeflectionAnalysis> {
  const { minTickets, agentHourlyCost } = params;
  
  // Group tickets by similarity clusters
  const clusters = await findTicketClusters(tickets, 0.85); // High similarity threshold
  
  // Filter clusters with enough tickets to be worth deflecting
  const significantClusters = clusters.filter(cluster => 
    cluster.tickets.length >= minTickets
  );

  const insights: DeflectionInsight[] = [];

  for (const cluster of significantClusters) {
    const insight = await generateDeflectionInsight(cluster, agentHourlyCost);
    if (insight) {
      insights.push(insight);
    }
  }

  // Sort by annual cost impact
  insights.sort((a, b) => b.annualCost - a.annualCost);

  // Calculate summary stats
  const totalTicketsAnalyzed = tickets.length;
  const repetitiveTicketCount = significantClusters.reduce((sum, cluster) => 
    sum + cluster.tickets.length, 0
  );
  const avgTicketCost = calculateAverageTicketCost(tickets, agentHourlyCost);

  // Calculate total potential savings
  const totalPotentialSavings = insights.reduce((sum, insight) => 
    sum + insight.annualCost, 0
  );
  const monthlyPotentialSavings = totalPotentialSavings / 12;

  // Categorize insights
  const quickWins = insights.filter(i => 
    i.implementationDifficulty === 'easy' && i.deflectionPotential > 60
  ).slice(0, 3);

  const bigImpact = insights.filter(i => 
    i.annualCost > totalPotentialSavings * 0.1
  ).slice(0, 5);

  const longTerm = insights.filter(i => 
    i.customerImpact === 'high' && i.implementationDifficulty === 'hard'
  ).slice(0, 3);

  // Category cost analysis
  const categoryStats = analyzeCostByCategory(tickets, agentHourlyCost);

  return {
    totalPotentialSavings,
    monthlyPotentialSavings,
    topInsights: insights.slice(0, 10),
    summaryStats: {
      totalTicketsAnalyzed,
      repetitiveTicketCount,
      avgTicketCost,
      topCostDrivers: categoryStats
    },
    recommendations: {
      quickWins,
      bigImpact,
      longTerm
    }
  };
}

async function findTicketClusters(tickets: any[], similarityThreshold: number) {
  const clusters: Array<{
    id: string;
    tickets: any[];
    centroid: number[];
    category: string;
  }> = [];

  for (const ticket of tickets) {
    if (!ticket.embedding) continue;

    let assignedToCluster = false;

    // Try to assign to existing cluster
    for (const cluster of clusters) {
      const similarity = cosineSimilarity(ticket.embedding, cluster.centroid);
      
      if (similarity >= similarityThreshold) {
        cluster.tickets.push(ticket);
        // Update centroid (simple average)
        cluster.centroid = updateCentroid(cluster.centroid, ticket.embedding, cluster.tickets.length);
        assignedToCluster = true;
        break;
      }
    }

    // Create new cluster if no match found
    if (!assignedToCluster) {
      clusters.push({
        id: `cluster_${clusters.length + 1}`,
        tickets: [ticket],
        centroid: [...ticket.embedding],
        category: ticket.category || 'Other'
      });
    }
  }

  return clusters;
}

function updateCentroid(currentCentroid: number[], newEmbedding: number[], count: number): number[] {
  const weight = 1 / count;
  return currentCentroid.map((value, index) => 
    value * (1 - weight) + newEmbedding[index] * weight
  );
}

async function generateDeflectionInsight(
  cluster: any,
  agentHourlyCost: number
): Promise<DeflectionInsight | null> {
  const { tickets, category } = cluster;
  
  if (tickets.length < 5) return null;

  // Calculate metrics
  const ticketCount = tickets.length;
  const avgHandleTime = tickets.reduce((sum: number, t: any) => 
    sum + (t.response_time_minutes || 15), 0
  ) / ticketCount;

  const annualCost = Math.round(ticketCount * (avgHandleTime / 60) * agentHourlyCost * 4.33); // 4.33 = weeks per month * 12 months / 52 weeks
  const monthlyCost = Math.round(annualCost / 12);

  // Extract example questions
  const exampleQuestions = tickets
    .slice(0, 3)
    .map((t: any) => t.subject || t.content?.substring(0, 100) + '...')
    .filter((q: string) => q && q.length > 10);

  if (exampleQuestions.length === 0) return null;

  // Generate insights
  const commonTheme = extractCommonTheme(tickets);
  const deflectionPotential = calculateDeflectionPotential(tickets, category);
  const customerImpact = assessCustomerImpact(tickets);
  const implementationDifficulty = assessImplementationDifficulty(category, commonTheme);

  // Generate KB article template
  const kbArticleTemplate = generateKBTemplate(commonTheme, exampleQuestions, category);

  return {
    id: `deflection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    patternId: cluster.id,
    title: `Reduce "${commonTheme}" tickets`,
    description: `${ticketCount} customers ask about ${commonTheme.toLowerCase()} every month. Create a KB article to deflect these tickets.`,
    ticketCount,
    avgHandleTime,
    annualCost,
    monthlyCost,
    exampleQuestions,
    recommendedAction: deflectionPotential > 70 ? 'Create comprehensive KB article' : 'Improve existing documentation',
    kbArticleTemplate,
    confidence: Math.min(0.9, ticketCount / 50), // Higher confidence with more tickets
    priority: annualCost > 10000 ? 'high' : annualCost > 3000 ? 'medium' : 'low',
    deflectionPotential,
    customerImpact,
    implementationDifficulty
  };
}

function extractCommonTheme(tickets: any[]): string {
  // Extract common words from subjects and content
  const allText = tickets
    .map(t => `${t.subject || ''} ${t.content || ''}`)
    .join(' ')
    .toLowerCase();

  // Simple keyword extraction (in production, use more sophisticated NLP)
  const words = allText.split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['the', 'and', 'for', 'with', 'this', 'that', 'have', 'from', 'your', 'they', 'been', 'were', 'said', 'what', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other', 'after', 'first', 'well', 'many', 'some', 'these', 'work', 'like', 'just', 'also', 'before', 'here', 'more', 'through', 'when', 'where', 'most', 'both', 'those', 'only', 'now', 'very', 'even', 'back', 'any', 'good', 'how', 'our', 'out', 'way', 'make', 'may', 'new', 'take', 'come', 'its', 'over', 'think', 'also', 'her', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'].includes(word));

  const wordCounts = words.reduce((acc: Record<string, number>, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});

  const topWords = Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([word]) => word);

  return topWords.join(' ').replace(/\b\w/g, l => l.toUpperCase());
}

function calculateDeflectionPotential(tickets: any[], category: string): number {
  // Higher deflection potential for FAQ-type categories
  const highDeflectionCategories = ['how-to', 'billing', 'account', 'technical'];
  const baseScore = highDeflectionCategories.includes(category.toLowerCase()) ? 80 : 60;
  
  // Adjust based on ticket characteristics
  const hasNegativeSentiment = tickets.some((t: any) => t.sentiment === 'negative');
  const adjustedScore = hasNegativeSentiment ? baseScore - 20 : baseScore;
  
  return Math.max(30, Math.min(95, adjustedScore));
}

function assessCustomerImpact(tickets: any[]): 'high' | 'medium' | 'low' {
  const uniqueCustomers = new Set(tickets.map((t: any) => t.customer_email)).size;
  const totalTickets = tickets.length;
  const repeatRate = 1 - (uniqueCustomers / totalTickets);
  
  if (repeatRate > 0.5) return 'high';
  if (repeatRate > 0.3) return 'medium';
  return 'low';
}

function assessImplementationDifficulty(category: string, theme: string): 'easy' | 'medium' | 'hard' {
  const easyCategories = ['billing', 'account', 'how-to'];
  const hardTopics = ['integration', 'api', 'custom', 'advanced'];
  
  if (easyCategories.includes(category.toLowerCase())) return 'easy';
  if (hardTopics.some(topic => theme.toLowerCase().includes(topic))) return 'hard';
  return 'medium';
}

function generateKBTemplate(theme: string, questions: string[], category: string): string {
  return `# ${theme} - Frequently Asked Questions

## Overview
This article addresses common questions about ${theme.toLowerCase()}.

## Common Questions

${questions.map((q, i) => `### ${i + 1}. ${q}
[Add detailed answer here]`).join('\n\n')}

## Related Articles
- [Link to related article 1]
- [Link to related article 2]

## Still Need Help?
If you can't find what you're looking for, please contact our support team.

---
*This KB article was generated based on analysis of ${questions.length} similar support tickets.*`;
}

function calculateAverageTicketCost(tickets: any[], agentHourlyCost: number): number {
  const totalMinutes = tickets.reduce((sum, t) => sum + (t.response_time_minutes || 15), 0);
  const avgMinutes = totalMinutes / tickets.length;
  return Math.round((avgMinutes / 60) * agentHourlyCost * 100) / 100;
}

function analyzeCostByCategory(tickets: any[], agentHourlyCost: number): Array<{
  category: string;
  cost: number;
  percentage: number;
}> {
  const categoryStats = tickets.reduce((acc: Record<string, { count: number; totalTime: number }>, ticket) => {
    const category = ticket.category || 'Other';
    if (!acc[category]) {
      acc[category] = { count: 0, totalTime: 0 };
    }
    acc[category].count++;
    acc[category].totalTime += (ticket.response_time_minutes || 15);
    return acc;
  }, {});

  const totalCost = Object.values(categoryStats).reduce((sum, stats) => 
    sum + (stats.totalTime / 60) * agentHourlyCost, 0
  );

  return Object.entries(categoryStats)
    .map(([category, stats]) => {
      const cost = Math.round((stats.totalTime / 60) * agentHourlyCost);
      return {
        category,
        cost,
        percentage: Math.round((cost / totalCost) * 100)
      };
    })
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5);
}
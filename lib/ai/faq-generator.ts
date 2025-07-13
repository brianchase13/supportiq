import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase/client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface TicketCluster {
  id: string;
  tickets: Array<{
    id: string;
    content: string;
    subject?: string;
    category?: string;
    resolution?: string;
  }>;
  commonTheme: string;
  frequency: number;
  averageResolutionTime: number;
}

export interface GeneratedFAQ {
  title: string;
  content: string;
  category: string;
  tags: string[];
  sourceTicketIds: string[];
  confidence: number;
}

export class FAQGenerator {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Analyze tickets and generate FAQ articles automatically
   */
  async generateFAQsFromTickets(options: {
    daysBack?: number;
    minTicketCount?: number;
    maxFAQs?: number;
  } = {}): Promise<GeneratedFAQ[]> {
    const {
      daysBack = 30,
      minTicketCount = 3,
      maxFAQs = 10
    } = options;

    try {
      // 1. Get recent tickets
      const tickets = await this.getRecentTickets(daysBack);
      
      if (tickets.length < minTicketCount) {
        return [];
      }

      // 2. Cluster similar tickets
      const clusters = await this.clusterTickets(tickets);
      
      // 3. Filter clusters with enough frequency
      const significantClusters = clusters
        .filter(cluster => cluster.frequency >= minTicketCount)
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, maxFAQs);

      // 4. Generate FAQ for each cluster
      const faqs: GeneratedFAQ[] = [];
      
      for (const cluster of significantClusters) {
        try {
          const faq = await this.generateFAQFromCluster(cluster);
          if (faq) {
            faqs.push(faq);
          }
        } catch (error) {
          console.error('Error generating FAQ for cluster:', error);
        }
      }

      // 5. Store generated FAQs
      await this.storeFAQs(faqs);

      return faqs;

    } catch (error) {
      console.error('FAQ generation error:', error);
      throw error;
    }
  }

  /**
   * Get recent tickets for analysis
   */
  private async getRecentTickets(daysBack: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const { data: tickets, error } = await supabaseAdmin
      .from('tickets')
      .select(`
        id,
        content,
        subject,
        category,
        resolution,
        created_at,
        conversation_metadata
      `)
      .eq('user_id', this.userId)
      .gte('created_at', cutoffDate.toISOString())
      .not('resolution', 'is', null) // Only resolved tickets
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      throw error;
    }

    return tickets || [];
  }

  /**
   * Cluster similar tickets using AI
   */
  private async clusterTickets(tickets: any[]): Promise<TicketCluster[]> {
    if (tickets.length === 0) return [];

    const prompt = `
Analyze these customer support tickets and group them into clusters of similar issues. For each cluster, identify:
1. The common theme/problem
2. Which tickets belong together
3. The frequency of this issue

Tickets:
${tickets.map((t, i) => `
${i + 1}. ID: ${t.id}
Subject: ${t.subject || 'No subject'}
Content: ${t.content.substring(0, 200)}...
Category: ${t.category || 'Uncategorized'}
`).join('\n')}

Return a JSON array of clusters in this format:
[
  {
    "commonTheme": "Password reset issues",
    "ticketIds": ["ticket_1", "ticket_2"],
    "category": "authentication",
    "frequency": 2
  }
]

Only create clusters with at least 2 similar tickets. Maximum 10 clusters.
`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing customer support patterns and clustering similar issues. Return only valid JSON.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      const clusters = JSON.parse(response);
      
      // Convert to TicketCluster format
      return clusters.map((cluster: any) => ({
        id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tickets: cluster.ticketIds.map((id: string) => 
          tickets.find(t => t.id === id)
        ).filter(Boolean),
        commonTheme: cluster.commonTheme,
        frequency: cluster.frequency,
        averageResolutionTime: this.calculateAverageResolutionTime(
          cluster.ticketIds.map((id: string) => tickets.find(t => t.id === id)).filter(Boolean)
        )
      }));

    } catch (error) {
      console.error('Error clustering tickets:', error);
      return [];
    }
  }

  /**
   * Generate FAQ article from a cluster of similar tickets
   */
  private async generateFAQFromCluster(cluster: TicketCluster): Promise<GeneratedFAQ | null> {
    const ticketExamples = cluster.tickets.slice(0, 5); // Use top 5 examples

    const prompt = `
Based on these similar customer support tickets, create a comprehensive FAQ article.

Common Theme: ${cluster.commonTheme}
Frequency: ${cluster.frequency} times in recent period

Example Tickets:
${ticketExamples.map((t, i) => `
Example ${i + 1}:
Subject: ${t.subject || 'No subject'}
Customer Question: ${t.content.substring(0, 300)}...
Resolution: ${t.resolution?.substring(0, 300) || 'No resolution recorded'}...
`).join('\n')}

Create a FAQ article with:
1. A clear, customer-friendly title (question format)
2. A comprehensive answer that addresses this issue
3. Relevant tags for categorization
4. Appropriate category

Return JSON format:
{
  "title": "How do I reset my password?",
  "content": "Detailed step-by-step answer...",
  "category": "authentication",
  "tags": ["password", "reset", "login"],
  "confidence": 0.85
}

Make the answer:
- Clear and actionable
- Include step-by-step instructions where relevant
- Address common variations of the problem
- Be helpful for customers to self-serve
`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a customer support expert who creates helpful FAQ articles. Write in a friendly, professional tone. Return only valid JSON.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return null;
      }

      const faqData = JSON.parse(response);
      
      return {
        title: faqData.title,
        content: faqData.content,
        category: faqData.category,
        tags: faqData.tags,
        sourceTicketIds: cluster.tickets.map(t => t.id),
        confidence: faqData.confidence || 0.8
      };

    } catch (error) {
      console.error('Error generating FAQ from cluster:', error);
      return null;
    }
  }

  /**
   * Store generated FAQs in the knowledge base
   */
  private async storeFAQs(faqs: GeneratedFAQ[]): Promise<void> {
    if (faqs.length === 0) return;

    const insertData = faqs.map(faq => ({
      user_id: this.userId,
      title: faq.title,
      content: faq.content,
      category: faq.category,
      tags: faq.tags,
      usage_count: 0,
      success_rate: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabaseAdmin
      .from('knowledge_base')
      .insert(insertData);

    if (error) {
      console.error('Error storing FAQs:', error);
      throw error;
    }
  }

  /**
   * Calculate average resolution time for tickets
   */
  private calculateAverageResolutionTime(tickets: any[]): number {
    // This would calculate based on ticket timestamps
    // For now, return a default value
    return 24; // hours
  }

  /**
   * Get existing knowledge base articles for a user
   */
  async getKnowledgeBase(): Promise<any[]> {
    const { data: articles, error } = await supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .eq('user_id', this.userId)
      .eq('is_active', true)
      .order('usage_count', { ascending: false });

    if (error) {
      throw error;
    }

    return articles || [];
  }

  /**
   * Update FAQ usage when it's used for deflection
   */
  async trackFAQUsage(faqId: string, wasSuccessful: boolean): Promise<void> {
    const { data: faq, error: fetchError } = await supabaseAdmin
      .from('knowledge_base')
      .select('usage_count, success_rate')
      .eq('id', faqId)
      .single();

    if (fetchError || !faq) return;

    const newUsageCount = (faq.usage_count || 0) + 1;
    const currentSuccessRate = faq.success_rate || 0;
    const newSuccessRate = wasSuccessful 
      ? ((currentSuccessRate * (newUsageCount - 1)) + 1) / newUsageCount
      : (currentSuccessRate * (newUsageCount - 1)) / newUsageCount;

    const { error: updateError } = await supabaseAdmin
      .from('knowledge_base')
      .update({
        usage_count: newUsageCount,
        success_rate: newSuccessRate,
        updated_at: new Date().toISOString()
      })
      .eq('id', faqId);

    if (updateError) {
      console.error('Error tracking FAQ usage:', updateError);
    }
  }

  /**
   * Search knowledge base for relevant articles
   */
  async searchKnowledgeBase(query: string, limit: number = 5): Promise<any[]> {
    // For now, do a simple text search
    // In production, you'd want to use embeddings/vector search
    const { data: articles, error } = await supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .eq('user_id', this.userId)
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('success_rate', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return articles || [];
  }
}
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { SupabaseClient } from '@supabase/supabase-js';

interface Ticket {
  id: string;
  subject: string;
  body: string;
  category?: string;
  tags?: string[];
  created_at: string;
  resolution?: string;
  satisfaction_score?: number;
}

interface TicketCluster {
  id: string;
  name: string;
  tickets: Ticket[];
  keywords: string[];
  category: string;
  frequency: number;
  avg_satisfaction: number;
  embeddings: number[][];
}

interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  related_tickets: string[];
  confidence: number;
  created_at: string;
  updated_at: string;
  view_count: number;
  helpful_count: number;
}

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_read_time: number;
  related_articles: string[];
  created_at: string;
  updated_at: string;
}

export class FAQGenerator {
  private openai: OpenAI;
  private supabase: SupabaseClient;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async generateFAQFromTickets(userId: string, days: number = 90): Promise<FAQEntry[]> {
    try {
      // Get tickets from the specified time period
      const tickets = await this.getTicketsForPeriod(userId, days);
      
      if (tickets.length < 10) {
        console.log('Not enough tickets to generate meaningful FAQ');
        return [];
      }

      // Cluster similar tickets
      const clusters = await this.clusterTickets(tickets);
      
      // Generate FAQ entries from clusters
      const faqEntries: FAQEntry[] = [];
      
      for (const cluster of clusters) {
        if (cluster.frequency >= 3) { // Only create FAQ for clusters with 3+ tickets
          const faqEntry = await this.generateFAQFromCluster(cluster);
          if (faqEntry) {
            faqEntries.push(faqEntry);
          }
        }
      }

      // Save FAQ entries to database
      await this.saveFAQEntries(faqEntries, userId);

      return faqEntries;
    } catch (error) {
      console.error('Error generating FAQ from tickets:', error);
      return [];
    }
  }

  private async getTicketsForPeriod(userId: string, days: number): Promise<Ticket[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('tickets')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching tickets: ${error.message}`);
    }

    return data || [];
  }

  private async clusterTickets(tickets: Ticket[]): Promise<TicketCluster[]> {
    const clusters: TicketCluster[] = [];
    
    // Group tickets by category first
    const categoryGroups = this.groupTicketsByCategory(tickets);
    
    for (const [category, categoryTickets] of Object.entries(categoryGroups)) {
      // Get embeddings for tickets in this category
      const embeddings = await this.getEmbeddings(categoryTickets);
      
      // Cluster tickets using similarity
      const categoryClusters = this.similarityClustering(categoryTickets, embeddings);
      
      clusters.push(...categoryClusters);
    }

    return clusters;
  }

  private groupTicketsByCategory(tickets: Ticket[]): { [key: string]: Ticket[] } {
    const groups: { [key: string]: Ticket[] } = {};
    
    for (const ticket of tickets) {
      const category = ticket.category || 'general';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(ticket);
    }
    
    return groups;
  }

  private async getEmbeddings(tickets: Ticket[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (const ticket of tickets) {
      const text = `${ticket.subject} ${ticket.body}`;
      const embedding = await this.getTextEmbedding(text);
      embeddings.push(embedding);
    }
    
    return embeddings;
  }

  private async getTextEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error getting embedding:', error);
      return new Array(1536).fill(0); // Fallback to zero vector
    }
  }

  private similarityClustering(tickets: Ticket[], embeddings: number[][]): TicketCluster[] {
    const clusters: TicketCluster[] = [];
    const visited = new Set<number>();
    
    for (let i = 0; i < tickets.length; i++) {
      if (visited.has(i)) continue;
      
      const cluster: TicketCluster = {
        id: `cluster_${clusters.length}`,
        name: '',
        tickets: [tickets[i]],
        keywords: [],
        category: tickets[i].category || 'general',
        frequency: 1,
        avg_satisfaction: tickets[i].satisfaction_score || 0,
        embeddings: [embeddings[i]]
      };
      
      visited.add(i);
      
      // Find similar tickets
      for (let j = i + 1; j < tickets.length; j++) {
        if (visited.has(j)) continue;
        
        const similarity = this.cosineSimilarity(embeddings[i], embeddings[j]);
        if (similarity > 0.85) { // High similarity threshold
          cluster.tickets.push(tickets[j]);
          cluster.embeddings.push(embeddings[j]);
          cluster.frequency++;
          cluster.avg_satisfaction += tickets[j].satisfaction_score ?? 0;
          visited.add(j);
        }
      }
      
      // Calculate average satisfaction
      cluster.avg_satisfaction = cluster.avg_satisfaction / cluster.frequency;
      
      // Extract keywords from cluster
      cluster.keywords = this.extractKeywords(cluster.tickets);
      
      // Generate cluster name
      cluster.name = this.generateClusterName(cluster);
      
      clusters.push(cluster);
    }
    
    return clusters;
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private extractKeywords(tickets: Ticket[]): string[] {
    const allText = tickets.map(t => `${t.subject} ${t.body}`).join(' ');
    const words = allText.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private generateClusterName(cluster: TicketCluster): string {
    const commonWords = cluster.keywords.slice(0, 3).join(' ');
    return `${cluster.category.charAt(0).toUpperCase() + cluster.category.slice(1)}: ${commonWords}`;
  }

  private async generateFAQFromCluster(cluster: TicketCluster): Promise<FAQEntry | null> {
    try {
      const prompt = `
Based on these similar support tickets, generate a comprehensive FAQ entry:

Tickets:
${cluster.tickets.map(t => `- ${t.subject}: ${t.body.substring(0, 200)}...`).join('\n')}

Category: ${cluster.category}
Keywords: ${cluster.keywords.join(', ')}
Frequency: ${cluster.frequency} tickets
Average satisfaction: ${cluster.avg_satisfaction.toFixed(1)}/5

Generate a JSON response with:
{
  "question": "A clear, specific question that captures the common issue",
  "answer": "A comprehensive answer that addresses the root cause and provides solutions",
  "tags": ["relevant", "tags", "for", "categorization"],
  "confidence": 0.95
}

Focus on creating helpful, actionable content that would resolve similar issues in the future.
`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 800
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return null;

      const faqData = JSON.parse(response);
      
      return {
        id: `faq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        question: faqData.question,
        answer: faqData.answer,
        category: cluster.category,
        tags: faqData.tags || cluster.keywords,
        related_tickets: cluster.tickets.map(t => t.id),
        confidence: faqData.confidence || 0.8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        view_count: 0,
        helpful_count: 0
      };
    } catch (error) {
      console.error('Error generating FAQ from cluster:', error);
      return null;
    }
  }

  private async saveFAQEntries(faqEntries: FAQEntry[], userId: string): Promise<void> {
    for (const entry of faqEntries) {
      try {
        await this.supabase
          .from('faq_entries')
          .upsert({
            ...entry,
            user_id: userId
          }, {
            onConflict: 'id'
          });
      } catch (error) {
        console.error('Error saving FAQ entry:', error);
      }
    }
  }

  async generateKnowledgeBaseArticles(userId: string): Promise<KnowledgeBaseArticle[]> {
    try {
      // Get FAQ entries
      const { data: faqEntries } = await this.supabase
        .from('faq_entries')
        .select('*')
        .eq('user_id', userId)
        .order('view_count', { ascending: false });

      if (!faqEntries || faqEntries.length === 0) {
        return [];
      }

      const articles: KnowledgeBaseArticle[] = [];

      // Group FAQ entries by category
      const categoryGroups = this.groupFAQByCategory(faqEntries);

      for (const [category, entries] of Object.entries(categoryGroups)) {
        if (entries.length >= 3) {
          const article = await this.generateArticleFromFAQ(category, entries);
          if (article) {
            articles.push(article);
          }
        }
      }

      // Save articles
      await this.saveKnowledgeBaseArticles(articles, userId);

      return articles;
    } catch (error) {
      console.error('Error generating knowledge base articles:', error);
      return [];
    }
  }

  private groupFAQByCategory(faqEntries: FAQEntry[]): { [key: string]: FAQEntry[] } {
    const groups: { [key: string]: FAQEntry[] } = {};
    
    for (const entry of faqEntries) {
      if (!groups[entry.category]) {
        groups[entry.category] = [];
      }
      groups[entry.category].push(entry);
    }
    
    return groups;
  }

  private async generateArticleFromFAQ(category: string, entries: FAQEntry[]): Promise<KnowledgeBaseArticle | null> {
    try {
      const prompt = `
Create a comprehensive knowledge base article based on these FAQ entries:

Category: ${category}
FAQ Entries:
${entries.map(e => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n')}

Generate a JSON response with:
{
  "title": "A clear, descriptive title for the article",
  "content": "Comprehensive article content with sections, examples, and step-by-step instructions",
  "difficulty": "beginner|intermediate|advanced",
  "estimated_read_time": 5,
  "tags": ["relevant", "tags"]
}

The article should be comprehensive, well-structured, and provide value beyond the individual FAQ entries.
`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return null;

      const articleData = JSON.parse(response);
      
      return {
        id: `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: articleData.title,
        content: articleData.content,
        category,
        tags: articleData.tags || [],
        difficulty: articleData.difficulty || 'beginner',
        estimated_read_time: articleData.estimated_read_time || 5,
        related_articles: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating knowledge base article:', error);
      return null;
    }
  }

  private async saveKnowledgeBaseArticles(articles: KnowledgeBaseArticle[], userId: string): Promise<void> {
    for (const article of articles) {
      try {
        await this.supabase
          .from('knowledge_base_articles')
          .upsert({
            ...article,
            user_id: userId
          }, {
            onConflict: 'id'
          });
      } catch (error) {
        console.error('Error saving knowledge base article:', error);
      }
    }
  }

  async searchFAQ(query: string, userId: string, limit: number = 10): Promise<FAQEntry[]> {
    try {
      // Get query embedding
      const queryEmbedding = await this.getTextEmbedding(query);
      
      // Get all FAQ entries
      const { data: faqEntries } = await this.supabase
        .from('faq_entries')
        .select('*')
        .eq('user_id', userId);

      if (!faqEntries) return [];

      // Calculate similarity scores
      const entriesWithScores = faqEntries.map((entry: FAQEntry) => {
        // For now, use simple text matching since we don't store embeddings
        const text = `${entry.question} ${entry.answer}`.toLowerCase();
        const queryLower = query.toLowerCase();
        
        let score = 0;
        const queryWords = queryLower.split(' ');
        
        for (const word of queryWords) {
          if (text.includes(word)) {
            score += 1;
          }
        }
        
        return { ...entry, similarity: score / queryWords.length };
      });

      // Sort by similarity and return top results
      return entriesWithScores
        .sort((a: { similarity: number }, b: { similarity: number }) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(({ similarity, ...entry }: { similarity: number } & FAQEntry) => entry);
    } catch (error) {
      console.error('Error searching FAQ:', error);
      return [];
    }
  }

  async updateFAQStats(faqId: string, action: 'view' | 'helpful'): Promise<void> {
    try {
      const update = action === 'view' 
        ? { view_count: this.supabase.sql`view_count + 1` }
        : { helpful_count: this.supabase.sql`helpful_count + 1` };

      await this.supabase
        .from('faq_entries')
        .update(update)
        .eq('id', faqId);
    } catch (error) {
      console.error('Error updating FAQ stats:', error);
    }
  }

  async getFAQAnalytics(userId: string, days: number = 30): Promise<unknown> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: faqEntries } = await this.supabase
        .from('faq_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString());

      if (!faqEntries) return null;

      const totalEntries = faqEntries.length;
      const totalViews = faqEntries.reduce((sum: number, entry: FAQEntry) => sum + entry.view_count, 0);
      const totalHelpful = faqEntries.reduce((sum: number, entry: FAQEntry) => sum + entry.helpful_count, 0);
      const avgConfidence = faqEntries.reduce((sum: number, entry: FAQEntry) => sum + entry.confidence, 0) / totalEntries;

      // Category breakdown
      const categoryStats: { [key: string]: number } = {};
      faqEntries.forEach((entry: FAQEntry) => {
        categoryStats[entry.category] = (categoryStats[entry.category] || 0) + 1;
      });

      return {
        total_entries: totalEntries,
        total_views: totalViews,
        total_helpful: totalHelpful,
        avg_confidence: avgConfidence,
        helpful_rate: totalViews > 0 ? (totalHelpful / totalViews) * 100 : 0,
        category_breakdown: categoryStats,
        top_performers: faqEntries
          .sort((a: FAQEntry, b: FAQEntry) => b.view_count - a.view_count)
          .slice(0, 5)
      };
    } catch (error) {
      console.error('Error getting FAQ analytics:', error);
      return null;
    }
  }
}
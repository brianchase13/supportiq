import { supabaseAdmin } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';

export interface DashboardMetrics {
  totalTickets: number;
  openTickets: number;
  avgResponseTime: number;
  customerSatisfaction: number;
  lastUpdated: string;
  
  // Trending data
  ticketTrends: Array<{
    date: string;
    count: number;
    resolved: number;
  }>;
  
  // Category breakdown
  categories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  
  // Sentiment analysis
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  
  // AI Insights
  insights: Array<{
    id: string;
    type: 'opportunity' | 'warning' | 'success';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number;
  }>;
  
  // Real-time status
  isLive: boolean;
  cacheAge: number; // milliseconds
  nextSync: string;
}

export interface DashboardError {
  message: string;
  code: string;
  retryAfter?: number;
  fallbackData?: Partial<DashboardMetrics>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STALE_DURATION = 15 * 60 * 1000; // 15 minutes - show stale data with warning

export class DashboardDataService {
  private userId: string;
  private cache: Map<string, { data: DashboardMetrics; timestamp: number }> = new Map();
  
  constructor(userId: string) {
    this.userId = userId;
  }

  async getDashboardMetrics(forceRefresh = false): Promise<{ 
    data: DashboardMetrics; 
    error?: DashboardError;
    fromCache: boolean;
  }> {
    const cacheKey = `dashboard_${this.userId}`;
    const now = Date.now();
    
    // Check cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        const age = now - cached.timestamp;
        
        // Fresh cache - return immediately
        if (age < CACHE_DURATION) {
          return {
            data: {
              ...cached.data,
              cacheAge: age,
              isLive: age < 30000, // Consider "live" if less than 30 seconds old
            },
            fromCache: true
          };
        }
        
        // Stale but acceptable cache - return with warning
        if (age < STALE_DURATION) {
          // Trigger async refresh but return stale data
          this.refreshDataAsync(cacheKey);
          
          return {
            data: {
              ...cached.data,
              cacheAge: age,
              isLive: false,
            },
            error: {
              message: 'Using cached data while refreshing',
              code: 'STALE_CACHE',
              fallbackData: cached.data
            },
            fromCache: true
          };
        }
      }
    }

    try {
      // Fetch fresh data
      const freshData = await this.fetchFreshMetrics();
      
      // Update cache
      this.cache.set(cacheKey, {
        data: freshData,
        timestamp: now
      });
      
      return {
        data: {
          ...freshData,
          cacheAge: 0,
          isLive: true,
        },
        fromCache: false
      };
      
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      
      // Try to return stale cache as fallback
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return {
          data: {
            ...cached.data,
            cacheAge: now - cached.timestamp,
            isLive: false,
          },
          error: {
            message: 'Failed to refresh data, showing cached version',
            code: 'FETCH_ERROR',
            retryAfter: 30000,
            fallbackData: cached.data
          },
          fromCache: true
        };
      }
      
      // No cache available - return minimal fallback
      throw {
        message: error instanceof Error ? error.message : 'Dashboard data unavailable',
        code: 'NO_DATA',
        retryAfter: 60000
      };
    }
  }

  private async refreshDataAsync(cacheKey: string): Promise<void> {
    try {
      const freshData = await this.fetchFreshMetrics();
      this.cache.set(cacheKey, {
        data: freshData,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Async refresh failed:', error);
    }
  }

  private async fetchFreshMetrics(): Promise<DashboardMetrics> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Parallel data fetching for performance
    const [
      ticketStats,
      trendData,
      categoryData,
      sentimentData,
      aiInsights
    ] = await Promise.all([
      this.fetchTicketStats(),
      this.fetchTrendData(sevenDaysAgo),
      this.fetchCategoryBreakdown(),
      this.fetchSentimentData(),
      this.fetchAIInsights()
    ]);

    return {
      ...ticketStats,
      ticketTrends: trendData,
      categories: categoryData,
      sentiment: sentimentData,
      insights: aiInsights,
      lastUpdated: now.toISOString(),
      isLive: true,
      cacheAge: 0,
      nextSync: new Date(now.getTime() + CACHE_DURATION).toISOString()
    };
  }

  private async fetchTicketStats() {
    const { data: stats, error } = await supabaseAdmin
      .from('tickets')
      .select(`
        id,
        status,
        response_time_minutes,
        created_at,
        sentiment_score
      `)
      .eq('user_id', this.userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw new Error(`Failed to fetch ticket stats: ${error.message}`);

    const tickets = stats || [];
    const openTickets = tickets.filter(t => ['open', 'snoozed'].includes(t.status)).length;
    
    // Calculate average response time (excluding null values)
    const responseTimes = tickets
      .map(t => t.response_time_minutes)
      .filter(t => t !== null && t !== undefined) as number[];
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Calculate satisfaction from sentiment scores
    const sentimentScores = tickets
      .map(t => t.sentiment_score)
      .filter(s => s !== null && s !== undefined) as number[];
    
    const customerSatisfaction = sentimentScores.length > 0
      ? ((sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length) + 1) * 50 // Convert -1 to 1 range to 0-100
      : 0;

    return {
      totalTickets: tickets.length,
      openTickets,
      avgResponseTime: Math.round(avgResponseTime),
      customerSatisfaction: Math.round(customerSatisfaction)
    };
  }

  private async fetchTrendData(since: Date) {
    const { data: trends, error } = await supabaseAdmin
      .from('tickets')
      .select('created_at, status')
      .eq('user_id', this.userId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch trend data: ${error.message}`);

    // Group by day
    const dailyStats = new Map<string, { count: number; resolved: number }>();
    
    (trends || []).forEach(ticket => {
      const date = new Date(ticket.created_at).toISOString().split('T')[0];
      const existing = dailyStats.get(date) || { count: 0, resolved: 0 };
      
      dailyStats.set(date, {
        count: existing.count + 1,
        resolved: existing.resolved + (ticket.status === 'closed' ? 1 : 0)
      });
    });

    // Fill in missing days with zeros
    const result = [];
    for (let d = new Date(since); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const stats = dailyStats.get(dateStr) || { count: 0, resolved: 0 };
      result.push({
        date: dateStr,
        ...stats
      });
    }

    return result;
  }

  private async fetchCategoryBreakdown() {
    const { data: categories, error } = await supabaseAdmin
      .from('tickets')
      .select('category')
      .eq('user_id', this.userId)
      .not('category', 'is', null)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw new Error(`Failed to fetch category data: ${error.message}`);

    const categoryCounts = new Map<string, number>();
    const total = (categories || []).length;

    (categories || []).forEach(ticket => {
      const category = ticket.category || 'Other';
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    });

    return Array.from(categoryCounts.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }

  private async fetchSentimentData() {
    const { data: sentiments, error } = await supabaseAdmin
      .from('tickets')
      .select('sentiment')
      .eq('user_id', this.userId)
      .not('sentiment', 'is', null)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw new Error(`Failed to fetch sentiment data: ${error.message}`);

    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    
    (sentiments || []).forEach(ticket => {
      const sentiment = ticket.sentiment as keyof typeof sentimentCounts;
      if (sentiment in sentimentCounts) {
        sentimentCounts[sentiment]++;
      }
    });

    return sentimentCounts;
  }

  private async fetchAIInsights(): Promise<DashboardMetrics['insights']> {
    try {
      // Get recent analysis results to generate insights
      const { data: recentTickets, error } = await supabaseAdmin
        .from('tickets')
        .select('category, sentiment, response_time_minutes, created_at')
        .eq('user_id', this.userId)
        .not('category', 'is', null)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error || !recentTickets) return [];

      const insights: DashboardMetrics['insights'] = [];

      // Insight 1: High volume category
      const categoryVolume = new Map<string, number>();
      recentTickets.forEach(ticket => {
        const cat = ticket.category || 'Other';
        categoryVolume.set(cat, (categoryVolume.get(cat) || 0) + 1);
      });

      const topCategory = Array.from(categoryVolume.entries())
        .sort((a, b) => b[1] - a[1])[0];

      if (topCategory && topCategory[1] > recentTickets.length * 0.3) {
        insights.push({
          id: 'high_volume_category',
          type: 'opportunity',
          title: `${topCategory[0]} tickets are trending`,
          description: `${topCategory[1]} tickets (${Math.round(topCategory[1] / recentTickets.length * 100)}%) are about ${topCategory[0]}. Consider creating self-service content.`,
          impact: 'high',
          confidence: 0.9
        });
      }

      // Insight 2: Response time analysis
      const responseTimes = recentTickets
        .map(t => t.response_time_minutes)
        .filter(t => t !== null) as number[];

      if (responseTimes.length > 0) {
        const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        
        if (avgResponseTime > 60) { // More than 1 hour
          insights.push({
            id: 'slow_response_time',
            type: 'warning',
            title: 'Response times are slower than optimal',
            description: `Average response time is ${Math.round(avgResponseTime)} minutes. Consider workflow automation.`,
            impact: 'high',
            confidence: 0.85
          });
        } else if (avgResponseTime < 15) {
          insights.push({
            id: 'fast_response_time',
            type: 'success',
            title: 'Excellent response times!',
            description: `Average response time is ${Math.round(avgResponseTime)} minutes. Keep up the great work!`,
            impact: 'medium',
            confidence: 0.9
          });
        }
      }

      // Insight 3: Sentiment trends
      const negativeSentiments = recentTickets.filter(t => t.sentiment === 'negative').length;
      const negativePercentage = recentTickets.length > 0 ? negativeSentiments / recentTickets.length : 0;

      if (negativePercentage > 0.3) {
        insights.push({
          id: 'high_negative_sentiment',
          type: 'warning',
          title: 'Customer satisfaction needs attention',
          description: `${Math.round(negativePercentage * 100)}% of recent tickets show negative sentiment. Review escalation processes.`,
          impact: 'high',
          confidence: 0.8
        });
      }

      return insights.slice(0, 5); // Limit to 5 insights

    } catch (error) {
      console.error('Failed to generate insights:', error);
      return [];
    }
  }

  // Real-time subscription for live updates
  setupRealtimeSubscription(onUpdate: (metrics: Partial<DashboardMetrics>) => void) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    return supabase
      .channel(`dashboard_${this.userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `user_id=eq.${this.userId}`
        },
        async (payload) => {
          console.log('Real-time ticket update:', payload);
          
          // Invalidate cache and trigger refresh
          this.cache.delete(`dashboard_${this.userId}`);
          
          try {
            const { data } = await this.getDashboardMetrics(true);
            onUpdate(data);
          } catch (error) {
            console.error('Failed to refresh after real-time update:', error);
          }
        }
      )
      .subscribe();
  }
}
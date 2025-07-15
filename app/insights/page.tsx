'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Users,
  MessageSquare,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { ModernNavigation } from '@/components/layout/ModernNavigation';
import { useRequireAuth } from '@/lib/auth/user-context';

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  category: string;
  timestamp: string;
  metrics: {
    before: number;
    after: number;
    change: number;
  };
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { loading: authLoading } = useRequireAuth();

  useEffect(() => {
    // Simulate loading insights data
    setTimeout(() => {
      setInsights([
        {
          id: '1',
          title: 'Response Time Improved by 40%',
          description: 'AI automation has reduced average response time from 2.5 hours to 1.5 hours',
          type: 'positive',
          impact: 'high',
          category: 'Performance',
          timestamp: '2024-01-15T10:30:00Z',
          metrics: { before: 2.5, after: 1.5, change: 40 }
        },
        {
          id: '2',
          title: 'Ticket Volume Increased 15%',
          description: 'Customer inquiries have increased, but AI is handling 85% automatically',
          type: 'neutral',
          impact: 'medium',
          category: 'Volume',
          timestamp: '2024-01-14T14:20:00Z',
          metrics: { before: 100, after: 115, change: 15 }
        },
        {
          id: '3',
          title: 'Customer Satisfaction Dropped 5%',
          description: 'Some customers prefer human interaction for complex issues',
          type: 'negative',
          impact: 'medium',
          category: 'Satisfaction',
          timestamp: '2024-01-13T09:15:00Z',
          metrics: { before: 4.8, after: 4.6, change: -5 }
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'negative':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Target className="w-5 h-5 text-blue-600" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[impact as keyof typeof colors]}>{impact}</Badge>;
  };

  const filteredInsights = filter === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === filter);

  if (authLoading || loading) {
    return (
      <ModernNavigation>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </ModernNavigation>
    );
  }

  return (
    <ModernNavigation>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
            <p className="text-gray-600">Intelligent analysis of your support performance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <Brain className="w-4 h-4 mr-2" />
              Generate Insights
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Auto-Resolution Rate</CardTitle>
              <Zap className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-green-600">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.5h</div>
              <p className="text-xs text-green-600">
                -40% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.6/5</div>
              <p className="text-xs text-red-600">
                -5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12.5K</div>
              <p className="text-xs text-green-600">
                +18% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Insights' },
              { value: 'positive', label: 'Positive' },
              { value: 'negative', label: 'Negative' },
              { value: 'neutral', label: 'Neutral' }
            ].map((filterOption) => (
              <Button
                key={filterOption.value}
                variant={filter === filterOption.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterOption.value)}
              >
                {filterOption.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Insights List */}
        <div className="space-y-4">
          {filteredInsights.map((insight) => (
            <Card key={insight.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                        {getImpactBadge(insight.impact)}
                      </div>
                      <p className="text-gray-600 mb-3">{insight.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{insight.category}</span>
                        <span>•</span>
                        <span>{new Date(insight.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {insight.metrics.change > 0 ? '+' : ''}{insight.metrics.change}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {insight.metrics.before} → {insight.metrics.after}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
            <CardContent className="p-6 text-center">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Custom Insights</h3>
              <p className="text-gray-600 mb-4">
                Ask AI to analyze specific aspects of your support data
              </p>
              <Button variant="outline">
                <Brain className="w-4 h-4 mr-2" />
                Create Insight
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
            <CardContent className="p-6 text-center">
              <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Insights Report</h3>
              <p className="text-gray-600 mb-4">
                Download a comprehensive report of all insights
              </p>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernNavigation>
  );
}
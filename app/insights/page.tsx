'use client';

import { Card } from '@/components/ui/card';
import { Brain, TrendingUp, Clock, AlertTriangle, CheckCircle, ArrowRight, Lightbulb, Target, Zap, Users, Loader2, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useInsights } from '@/hooks/data/useSupabaseData';
import { useAuth } from '@/components/auth/AuthContext';
import Link from 'next/link';

interface Insight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'prevention' | 'efficiency' | 'satisfaction';
  impactScore: number;
  action: string;
  icon: React.ElementType;
  color: string;
}

// Fallback insights for demo purposes
const fallbackInsights: Insight[] = [
  {
    id: '1',
    title: '27% of tickets could be prevented with a docs update',
    description: 'Most common questions about password reset, billing cycles, and API integration could be resolved with improved documentation.',
    impact: 'high',
    category: 'prevention',
    impactScore: 89,
    action: 'Update documentation sections for password reset, billing FAQ, and API guides',
    icon: Brain,
    color: 'blue'
  },
  {
    id: '2',
    title: 'Response time affects satisfaction by 2.3x',
    description: 'Tickets responded to within 15 minutes have 2.3x higher satisfaction scores compared to those taking over 1 hour.',
    impact: 'high',
    category: 'efficiency',
    impactScore: 92,
    action: 'Implement auto-routing for high-priority tickets and add response time alerts',
    icon: Clock,
    color: 'green'
  },
  {
    id: '3',
    title: 'Billing questions spike on the 1st of each month',
    description: 'Invoice-related tickets increase 340% during the first 3 days of each month, overwhelming the support team.',
    impact: 'medium',
    category: 'prevention',
    impactScore: 76,
    action: 'Send proactive billing reminders and create automated invoice explanations',
    icon: TrendingUp,
    color: 'yellow'
  },
  {
    id: '4',
    title: 'Mobile app crashes drive 18% of bug reports',
    description: 'iOS and Android app crashes in the checkout flow are the leading cause of urgent support tickets.',
    impact: 'high',
    category: 'prevention',
    impactScore: 85,
    action: 'Prioritize mobile app stability fixes and add crash reporting dashboard',
    icon: AlertTriangle,
    color: 'red'
  },
  {
    id: '5',
    title: 'Feature request patterns show user workflow gaps',
    description: 'Analysis of 200+ feature requests reveals 3 common workflow bottlenecks that could be addressed.',
    impact: 'medium',
    category: 'satisfaction',
    impactScore: 71,
    action: 'Review product roadmap to address bulk actions, search filters, and export options',
    icon: Lightbulb,
    color: 'purple'
  }
];

export default function InsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const { insights: realInsights, loading: insightsLoading } = useInsights();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loading = authLoading || insightsLoading;

  // Use real insights if available, otherwise fallback to demo insights
  const insights = realInsights.length > 0 ? realInsights : fallbackInsights;

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-400';
      case 'green': return 'text-green-400';
      case 'yellow': return 'text-yellow-400';
      case 'red': return 'text-red-400';
      case 'purple': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading insights...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-slate-400 mb-4">Please sign in to view insights</p>
            <Link 
              href="/auth"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">AI Insights</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            {realInsights.length > 0 
              ? 'Intelligent recommendations to optimize your support performance'
              : 'Demo insights showing how AI can help optimize your support performance'
            }
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-600 mb-1">Total Insights</div>
                <div className="text-3xl font-bold text-slate-900">{insights.length}</div>
                <div className="text-sm text-blue-600">Active recommendations</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-red-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-600 mb-1">High Impact</div>
                <div className="text-3xl font-bold text-slate-900">{insights.filter(i => i.impact === 'high').length}</div>
                <div className="text-sm text-red-600">Critical actions</div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-600 mb-1">Ticket Reduction</div>
                <div className="text-3xl font-bold text-slate-900">34%</div>
                <div className="text-sm text-green-600">Potential savings</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-600 mb-1">Ready to Act</div>
                <div className="text-3xl font-bold text-slate-900">{insights.filter(i => i.impactScore > 80).length}</div>
                <div className="text-sm text-purple-600">High-confidence</div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Demo Notice */}
        {realInsights.length === 0 && (
          <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Demo Mode</h3>
                <p className="text-slate-600 mb-3">
                  These are sample insights. Connect your support channels to get personalized AI recommendations based on your actual data.
                </p>
                <Link 
                  href="/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Connect Support Channel
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            All Insights
          </button>
          <button
            onClick={() => setSelectedCategory('prevention')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'prevention' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4 mr-2 inline" />
            Prevention
          </button>
          <button
            onClick={() => setSelectedCategory('efficiency')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'efficiency' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Zap className="w-4 h-4 mr-2 inline" />
            Efficiency
          </button>
          <button
            onClick={() => setSelectedCategory('satisfaction')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'satisfaction' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4 mr-2 inline" />
            Satisfaction
          </button>
        </div>

        {/* Insights Grid */}
        <div className="space-y-6">
          {filteredInsights.map((insight) => {
            const Icon = insight.icon;
            return (
              <Card key={insight.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      insight.color === 'blue' ? 'bg-blue-100' :
                      insight.color === 'green' ? 'bg-green-100' :
                      insight.color === 'yellow' ? 'bg-yellow-100' :
                      insight.color === 'red' ? 'bg-red-100' :
                      insight.color === 'purple' ? 'bg-purple-100' : 'bg-slate-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${getIconColor(insight.color)}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-slate-900 leading-tight">{insight.title}</h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getImpactColor(insight.impact)}`}>
                          {insight.impact.toUpperCase()} IMPACT
                        </div>
                      </div>
                      <p className="text-slate-600 mb-4 leading-relaxed">{insight.description}</p>
                      
                      {/* Impact Score */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-slate-700">Confidence Score</span>
                          <span className="text-sm font-bold text-slate-900">{insight.impactScore}/100</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              insight.color === 'blue' ? 'bg-blue-500' :
                              insight.color === 'green' ? 'bg-green-500' :
                              insight.color === 'yellow' ? 'bg-yellow-500' :
                              insight.color === 'red' ? 'bg-red-500' :
                              insight.color === 'purple' ? 'bg-purple-500' : 'bg-slate-500'
                            }`}
                            style={{ width: `${insight.impactScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Box */}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900 mb-1">Recommended Action</p>
                            <p className="text-sm text-slate-600 leading-relaxed">{insight.action}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                      Implement Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
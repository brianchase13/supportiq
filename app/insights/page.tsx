'use client';

import { Card, Title, Metric, Grid, Text, Flex, Badge, ProgressBar } from '@tremor/react';
import { Brain, TrendingUp, Clock, AlertTriangle, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { useState } from 'react';

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

const insights: Insight[] = [
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
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">AI Insights</h1>
        <p className="text-slate-400">Intelligent recommendations to improve your support performance</p>
      </div>

      {/* Summary Cards */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <Flex alignItems="start">
            <div className="truncate">
              <Text className="text-slate-400">Total Insights</Text>
              <Metric className="text-white">{insights.length}</Metric>
            </div>
            <div className="flex-shrink-0">
              <Brain className="w-8 h-8 text-blue-400" />
            </div>
          </Flex>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <Flex alignItems="start">
            <div className="truncate">
              <Text className="text-slate-400">High Impact</Text>
              <Metric className="text-white">{insights.filter(i => i.impact === 'high').length}</Metric>
            </div>
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </Flex>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <Flex alignItems="start">
            <div className="truncate">
              <Text className="text-slate-400">Potential Reduction</Text>
              <Metric className="text-white">34%</Metric>
            </div>
            <div className="flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </Flex>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <Flex alignItems="start">
            <div className="truncate">
              <Text className="text-slate-400">Actions Ready</Text>
              <Metric className="text-white">{insights.filter(i => i.impactScore > 80).length}</Metric>
            </div>
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
          </Flex>
        </Card>
      </Grid>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            selectedCategory === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Insights
        </button>
        <button
          onClick={() => setSelectedCategory('prevention')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            selectedCategory === 'prevention' 
              ? 'bg-blue-500 text-white' 
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Prevention
        </button>
        <button
          onClick={() => setSelectedCategory('efficiency')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            selectedCategory === 'efficiency' 
              ? 'bg-blue-500 text-white' 
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Efficiency
        </button>
        <button
          onClick={() => setSelectedCategory('satisfaction')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            selectedCategory === 'satisfaction' 
              ? 'bg-blue-500 text-white' 
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Satisfaction
        </button>
      </div>

      {/* Insights Grid */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => {
          const Icon = insight.icon;
          return (
            <Card key={insight.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
              <div className="space-y-4">
                <Flex alignItems="start" className="gap-4">
                  <div className="flex-shrink-0">
                    <Icon className={`w-8 h-8 ${getIconColor(insight.color)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <Title className="text-white">{insight.title}</Title>
                      <Badge className={`border ${getImpactColor(insight.impact)}`}>
                        {insight.impact.toUpperCase()} IMPACT
                      </Badge>
                    </div>
                    <Text className="text-slate-400 mb-3">{insight.description}</Text>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <Text className="text-sm text-slate-400">Impact Score</Text>
                        <Text className="text-sm font-medium text-white">{insight.impactScore}/100</Text>
                      </div>
                      <ProgressBar value={insight.impactScore} className="h-2" color={insight.color} />
                    </div>

                    <div className="bg-slate-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-white mb-1">Recommended Action</p>
                          <p className="text-sm text-slate-400">{insight.action}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Flex>

                <Flex justifyContent="end">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-sm font-medium">
                    Take Action <ArrowRight className="w-4 h-4" />
                  </button>
                </Flex>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
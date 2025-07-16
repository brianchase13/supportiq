'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, TrendingDown, Minus, Bot, Users, DollarSign, Clock, Zap, Target, Brain } from 'lucide-react';

interface DeflectionMetrics {
  deflection_rate: number;
  customer_satisfaction: number;
  cost_savings: number;
  response_time: number;
  total_tickets: number;
  auto_resolved: number;
  escalated: number;
  trend: 'up' | 'down' | 'stable';
}

interface DeflectionDashboardProps {
  userId: string;
  dateRange?: string;
}

export function DeflectionDashboard({ userId, dateRange = '30d' }: DeflectionDashboardProps) {
  const [metrics, setMetrics] = useState<DeflectionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(dateRange);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/deflection/metrics?date_range=${selectedTimeframe}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch deflection metrics');
      }
      
      const data = await response.json();
      setMetrics(data.summary);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
      console.error('Metrics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe]);



  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPerformanceColor = (value: number, type: 'deflection' | 'satisfaction' | 'savings') => {
    switch (type) {
      case 'deflection':
        if (value >= 70) return 'text-green-600';
        if (value >= 50) return 'text-yellow-600';
        return 'text-red-600';
      case 'satisfaction':
        if (value >= 80) return 'text-green-600';
        if (value >= 60) return 'text-yellow-600';
        return 'text-red-600';
      case 'savings':
        if (value >= 1000) return 'text-green-600';
        if (value >= 500) return 'text-yellow-600';
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPerformanceBadge = (value: number, type: 'deflection' | 'satisfaction' | 'savings') => {
    const colorClass = getPerformanceColor(value, type);
    let label = 'Good';
    
    switch (type) {
      case 'deflection':
        if (value >= 70) label = 'Excellent';
        else if (value >= 50) label = 'Good';
        else label = 'Needs Improvement';
        break;
      case 'satisfaction':
        if (value >= 80) label = 'Excellent';
        else if (value >= 60) label = 'Good';
        else label = 'Needs Improvement';
        break;
      case 'savings':
        if (value >= 1000) label = 'High Impact';
        else if (value >= 500) label = 'Moderate Impact';
        else label = 'Growing';
        break;
    }

    return (
      <Badge variant={value >= 70 ? 'default' : value >= 50 ? 'secondary' : 'destructive'}>
        {label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">AI Deflection Dashboard</h2>
          <div className="flex space-x-2">
            {['7d', '30d', '90d'].map((range) => (
              <div key={range} className="h-9 w-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error loading deflection metrics</span>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
          <Button 
            onClick={fetchMetrics} 
            variant="outline" 
            className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Deflection Data Yet</h3>
          <p className="text-gray-600 mb-4">
            Start using AI ticket deflection to see your performance metrics here.
          </p>
          <Button onClick={() => window.location.href = '/dashboard/settings'}>
            Configure Deflection Settings
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Deflection Dashboard</h2>
          <p className="text-gray-600 mt-1">Monitor your AI-powered ticket deflection performance</p>
        </div>
        <div className="flex space-x-2">
          {['7d', '30d', '90d'].map((range) => (
            <Button
              key={range}
              variant={selectedTimeframe === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(range)}
            >
              {range.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deflection Rate</CardTitle>
            <div className="flex items-center space-x-1">
              {getTrendIcon(metrics.trend)}
              <Target className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.deflection_rate * 100)}%</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {metrics.auto_resolved} of {metrics.total_tickets} tickets
              </p>
              {getPerformanceBadge(metrics.deflection_rate * 100, 'deflection')}
            </div>
            <Progress value={metrics.deflection_rate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.customer_satisfaction * 100)}%</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                Based on feedback
              </p>
              {getPerformanceBadge(metrics.customer_satisfaction * 100, 'satisfaction')}
            </div>
            <Progress value={metrics.customer_satisfaction * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(metrics.cost_savings)}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                This {selectedTimeframe}
              </p>
              {getPerformanceBadge(metrics.cost_savings, 'savings')}
            </div>
            <div className="text-xs text-green-600 mt-1">
              ~${Math.round(metrics.cost_savings / parseInt(selectedTimeframe))}/day avg
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.response_time < 1 ? '<1' : Math.round(metrics.response_time)}min
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                AI responses
              </p>
              <Badge variant="secondary">
                <Zap className="h-3 w-3 mr-1" />
                Instant
              </Badge>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              vs. ~15min human avg
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Volume Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Volume Breakdown</CardTitle>
                <CardDescription>How your tickets are being handled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Auto-Resolved</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metrics.auto_resolved}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(metrics.auto_resolved / metrics.total_tickets) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Escalated to Human</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metrics.escalated}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${(metrics.escalated / metrics.total_tickets) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Total Tickets</span>
                    <span className="font-bold">{metrics.total_tickets}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Indicators</CardTitle>
                <CardDescription>Key success metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Deflection Efficiency</span>
                    <span className={`text-sm font-medium ${getPerformanceColor(metrics.deflection_rate * 100, 'deflection')}`}>
                      {Math.round(metrics.deflection_rate * 100)}%
                    </span>
                  </div>
                  <Progress value={metrics.deflection_rate * 100} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Customer Happiness</span>
                    <span className={`text-sm font-medium ${getPerformanceColor(metrics.customer_satisfaction * 100, 'satisfaction')}`}>
                      {Math.round(metrics.customer_satisfaction * 100)}%
                    </span>
                  </div>
                  <Progress value={metrics.customer_satisfaction * 100} />
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${Math.round(metrics.cost_savings)}
                    </div>
                    <div className="text-sm text-gray-600">saved this {selectedTimeframe}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Track your deflection performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Performance charts coming soon</p>
                  <p className="text-sm">Integration with analytics in progress</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{metrics.auto_resolved}</div>
                  <div className="text-sm text-blue-700">Tickets Auto-Resolved</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${Math.round(metrics.cost_savings)}</div>
                  <div className="text-sm text-green-700">Cost Savings</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics.response_time < 1 ? '<1' : Math.round(metrics.response_time)}min
                  </div>
                  <div className="text-sm text-purple-700">Avg Response Time</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Performance Insights</CardTitle>
              <CardDescription>Smart recommendations to improve your deflection strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.deflection_rate < 0.5 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800">Low Deflection Rate</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          Your current deflection rate is {Math.round(metrics.deflection_rate * 100)}%. 
                          Consider adjusting your confidence threshold or adding more knowledge base content.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {metrics.customer_satisfaction > 0.8 && metrics.deflection_rate < 0.7 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">High Quality, Low Volume</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Your responses have high satisfaction ({Math.round(metrics.customer_satisfaction * 100)}%) but low volume. 
                          Consider lowering your confidence threshold to deflect more tickets.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {metrics.cost_savings > 1000 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800">Excellent ROI</h4>
                        <p className="text-sm text-green-700 mt-1">
                          You're saving ${Math.round(metrics.cost_savings)} this {selectedTimeframe}. 
                          Your AI deflection system is delivering strong ROI!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Brain className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Next Steps</h4>
                      <ul className="text-sm text-gray-700 mt-1 space-y-1">
                        <li>• Review and update your knowledge base regularly</li>
                        <li>• Monitor customer feedback to improve response quality</li>
                        <li>• Adjust confidence thresholds based on performance</li>
                        <li>• Add escalation keywords for sensitive topics</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
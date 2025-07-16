'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Download
} from 'lucide-react';

interface AnalyticsData {
  conversionFunnel: {
    landingPageViews: number;
    trialSignups: number;
    firstAIUse: number;
    limitReached: number;
    upgrades: number;
  };
  revenueMetrics: {
    mrr: number;
    arr: number;
    ltv: number;
    cac: number;
    churnRate: number;
  };
  usageMetrics: {
    activeUsers: number;
    aiResponsesPerUser: number;
    averageSessionTime: number;
    featureAdoption: Record<string, number>;
  };
  timeSeriesData: {
    date: string;
    trials: number;
    conversions: number;
    revenue: number;
  }[];
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);



  const calculateConversionRate = (numerator: number, denominator: number) => {
    return denominator > 0 ? (numerator / denominator * 100).toFixed(1) : '0.0';
  };

  const getGrowthIndicator = (current: number, previous: number) => {
    if (previous === 0) return { icon: <ArrowUpRight className="w-4 h-4 text-green-500" />, text: 'New', color: 'text-green-600' };
    const growth = ((current - previous) / previous * 100);
    if (growth > 0) {
      return { icon: <ArrowUpRight className="w-4 h-4 text-green-500" />, text: `+${growth.toFixed(1)}%`, color: 'text-green-600' };
    } else {
      return { icon: <ArrowDownRight className="w-4 h-4 text-red-500" />, text: `${growth.toFixed(1)}%`, color: 'text-red-600' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    );
  }

  const { conversionFunnel, revenueMetrics, usageMetrics, timeSeriesData } = analyticsData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Track conversion metrics, revenue, and customer behavior</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: '7d' | '30d' | '90d') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueMetrics.mrr.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIndicator(revenueMetrics.mrr, revenueMetrics.mrr * 0.9).icon}
              <span className={getGrowthIndicator(revenueMetrics.mrr, revenueMetrics.mrr * 0.9).color}>
                {getGrowthIndicator(revenueMetrics.mrr, revenueMetrics.mrr * 0.9).text}
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateConversionRate(conversionFunnel.upgrades, conversionFunnel.trialSignups)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {conversionFunnel.upgrades} of {conversionFunnel.trialSignups} trials converted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageMetrics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {usageMetrics.aiResponsesPerUser.toFixed(1)} AI responses per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Lifetime Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueMetrics.ltv.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              CAC: ${revenueMetrics.cac.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>
                Track user journey from landing page to paid conversion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Funnel Steps */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <div className="font-semibold">Landing Page Views</div>
                        <div className="text-sm text-gray-600">Users who visited the landing page</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{conversionFunnel.landingPageViews.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">100%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <div className="font-semibold">Trial Signups</div>
                        <div className="text-sm text-gray-600">Users who started a trial</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{conversionFunnel.trialSignups.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">
                        {calculateConversionRate(conversionFunnel.trialSignups, conversionFunnel.landingPageViews)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <div className="font-semibold">First AI Use</div>
                        <div className="text-sm text-gray-600">Users who processed their first ticket</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{conversionFunnel.firstAIUse.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">
                        {calculateConversionRate(conversionFunnel.firstAIUse, conversionFunnel.trialSignups)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold">
                        4
                      </div>
                      <div>
                        <div className="font-semibold">Limit Reached</div>
                        <div className="text-sm text-gray-600">Users who hit trial limits</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{conversionFunnel.limitReached.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">
                        {calculateConversionRate(conversionFunnel.limitReached, conversionFunnel.firstAIUse)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                        5
                      </div>
                      <div>
                        <div className="font-semibold">Upgrades</div>
                        <div className="text-sm text-gray-600">Users who converted to paid</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{conversionFunnel.upgrades.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">
                        {calculateConversionRate(conversionFunnel.upgrades, conversionFunnel.limitReached)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overall Conversion Rate */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {calculateConversionRate(conversionFunnel.upgrades, conversionFunnel.landingPageViews)}%
                    </div>
                    <div className="text-sm text-gray-600">Overall conversion rate</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>MRR</span>
                    <span className="font-bold">${revenueMetrics.mrr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ARR</span>
                    <span className="font-bold">${revenueMetrics.arr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LTV</span>
                    <span className="font-bold">${revenueMetrics.ltv.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CAC</span>
                    <span className="font-bold">${revenueMetrics.cac.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Churn Rate</span>
                    <span className="font-bold">{revenueMetrics.churnRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>LTV/CAC Ratio</span>
                    <Badge variant={revenueMetrics.ltv / revenueMetrics.cac > 3 ? 'default' : 'destructive'}>
                      {(revenueMetrics.ltv / revenueMetrics.cac).toFixed(1)}x
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Payback Period</span>
                    <span className="font-bold">{(revenueMetrics.cac / (revenueMetrics.mrr / 12)).toFixed(1)} months</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Adoption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(usageMetrics.featureAdoption).map(([feature, adoption]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${adoption}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{adoption}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeSeriesData.slice(-7).map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{new Date(data.date).toLocaleDateString()}</span>
                    <div className="flex gap-4">
                      <span className="text-sm">
                        Trials: <span className="font-bold">{data.trials}</span>
                      </span>
                      <span className="text-sm">
                        Conversions: <span className="font-bold">{data.conversions}</span>
                      </span>
                      <span className="text-sm">
                        Revenue: <span className="font-bold">${data.revenue}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
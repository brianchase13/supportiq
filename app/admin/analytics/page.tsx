'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Clock, 
  Target, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessMetrics {
  activationRate: number;
  timeToValue: number;
  dailyActiveRate: number;
  upgradeConversionRate: number;
  garyTanTestRate: number;
  churnRate: number;
  ltv: number;
  cac: number;
  paybackPeriod: number;
}

interface AnalyticsData {
  successMetrics: SuccessMetrics;
  trends: {
    activationTrend: Array<{ date: string; rate: number }>;
    conversionTrend: Array<{ date: string; rate: number }>;
    churnTrend: Array<{ date: string; rate: number }>;
  };
  userJourney: {
    signups: number;
    demoViews: number;
    intercomConnections: number;
    firstInsights: number;
    conversions: number;
    churns: number;
  };
  revenueMetrics: {
    mrr: number;
    arr: number;
    averageRevenuePerUser: number;
    churnMrr: number;
    expansionMrr: number;
  };
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from your analytics API
      const mockData: AnalyticsData = {
        successMetrics: {
          activationRate: 78.5, // Target: 80%+
          timeToValue: 267, // Target: <300s (5 min)
          dailyActiveRate: 64.2, // Target: >60%
          upgradeConversionRate: 32.8, // Target: >30%
          garyTanTestRate: 67.3, // Target: >60%
          churnRate: 4.2, // Target: <5%
          ltv: 2847, // Lifetime value
          cac: 287, // Customer acquisition cost
          paybackPeriod: 2.1, // Target: <3 months
        },
        trends: {
          activationTrend: generateTrendData(30, 75, 5),
          conversionTrend: generateTrendData(30, 30, 8),
          churnTrend: generateTrendData(30, 4, 2),
        },
        userJourney: {
          signups: 1247,
          demoViews: 892,
          intercomConnections: 678,
          firstInsights: 634,
          conversions: 208,
          churns: 23,
        },
        revenueMetrics: {
          mrr: 47823,
          arr: 573876,
          averageRevenuePerUser: 247,
          churnMrr: 2341,
          expansionMrr: 3456,
        },
      };
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (!analyticsData) {
    return <div>Failed to load analytics data</div>;
  }

  const { successMetrics, trends, userJourney, revenueMetrics } = analyticsData;

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">SupportIQ Analytics</h1>
          <p className="text-slate-400">Critical success metrics and business intelligence</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={cn(
              'px-3 py-1 rounded-lg text-sm transition-colors',
              timeRange === '7d' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            )}
          >
            7 days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={cn(
              'px-3 py-1 rounded-lg text-sm transition-colors',
              timeRange === '30d' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            )}
          >
            30 days
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={cn(
              'px-3 py-1 rounded-lg text-sm transition-colors',
              timeRange === '90d' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            )}
          >
            90 days
          </button>
        </div>
      </div>

      {/* Critical Success Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Activation Rate"
          value={`${successMetrics.activationRate}%`}
          target="80%+"
          icon={<Zap className="w-5 h-5" />}
          trend={successMetrics.activationRate >= 80 ? 'up' : 'down'}
          description="Intercom connected within 10 min"
          color={successMetrics.activationRate >= 80 ? 'green' : 'red'}
        />
        
        <MetricCard
          title="Time to Value"
          value={`${Math.round(successMetrics.timeToValue / 60)}m ${successMetrics.timeToValue % 60}s`}
          target="<5min"
          icon={<Clock className="w-5 h-5" />}
          trend={successMetrics.timeToValue <= 300 ? 'up' : 'down'}
          description="First insight delivered"
          color={successMetrics.timeToValue <= 300 ? 'green' : 'red'}
        />
        
        <MetricCard
          title="Daily Active Rate"
          value={`${successMetrics.dailyActiveRate}%`}
          target="60%+"
          icon={<Activity className="w-5 h-5" />}
          trend={successMetrics.dailyActiveRate >= 60 ? 'up' : 'down'}
          description="Users active daily"
          color={successMetrics.dailyActiveRate >= 60 ? 'green' : 'yellow'}
        />
        
        <MetricCard
          title="Upgrade Conversion"
          value={`${successMetrics.upgradeConversionRate}%`}
          target="30%+"
          icon={<TrendingUp className="w-5 h-5" />}
          trend={successMetrics.upgradeConversionRate >= 30 ? 'up' : 'down'}
          description="Upgrade within first month"
          color={successMetrics.upgradeConversionRate >= 30 ? 'green' : 'yellow'}
        />
        
        <MetricCard
          title="Gary Tan Test"
          value={`${successMetrics.garyTanTestRate}%`}
          target="60%+"
          icon={<Target className="w-5 h-5" />}
          trend={successMetrics.garyTanTestRate >= 60 ? 'up' : 'down'}
          description="Credit card intent in 5 min"
          color={successMetrics.garyTanTestRate >= 60 ? 'green' : 'yellow'}
        />
        
        <MetricCard
          title="Payback Period"
          value={`${successMetrics.paybackPeriod} months`}
          target="<3 months"
          icon={<DollarSign className="w-5 h-5" />}
          trend={successMetrics.paybackPeriod <= 3 ? 'up' : 'down'}
          description="CAC recovery time"
          color={successMetrics.paybackPeriod <= 3 ? 'green' : 'red'}
        />
      </div>

      {/* Revenue Metrics */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                ${revenueMetrics.mrr.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Monthly Recurring Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                ${revenueMetrics.arr.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Annual Recurring Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                ${revenueMetrics.averageRevenuePerUser}
              </div>
              <div className="text-sm text-slate-400">Average Revenue Per User</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                ${successMetrics.ltv.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Customer Lifetime Value</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Journey Funnel */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">User Journey Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FunnelStep
              step="Signups"
              count={userJourney.signups}
              percentage={100}
              color="blue"
            />
            <FunnelStep
              step="Demo Views"
              count={userJourney.demoViews}
              percentage={Math.round((userJourney.demoViews / userJourney.signups) * 100)}
              color="purple"
            />
            <FunnelStep
              step="Intercom Connected"
              count={userJourney.intercomConnections}
              percentage={Math.round((userJourney.intercomConnections / userJourney.signups) * 100)}
              color="green"
            />
            <FunnelStep
              step="First Insights"
              count={userJourney.firstInsights}
              percentage={Math.round((userJourney.firstInsights / userJourney.signups) * 100)}
              color="yellow"
            />
            <FunnelStep
              step="Conversions"
              count={userJourney.conversions}
              percentage={Math.round((userJourney.conversions / userJourney.signups) * 100)}
              color="emerald"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Activation Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.activationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Conversion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.conversionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Health Score */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Business Health Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {calculateHealthScore(successMetrics)}
              </div>
              <div className="text-sm text-slate-400">Overall Health Score</div>
              <div className="text-xs text-slate-500">Based on critical success metrics</div>
            </div>
            <div className="col-span-2">
              <div className="space-y-2">
                <HealthMetric
                  name="Activation"
                  score={successMetrics.activationRate}
                  target={80}
                  weight={25}
                />
                <HealthMetric
                  name="Time to Value"
                  score={successMetrics.timeToValue <= 300 ? 100 : 50}
                  target={100}
                  weight={25}
                />
                <HealthMetric
                  name="Conversion"
                  score={successMetrics.upgradeConversionRate}
                  target={30}
                  weight={25}
                />
                <HealthMetric
                  name="Retention"
                  score={100 - successMetrics.churnRate}
                  target={95}
                  weight={25}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, target, icon, trend, description, color }: {
  title: string;
  value: string;
  target: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  description: string;
  color: 'green' | 'yellow' | 'red';
}) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-2 rounded-lg",
            color === 'green' && "bg-green-600",
            color === 'yellow' && "bg-yellow-600",
            color === 'red' && "bg-red-600"
          )}>
            {icon}
          </div>
          <div className="flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <Badge variant="outline" className="text-xs">
              Target: {target}
            </Badge>
          </div>
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-slate-400">{title}</div>
        <div className="text-xs text-slate-500 mt-2">{description}</div>
      </CardContent>
    </Card>
  );
}

function FunnelStep({ step, count, percentage, color }: {
  step: string;
  count: number;
  percentage: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-4 h-4 rounded-full",
          color === 'blue' && "bg-blue-500",
          color === 'purple' && "bg-purple-500",
          color === 'green' && "bg-green-500",
          color === 'yellow' && "bg-yellow-500",
          color === 'emerald' && "bg-emerald-500"
        )} />
        <div>
          <div className="font-medium text-white">{step}</div>
          <div className="text-sm text-slate-400">{count.toLocaleString()} users</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-white">{percentage}%</div>
        <div className="text-sm text-slate-400">conversion</div>
      </div>
    </div>
  );
}

function HealthMetric({ name, score, target, weight }: {
  name: string;
  score: number;
  target: number;
  weight: number;
}) {
  const percentage = Math.min((score / target) * 100, 100);
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-16 text-sm text-slate-400">{name}</div>
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-500",
              percentage >= 90 ? "bg-green-500" : 
              percentage >= 70 ? "bg-yellow-500" : "bg-red-500"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="text-sm text-slate-300 ml-3">
        {Math.round(score)}/{target}
      </div>
    </div>
  );
}

function calculateHealthScore(metrics: SuccessMetrics): number {
  const scores = [
    Math.min(metrics.activationRate / 80, 1) * 25,
    (metrics.timeToValue <= 300 ? 1 : 0.5) * 25,
    Math.min(metrics.upgradeConversionRate / 30, 1) * 25,
    Math.min((100 - metrics.churnRate) / 95, 1) * 25,
  ];
  
  return Math.round(scores.reduce((sum, score) => sum + score, 0));
}

function generateTrendData(days: number, baseValue: number, variance: number) {
  const data = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const value = baseValue + (Math.random() - 0.5) * variance;
    data.push({
      date: date.toISOString().split('T')[0],
      rate: Math.round(value * 10) / 10,
    });
  }
  return data;
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen">
      <div className="h-8 bg-slate-800 rounded w-1/3 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-slate-800 rounded animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-slate-800 rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-slate-800 rounded animate-pulse" />
        <div className="h-80 bg-slate-800 rounded animate-pulse" />
      </div>
    </div>
  );
}
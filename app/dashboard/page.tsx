'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Zap,
  Clock,
  TrendingUp,
  Upload,
  ArrowRight,
  Users,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface DashboardData {
  metrics: {
    totalTickets: number;
    avgResponseTime: number;
    satisfactionScore: number;
    openTickets: number;
    deflectionRate: number;
    potentialSavings: number;
  };
  trends: any[];
  categories: any[];
  sentiment: any[];
  topIssues: any[];
  agents: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/demo-dashboard');
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-8">
          <div className="h-6 bg-slate-200 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-slate-100 rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-lg text-slate-900 mb-4">Unable to load dashboard</div>
            <button 
              onClick={fetchDashboardData}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Clean Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">AI handling your support automatically</p>
        </div>

        {/* Key Metrics - Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                +{data.metrics.deflectionRate - 80}% this month
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-600">Auto-Resolution Rate</div>
              <div className="text-3xl font-bold text-slate-900">{data.metrics.deflectionRate}%</div>
              <div className="text-sm text-green-600">AI handling tickets automatically</div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                Real-time
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-600">Avg Response Time</div>
              <div className="text-3xl font-bold text-slate-900">&lt; {data.metrics.avgResponseTime}m</div>
              <div className="text-sm text-blue-600">Instant AI responses</div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                This month
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-600">Cost Savings</div>
              <div className="text-3xl font-bold text-slate-900">${data.metrics.potentialSavings.toLocaleString()}</div>
              <div className="text-sm text-purple-600">Support cost reduction</div>
            </div>
          </Card>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border-0 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Automation Active</h3>
                <p className="text-slate-600 mb-4">
                  Handling {data.metrics.deflectionRate}% of {data.metrics.totalTickets.toLocaleString()} tickets automatically. 
                  Saving ~{Math.round(data.metrics.totalTickets * 0.1)} hours monthly.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">System performing optimally</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Customer Satisfaction</h3>
                <p className="text-slate-600 mb-4">
                  {data.metrics.satisfactionScore}% satisfaction rate with AI responses. 
                  Customers love the instant, accurate support.
                </p>
                <Link 
                  href="/insights" 
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  View Detailed Insights
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <p className="text-sm text-slate-600 mt-1">Latest automation wins and system updates</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">Password reset automation deployed</div>
                  <div className="text-sm text-slate-600">23 tickets resolved • 4.6 hours saved</div>
                </div>
                <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">2h ago</div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">Billing inquiry responses updated</div>
                  <div className="text-sm text-slate-600">18 tickets resolved • 5.4 hours saved</div>
                </div>
                <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full font-medium">6h ago</div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">Setup guide automation improved</div>
                  <div className="text-sm text-slate-600">12 tickets resolved • 3.2 hours saved</div>
                </div>
                <div className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full font-medium">1d ago</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-8 border-0 shadow-sm bg-gradient-to-r from-slate-900 to-slate-800 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-white mb-2">Ready to Scale Further?</h3>
            <p className="text-slate-300 mb-6">Connect additional support channels to maximize automation coverage.</p>
            <Link 
              href="/upload" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Add Support Channel
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
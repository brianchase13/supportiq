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

        {/* Key Metrics - Modern AI-First Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border border-slate-200 shadow-lg bg-white hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#0066FF] to-[#0052CC] rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">{data.metrics.deflectionRate}%</div>
                  <div className="text-sm text-slate-600 font-semibold">Auto-Resolution</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  +{data.metrics.deflectionRate - 80}%
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium">vs last month</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-slate-200 shadow-lg bg-white hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">&lt; {data.metrics.avgResponseTime}m</div>
                  <div className="text-sm text-slate-600 font-semibold">Response Time</div>
                </div>
              </div>
              <div className="text-right">
                <div className="w-3 h-3 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full animate-pulse shadow-sm"></div>
                <div className="text-xs text-slate-500 mt-1 font-medium">Real-time</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-slate-200 shadow-lg bg-white hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">${data.metrics.potentialSavings.toLocaleString()}</div>
                  <div className="text-sm text-slate-600 font-semibold">Monthly Savings</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-[#8B5CF6] bg-violet-50 px-3 py-1.5 rounded-full border border-violet-200">
                  ROI 2,424%
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium">vs $99 cost</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="p-6 border border-slate-200 shadow-lg bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI Performance Analytics</h3>
              <p className="text-sm text-slate-600">Real-time automation efficiency tracking</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-[#0066FF] to-[#0052CC] rounded-full shadow-sm"></div>
                <span className="text-sm text-slate-700 font-medium">AI Resolved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                <span className="text-sm text-slate-700 font-medium">Manual</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { day: 'Mon', auto: 92, manual: 8 },
              { day: 'Tue', auto: 89, manual: 11 },
              { day: 'Wed', auto: 94, manual: 6 },
              { day: 'Thu', auto: 87, manual: 13 },
              { day: 'Fri', auto: 91, manual: 9 },
              { day: 'Sat', auto: 96, manual: 4 },
              { day: 'Sun', auto: 93, manual: 7 }
            ].map((day, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 text-sm font-bold text-slate-700">{day.day}</div>
                <div className="flex-1 flex bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] transition-all duration-700 shadow-sm"
                    style={{ width: `${day.auto}%` }}
                  />
                  <div 
                    className="bg-slate-300 transition-all duration-700"
                    style={{ width: `${day.manual}%` }}
                  />
                </div>
                <div className="w-12 text-sm font-bold text-[#0066FF] text-right">{day.auto}%</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border border-slate-200 shadow-lg bg-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">AI Automation Engine</h3>
                <p className="text-slate-600 mb-4">
                  Handling {data.metrics.deflectionRate}% of {data.metrics.totalTickets.toLocaleString()} tickets automatically. 
                  Saving ~{Math.round(data.metrics.totalTickets * 0.1)} hours monthly.
                </p>
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                  <div className="w-2 h-2 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full animate-pulse"></div>
                  <span className="font-bold">Optimal performance</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-slate-200 shadow-lg bg-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#0066FF] to-[#0052CC] rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Customer Intelligence</h3>
                <p className="text-slate-600 mb-4">
                  {data.metrics.satisfactionScore}% satisfaction rate with AI responses. 
                  Customers love the instant, accurate support.
                </p>
                <Link 
                  href="/insights" 
                  className="inline-flex items-center gap-2 text-[#0066FF] hover:text-[#0052CC] font-semibold text-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  View AI Insights
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card className="border border-slate-200 shadow-lg bg-white">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">AI Activity Stream</h2>
            <p className="text-sm text-slate-600 mt-1">Real-time automation wins and intelligent updates</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 rounded-xl transition-all border border-transparent hover:border-emerald-200">
                <div className="w-10 h-10 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-sm">Password reset automation deployed</div>
                  <div className="text-xs text-slate-600 font-medium">23 tickets resolved • 4.6 hours saved</div>
                </div>
                <div className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-full">2h ago</div>
              </div>

              <div className="flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all border border-transparent hover:border-blue-200">
                <div className="w-10 h-10 bg-gradient-to-r from-[#0066FF] to-[#0052CC] rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-sm">Billing inquiry responses updated</div>
                  <div className="text-xs text-slate-600 font-medium">18 tickets resolved • 5.4 hours saved</div>
                </div>
                <div className="text-xs text-[#0066FF] font-bold bg-blue-50 px-2 py-1 rounded-full">6h ago</div>
              </div>

              <div className="flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 rounded-xl transition-all border border-transparent hover:border-violet-200">
                <div className="w-10 h-10 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-sm">Setup guide automation improved</div>
                  <div className="text-xs text-slate-600 font-medium">12 tickets resolved • 3.2 hours saved</div>
                </div>
                <div className="text-xs text-[#8B5CF6] font-bold bg-violet-50 px-2 py-1 rounded-full">1d ago</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-8 border border-slate-200 shadow-lg bg-white">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#0066FF] to-[#0052CC] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Scale Your AI Intelligence</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">Connect additional support channels to maximize automation coverage and unlock deeper insights.</p>
            <Link 
              href="/upload" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white rounded-xl font-bold hover:shadow-xl transition-all hover:-translate-y-1 text-lg"
            >
              <Upload className="w-5 h-5" />
              Add Support Channel
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
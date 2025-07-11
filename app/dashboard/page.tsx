'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Star,
  DollarSign,
  Zap,
  ArrowRight,
  Upload,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TicketAnalyzer } from '@/components/intercom/TicketAnalyzer';
import Link from 'next/link';

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
      <div className="min-h-screen bg-black text-white p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-800 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-800 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-slate-800 rounded" />
            <div className="h-80 bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-white mb-2">Failed to load dashboard data</div>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-black/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            SupportIQ
          </Link>
          <div className="flex items-center gap-4">
            <Badge className="bg-green-600 text-white">Live Demo</Badge>
            <Link 
              href="/checkout" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium text-sm"
            >
              Upgrade →
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold mb-4">
            Your Support Cost Analysis
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            Demo data from a real SaaS company. Upload your tickets to see your actual savings.
          </p>
          
          {/* Main CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              href="/upload" 
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Upload className="w-5 h-5" />
              Upload My Tickets
            </Link>
            <div className="px-8 py-4 border border-slate-600 rounded-lg font-semibold text-lg">
              👇 See demo results below
            </div>
          </div>
        </div>

        {/* Instant Results */}
        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">🎯 Potential Monthly Savings</h2>
          <div className="text-6xl font-bold text-green-400 mb-2">
            ${data.metrics.potentialSavings.toLocaleString()}
          </div>
          <p className="text-slate-300 text-lg">
            Based on analyzing {data.metrics.totalTickets.toLocaleString()} support tickets
          </p>
          <div className="mt-6">
            <Link 
              href="/checkout" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
            >
              Get My Real Savings Report <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Ticket Analyzer */}
        <div className="mb-8">
          <TicketAnalyzer />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Tickets</p>
                  <p className="text-2xl font-bold">{data.metrics.totalTickets.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingDown className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400">Could be 40% fewer</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Cost per Ticket</p>
                  <p className="text-2xl font-bold">$18</p>
                </div>
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-red-400 mr-1" />
                <span className="text-red-400">Industry average: $25</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Deflection Rate</p>
                  <p className="text-2xl font-bold">{data.metrics.deflectionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400">Could reach 60%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Monthly Cost</p>
                  <p className="text-2xl font-bold">$47K</p>
                </div>
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingDown className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400">Save ${data.metrics.potentialSavings.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ticket Trends */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Daily Ticket Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.trends}>
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
                  <Area 
                    type="monotone" 
                    dataKey="tickets" 
                    stroke="#3B82F6" 
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Top Issues (Preventable)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topIssues.slice(0, 5).map((issue, index) => (
                  <div key={issue.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-white">{issue.issue}</div>
                      <div className="text-sm text-slate-400">{issue.count} tickets • ${(issue.count * 18).toLocaleString()} cost</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600 text-white">
                        Fixable
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link 
                  href="/checkout" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
                >
                  Get Action Plan <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Final CTA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to save ${data.metrics.potentialSavings.toLocaleString()}/month?</h2>
          <p className="text-slate-400 mb-6">
            This is demo data. Upload your actual support tickets to get your real savings report.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/upload" 
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload My Tickets (Free)
            </Link>
            <Link 
              href="/checkout" 
              className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Start Saving Now ($99/mo)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
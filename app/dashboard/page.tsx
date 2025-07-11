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
  CheckCircle,
  AlertTriangle,
  Target
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
      <div className="min-h-screen bg-white p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-slate-200 rounded" />
            <div className="h-80 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-slate-900 mb-2">Failed to load dashboard data</div>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            SupportIQ
          </Link>
          <div className="flex items-center gap-4">
            <Badge className="bg-orange-100 text-orange-700 border border-orange-200">Demo Data</Badge>
            <Link 
              href="/checkout" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm"
            >
              Get Your Real Data →
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* YC-Style Problem Alert */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-red-900 mb-2">🚨 Your support costs are bleeding money</h2>
              <p className="text-red-700 mb-4">
                Based on this demo data analysis: <strong>${data.metrics.potentialSavings.toLocaleString()}/month</strong> could be saved by preventing just the top 3 ticket types.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/upload" 
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload My Real Tickets
                </Link>
                <Link 
                  href="/checkout" 
                  className="px-6 py-3 border border-red-600 text-red-600 hover:bg-red-50 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Target className="w-5 h-5" />
                  Stop The Bleeding ($99/mo)
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Founder-Focused ROI */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-green-900 mb-4">💰 Monthly Cost Savings Opportunity</h3>
            <div className="text-4xl font-bold text-green-600 mb-2">
              ${data.metrics.potentialSavings.toLocaleString()}
            </div>
            <p className="text-green-700 text-sm mb-4">
              That's <strong>${(data.metrics.potentialSavings * 12).toLocaleString()}/year</strong> you could reinvest in growth
            </p>
            <div className="text-xs text-green-600">
              • ROI on SupportIQ: {Math.round(data.metrics.potentialSavings / 99)}x
              <br />
              • Payback period: 3 days
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">📊 Current Support Burn Rate</h3>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              ${Math.round(data.metrics.totalTickets * 25).toLocaleString()}
            </div>
            <p className="text-blue-700 text-sm mb-4">
              Monthly support costs at $25/ticket average
            </p>
            <div className="text-xs text-blue-600">
              • {data.metrics.totalTickets.toLocaleString()} tickets last 30 days
              <br />
              • ~{Math.round(data.metrics.totalTickets * 0.4).toLocaleString()} preventable
            </div>
          </div>
        </div>

        {/* Ticket Analyzer - YC Style */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">🔍 Find Your Biggest Cost Drains</h2>
            <p className="text-slate-600">
              This demo analyzes real startup data. Upload your tickets to see which ones are killing your runway.
            </p>
          </div>
          <TicketAnalyzer />
        </div>

        {/* Key Metrics - Founder Focused */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Runway Drain</p>
                  <p className="text-2xl font-bold text-slate-900">${Math.round(data.metrics.totalTickets * 25 / 1000)}K/mo</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-red-500">Burning cash on preventable tickets</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Prevention Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{100 - data.metrics.deflectionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingDown className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-orange-500">Could reach 60%+ prevention</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Team Efficiency</p>
                  <p className="text-2xl font-bold text-slate-900">{data.metrics.avgResponseTime}min</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">Good response time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Potential ROI</p>
                  <p className="text-2xl font-bold text-slate-900">{Math.round(data.metrics.potentialSavings / 99)}x</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">Pays for itself in 3 days</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts - Focus on actionable insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Trend */}
          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Monthly Support Cost Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#1e293b'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tickets" 
                    stroke="#dc2626" 
                    fill="#dc2626"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Cost Drains */}
          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Biggest Money Drains (Fixable)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topIssues.slice(0, 5).map((issue, index) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{issue.issue}</div>
                      <div className="text-sm text-slate-600">{issue.count} tickets • ${(issue.count * 25).toLocaleString()} monthly cost</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-700 border border-red-200">
                        -${Math.round(issue.count * 25 * 0.8).toLocaleString()}/mo
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link 
                  href="/checkout" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Get Specific Fix Instructions <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Founder Call to Action */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to stop burning ${data.metrics.potentialSavings.toLocaleString()}/month?
          </h2>
          <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
            This is <strong>demo data</strong> from a real startup. They saved $47K in their first 3 months.
            <br />
            Upload your actual tickets to see your specific savings opportunities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link 
              href="/upload" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Analyze My Real Data
            </Link>
            <Link 
              href="mailto:founders@supportiq.ai?subject=I want to save money on support&body=Hi! I'm interested in SupportIQ. My startup handles about [X] tickets per month and our current support costs are killing us."
              className="px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Talk to Founders
            </Link>
          </div>

          <div className="mt-6 text-sm text-slate-600">
            🚀 <strong>YC companies get 50% off first year</strong> - mention your batch
          </div>
        </div>
      </div>
    </div>
  );
}
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
  Heart,
  Share2,
  MessageSquare,
  Trophy,
  Sparkles,
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-purple-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-purple-100 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-purple-100 rounded" />
            <div className="h-80 bg-purple-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-slate-900 mb-2">Failed to load community data</div>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <nav className="border-b border-indigo-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-slate-700 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            SupportIQ
          </Link>
          <div className="flex items-center gap-4">
            <Badge className="bg-gradient-to-r from-indigo-100 to-slate-100 text-indigo-700 border border-indigo-200">
              Pro Plan
            </Badge>
            <Link 
              href="/checkout" 
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-slate-700 text-white rounded-lg font-medium text-sm transition-all"
            >
              Upgrade Plan →
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Dashboard Welcome */}
        <div className="bg-gradient-to-r from-indigo-100 via-slate-100 to-indigo-100 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
                Welcome to your support dashboard! 
              </h1>
              <p className="text-slate-700">
                You're using the same analytics that helped <strong className="text-indigo-600">847 SaaS teams</strong> save <strong className="text-green-600">$47M total</strong> in support costs.
                <br />
                Demo analysis below shows what SupportIQ can do. Upload your data to see your real insights!
              </p>
            </div>
            <div className="bg-white border border-indigo-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">Demo</div>
                <div className="text-sm text-slate-600">Mode active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-indigo-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-8 h-8 text-indigo-500" />
              <div>
                <div className="text-2xl font-bold text-slate-900">{data.metrics.totalTickets.toLocaleString()}</div>
                <div className="text-sm text-slate-600">Tickets analyzed</div>
              </div>
            </div>
            <div className="text-xs text-indigo-600">Demo data</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-8 h-8 text-slate-500" />
              <div>
                <div className="text-2xl font-bold text-slate-900">{data.metrics.avgResponseTime}h</div>
                <div className="text-sm text-slate-600">Avg response time</div>
              </div>
            </div>
            <div className="text-xs text-green-600">Industry benchmark: 24h</div>
          </div>

          <div className="bg-white border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-slate-900">{data.metrics.deflectionRate}%</div>
                <div className="text-sm text-slate-600">Deflection potential</div>
              </div>
            </div>
            <div className="text-xs text-blue-600">Tickets preventable</div>
          </div>
        </div>

        {/* Savings Potential */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
            💰 Your potential savings (demo analysis)
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                ${data.metrics.potentialSavings.toLocaleString()}/month
              </div>
              <p className="text-green-700 mb-4">
                Based on analyzing {data.metrics.totalTickets.toLocaleString()} demo tickets. Upload your real data to see your actual savings potential.
              </p>
              <div className="text-sm text-green-600">
                • Identifies top cost-driving ticket types
                <br />
                • Shows automation opportunities
                <br />
                • Tracks ROI from improvements
              </div>
            </div>
            <div className="space-y-4">
              <Link 
                href="/upload" 
                className="block w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-center transition-all"
              >
                <Upload className="w-5 h-5 inline mr-2" />
                Upload My Real Data
              </Link>
              <button 
                className="block w-full px-6 py-3 border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-lg font-semibold transition-all"
                onClick={() => document.getElementById('insights')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <BarChart3 className="w-5 h-5 inline mr-2" />
                See Full Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Ticket Analyzer */}
        <div className="bg-white border border-indigo-200 rounded-xl p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              🔍 Smart Ticket Analysis
            </h2>
            <p className="text-slate-600">
              SupportIQ automatically categorizes your tickets and identifies patterns. This demo shows the insights you'll get with your real data.
            </p>
          </div>
          <TicketAnalyzer />
        </div>

        {/* Analytics Insights */}
        <div id="insights" className="bg-white border border-indigo-200 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            📈 Analytics insights from your data
          </h2>
          
          <div className="space-y-4 mb-6">
            {/* Win 1 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-sm">S</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">Sarah @TechFlow</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">2 hours ago</span>
                  </div>
                  <p className="text-slate-700 text-sm mb-2">
                    "Used the community's password reset template - 67% of tickets gone overnight! 🤯"
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="font-semibold text-green-600">Saved: $8,400/month</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-500" />
                      <span>47 likes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>12 replies</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Win 2 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center font-bold text-white text-sm">M</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">Mike @DevTools</span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">6 hours ago</span>
                  </div>
                  <p className="text-slate-700 text-sm mb-2">
                    "The API docs template from Alex reduced our tickets 80%. Sharing my version back to the community!"
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="font-semibold text-blue-600">Saved: $12,100/month</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-500" />
                      <span>92 likes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      <span>Template shared</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/checkout" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold hover:scale-105 transition-all"
            >
              <Users className="w-5 h-5" />
              Join Community Slack
            </Link>
          </div>
        </div>

        {/* Key Metrics - Community Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border border-purple-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Demo Tickets</p>
                  <p className="text-2xl font-bold text-slate-900">{data.metrics.totalTickets.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Target className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-purple-600">Community avg: 40% reduction</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Community Impact</p>
                  <p className="text-2xl font-bold text-slate-900">{Math.round(data.metrics.potentialSavings / 99)}x</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">ROI based on 2,847 members</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Templates Available</p>
                  <p className="text-2xl font-bold text-slate-900">156</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Sparkles className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-blue-600">Community-tested solutions</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Monthly Saves</p>
                  <p className="text-2xl font-bold text-slate-900">$2.3M</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Heart className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-red-600">Community total this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts with Community Context */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-purple-200 bg-white">
            <CardHeader>
              <CardTitle className="text-slate-900">Demo Ticket Trends</CardTitle>
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
                    stroke="#8b5cf6" 
                    fill="#8b5cf6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-purple-200 bg-white">
            <CardHeader>
              <CardTitle className="text-slate-900">Community-Proven Fixes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topIssues.slice(0, 4).map((issue, index) => (
                  <div key={issue.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{issue.issue}</div>
                      <div className="text-sm text-slate-600">{issue.count} tickets • Template available</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700">
                        Community-solved
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Final Community CTA */}
        <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-purple-100 border border-purple-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to turn your data into community wins?
          </h2>
          <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
            This demo shows what's possible. Upload your real tickets to join <strong className="text-purple-600">2,847 founders</strong> who are sharing strategies and saving millions together.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/upload" 
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-all"
            >
              <Upload className="w-5 h-5" />
              Upload My Real Data
            </Link>
            <Link 
              href="/checkout"
              className="px-8 py-4 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-full font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Users className="w-5 h-5" />
              Join The Community ($99/mo)
            </Link>
          </div>

          <div className="mt-6 text-sm text-slate-600">
            💜 <strong>Community-first forever</strong> - Your success stories fund new member resources
          </div>
        </div>
      </div>
    </div>
  );
}
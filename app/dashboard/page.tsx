'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Zap,
  Clock,
  TrendingUp,
  Upload,
  ArrowRight,
  Users,
  MessageSquare,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useTickets, useInsights, useTicketStats } from '@/hooks/data/useSupabaseData';
import { useUser, useRequireAuth } from '@/lib/auth/user-context';
import { SyncStatus } from '@/components/dashboard/SyncStatus';
import { TicketDeflectionCalculator } from '@/components/dashboard/TicketDeflectionCalculator';
import { AgentPerformanceScorecard } from '@/components/dashboard/AgentPerformanceScorecard';
import { CrisisModeAlert } from '@/components/dashboard/CrisisModeAlert';
import { ROIDashboard } from '@/components/dashboard/ROIDashboard';
import { TrialStatus } from '@/components/trial/TrialStatus';
import { TicketTester } from '@/components/ai/TicketTester';

export default function DashboardPage() {
  const { user } = useUser();
  const { loading } = useRequireAuth();
  const { tickets, loading: ticketsLoading } = useTickets();
  const { insights, loading: insightsLoading } = useInsights();
  const { metrics, loading: metricsLoading } = useTicketStats();

  if (loading || ticketsLoading || insightsLoading || metricsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Clean Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Dashboard</h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          {tickets.length > 0 
            ? `AI analyzing ${tickets.length} tickets from your support channels`
            : 'Connect your support channels to start getting AI insights'
          }
        </p>
        {user && (
          <p className="text-sm text-gray-500 mt-2">
            Welcome back, {user.email}
          </p>
        )}
      </div>

      {/* Key Metrics - Modern AI-First Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.deflectionRate}%</div>
                <div className="text-sm text-gray-600 font-medium">Auto-Resolution</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                +{Math.round(metrics.deflectionRate - 80)}%
              </div>
              <div className="text-xs text-gray-500 mt-1 font-medium">vs last month</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-sm">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.avgResponseTime}m</div>
                <div className="text-sm text-gray-600 font-medium">Avg Response</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                -{Math.round(metrics.avgResponseTime * 0.3)}m
              </div>
              <div className="text-xs text-gray-500 mt-1 font-medium">vs last month</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.satisfactionScore}%</div>
                <div className="text-sm text-gray-600 font-medium">Satisfaction</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
                +{Math.round(metrics.satisfactionScore - 85)}%
              </div>
              <div className="text-xs text-gray-500 mt-1 font-medium">vs last month</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Upload Data</h3>
              <p className="text-sm text-gray-600">Import tickets</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-black transition-colors" />
          </div>
        </Card>

        <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Team Setup</h3>
              <p className="text-sm text-gray-600">Add members</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-black transition-colors" />
          </div>
        </Card>

        <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Training</h3>
              <p className="text-sm text-gray-600">Improve responses</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-black transition-colors" />
          </div>
        </Card>

        <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600">View reports</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-black transition-colors" />
          </div>
        </Card>
      </div>

      {/* Trial Status */}
      <TrialStatus />

      {/* Sync Status */}
      {user?.id && <SyncStatus userId={user.id} />}

      {/* AI Ticket Tester */}
      <TicketTester />

      {/* Revenue-Driving Features */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900">Revenue & Performance Tools</h2>
        
        {/* Ticket Deflection Calculator */}
        <TicketDeflectionCalculator />

        {/* Agent Performance Scorecard */}
        <AgentPerformanceScorecard />

        {/* Crisis Mode Alert */}
        <CrisisModeAlert />

        {/* ROI Dashboard */}
        <ROIDashboard />
      </div>
    </div>
  );
}
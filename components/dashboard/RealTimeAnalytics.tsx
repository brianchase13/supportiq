'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  MessageSquare, 
  Zap, 
  Clock, 
  Users,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  BarChart3,
  Activity
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

interface AnalyticsData {
  deflection_rate: number;
  total_tickets: number;
  deflected_tickets: number;
  avg_response_time: number;
  avg_resolution_time: number;
  webhook_events_today: number;
  webhook_success_rate: number;
  integration_status: 'connected' | 'disconnected' | 'error';
  recent_activity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: 'success' | 'error' | 'pending';
  }>;
  category_breakdown: Array<{
    category: string;
    count: number;
    deflection_rate: number;
  }>;
  hourly_activity: Array<{
    hour: number;
    tickets: number;
    deflections: number;
  }>;
}

export default function RealTimeAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/realtime?range=${timeRange}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);



  const refreshData = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-900 border-slate-800">
          <div className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Data Available</h3>
            <p className="text-slate-400">Connect your support channels to see analytics</p>
          </div>
        </Card>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'pending': return 'text-yellow-500';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Real-Time Analytics</h2>
          <p className="text-slate-400">Live deflection metrics and system performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
            className="bg-slate-800 border border-slate-700 text-white rounded px-3 py-2"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-2xl font-bold text-white">{data.deflection_rate}%</span>
            </div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Deflection Rate</h3>
            <p className="text-xs text-slate-500">
              {data.deflected_tickets} of {data.total_tickets} tickets deflected
            </p>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-2xl font-bold text-white">{data.total_tickets}</span>
            </div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Total Tickets</h3>
            <p className="text-xs text-slate-500">Processed in selected period</p>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-2xl font-bold text-white">{formatTime(data.avg_response_time)}</span>
            </div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Avg Response Time</h3>
            <p className="text-xs text-slate-500">Time to first response</p>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-2xl font-bold text-white">{data.webhook_events_today}</span>
            </div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Webhook Events</h3>
            <p className="text-xs text-slate-500">{data.webhook_success_rate}% success rate</p>
          </div>
        </Card>
      </div>

      {/* Integration Status */}
      <Card className="bg-slate-900 border-slate-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Integration Status</h3>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              data.integration_status === 'connected' ? 'bg-green-500' :
              data.integration_status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
            <span className="text-white capitalize">{data.integration_status}</span>
            <span className="text-slate-400">• Intercom Integration</span>
          </div>
        </div>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {data.category_breakdown.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-white">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{category.count}</div>
                    <div className="text-xs text-slate-400">{category.deflection_rate}% deflected</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-900 border-slate-800">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {data.recent_activity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className={`${getStatusColor(activity.status)}`}>
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{activity.description}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Hourly Activity Chart */}
      <Card className="bg-slate-900 border-slate-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Hourly Activity</h3>
          <div className="h-64 flex items-end gap-2">
            {data.hourly_activity.map((hour) => (
              <div key={hour.hour} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-slate-800 rounded-t mb-2 relative">
                  <div 
                    className="bg-blue-500 rounded-t transition-all duration-300"
                    style={{ 
                      height: `${(hour.tickets / Math.max(...data.hourly_activity.map(h => h.tickets))) * 100}%` 
                    }}
                  />
                  {hour.deflections > 0 && (
                    <div 
                      className="bg-green-500 absolute bottom-0 w-full rounded-t transition-all duration-300"
                      style={{ 
                        height: `${(hour.deflections / hour.tickets) * 100}%` 
                      }}
                    />
                  )}
                </div>
                <span className="text-xs text-slate-400">{hour.hour}:00</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-xs text-slate-400">Tickets</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-xs text-slate-400">Deflections</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 
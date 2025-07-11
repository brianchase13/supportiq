'use client';

import { DashboardMetrics, DashboardError } from '@/lib/dashboard/dashboard-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RefreshCw, AlertCircle, CheckCircle2, TrendingUp, Users, Clock, Smile, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealTimeDashboard } from '@/hooks/useRealTimeDashboard';

interface RealTimeDashboardProps {
  userId: string;
  className?: string;
}

export function RealTimeDashboard({ userId, className }: RealTimeDashboardProps) {
  const { 
    metrics, 
    error, 
    loading, 
    refreshing, 
    refresh, 
    isConnected 
  } = useRealTimeDashboard(userId);

  if (loading && !metrics) {
    return <DashboardSkeleton />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge 
            variant={metrics?.isLive ? "default" : "secondary"}
            className={cn(
              "flex items-center gap-1",
              metrics?.isLive ? "bg-green-600" : "bg-yellow-600"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              metrics?.isLive ? "bg-green-300 animate-pulse" : "bg-yellow-300"
            )} />
            {metrics?.isLive ? "Live" : "Cached"}
          </Badge>
          
          <Badge 
            variant="outline"
            className={cn(
              "flex items-center gap-1",
              isConnected ? "text-green-400 border-green-400" : "text-red-400 border-red-400"
            )}
          >
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          
          {metrics && (
            <span className="text-sm text-muted-foreground">
              Updated {formatCacheAge(metrics.cacheAge)}
            </span>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant={error.code === 'STALE_CACHE' ? "default" : "destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message}
            {error.retryAfter && (
              <span className="ml-2 text-sm">
                Retrying in {Math.round(error.retryAfter / 1000)}s
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {metrics && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Tickets"
              value={metrics.totalTickets}
              icon={<Users className="w-4 h-4" />}
              trend="neutral"
            />
            <MetricCard
              title="Open Tickets"
              value={metrics.openTickets}
              icon={<AlertCircle className="w-4 h-4" />}
              trend={metrics.openTickets > metrics.totalTickets * 0.3 ? "down" : "up"}
            />
            <MetricCard
              title="Avg Response Time"
              value={`${metrics.avgResponseTime}m`}
              icon={<Clock className="w-4 h-4" />}
              trend={metrics.avgResponseTime < 30 ? "up" : "down"}
            />
            <MetricCard
              title="Satisfaction"
              value={`${metrics.customerSatisfaction}%`}
              icon={<Smile className="w-4 h-4" />}
              trend={metrics.customerSatisfaction > 70 ? "up" : "down"}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ticket Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Trends</CardTitle>
                <CardDescription>Daily ticket volume and resolution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.ticketTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      name="Created"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="resolved" 
                      stackId="1"
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      name="Resolved"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Ticket categories breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.categories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {metrics.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          {metrics.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  AI Insights
                </CardTitle>
                <CardDescription>
                  Actionable insights from your support data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.insights.map((insight) => (
                    <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        insight.type === 'opportunity' && "bg-blue-500",
                        insight.type === 'warning' && "bg-yellow-500",
                        insight.type === 'success' && "bg-green-500"
                      )} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{insight.title}</h4>
                          <Badge variant="outline" size="sm">
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={cn(
            "p-2 rounded-md",
            trend === 'up' && "bg-green-100 text-green-600",
            trend === 'down' && "bg-red-100 text-red-600",
            trend === 'neutral' && "bg-gray-100 text-gray-600"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-8 w-20 bg-muted rounded animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse" />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-muted rounded animate-pulse" />
        <div className="h-80 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

function formatCacheAge(ageMs: number): string {
  const seconds = Math.floor(ageMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

const CATEGORY_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
  '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'
];
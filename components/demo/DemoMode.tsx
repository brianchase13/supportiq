'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play,
  Pause,
  RotateCcw,
  Zap,
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
  DollarSign,
  Target,
  BarChart3,
  Settings,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

interface DemoMetrics {
  ticketsProcessed: number;
  autoResolved: number;
  responseTime: number;
  satisfaction: number;
  costSavings: number;
  roi: number;
  deflectionRate: number;
  agentEfficiency: number;
}

export function DemoMode() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [metrics, setMetrics] = useState<DemoMetrics>({
    ticketsProcessed: 1247,
    autoResolved: 847,
    responseTime: 2.3,
    satisfaction: 4.2,
    costSavings: 8470,
    roi: 8560,
    deflectionRate: 68,
    agentEfficiency: 87
  });

  const [liveMetrics, setLiveMetrics] = useState<DemoMetrics>({
    ticketsProcessed: 1247,
    autoResolved: 847,
    responseTime: 2.3,
    satisfaction: 4.2,
    costSavings: 8470,
    roi: 8560,
    deflectionRate: 68,
    agentEfficiency: 87
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setLiveMetrics(prev => ({
          ticketsProcessed: prev.ticketsProcessed + Math.floor(Math.random() * 3) + 1,
          autoResolved: prev.autoResolved + Math.floor(Math.random() * 2) + 1,
          responseTime: Math.max(1.5, prev.responseTime + (Math.random() - 0.5) * 0.2),
          satisfaction: Math.min(5, Math.max(3.5, prev.satisfaction + (Math.random() - 0.5) * 0.1)),
          costSavings: prev.costSavings + Math.floor(Math.random() * 50) + 10,
          roi: Math.min(10000, prev.roi + Math.floor(Math.random() * 100) + 20),
          deflectionRate: Math.min(85, prev.deflectionRate + (Math.random() - 0.5) * 2),
          agentEfficiency: Math.min(95, prev.agentEfficiency + (Math.random() - 0.5) * 1)
        }));
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [isPlaying]);

  const resetDemo = () => {
    setLiveMetrics(metrics);
    setIsPlaying(false);
  };

  const toggleDemo = () => {
    setIsPlaying(!isPlaying);
  };

  const recentActivity = [
    {
      id: 1,
      type: 'auto-resolve',
      message: 'Password reset ticket automatically resolved',
      time: '2 minutes ago',
      savings: 25,
      icon: <Zap className="w-4 h-4 text-green-600" />
    },
    {
      id: 2,
      type: 'insight',
      message: 'New pattern detected: 23% of tickets are billing-related',
      time: '5 minutes ago',
      savings: 0,
      icon: <TrendingUp className="w-4 h-4 text-blue-600" />
    },
    {
      id: 3,
      type: 'auto-resolve',
      message: 'Account access issue resolved with AI response',
      time: '8 minutes ago',
      savings: 30,
      icon: <Zap className="w-4 h-4 text-green-600" />
    },
    {
      id: 4,
      type: 'escalation',
      message: 'Complex technical issue escalated to human agent',
      time: '12 minutes ago',
      savings: 0,
      icon: <Users className="w-4 h-4 text-orange-600" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Demo Controls */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Interactive Demo Mode</CardTitle>
                <CardDescription>
                  Experience SupportIQ with realistic, live-updating data
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-white">
              Demo Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleDemo}
              variant={isPlaying ? "outline" : "default"}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Demo
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Live Demo
                </>
              )}
            </Button>
            <Button onClick={resetDemo} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
            >
              {showDetails ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show Details
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                Live
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {liveMetrics.ticketsProcessed.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-2">Tickets Processed</div>
            <Progress value={Math.min(100, (liveMetrics.ticketsProcessed / 2000) * 100)} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                {liveMetrics.deflectionRate}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {liveMetrics.autoResolved.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-2">Auto-Resolved</div>
            <Progress value={liveMetrics.deflectionRate} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                {liveMetrics.responseTime.toFixed(1)}h
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {liveMetrics.responseTime.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600 mb-2">Avg Response Time</div>
            <Progress value={Math.max(0, 100 - (liveMetrics.responseTime / 5) * 100)} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                ${liveMetrics.roi.toLocaleString()}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ${liveMetrics.costSavings.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-2">Monthly Savings</div>
            <Progress value={Math.min(100, (liveMetrics.costSavings / 10000) * 100)} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* ROI Calculator */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Target className="w-5 h-5" />
            ROI Calculator
          </CardTitle>
          <CardDescription>
            See how SupportIQ pays for itself
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg border">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round((liveMetrics.costSavings / 99) * 100)}%
              </div>
              <div className="text-sm text-gray-600 mb-2">ROI</div>
              <div className="text-xs text-gray-500">
                $99/month cost vs ${liveMetrics.costSavings.toLocaleString()}/month savings
              </div>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round(liveMetrics.autoResolved * 0.1)}h
              </div>
              <div className="text-sm text-gray-600 mb-2">Time Saved</div>
              <div className="text-xs text-gray-500">
                {liveMetrics.autoResolved} tickets × 0.1 hours each
              </div>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                ${Math.round(liveMetrics.costSavings / 12).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mb-2">Daily Savings</div>
              <div className="text-xs text-gray-500">
                ${liveMetrics.costSavings.toLocaleString()}/month ÷ 30 days
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Live Activity Feed
          </CardTitle>
          <CardDescription>
            Real-time updates from your AI automation engine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{activity.message}</div>
                  <div className="text-sm text-gray-500">{activity.time}</div>
                </div>
                {activity.savings > 0 && (
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">
                      +${activity.savings}
                    </div>
                    <div className="text-xs text-gray-500">saved</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Detailed Analytics
            </CardTitle>
            <CardDescription>
              Deep dive into your support performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Ticket Categories</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Password Resets</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                      <span className="text-sm font-medium">95%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Account Access</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Billing Questions</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                      </div>
                      <span className="text-sm font-medium">72%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Performance Trends</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Customer Satisfaction</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{liveMetrics.satisfaction.toFixed(1)}/5</span>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        +0.3
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Agent Efficiency</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{liveMetrics.agentEfficiency}%</span>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        +12%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{liveMetrics.responseTime.toFixed(1)}h</span>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        -1.2h
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Ready to Transform Your Support?
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start your free trial and see these results with your real support data
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline">
              Schedule Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
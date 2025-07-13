'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  Zap,
  Users,
  BarChart3,
  Calendar,
  Award,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Play,
  Pause
} from 'lucide-react';
import { useUser } from '@/lib/auth/user-context';

interface ROIMetrics {
  current_savings: number;
  target_savings: number;
  monthly_savings: number;
  annual_savings: number;
  roi_percentage: number;
  payback_period_months: number;
  tickets_deflected: number;
  hours_saved: number;
  agent_efficiency: number;
  customer_satisfaction: number;
  deflection_rate: number;
  cost_per_ticket: number;
}

interface Milestone {
  id: string;
  name: string;
  target: number;
  current: number;
  achieved: boolean;
  reward: string;
  icon: React.ReactNode;
}

interface SavingsHistory {
  date: string;
  savings: number;
  tickets: number;
  deflection_rate: number;
}

export function ROIDashboard() {
  const { user } = useUser();
  const [metrics, setMetrics] = useState<ROIMetrics>({
    current_savings: 8470,
    target_savings: 15000,
    monthly_savings: 8470,
    annual_savings: 101640,
    roi_percentage: 8560,
    payback_period_months: 1.2,
    tickets_deflected: 847,
    hours_saved: 84.7,
    agent_efficiency: 87,
    customer_satisfaction: 4.2,
    deflection_rate: 68,
    cost_per_ticket: 25
  });

  const [isLive, setIsLive] = useState(true);
  const [savingsHistory, setSavingsHistory] = useState<SavingsHistory[]>([]);

  const milestones: Milestone[] = [
    {
      id: '1',
      name: 'First $1K Saved',
      target: 1000,
      current: Math.min(metrics.current_savings, 1000),
      achieved: metrics.current_savings >= 1000,
      reward: '🎉 Early Adopter Badge',
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      id: '2',
      name: '100 Tickets Deflected',
      target: 100,
      current: Math.min(metrics.tickets_deflected, 100),
      achieved: metrics.tickets_deflected >= 100,
      reward: '🚀 Efficiency Expert',
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: '3',
      name: '50% Deflection Rate',
      target: 50,
      current: Math.min(metrics.deflection_rate, 50),
      achieved: metrics.deflection_rate >= 50,
      reward: '🎯 Automation Master',
      icon: <Target className="w-5 h-5" />
    },
    {
      id: '4',
      name: '10,000% ROI',
      target: 10000,
      current: Math.min(metrics.roi_percentage, 10000),
      achieved: metrics.roi_percentage >= 10000,
      reward: '💎 ROI Champion',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      id: '5',
      name: '4.5+ Satisfaction',
      target: 4.5,
      current: Math.min(metrics.customer_satisfaction, 4.5),
      achieved: metrics.customer_satisfaction >= 4.5,
      reward: '⭐ Customer Success Hero',
      icon: <Users className="w-5 h-5" />
    }
  ];

  useEffect(() => {
    // Generate mock savings history
    const history: SavingsHistory[] = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        savings: Math.floor(Math.random() * 500) + 200,
        tickets: Math.floor(Math.random() * 50) + 20,
        deflection_rate: Math.random() * 20 + 60
      });
    }
    setSavingsHistory(history);

    // Live updates simulation
    if (isLive) {
      const interval = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          current_savings: prev.current_savings + Math.floor(Math.random() * 10) + 1,
          tickets_deflected: prev.tickets_deflected + Math.floor(Math.random() * 2) + 1,
          hours_saved: prev.hours_saved + (Math.random() * 0.2),
          monthly_savings: prev.current_savings + Math.floor(Math.random() * 10) + 1,
          annual_savings: (prev.current_savings + Math.floor(Math.random() * 10) + 1) * 12
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isLive]);

  const progressToTarget = (metrics.current_savings / metrics.target_savings) * 100;
  const nextMilestone = milestones.find(m => !m.achieved);
  const recentAchievements = milestones.filter(m => m.achieved).slice(-2);

  return (
    <div className="space-y-6">
      {/* ROI Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-green-800">ROI Dashboard</CardTitle>
                <CardDescription className="text-green-700">
                  Real-time return on investment tracking and value demonstration
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isLive ? "default" : "secondary"} className="bg-green-100 text-green-800">
                {isLive ? (
                  <>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse mr-2"></div>
                    Live Updates
                  </>
                ) : (
                  'Paused'
                )}
              </Badge>
              <Button
                onClick={() => setIsLive(!isLive)}
                variant="outline"
                size="sm"
              >
                {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key ROI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                {metrics.roi_percentage.toLocaleString()}% ROI
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ${metrics.current_savings.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-2">Total Savings</div>
            <Progress value={progressToTarget} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Current</span>
              <span>Target: ${metrics.target_savings.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                {metrics.deflection_rate}% Rate
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.tickets_deflected.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-2">Tickets Deflected</div>
            <Progress value={metrics.deflection_rate} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Current</span>
              <span>Target: 85%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                {metrics.payback_period_months}mo
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.hours_saved.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600 mb-2">Time Saved</div>
            <Progress value={Math.min(100, (metrics.hours_saved / 100) * 100)} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Current</span>
              <span>Target: 100h</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                {metrics.customer_satisfaction}/5
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.agent_efficiency}%
            </div>
            <div className="text-sm text-gray-600 mb-2">Agent Efficiency</div>
            <Progress value={metrics.agent_efficiency} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Current</span>
              <span>Target: 95%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Monthly Savings Trend
            </CardTitle>
            <CardDescription>
              Track your savings growth over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savingsHistory.slice(-7).map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {day.tickets} tickets • {day.deflection_rate.toFixed(1)}% deflection
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">+${day.savings}</div>
                    <div className="text-xs text-gray-500">saved</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Milestones & Achievements
            </CardTitle>
            <CardDescription>
              Track your progress and unlock rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    milestone.achieved ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {milestone.achieved ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      milestone.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{milestone.name}</div>
                    <div className="text-xs text-gray-500">
                      {milestone.current}/{milestone.target}
                    </div>
                    <Progress 
                      value={(milestone.current / milestone.target) * 100} 
                      className="h-1 mt-1" 
                    />
                  </div>
                  {milestone.achieved && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {milestone.reward}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Award className="w-5 h-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-yellow-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{achievement.name}</div>
                    <div className="text-sm text-gray-600">{achievement.reward}</div>
                    <div className="text-xs text-yellow-600 mt-1">Achieved recently!</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Milestone */}
      {nextMilestone && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Target className="w-5 h-5" />
              Next Milestone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                {nextMilestone.icon}
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-gray-900 mb-1">{nextMilestone.name}</div>
                <div className="text-gray-600 mb-2">Reward: {nextMilestone.reward}</div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(nextMilestone.current / nextMilestone.target) * 100} 
                    className="flex-1 h-2" 
                  />
                  <span className="text-sm font-medium text-blue-600">
                    {Math.round((nextMilestone.current / nextMilestone.target) * 100)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {nextMilestone.current}/{nextMilestone.target} - {nextMilestone.target - nextMilestone.current} more needed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ROI Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <TrendingUp className="w-5 h-5" />
            ROI Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {metrics.roi_percentage.toLocaleString()}%
              </div>
              <div className="text-sm text-purple-700 font-medium">Return on Investment</div>
              <div className="text-xs text-purple-600 mt-1">
                $99/month cost vs ${metrics.monthly_savings.toLocaleString()}/month savings
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {metrics.payback_period_months}
              </div>
              <div className="text-sm text-purple-700 font-medium">Months to Payback</div>
              <div className="text-xs text-purple-600 mt-1">
                Time to recover your investment
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                ${metrics.annual_savings.toLocaleString()}
              </div>
              <div className="text-sm text-purple-700 font-medium">Annual Savings</div>
              <div className="text-xs text-purple-600 mt-1">
                Projected yearly value
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
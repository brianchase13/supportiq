'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Clock, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Award,
  Target,
  Users,
  Zap
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  ticketsHandled: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  satisfactionScore: number;
  deflectionRate: number;
  efficiency: number;
  achievements: string[];
  rank: number;
}

interface PerformanceMetrics {
  totalAgents: number;
  avgResponseTime: number;
  avgSatisfaction: number;
  totalTickets: number;
  topPerformer: Agent;
  mostImproved: Agent;
}

export function AgentPerformanceScorecard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadAgentData();
  }, [selectedPeriod]);

  const loadAgentData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAgents: Agent[] = [
        {
          id: '1',
          name: 'Sarah Chen',
          email: 'sarah@company.com',
          avatar: '/avatars/sarah.jpg',
          ticketsHandled: 247,
          avgResponseTime: 8.2,
          avgResolutionTime: 12.5,
          satisfactionScore: 4.8,
          deflectionRate: 92,
          efficiency: 94,
          achievements: ['Top Responder', 'Customer Choice', 'Efficiency Champion'],
          rank: 1
        },
        {
          id: '2',
          name: 'Mike Rodriguez',
          email: 'mike@company.com',
          avatar: '/avatars/mike.jpg',
          ticketsHandled: 198,
          avgResponseTime: 9.1,
          avgResolutionTime: 14.2,
          satisfactionScore: 4.6,
          deflectionRate: 88,
          efficiency: 91,
          achievements: ['Most Improved', 'Team Player'],
          rank: 2
        },
        {
          id: '3',
          name: 'Emma Thompson',
          email: 'emma@company.com',
          avatar: '/avatars/emma.jpg',
          ticketsHandled: 223,
          avgResponseTime: 7.8,
          avgResolutionTime: 11.9,
          satisfactionScore: 4.7,
          deflectionRate: 90,
          efficiency: 93,
          achievements: ['Speed Demon', 'Quality Focus'],
          rank: 3
        },
        {
          id: '4',
          name: 'Alex Johnson',
          email: 'alex@company.com',
          avatar: '/avatars/alex.jpg',
          ticketsHandled: 156,
          avgResponseTime: 10.5,
          avgResolutionTime: 16.8,
          satisfactionScore: 4.4,
          deflectionRate: 85,
          efficiency: 87,
          achievements: ['Rising Star'],
          rank: 4
        }
      ];

      setAgents(mockAgents);
      setMetrics({
        totalAgents: mockAgents.length,
        avgResponseTime: mockAgents.reduce((sum, agent) => sum + agent.avgResponseTime, 0) / mockAgents.length,
        avgSatisfaction: mockAgents.reduce((sum, agent) => sum + agent.satisfactionScore, 0) / mockAgents.length,
        totalTickets: mockAgents.reduce((sum, agent) => sum + agent.ticketsHandled, 0),
        topPerformer: mockAgents[0],
        mostImproved: mockAgents[1]
      });
    } catch (error) {
      console.error('Error loading agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Award className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading team performance...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="w-6 h-6 text-purple-600" />
                Agent Performance Scorecard
              </CardTitle>
              <CardDescription>
                Team performance metrics and achievements
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {(['week', 'month', 'quarter'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Team Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.totalAgents}
              </div>
              <div className="text-sm text-gray-600">Team Members</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.avgResponseTime.toFixed(1)}m
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.avgSatisfaction.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Satisfaction</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {metrics.totalTickets}
              </div>
              <div className="text-sm text-gray-600">Tickets Handled</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performer */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Trophy className="w-5 h-5" />
              Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics?.topPerformer && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={metrics.topPerformer.avatar} />
                    <AvatarFallback>{metrics.topPerformer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{metrics.topPerformer.name}</h3>
                    <p className="text-gray-600">{metrics.topPerformer.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        #{metrics.topPerformer.rank} Rank
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{metrics.topPerformer.efficiency}%</div>
                    <div className="text-sm text-gray-600">Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{metrics.topPerformer.avgResponseTime}m</div>
                    <div className="text-sm text-gray-600">Response Time</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">Achievements</h4>
                  <div className="flex flex-wrap gap-2">
                    {metrics.topPerformer.achievements.map((achievement, index) => (
                      <Badge key={index} variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Improved */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="w-5 h-5" />
              Most Improved
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics?.mostImproved && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={metrics.mostImproved.avatar} />
                    <AvatarFallback>{metrics.mostImproved.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{metrics.mostImproved.name}</h3>
                    <p className="text-gray-600">{metrics.mostImproved.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        +15% This Month
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{metrics.mostImproved.deflectionRate}%</div>
                    <div className="text-sm text-gray-600">Deflection Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{metrics.mostImproved.satisfactionScore}</div>
                    <div className="text-sm text-gray-600">Satisfaction</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">Recent Wins</h4>
                  <div className="flex flex-wrap gap-2">
                    {metrics.mostImproved.achievements.map((achievement, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50 border-green-200 text-green-800">
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agent Rankings */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Team Rankings
          </CardTitle>
          <CardDescription>
            Performance metrics for all team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {getRankIcon(agent.rank)}
                  <Avatar>
                    <AvatarImage src={agent.avatar} />
                    <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                    <p className="text-sm text-gray-600">{agent.email}</p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{agent.ticketsHandled}</div>
                    <div className="text-xs text-gray-600">Tickets</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">{agent.avgResponseTime}m</div>
                    <div className="text-xs text-gray-600">Response</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{agent.satisfactionScore}</div>
                    <div className="text-xs text-gray-600">Satisfaction</div>
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${getEfficiencyColor(agent.efficiency)}`}>
                      {agent.efficiency}%
                    </div>
                    <div className="text-xs text-gray-600">Efficiency</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {agent.achievements.slice(0, 2).map((achievement, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {achievement}
                    </Badge>
                  ))}
                  {agent.achievements.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{agent.achievements.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Insights */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Team Insights</h3>
            <p className="text-blue-100 mb-4">
              Your team is performing {metrics && metrics.avgSatisfaction > 4.5 ? 'exceptionally well' : 'well'} with an average satisfaction score of {metrics?.avgSatisfaction.toFixed(1)}/5
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Share Results
              </Button>
              <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-blue-600">
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
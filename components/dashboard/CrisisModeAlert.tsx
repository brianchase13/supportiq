'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Users, 
  MessageSquare,
  Bell,
  Zap,
  Target,
  ArrowRight,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface CrisisAlert {
  id: string;
  type: 'spike' | 'satisfaction_drop' | 'response_time_increase' | 'system_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  currentValue: number;
  baselineValue: number;
  percentageChange: number;
  detectedAt: string;
  recommendations: string[];
  actions: string[];
  status: 'active' | 'acknowledged' | 'resolved';
}

interface CrisisMetrics {
  totalAlerts: number;
  activeAlerts: number;
  avgResponseTime: number;
  ticketVolume: number;
  satisfactionScore: number;
  teamAvailability: number;
}

export function CrisisModeAlert() {
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [metrics, setMetrics] = useState<CrisisMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    loadCrisisData();
  }, []);

  const loadCrisisData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAlerts: CrisisAlert[] = [
        {
          id: '1',
          type: 'spike',
          severity: 'high',
          title: 'Unusual Ticket Volume Spike',
          description: 'Ticket volume increased by 150% in the last 2 hours',
          currentValue: 45,
          baselineValue: 18,
          percentageChange: 150,
          detectedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          recommendations: [
            'Activate all-hands support mode',
            'Enable automated responses for common issues',
            'Prioritize high-impact tickets',
            'Notify management team'
          ],
          actions: [
            'Escalate to senior support',
            'Update status page',
            'Send customer communication'
          ],
          status: 'active'
        },
        {
          id: '2',
          type: 'satisfaction_drop',
          severity: 'medium',
          title: 'Customer Satisfaction Decline',
          description: 'Satisfaction score dropped by 25% this week',
          currentValue: 3.2,
          baselineValue: 4.3,
          percentageChange: -25,
          detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          recommendations: [
            'Review recent ticket responses',
            'Implement quality assurance checks',
            'Provide additional training to team',
            'Analyze common complaint patterns'
          ],
          actions: [
            'Schedule team meeting',
            'Review response templates',
            'Implement feedback loop'
          ],
          status: 'acknowledged'
        },
        {
          id: '3',
          type: 'response_time_increase',
          severity: 'critical',
          title: 'Response Time Crisis',
          description: 'Average response time increased by 300%',
          currentValue: 45,
          baselineValue: 11,
          percentageChange: 300,
          detectedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
          recommendations: [
            'Immediate all-hands on deck',
            'Activate backup support team',
            'Enable emergency response protocols',
            'Contact management immediately'
          ],
          actions: [
            'Emergency team activation',
            'Customer communication blast',
            'Status page update'
          ],
          status: 'active'
        }
      ];

      setAlerts(mockAlerts);
      setMetrics({
        totalAlerts: mockAlerts.length,
        activeAlerts: mockAlerts.filter(a => a.status === 'active').length,
        avgResponseTime: 23,
        ticketVolume: 156,
        satisfactionScore: 3.8,
        teamAvailability: 85
      });
    } catch (error) {
      console.error('Error loading crisis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'acknowledged' as const } : alert
    ));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' as const } : alert
    ));
  };

  const getSeverityColor = (severity: CrisisAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: CrisisAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusIcon = (status: CrisisAlert['status']) => {
    switch (status) {
      case 'active':
        return <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />;
      case 'acknowledged':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const filteredAlerts = showResolved 
    ? alerts 
    : alerts.filter(alert => alert.status !== 'resolved');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Monitoring for crisis alerts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasActiveAlerts = alerts.some(alert => alert.status === 'active');

  return (
    <div className="space-y-6">
      {/* Crisis Status Header */}
      <Card className={`border-0 shadow-lg ${hasActiveAlerts ? 'bg-gradient-to-r from-red-50 to-orange-50' : 'bg-gradient-to-r from-green-50 to-emerald-50'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {hasActiveAlerts ? (
                <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-600" />
              )}
              <div>
                <CardTitle className={`text-2xl ${hasActiveAlerts ? 'text-red-800' : 'text-green-800'}`}>
                  {hasActiveAlerts ? 'Crisis Mode Active' : 'All Systems Normal'}
                </CardTitle>
                <CardDescription className={hasActiveAlerts ? 'text-red-700' : 'text-green-700'}>
                  {hasActiveAlerts 
                    ? `${alerts.filter(a => a.status === 'active').length} active alerts require attention`
                    : 'No critical issues detected'
                  }
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResolved(!showResolved)}
              >
                {showResolved ? 'Hide Resolved' : 'Show All'}
              </Button>
              <Badge variant={hasActiveAlerts ? 'destructive' : 'secondary'}>
                {metrics?.activeAlerts || 0} Active
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Crisis Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-red-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {metrics.avgResponseTime}m
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
              <Badge variant="destructive" className="mt-1">
                +{Math.round((metrics.avgResponseTime - 11) / 11 * 100)}%
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-white border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {metrics.ticketVolume}
              </div>
              <div className="text-sm text-gray-600">Active Tickets</div>
              <Badge variant="secondary" className="mt-1">
                +{Math.round((metrics.ticketVolume - 50) / 50 * 100)}%
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-white border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {metrics.satisfactionScore}
              </div>
              <div className="text-sm text-gray-600">Satisfaction Score</div>
              <Badge variant="secondary" className="mt-1">
                -{Math.round((4.3 - metrics.satisfactionScore) / 4.3 * 100)}%
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-white border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.teamAvailability}%
              </div>
              <div className="text-sm text-gray-600">Team Available</div>
              <Badge variant="secondary" className="mt-1">
                {metrics.teamAvailability > 80 ? 'Good' : 'Low'}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Alerts */}
      {filteredAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className="border-l-4 border-l-red-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        {getStatusIcon(alert.status)}
                      </div>
                      <CardDescription>{alert.description}</CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Detected: {new Date(alert.detectedAt).toLocaleString()}</span>
                        <span>Change: {alert.percentageChange > 0 ? '+' : ''}{alert.percentageChange}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {alert.status === 'active' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Recommendations */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    Immediate Actions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h5>
                      <ul className="space-y-1">
                        {alert.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Required Actions</h5>
                      <ul className="space-y-1">
                        {alert.actions.map((action, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Update
                  </Button>
                  <Button size="sm" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Escalate
                  </Button>
                  <Button size="sm" variant="outline">
                    <Zap className="w-4 h-4 mr-2" />
                    Auto-Respond
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Crisis Response CTA */}
      {hasActiveAlerts && (
        <Card className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Crisis Response Required</h3>
              <p className="text-red-100 mb-4">
                Immediate action needed to address {alerts.filter(a => a.status === 'active').length} active alerts
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" size="lg">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Emergency Response
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-red-600">
                  View Protocol
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Alerts State */}
      {!hasActiveAlerts && filteredAlerts.length === 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-800 mb-2">All Systems Normal</h3>
            <p className="text-green-700 mb-4">
              No crisis alerts detected. Your support team is operating efficiently.
            </p>
            <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
              View Historical Alerts
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
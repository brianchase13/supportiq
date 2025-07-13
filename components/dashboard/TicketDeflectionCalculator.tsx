'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Users,
  Target,
  Zap,
  ArrowRight
} from 'lucide-react';

interface DeflectionMetrics {
  currentTickets: number;
  currentDeflectionRate: number;
  avgTicketCost: number;
  avgResolutionTime: number;
  teamSize: number;
  avgHourlyRate: number;
}

interface DeflectionProjection {
  potentialDeflectionRate: number;
  ticketsDeflected: number;
  monthlySavings: number;
  annualSavings: number;
  timeSaved: number;
  roi: number;
  recommendations: string[];
}

export function TicketDeflectionCalculator() {
  const [metrics, setMetrics] = useState<DeflectionMetrics>({
    currentTickets: 1000,
    currentDeflectionRate: 15,
    avgTicketCost: 25,
    avgResolutionTime: 15,
    teamSize: 5,
    avgHourlyRate: 30
  });

  const [projection, setProjection] = useState<DeflectionProjection | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate deflection projections
  const calculateProjections = async () => {
    setLoading(true);
    try {
      // Simulate API call to get AI-powered projections
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const potentialRate = Math.min(85, metrics.currentDeflectionRate + 70);
      const ticketsDeflected = Math.round(metrics.currentTickets * (potentialRate - metrics.currentDeflectionRate) / 100);
      const monthlySavings = ticketsDeflected * metrics.avgTicketCost;
      const annualSavings = monthlySavings * 12;
      const timeSaved = ticketsDeflected * metrics.avgResolutionTime / 60; // hours
      const roi = ((annualSavings - 1188) / 1188) * 100; // $99/month = $1188/year

      const recommendations = [
        'Update FAQ with common questions',
        'Implement automated password reset',
        'Add self-service account management',
        'Create video tutorials for complex features',
        'Optimize response templates for high-volume categories'
      ];

      setProjection({
        potentialDeflectionRate: potentialRate,
        ticketsDeflected,
        monthlySavings,
        annualSavings,
        timeSaved,
        roi,
        recommendations
      });
    } catch (error) {
      console.error('Error calculating projections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateProjections();
  }, [metrics]);

  const updateMetric = (key: keyof DeflectionMetrics, value: number) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Calculator className="w-6 h-6 text-blue-600" />
          Ticket Deflection Calculator
        </CardTitle>
        <CardDescription>
          See how AI can transform your support efficiency and ROI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="tickets">Monthly Tickets</Label>
            <Input
              id="tickets"
              type="number"
              value={metrics.currentTickets}
              onChange={(e) => updateMetric('currentTickets', parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="deflection">Current Deflection Rate (%)</Label>
            <Input
              id="deflection"
              type="number"
              value={metrics.currentDeflectionRate}
              onChange={(e) => updateMetric('currentDeflectionRate', parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cost">Avg Ticket Cost ($)</Label>
            <Input
              id="cost"
              type="number"
              value={metrics.avgTicketCost}
              onChange={(e) => updateMetric('avgTicketCost', parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="time">Resolution Time (min)</Label>
            <Input
              id="time"
              type="number"
              value={metrics.avgResolutionTime}
              onChange={(e) => updateMetric('avgResolutionTime', parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="team">Team Size</Label>
            <Input
              id="team"
              type="number"
              value={metrics.teamSize}
              onChange={(e) => updateMetric('teamSize', parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="rate">Hourly Rate ($)</Label>
            <Input
              id="rate"
              type="number"
              value={metrics.avgHourlyRate}
              onChange={(e) => updateMetric('avgHourlyRate', parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Projections */}
        {projection && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {projection.potentialDeflectionRate}%
                  </div>
                  <div className="text-sm text-gray-600">Potential Deflection</div>
                  <Badge variant="secondary" className="mt-1">
                    +{projection.potentialDeflectionRate - metrics.currentDeflectionRate}%
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-white border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${projection.monthlySavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Monthly Savings</div>
                  <Badge variant="secondary" className="mt-1">
                    ${projection.annualSavings.toLocaleString()}/year
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-white border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {projection.timeSaved.toFixed(0)}h
                  </div>
                  <div className="text-sm text-gray-600">Time Saved</div>
                  <Badge variant="secondary" className="mt-1">
                    {Math.round(projection.timeSaved / 8)} work days
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-white border-orange-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {projection.roi.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">ROI</div>
                  <Badge variant="secondary" className="mt-1">
                    vs $99/month cost
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Impact Summary */}
            <Card className="bg-white border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Zap className="w-5 h-5" />
                  AI Transformation Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Current State</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Manual tickets:</span>
                        <span className="font-medium">{Math.round(metrics.currentTickets * (100 - metrics.currentDeflectionRate) / 100)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly cost:</span>
                        <span className="font-medium">${(metrics.currentTickets * metrics.avgTicketCost).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Team workload:</span>
                        <span className="font-medium">High</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-800">With AI Support</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Manual tickets:</span>
                        <span className="font-medium text-green-600">{Math.round(metrics.currentTickets * (100 - projection.potentialDeflectionRate) / 100)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly cost:</span>
                        <span className="font-medium text-green-600">${(metrics.currentTickets * metrics.avgTicketCost - projection.monthlySavings).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Team workload:</span>
                        <span className="font-medium text-green-600">Reduced</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>
                  Actionable steps to achieve maximum deflection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projection.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{rec}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Estimated impact: +{Math.round(10 + Math.random() * 15)}% deflection
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Ready to Transform Your Support?</h3>
                <p className="text-blue-100 mb-4">
                  Start with a free trial and see the impact in your first week
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => window.location.href = '/settings'}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    View Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Calculating your AI transformation...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
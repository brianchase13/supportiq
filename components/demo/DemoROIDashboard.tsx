'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Award,
  CheckCircle,
  Star,
  Quote
} from 'lucide-react';
import { DemoDataGenerator } from '@/lib/demo/demo-data-generator';

interface DemoROIDashboardProps {
  scenario: any;
}

export function DemoROIDashboard({ scenario }: DemoROIDashboardProps) {
  const [demoGenerator] = useState(() => new DemoDataGenerator());
  const [savingsHistory, setSavingsHistory] = useState<any[]>([]);
  const [ticketCategories, setTicketCategories] = useState<any[]>([]);
  const [industryBenchmarks, setIndustryBenchmarks] = useState<any>(null);

  useEffect(() => {
    if (scenario) {
      const history = demoGenerator.generateSavingsHistory(scenario, 6);
      const categories = demoGenerator.generateTicketCategories(scenario);
      const benchmarks = demoGenerator.getIndustryBenchmarks(scenario.company.industry);
      
      setSavingsHistory(history);
      setTicketCategories(categories);
      setIndustryBenchmarks(benchmarks);
    }
  }, [scenario, demoGenerator]);

  if (!scenario) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const progressToTarget = Math.min(100, (scenario.metrics.deflection_rate / 85) * 100);
  const achievedMilestones = scenario.milestones.achieved;
  const nextMilestone = scenario.milestones.next;

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-blue-800">
                  {scenario.name} Demo
                </CardTitle>
                <CardDescription className="text-blue-700">
                  {scenario.company.name} • {scenario.company.industry} • {scenario.company.agent_count} agents
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
              Demo Mode
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                {scenario.metrics.roi_percentage.toLocaleString()}% ROI
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(scenario.metrics.monthly_savings)}
            </div>
            <div className="text-sm text-gray-600 mb-2">Monthly Savings</div>
            <Progress value={progressToTarget} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Current</span>
              <span>vs {formatCurrency(scenario.company.monthly_tickets * scenario.company.avg_ticket_cost * 0.85)} potential</span>
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
                vs {industryBenchmarks?.avg_deflection_rate}% avg
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {scenario.metrics.deflection_rate}%
            </div>
            <div className="text-sm text-gray-600 mb-2">Deflection Rate</div>
            <Progress value={scenario.metrics.deflection_rate} className="h-2" />
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
                {scenario.metrics.payback_months}mo payback
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {scenario.metrics.response_time_improvement}%
            </div>
            <div className="text-sm text-gray-600 mb-2">Faster Responses</div>
            <Progress value={scenario.metrics.response_time_improvement} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Improvement</span>
              <span>vs {industryBenchmarks?.avg_response_time}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-orange-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                vs {industryBenchmarks?.avg_satisfaction} avg
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {scenario.metrics.customer_satisfaction.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 mb-2">Satisfaction Score</div>
            <Progress value={(scenario.metrics.customer_satisfaction / 5) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Current</span>
              <span>Target: 4.5/5</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Trend and Ticket Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Savings Growth Over Time
            </CardTitle>
            <CardDescription>
              Monthly savings progression for {scenario.company.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savingsHistory.slice(-6).map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{month.month}</div>
                      <div className="text-xs text-gray-500">
                        {month.tickets_deflected} tickets • {month.deflection_rate}% rate
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(month.savings)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(month.cumulative_savings)} total
                    </div>
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
              Ticket Categories Performance
            </CardTitle>
            <CardDescription>
              Deflection rates by ticket type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{category.category}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {category.deflection_rate}%
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {category.avg_resolution_time}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={category.deflection_rate} className="flex-1 h-2" />
                    <span className="text-xs text-gray-500 w-16">
                      {category.count} tickets
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones and Testimonial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Achievement Milestones
            </CardTitle>
            <CardDescription>
              Progress tracking for {scenario.company.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievedMilestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-green-800">{milestone}</div>
                    <div className="text-xs text-green-600">Achieved</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    ✓
                  </Badge>
                </div>
              ))}
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <Target className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-blue-800">{nextMilestone}</div>
                  <div className="text-xs text-blue-600">
                    {scenario.milestones.progress}% progress
                  </div>
                  <Progress value={scenario.milestones.progress} className="h-1 mt-1" />
                </div>
                <Badge variant="outline" className="text-blue-600">
                  Next
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {scenario.testimonial && (
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Quote className="w-5 h-5" />
                Customer Success Story
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <blockquote className="text-purple-900 italic">
                  "{scenario.testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                    {scenario.testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-purple-800">
                      {scenario.testimonial.author}
                    </div>
                    <div className="text-sm text-purple-600">
                      {scenario.testimonial.title}
                    </div>
                    <div className="text-sm text-purple-600">
                      {scenario.testimonial.company}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(scenario.metrics.annual_savings)}
                    </div>
                    <div className="text-xs text-purple-600">Annual Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {scenario.metrics.roi_percentage.toLocaleString()}%
                    </div>
                    <div className="text-xs text-purple-600">ROI Achieved</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Industry Comparison */}
      {industryBenchmarks && (
        <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Industry Comparison: {scenario.company.industry}
            </CardTitle>
            <CardDescription>
              How {scenario.company.name} compares to industry benchmarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  +{scenario.metrics.deflection_rate - industryBenchmarks.avg_deflection_rate}%
                </div>
                <div className="text-sm font-medium">Better Deflection</div>
                <div className="text-xs text-gray-500 mt-1">
                  vs {industryBenchmarks.avg_deflection_rate}% industry average
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {scenario.metrics.customer_satisfaction.toFixed(1)}/5
                </div>
                <div className="text-sm font-medium">Customer Satisfaction</div>
                <div className="text-xs text-gray-500 mt-1">
                  vs {industryBenchmarks.avg_satisfaction} industry average
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatCurrency(scenario.metrics.annual_savings)}
                </div>
                <div className="text-sm font-medium">Annual Value</div>
                <div className="text-xs text-gray-500 mt-1">
                  Realized cost savings
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
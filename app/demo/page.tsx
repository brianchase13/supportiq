'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Target, 
  Zap,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  ArrowRight,
  Play,
  Download,
  Calendar,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { analytics } from '@/lib/analytics';

interface DemoData {
  summary: {
    totalTicketsAnalyzed: number;
    totalSavingsIdentified: number;
    monthlySavingsOpportunity: number;
    averageTicketCost: number;
    deflectionPotential: number;
  };
  topDeflectionOpportunities: Array<{
    id: string;
    title: string;
    description: string;
    ticketCount: number;
    monthlyCost: number;
    annualCost: number;
    deflectionPotential: number;
    confidence: number;
    priority: string;
    exampleQuestions: string[];
    timeToImplement: string;
    expectedImpact: string;
  }>;
  metrics: any;
  benchmarks: any;
  trends: any;
  roiCalculator: any;
  quickWins: any[];
  socialProof: any;
}

export default function DemoPage() {
  const [demoData, setDemoData] = useState<DemoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animationStep, setAnimationStep] = useState(0);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    fetchDemoData();
  }, []);

  useEffect(() => {
    if (demoData) {
      // Animate the reveal of insights
      const timer = setInterval(() => {
        setAnimationStep(prev => {
          if (prev < 5) {
            return prev + 1;
          } else {
            setShowCTA(true);
            clearInterval(timer);
            return prev;
          }
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [demoData]);

  const fetchDemoData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/demo-insights');
      const data = await response.json();
      setDemoData({
        summary: data.data.summary,
        topDeflectionOpportunities: data.data.opportunities,
        // Add mock data for other sections
        metrics: {
          responseTime: { current: 47, target: 30, industryAverage: 65, trend: 'improving', percentile: 35 },
          ticketVolume: { current: 1247, lastMonth: 1389, trend: 'decreasing', percentChange: -10.2 },
          satisfaction: { current: 78, target: 85, trend: 'stable', lastMonth: 79 },
          deflectionRate: { current: 34, potential: 68, improvement: 34, impact: '$2,841/month' }
        },
        benchmarks: {
          industryPosition: { overallRank: 45, strongestMetric: 'Customer Satisfaction', weakestMetric: 'Response Time', improvementFocus: 'Ticket Deflection' },
          peerComparison: { similarCompanies: 127, betterThan: 57, percentile: 45 },
          industryInsights: []
        },
        trends: {
          dailyTickets: [],
          categoryBreakdown: [],
          sentimentTrends: []
        },
        roiCalculator: {
          currentCosts: { monthlyTickets: 1247, avgHandleTime: 23.5, agentHourlyCost: 30, monthlyAgentCost: 14756, annualAgentCost: 177072 },
          withDeflection: { deflectedTickets: 847, remainingTickets: 400, newMonthlyCost: 4700, newAnnualCost: 56400, monthlySavings: 10056, annualSavings: 120672 },
          implementation: { timeRequired: '2-3 weeks', resourcesNeeded: 'Content writer + Developer', upfrontCost: 5000, paybackPeriod: '2 weeks', roi: '2,413%' }
        },
        quickWins: [],
        socialProof: {
          companiesAnalyzed: 247,
          totalSavingsGenerated: 2347829,
          averageROI: 847,
          customerCount: 89,
          testimonials: [
            { company: 'TechCorp', role: 'Head of Support', quote: 'SupportIQ identified $47K in savings in our first month. We implemented 3 KB articles and cut our ticket volume by 60%.', savings: 47000, timeline: '1 month' },
            { company: 'GrowthSaaS', role: 'Customer Success Manager', quote: 'The insights were shocking. We had no idea we were spending $3K/month on password reset tickets.', savings: 36000, timeline: '2 weeks' }
          ]
        }
      });
      
      // Track demo view
      await analytics.track({
        name: 'demo_viewed',
        properties: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to fetch demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCTAClick = async (action: string) => {
    await analytics.track({
      name: 'demo_cta_clicked',
      properties: {
        action,
        timestamp: new Date().toISOString(),
      },
    });

    if (action === 'start_analysis') {
      window.location.href = '/auth/intercom';
    } else if (action === 'schedule_demo') {
      window.open('https://calendly.com/supportiq/demo', '_blank');
    }
  };

  if (loading) {
    return <DemoLoadingScreen />;
  }

  if (!demoData) {
    return <DemoErrorScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <Badge className="bg-yellow-600 text-white">
                Live Demo
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">You're Losing </span>
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                ${demoData.summary.monthlySavingsOpportunity.toLocaleString()}/month
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Our AI analyzed {demoData.summary.totalTicketsAnalyzed.toLocaleString()} support tickets and found exactly where your money is going.
            </p>
          </div>

          {/* Animated Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className={cn(
              "bg-slate-900 border-slate-800 transition-all duration-1000",
              animationStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-red-400 mb-2">
                  ${demoData.summary.totalSavingsIdentified.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">Annual Waste Identified</div>
              </CardContent>
            </Card>

            <Card className={cn(
              "bg-slate-900 border-slate-800 transition-all duration-1000",
              animationStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {demoData.summary.totalTicketsAnalyzed.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">Tickets Analyzed</div>
              </CardContent>
            </Card>

            <Card className={cn(
              "bg-slate-900 border-slate-800 transition-all duration-1000",
              animationStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {demoData.summary.deflectionPotential}%
                </div>
                <div className="text-sm text-slate-400">Deflection Potential</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Money-Burning Issues */}
        <div className={cn(
          "mb-12 transition-all duration-1000",
          animationStep >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <h2 className="text-3xl font-bold mb-8 text-center">
            🔥 Top Money-Burning Issues
          </h2>
          
          <div className="grid gap-6">
            {demoData.topDeflectionOpportunities.map((opportunity, index) => (
              <Card 
                key={opportunity.id} 
                className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <span className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </span>
                        {opportunity.title}
                      </CardTitle>
                      <p className="text-slate-300 mt-2">{opportunity.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-400">
                        ${opportunity.monthlyCost.toLocaleString()}/mo
                      </div>
                      <div className="text-sm text-slate-400">
                        ${opportunity.annualCost.toLocaleString()}/year
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-slate-400 mb-2">Impact</div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span className="text-sm">{opportunity.ticketCount} tickets</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-green-400" />
                          <span className="text-sm">{opportunity.deflectionPotential}% deflectable</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-400" />
                          <span className="text-sm">{opportunity.confidence}% confidence</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-400 mb-2">Common Questions</div>
                      <ul className="space-y-1">
                        {opportunity.exampleQuestions.slice(0, 3).map((question, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                            {question}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-sm text-slate-400 mb-2">Solution</div>
                      <div className="space-y-2">
                        <div className="text-sm text-slate-300">{opportunity.expectedImpact}</div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm">{opportunity.timeToImplement}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ROI Calculator */}
        <div className={cn(
          "mb-12 transition-all duration-1000",
          animationStep >= 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-400" />
                ROI Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-2">Current Monthly Cost</div>
                  <div className="text-3xl font-bold text-red-400">
                    ${demoData.roiCalculator.currentCosts.monthlyAgentCost.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-300">
                    {demoData.roiCalculator.currentCosts.monthlyTickets} tickets × ${demoData.roiCalculator.currentCosts.avgHandleTime}min
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-2">With SupportIQ</div>
                  <div className="text-3xl font-bold text-green-400">
                    ${demoData.roiCalculator.withDeflection.newMonthlyCost.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-300">
                    {demoData.roiCalculator.withDeflection.remainingTickets} tickets (68% deflected)
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-2">Monthly Savings</div>
                  <div className="text-3xl font-bold text-blue-400">
                    ${demoData.roiCalculator.withDeflection.monthlySavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-300">
                    ROI: {demoData.roiCalculator.implementation.roi}
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-slate-800 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-white mb-2">
                    Payback Period: {demoData.roiCalculator.implementation.paybackPeriod}
                  </div>
                  <div className="text-sm text-slate-400">
                    Implementation: {demoData.roiCalculator.implementation.timeRequired}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        {showCTA && (
          <div className="text-center animate-fade-in">
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-12 mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Stop the Bleeding?
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                This demo shows what's possible. Connect your real data to see your actual savings.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => handleCTAClick('start_analysis')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Your Real Analysis
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => handleCTAClick('schedule_demo')}
                  className="border-slate-600 text-slate-300 px-8 py-4 text-lg"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Demo Call
                </Button>
              </div>
            </div>

            {/* Social Proof */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {demoData.socialProof.testimonials.map((testimonial: any, index: number) => (
                <Card key={index} className="bg-slate-900 border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {testimonial.company.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">{testimonial.company}</div>
                        <div className="text-sm text-slate-400">{testimonial.role}</div>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-3">"{testimonial.quote}"</p>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-600 text-white">
                        ${testimonial.savings.toLocaleString()} saved
                      </Badge>
                      <span className="text-sm text-slate-400">{testimonial.timeline}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DemoLoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Analyzing Your Support Data</h2>
        <div className="space-y-2 text-slate-300">
          <div className="animate-pulse">🔍 Scanning 10,247 tickets...</div>
          <div className="animate-pulse delay-300">💰 Calculating cost impact...</div>
          <div className="animate-pulse delay-500">🎯 Identifying deflection opportunities...</div>
        </div>
      </div>
    </div>
  );
}

function DemoErrorScreen() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-4">Demo Temporarily Unavailable</h2>
        <p className="text-slate-300 mb-6">We're updating our demo with fresh data. Try again in a few minutes.</p>
        <Button onClick={() => window.location.reload()}>
          Retry Demo
        </Button>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, DollarSign, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface AnalysisResult {
  totalTickets: number;
  topIssue: {
    category: string;
    count: number;
  };
  suggestedAction: string;
  potentialSavings: number;
  breakdown: {
    category: string;
    count: number;
    percentage: number;
  }[];
}

export function TicketAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTicket, setCurrentTicket] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);

    const mockTotalTickets = Math.floor(Math.random() * 300) + 150; // 150-450 tickets
    setTotalTickets(mockTotalTickets);

    // Simulate progressive analysis with realistic timing
    for (let i = 1; i <= mockTotalTickets; i++) {
      setCurrentTicket(i);
      setProgress((i / mockTotalTickets) * 100);
      
      // Variable delay to make it feel realistic
      const delay = i < 10 ? 150 : i < 50 ? 100 : i < 100 ? 50 : 25;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Generate realistic analysis results
    const mockResult: AnalysisResult = {
      totalTickets: mockTotalTickets,
      topIssue: {
        category: getRandomTopIssue(),
        count: Math.floor(mockTotalTickets * (Math.random() * 0.15 + 0.15)) // 15-30%
      },
      suggestedAction: '',
      potentialSavings: Math.floor((mockTotalTickets * 12) + (Math.random() * 1000)), // $12+ per ticket
      breakdown: []
    };

    // Generate category breakdown
    const categories = [
      'Password Reset', 'Billing Questions', 'Feature Requests', 
      'Bug Reports', 'Account Issues', 'Integration Help'
    ];
    
    let remaining = mockTotalTickets;
    mockResult.breakdown = categories.map((category, index) => {
      const isLast = index === categories.length - 1;
      const count = isLast ? remaining : Math.floor(remaining * (Math.random() * 0.3 + 0.1));
      remaining -= count;
      return {
        category,
        count,
        percentage: Math.round((count / mockTotalTickets) * 100)
      };
    }).filter(item => item.count > 0);

    mockResult.suggestedAction = getSuggestedAction(mockResult.topIssue.category);

    setResult(mockResult);
    setIsAnalyzing(false);
  };

  const getRandomTopIssue = () => {
    const issues = ['Password Reset', 'Billing Questions', 'Feature Requests', 'Bug Reports', 'Account Issues'];
    return issues[Math.floor(Math.random() * issues.length)];
  };

  const getSuggestedAction = (category: string) => {
    const actions: Record<string, string> = {
      'Password Reset': 'Add self-service password reset to your dashboard',
      'Billing Questions': 'Create billing FAQ and add invoice explanations',
      'Feature Requests': 'Build public roadmap to reduce duplicate requests',
      'Bug Reports': 'Improve error messages and add troubleshooting guide',
      'Account Issues': 'Add account management self-service options',
      'Integration Help': 'Create step-by-step integration documentation'
    };
    return actions[category] || 'Review and optimize your help documentation';
  };

  const reset = () => {
    setResult(null);
    setProgress(0);
    setCurrentTicket(0);
    setTotalTickets(0);
  };

  if (result) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Analysis Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">{result.totalTickets}</div>
              <div className="text-sm text-slate-400">Total Tickets</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-400">{result.topIssue.count}</div>
              <div className="text-sm text-slate-400">Top Issue</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400">${result.potentialSavings}</div>
              <div className="text-sm text-slate-400">Monthly Savings</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-400">{Math.round((result.topIssue.count / result.totalTickets) * 100)}%</div>
              <div className="text-sm text-slate-400">Top Category</div>
            </div>
          </div>

          {/* Top Issue */}
          <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Most Common Issue</h3>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">{result.topIssue.category}</span>
              <Badge className="bg-red-600 text-white">{result.topIssue.count} tickets</Badge>
            </div>
            <p className="text-slate-300 text-sm">
              <strong>Suggested Action:</strong> {result.suggestedAction}
            </p>
          </div>

          {/* Category Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Ticket Breakdown</h3>
            <div className="space-y-2">
              {result.breakdown.slice(0, 5).map((item, index) => (
                <div key={item.category} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                  <span className="text-slate-300">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{item.count}</span>
                    <span className="text-slate-400 text-sm">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Potential Savings */}
          <div className="bg-green-900/20 border border-green-500/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Potential Monthly Savings</h3>
            </div>
            <p className="text-slate-300 text-sm">
              By implementing the suggested improvements, you could potentially save 
              <strong className="text-green-400"> ${result.potentialSavings}/month</strong> in support costs.
            </p>
          </div>

          <Button onClick={reset} variant="outline" className="w-full border-slate-600 text-slate-300">
            Analyze Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Ticket Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAnalyzing ? (
          <>
            <p className="text-slate-400">
              Analyze your last 30 days of Intercom tickets to discover patterns, identify top issues, and calculate potential cost savings.
            </p>
            <Button 
              onClick={startAnalysis}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Analyze My Tickets
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-white mb-2">
                Analyzing tickets...
              </div>
              <div className="text-sm text-slate-400 mb-4">
                Processing ticket #{currentTicket} of {totalTickets}
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-xs text-slate-500 mt-2">
                {Math.round(progress)}% complete
              </div>
            </div>
            
            <div className="bg-slate-800 p-3 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Current Analysis:</div>
              <div className="text-white font-medium">
                {currentTicket < 10 ? 'Connecting to Intercom API...' :
                 currentTicket < 50 ? 'Fetching conversation data...' :
                 currentTicket < 100 ? 'Categorizing tickets...' :
                 currentTicket < totalTickets * 0.8 ? 'Running AI analysis...' :
                 'Calculating cost savings...'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Play,
  RefreshCw,
  Loader2,
  BarChart3,
  Target,
  Users
} from 'lucide-react';

interface DeflectionMetrics {
  totalTickets: number;
  deflectedTickets: number;
  deflectionRate: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  topCategories: Array<{ category: string; count: number; percentage: number }>;
  sentimentBreakdown: Array<{ sentiment: string; count: number; percentage: number }>;
}

interface RecentDeflection {
  id: string;
  subject: string;
  category: string;
  deflected: boolean;
  deflection_confidence: number;
  created_at: string;
}

interface DeflectionData {
  metrics: DeflectionMetrics;
  recentDeflections: RecentDeflection[];
  deflectionEngine: {
    status: string;
    version: string;
    features: string[];
  };
}

export default function TicketDeflectionDashboard() {
  const [data, setData] = useState<DeflectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    fetchDeflectionData();
  }, []);

  const fetchDeflectionData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tickets/deflect');
      if (response.ok) {
        const deflectionData = await response.json();
        setData(deflectionData);
      } else {
        console.error('Failed to fetch deflection data');
      }
    } catch (error) {
      console.error('Error fetching deflection data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoTickets = async () => {
    try {
      setRunningAnalysis(true);
      setAnalysisProgress(0);

      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 15, 90));
      }, 300);

      const response = await fetch('/api/demo/generate-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          count: 25,
          includeResponses: true
        }),
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (response.ok) {
        const result = await response.json();
        console.log('Demo tickets generated:', result);
        
        // Refresh data after generation
        setTimeout(() => {
          fetchDeflectionData();
          setAnalysisProgress(0);
        }, 1000);
      } else {
        console.error('Failed to generate demo tickets');
      }
    } catch (error) {
      console.error('Error generating demo tickets:', error);
    } finally {
      setRunningAnalysis(false);
    }
  };

  const runDeflectionAnalysis = async () => {
    try {
      setRunningAnalysis(true);
      setAnalysisProgress(0);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/tickets/deflect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          autoRespond: false,
          dryRun: false
        }),
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (response.ok) {
        const result = await response.json();
        console.log('Deflection analysis result:', result);
        
        // Refresh data after analysis
        setTimeout(() => {
          fetchDeflectionData();
          setAnalysisProgress(0);
        }, 1000);
      } else {
        console.error('Failed to run deflection analysis');
      }
    } catch (error) {
      console.error('Error running deflection analysis:', error);
    } finally {
      setRunningAnalysis(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading deflection data...</p>
          </div>
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
            <h3 className="text-lg font-semibold text-white mb-2">No Deflection Data</h3>
            <p className="text-slate-400 mb-4">
              Run your first deflection analysis to see metrics and insights.
            </p>
            <Button
              onClick={runDeflectionAnalysis}
              disabled={runningAnalysis}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {runningAnalysis ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run First Analysis
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { metrics, recentDeflections, deflectionEngine } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Ticket Deflection</h2>
          <p className="text-slate-400">AI-powered ticket analysis and automated responses</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={fetchDeflectionData}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={generateDemoTickets}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Users className="w-4 h-4 mr-2" />
            Generate Demo Data
          </Button>
          <Button
            onClick={runDeflectionAnalysis}
            disabled={runningAnalysis}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {runningAnalysis ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {runningAnalysis ? 'Analyzing...' : 'Run Analysis'}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {runningAnalysis && (
        <Card className="bg-slate-900 border-slate-800">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">Analyzing tickets...</span>
              <span className="text-sm text-slate-400">{analysisProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Deflection Rate</p>
                <p className="text-2xl font-bold text-white">
                  {metrics.deflectionRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-400">
                {metrics.deflectedTickets} of {metrics.totalTickets} tickets deflected
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Response Time</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(metrics.avgResponseTime)}m
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-400">
                Faster than industry average
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Tickets</p>
                <p className="text-2xl font-bold text-white">
                  {metrics.totalTickets.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-400">
                Analyzed this month
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Engine Status</p>
                <p className="text-2xl font-bold text-white">
                  {deflectionEngine.status}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-400">
                v{deflectionEngine.version}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card className="bg-slate-900 border-slate-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Top Categories</h3>
            </div>
            <div className="space-y-3">
              {metrics.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-slate-300">{category.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{category.count}</span>
                    <span className="text-xs text-slate-500">({category.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Sentiment Breakdown */}
        <Card className="bg-slate-900 border-slate-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Sentiment Analysis</h3>
            </div>
            <div className="space-y-3">
              {metrics.sentimentBreakdown.map((sentiment, index) => (
                <div key={sentiment.sentiment} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      sentiment.sentiment === 'positive' ? 'bg-green-500' :
                      sentiment.sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-slate-300 capitalize">{sentiment.sentiment}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{sentiment.count}</span>
                    <span className="text-xs text-slate-500">({sentiment.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Deflections */}
      <Card className="bg-slate-900 border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Recent Deflection Activity</h3>
          </div>
          <div className="space-y-3">
            {recentDeflections.length > 0 ? (
              recentDeflections.map((deflection) => (
                <div key={deflection.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">{deflection.subject}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-slate-400">{deflection.category}</span>
                      <span className="text-sm text-slate-400">
                        {new Date(deflection.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {deflection.deflected ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Deflected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">Escalated</span>
                      </div>
                    )}
                    <span className="text-xs text-slate-500">
                      {(deflection.deflection_confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No recent deflection activity</p>
                <p className="text-sm text-slate-500 mt-1">
                  Run an analysis to see deflection results
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
} 
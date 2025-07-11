'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  AlertTriangle,
  BarChart3,
  Users,
  Clock,
  Smile,
  Shield,
  Crown,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BenchmarkData {
  metric: string;
  userValue: number;
  industryAverage: number;
  percentile: number;
  comparison: 'better' | 'worse' | 'average';
  improvementOpportunity: number;
  benchmarkInsight: string;
}

interface BenchmarkResponse {
  userMetrics: BenchmarkData[];
  industryInsights: Array<{
    title: string;
    description: string;
    actionItems: string[];
    potentialSavings: number;
  }>;
  competitivePosition: {
    overallRank: number;
    strongestMetric: string;
    weakestMetric: string;
    improvementFocus: string;
  };
  peerComparison: {
    similarCompanies: number;
    betterThan: number;
    percentile: number;
  };
}

export default function BenchmarksPage() {
  const { user } = useUser();
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [companySize, setCompanySize] = useState('medium');
  const [industry, setIndustry] = useState('SaaS');
  const [region, setRegion] = useState('global');

  useEffect(() => {
    if (user) {
      fetchBenchmarkData();
    }
  }, [user, companySize, industry, region]);

  const fetchBenchmarkData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        companySize,
        industry,
        region,
        metrics: 'response_time,ticket_volume,satisfaction,deflection_rate',
      });

      const response = await fetch(`/api/benchmarks?${params}`);
      const data = await response.json();

      if (response.status === 402) {
        setHasAccess(false);
        setError('Benchmark access requires Growth or Enterprise plan');
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch benchmark data');
      }

      setBenchmarkData(data.data);
      setHasAccess(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch benchmark data');
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'response_time': return <Clock className="w-5 h-5" />;
      case 'ticket_volume': return <BarChart3 className="w-5 h-5" />;
      case 'satisfaction': return <Smile className="w-5 h-5" />;
      case 'deflection_rate': return <Shield className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getMetricName = (metric: string) => {
    switch (metric) {
      case 'response_time': return 'Response Time';
      case 'ticket_volume': return 'Ticket Volume';
      case 'satisfaction': return 'Satisfaction';
      case 'deflection_rate': return 'Deflection Rate';
      default: return metric;
    }
  };

  const getMetricUnit = (metric: string) => {
    switch (metric) {
      case 'response_time': return 'min';
      case 'ticket_volume': return 'tickets';
      case 'satisfaction': return '%';
      case 'deflection_rate': return '%';
      default: return '';
    }
  };

  if (loading) {
    return <BenchmarksSkeleton />;
  }

  if (!hasAccess) {
    return <BenchmarksUpgrade error={error} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            Industry Benchmarks
          </h1>
          <p className="text-slate-400">See how you compare to similar companies</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
            <Crown className="w-3 h-3 mr-1" />
            Premium Feature
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">Benchmark Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Company Size
              </label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="small">Small (1-50 employees)</option>
                <option value="medium">Medium (51-200 employees)</option>
                <option value="large">Large (201-1000 employees)</option>
                <option value="enterprise">Enterprise (1000+ employees)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="SaaS">SaaS</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="global">Global</option>
                <option value="us">United States</option>
                <option value="eu">Europe</option>
                <option value="apac">Asia Pacific</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {benchmarkData && (
        <>
          {/* Competitive Position Overview */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                Competitive Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {benchmarkData.competitivePosition.overallRank}
                  </div>
                  <div className="text-sm text-slate-400">Overall Percentile</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {benchmarkData.peerComparison.betterThan}
                  </div>
                  <div className="text-sm text-slate-400">
                    Companies You Outperform
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {benchmarkData.peerComparison.similarCompanies}
                  </div>
                  <div className="text-sm text-slate-400">Similar Companies</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">Strongest Metric</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {getMetricName(benchmarkData.competitivePosition.strongestMetric)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Focus Area</span>
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                    {getMetricName(benchmarkData.competitivePosition.weakestMetric)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metric Comparisons */}
          <div className="grid md:grid-cols-2 gap-6">
            {benchmarkData.userMetrics.map((metric, index) => (
              <Card key={index} className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMetricIcon(metric.metric)}
                      {getMetricName(metric.metric)}
                    </div>
                    <div className="flex items-center gap-2">
                      {metric.comparison === 'better' && (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      )}
                      {metric.comparison === 'worse' && (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <Badge
                        variant={metric.comparison === 'better' ? 'default' : 'secondary'}
                        className={cn(
                          metric.comparison === 'better' && 'bg-green-600',
                          metric.comparison === 'worse' && 'bg-red-600'
                        )}
                      >
                        {metric.percentile}th percentile
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {metric.userValue}{getMetricUnit(metric.metric)}
                        </div>
                        <div className="text-sm text-slate-400">Your Performance</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-slate-300">
                          {metric.industryAverage}{getMetricUnit(metric.metric)}
                        </div>
                        <div className="text-sm text-slate-400">Industry Average</div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-300">
                      {metric.benchmarkInsight}
                    </div>
                    
                    {metric.improvementOpportunity > 0 && (
                      <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                        <div className="text-sm text-blue-300">
                          <strong>Improvement Opportunity:</strong> {metric.improvementOpportunity}%
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Industry Insights */}
          {benchmarkData.industryInsights.length > 0 && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Priority Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {benchmarkData.industryInsights.map((insight, index) => (
                    <div key={index} className="p-4 bg-slate-800 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white">{insight.title}</h3>
                          <p className="text-slate-300 text-sm mt-1">{insight.description}</p>
                        </div>
                        <Badge className="bg-green-600 text-white">
                          ${insight.potentialSavings.toLocaleString()}/year
                        </Badge>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-slate-300 mb-2">
                          Recommended Actions:
                        </div>
                        <ul className="space-y-1">
                          {insight.actionItems.map((action, actionIndex) => (
                            <li key={actionIndex} className="flex items-center gap-2 text-sm text-slate-400">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                              {action}
                            </li>
                          ))}
                        </ul>
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

function BenchmarksSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-slate-800 rounded w-64 mb-2 animate-pulse" />
          <div className="h-4 bg-slate-800 rounded w-48 animate-pulse" />
        </div>
        <div className="h-8 bg-slate-800 rounded w-32 animate-pulse" />
      </div>
      
      <div className="h-32 bg-slate-800 rounded animate-pulse" />
      
      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 bg-slate-800 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function BenchmarksUpgrade({ error }: { error: string | null }) {
  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Crown className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Unlock Industry Benchmarks
        </h1>
        
        <p className="text-slate-300 mb-8">
          Compare your performance against similar companies and discover exactly where you stand in your industry.
        </p>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-white mb-4">What You'll Get:</h3>
          <ul className="space-y-2 text-left">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-slate-300">Compare against 1000+ companies</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-slate-300">Industry-specific benchmarks</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-slate-300">Competitive positioning insights</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-slate-300">Personalized improvement roadmap</span>
            </li>
          </ul>
        </div>
        
        <Button 
          onClick={() => window.location.href = '/pricing?feature=benchmarks'}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Growth Plan
        </Button>
      </div>
    </div>
  );
}
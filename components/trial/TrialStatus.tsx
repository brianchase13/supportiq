'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Zap, 
  Users, 
  Database, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Crown
} from 'lucide-react';

interface TrialData {
  id: string;
  started_at: string;
  expires_at: string;
  status: 'active' | 'expired' | 'converted' | 'cancelled';
  days_remaining: number;
  is_expired: boolean;
  limits: {
    ai_responses: number;
    team_members: number;
    integrations: number;
    tickets_per_month: number;
    storage_gb: number;
  };
  usage: {
    ai_responses_used: number;
    team_members_added: number;
    integrations_connected: number;
    tickets_processed: number;
    storage_used_gb: number;
  };
  usage_percentages: {
    ai_responses: number;
    team_members: number;
    integrations: number;
    tickets_per_month: number;
    storage_gb: number;
  };
}

export function TrialStatus() {
  const [trialData, setTrialData] = useState<TrialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrialStatus();
  }, []);

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch('/api/trial/status');
      const data = await response.json();
      
      if (data.has_trial) {
        setTrialData(data.trial);
      }
    } catch (error) {
      console.error('Failed to fetch trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      const response = await fetch('/api/trial/start', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchTrialStatus();
      }
    } catch (error) {
      console.error('Failed to start trial:', error);
    }
  };

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Trial Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trialData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Start Your Free Trial
          </CardTitle>
          <CardDescription>
            Get 14 days of full access to SupportIQ's AI-powered support automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>100 AI Responses</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <span>2 Team Members</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-500" />
                <span>1 Integration</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-orange-500" />
                <span>1,000 Tickets/Month</span>
              </div>
            </div>
            <Button onClick={handleStartTrial} className="w-full">
              Start Free Trial
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const getUsageBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {trialData.is_expired ? (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              ) : (
                <Clock className="w-5 h-5 text-blue-500" />
              )}
              Trial Status
            </CardTitle>
            <CardDescription>
              {trialData.is_expired 
                ? 'Your trial has expired. Upgrade to continue using SupportIQ.'
                : `${trialData.days_remaining} days remaining in your trial`
              }
            </CardDescription>
          </div>
          <Badge className={getStatusColor(trialData.status)}>
            {trialData.status.charAt(0).toUpperCase() + trialData.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Usage Limits */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Usage Limits</h4>
            
            {/* AI Responses */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>AI Responses</span>
                </div>
                <span className={getUsageColor(trialData.usage_percentages.ai_responses)}>
                  {trialData.usage.ai_responses_used}/{trialData.limits.ai_responses}
                </span>
              </div>
              <Progress 
                value={trialData.usage_percentages.ai_responses} 
                className="h-2"
              />
            </div>

            {/* Team Members */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span>Team Members</span>
                </div>
                <span className={getUsageColor(trialData.usage_percentages.team_members)}>
                  {trialData.usage.team_members_added}/{trialData.limits.team_members}
                </span>
              </div>
              <Progress 
                value={trialData.usage_percentages.team_members} 
                className="h-2"
              />
            </div>

            {/* Integrations */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <span>Integrations</span>
                </div>
                <span className={getUsageColor(trialData.usage_percentages.integrations)}>
                  {trialData.usage.integrations_connected}/{trialData.limits.integrations}
                </span>
              </div>
              <Progress 
                value={trialData.usage_percentages.integrations} 
                className="h-2"
              />
            </div>

            {/* Tickets */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-orange-500" />
                  <span>Tickets/Month</span>
                </div>
                <span className={getUsageColor(trialData.usage_percentages.tickets_per_month)}>
                  {trialData.usage.tickets_processed.toLocaleString()}/{trialData.limits.tickets_per_month.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={trialData.usage_percentages.tickets_per_month} 
                className="h-2"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t">
            {trialData.is_expired ? (
              <Button onClick={handleUpgrade} className="w-full">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            ) : (
              <div className="space-y-2">
                <Button onClick={handleUpgrade} variant="outline" className="w-full">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Upgrade Early
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  No credit card required • Cancel anytime
                </p>
              </div>
            )}
          </div>

          {/* Trial Benefits */}
          {!trialData.is_expired && (
            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm mb-2">Trial Benefits</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Full access to all features</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>AI-powered ticket automation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Real-time insights and analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Priority support during trial</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Zap, 
  Users, 
  Database, 
  MessageSquare, 
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerReason?: 'limit_reached' | 'trial_expiring' | 'manual';
  currentUsage?: {
    ai_responses_used: number;
    ai_responses_limit: number;
    team_members_added: number;
    team_members_limit: number;
    integrations_connected: number;
    integrations_limit: number;
    tickets_processed: number;
    tickets_limit: number;
  };
  trialData?: {
    days_remaining: number;
    is_expired: boolean;
  };
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  features: string[];
  limits: {
    ai_responses: number;
    team_members: number;
    integrations: number;
    tickets_per_month: number;
    storage_gb: number;
  };
  popular?: boolean;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    yearlyPrice: 89,
    features: [
      'Up to 1,000 AI responses/month',
      '3 team members',
      '2 integrations',
      '5,000 tickets/month',
      '5GB storage',
      'Email support',
      'Basic analytics'
    ],
    limits: {
      ai_responses: 1000,
      team_members: 3,
      integrations: 2,
      tickets_per_month: 5000,
      storage_gb: 5
    }
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 299,
    yearlyPrice: 269,
    features: [
      'Up to 10,000 AI responses/month',
      '10 team members',
      '5 integrations',
      '50,000 tickets/month',
      '20GB storage',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
      'API access'
    ],
    limits: {
      ai_responses: 10000,
      team_members: 10,
      integrations: 5,
      tickets_per_month: 50000,
      storage_gb: 20
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 899,
    yearlyPrice: 809,
    features: [
      'Unlimited AI responses',
      'Unlimited team members',
      'Unlimited integrations',
      'Unlimited tickets',
      '100GB storage',
      'Dedicated support',
      'Custom AI models',
      'White-label options',
      'SLA guarantees'
    ],
    limits: {
      ai_responses: -1, // unlimited
      team_members: -1,
      integrations: -1,
      tickets_per_month: -1,
      storage_gb: 100
    }
  }
];

export function UpgradeModal({ isOpen, onClose, triggerReason, currentUsage, trialData }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('growth');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  // Auto-select best plan based on usage
  useEffect(() => {
    if (currentUsage) {
      const { ai_responses_used, ai_responses_limit } = currentUsage;
      const usagePercentage = (ai_responses_used / ai_responses_limit) * 100;
      
      if (usagePercentage > 80) {
        setSelectedPlan('growth');
      } else if (usagePercentage > 50) {
        setSelectedPlan('starter');
      }
    }
  }, [currentUsage]);

  const selectedPlanData = PRICING_PLANS.find(plan => plan.id === selectedPlan);
  const currentPrice = billingCycle === 'yearly' ? selectedPlanData?.yearlyPrice : selectedPlanData?.price;

  const handleUpgrade = async () => {
    if (!selectedPlanData) return;

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          billingCycle,
          isTrialConversion: true,
          trialEndDate: trialData?.is_expired ? undefined : new Date(Date.now() + (trialData?.days_remaining || 0) * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      const data = await response.json();
      
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error('Checkout failed:', data.error);
        alert('Failed to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTriggerMessage = () => {
    switch (triggerReason) {
      case 'limit_reached':
        return 'You\'ve reached your trial limits. Upgrade to continue using SupportIQ.';
      case 'trial_expiring':
        return `Your trial expires in ${trialData?.days_remaining} days. Upgrade now to keep your data and continue growing.`;
      case 'manual':
        return 'Ready to unlock the full power of SupportIQ?';
      default:
        return 'Upgrade to continue using SupportIQ.';
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="w-6 h-6 text-yellow-500" />
            Upgrade to SupportIQ Pro
          </DialogTitle>
          <DialogDescription className="text-lg">
            {getTriggerMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Usage Summary */}
          {currentUsage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Current Usage</CardTitle>
                <CardDescription>
                  Here's how you're using SupportIQ during your trial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <span>AI Responses</span>
                      </div>
                      <span className="font-medium">
                        {currentUsage.ai_responses_used}/{currentUsage.ai_responses_limit}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(currentUsage.ai_responses_used, currentUsage.ai_responses_limit)} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <span>Team Members</span>
                      </div>
                      <span className="font-medium">
                        {currentUsage.team_members_added}/{currentUsage.team_members_limit}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(currentUsage.team_members_added, currentUsage.team_members_limit)} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-500" />
                        <span>Integrations</span>
                      </div>
                      <span className="font-medium">
                        {currentUsage.integrations_connected}/{currentUsage.integrations_limit}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(currentUsage.integrations_connected, currentUsage.integrations_limit)} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-orange-500" />
                        <span>Tickets/Month</span>
                      </div>
                      <span className="font-medium">
                        {currentUsage.tickets_processed.toLocaleString()}/{currentUsage.tickets_limit.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(currentUsage.tickets_processed, currentUsage.tickets_limit)} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center">
            <div className="bg-gray-100 rounded-lg p-1">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly
                <Badge variant="secondary" className="ml-2 text-xs">
                  Save 10%
                </Badge>
              </Button>
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRICING_PLANS.map((plan) => (
              <Card 
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan === plan.id 
                    ? 'ring-2 ring-blue-500 border-blue-500' 
                    : 'hover:border-gray-300'
                } ${plan.popular ? 'relative' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      ${billingCycle === 'yearly' ? plan.yearlyPrice : plan.price}
                      <span className="text-sm font-normal text-gray-500">/month</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-green-600 font-medium">
                        Save ${(plan.price - plan.yearlyPrice) * 12}/year
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Value Proposition */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600">
                  <TrendingUp className="w-6 h-6" />
                  <span>Typical ROI: 15x in first year</span>
                </div>
                <p className="text-gray-600">
                  SupportIQ customers save an average of $12,000/month in support costs 
                  while improving customer satisfaction by 40%.
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Cancel anytime</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>No setup fees</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
            <Button 
              onClick={handleUpgrade} 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Upgrade to {selectedPlanData?.name}
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>

          {/* Trial Expiration Warning */}
          {trialData && trialData.days_remaining <= 3 && !trialData.is_expired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Trial Expiring Soon</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Your trial expires in {trialData.days_remaining} days. Upgrade now to keep your data and continue using SupportIQ.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
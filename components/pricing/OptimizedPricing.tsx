'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check,
  Star,
  Zap,
  Users,
  Shield,
  TrendingUp,
  Target,
  Award,
  Crown,
  Sparkles,
  ArrowRight,
  Calculator,
  BarChart3,
  MessageSquare,
  Globe
} from 'lucide-react';
import { useUser } from '@/lib/auth/user-context';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  billing: 'monthly' | 'annual';
  description: string;
  features: PricingFeature[];
  value_highlights: string[];
  savings_estimate: number;
  roi_estimate: number;
  popular?: boolean;
  recommended?: boolean;
}

interface PricingFeature {
  name: string;
  included: boolean;
  highlight?: boolean;
  description?: string;
}

export function OptimizedPricing() {
  const { user } = useUser();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedTier, setSelectedTier] = useState<string>('professional');

  const pricingTiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: billingCycle === 'annual' ? 79 : 99,
      billing: billingCycle,
      description: 'Perfect for small teams getting started with AI support',
      value_highlights: [
        'Save $1,500+ monthly',
        '500%+ ROI guaranteed',
        '30-day money-back guarantee'
      ],
      savings_estimate: 1500,
      roi_estimate: 500,
      features: [
        { name: 'AI Ticket Analysis', included: true, highlight: true },
        { name: 'Basic Auto-Responses', included: true },
        { name: 'Email Support', included: true },
        { name: 'Basic Analytics Dashboard', included: true },
        { name: 'Up to 500 tickets/month', included: true },
        { name: '1 Support Channel', included: true },
        { name: 'Response Templates', included: false },
        { name: 'Advanced Analytics', included: false },
        { name: 'Team Collaboration', included: false },
        { name: 'API Access', included: false },
        { name: 'Custom Integrations', included: false },
        { name: 'Priority Support', included: false },
        { name: 'Dedicated Success Manager', included: false },
        { name: 'Custom AI Training', included: false },
        { name: 'SLA Guarantees', included: false }
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: billingCycle === 'annual' ? 249 : 299,
      billing: billingCycle,
      description: 'Advanced automation for growing support teams',
      value_highlights: [
        'Save $6,000+ monthly',
        '2,000%+ ROI guaranteed',
        'Most popular choice'
      ],
      savings_estimate: 6000,
      roi_estimate: 2000,
      popular: true,
      recommended: true,
      features: [
        { name: 'AI Ticket Analysis', included: true, highlight: true },
        { name: 'Advanced Auto-Responses', included: true, highlight: true },
        { name: 'Priority Support', included: true },
        { name: 'Advanced Analytics Dashboard', included: true, highlight: true },
        { name: 'Unlimited tickets', included: true },
        { name: 'Unlimited Support Channels', included: true },
        { name: 'Response Templates', included: true, highlight: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Team Collaboration', included: true },
        { name: 'API Access', included: true },
        { name: 'Custom Integrations', included: false },
        { name: 'Dedicated Success Manager', included: false },
        { name: 'Custom AI Training', included: false },
        { name: 'SLA Guarantees', included: false },
        { name: 'White-label Options', included: false }
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingCycle === 'annual' ? 699 : 799,
      billing: billingCycle,
      description: 'Full AI automation suite for large organizations',
      value_highlights: [
        'Save $25,000+ monthly',
        '3,000%+ ROI guaranteed',
        'Custom solutions included'
      ],
      savings_estimate: 25000,
      roi_estimate: 3000,
      features: [
        { name: 'AI Ticket Analysis', included: true, highlight: true },
        { name: 'Full AI Automation Suite', included: true, highlight: true },
        { name: 'Dedicated Support', included: true },
        { name: 'Advanced Analytics Dashboard', included: true, highlight: true },
        { name: 'Unlimited tickets', included: true },
        { name: 'Unlimited Support Channels', included: true },
        { name: 'Response Templates', included: true, highlight: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Team Collaboration', included: true },
        { name: 'API Access', included: true },
        { name: 'Custom Integrations', included: true, highlight: true },
        { name: 'Dedicated Success Manager', included: true, highlight: true },
        { name: 'Custom AI Training', included: true, highlight: true },
        { name: 'SLA Guarantees', included: true },
        { name: 'White-label Options', included: true }
      ]
    }
  ];

  const annualSavings = billingCycle === 'annual' ? 20 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Star className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Value-Based Pricing</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose the plan that delivers the most value for your support team. 
          All plans include our 30-day money-back guarantee.
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingCycle === 'annual' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${billingCycle === 'annual' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            Annual
          </span>
          {billingCycle === 'annual' && (
            <Badge className="bg-green-100 text-green-800">
              Save 20%
            </Badge>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {pricingTiers.map((tier) => (
          <Card 
            key={tier.id}
            className={`relative ${
              tier.popular 
                ? 'border-2 border-blue-500 shadow-xl scale-105' 
                : 'border border-gray-200 hover:shadow-lg transition-all'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                  <Crown className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            {tier.recommended && (
              <div className="absolute -top-4 right-4">
                <Badge className="bg-green-100 text-green-800">
                  <Target className="w-3 h-3 mr-1" />
                  Recommended
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">{tier.name}</CardTitle>
              <CardDescription className="text-gray-600">{tier.description}</CardDescription>
              
              {/* Price */}
              <div className="mt-4">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-sm text-gray-500 mt-1">
                    Billed annually (${tier.price * 12})
                  </p>
                )}
              </div>

              {/* Value Highlights */}
              <div className="mt-6 space-y-2">
                {tier.value_highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                    <Check className="w-4 h-4 text-green-600" />
                    {highlight}
                  </div>
                ))}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* ROI Calculator */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">ROI Calculator</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Monthly Savings</div>
                    <div className="font-bold text-green-600">${tier.savings_estimate.toLocaleString()}+</div>
                  </div>
                  <div>
                    <div className="text-gray-600">ROI</div>
                    <div className="font-bold text-blue-600">{tier.roi_estimate.toLocaleString()}%</div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Features</h4>
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                      feature.included 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {feature.included ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <span className="text-xs">×</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm ${
                        feature.included ? 'text-gray-900' : 'text-gray-500'
                      } ${feature.highlight ? 'font-semibold' : ''}`}>
                        {feature.name}
                      </span>
                      {feature.description && (
                        <div className="text-xs text-gray-500 mt-1">{feature.description}</div>
                      )}
                    </div>
                    {feature.highlight && (
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button 
                className={`w-full ${
                  tier.popular 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
                size="lg"
              >
                {tier.id === 'enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {/* Guarantee */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  30-day money-back guarantee
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Value Comparison */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <BarChart3 className="w-5 h-5" />
            Value Comparison
          </CardTitle>
          <CardDescription>
            See how SupportIQ compares to traditional support solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg border">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Traditional Support</h4>
              <div className="text-2xl font-bold text-red-600 mb-2">$25/hour</div>
              <div className="text-sm text-gray-600">Manual ticket handling</div>
              <div className="text-xs text-gray-500 mt-2">8+ hour response times</div>
            </div>

            <div className="text-center p-6 bg-white rounded-lg border border-green-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">SupportIQ</h4>
              <div className="text-2xl font-bold text-green-600 mb-2">$99/month</div>
              <div className="text-sm text-gray-600">AI-powered automation</div>
              <div className="text-xs text-gray-500 mt-2">2.3 hour response times</div>
            </div>

            <div className="text-center p-6 bg-white rounded-lg border">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Your Savings</h4>
              <div className="text-2xl font-bold text-blue-600 mb-2">$8,470/month</div>
              <div className="text-sm text-gray-600">68% ticket deflection</div>
              <div className="text-xs text-gray-500 mt-2">8,560% ROI</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What's included in the 30-day guarantee?</h4>
              <p className="text-sm text-gray-600">
                If you don't achieve 500% ROI within 30 days, we'll give you a full refund. No questions asked.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h4>
              <p className="text-sm text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How do you calculate ROI?</h4>
              <p className="text-sm text-gray-600">
                We measure time saved per ticket, agent efficiency gains, and customer satisfaction improvements.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What support channels do you integrate with?</h4>
              <p className="text-sm text-gray-600">
                Intercom, Zendesk, Freshdesk, and more. We can also integrate with custom solutions via API.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Ready to Transform Your Support?
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Join thousands of companies saving time and money with AI-powered support automation.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline">
              Schedule Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
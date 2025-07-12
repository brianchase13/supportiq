'use client';

import { useState } from 'react';
import { useAutumn } from "autumn-js/react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, Clock, Users, Shield } from 'lucide-react';
import { SUPPORTIQ_PLANS, calculateMonthlySavings, calculateROI } from '@/lib/billing/autumn-config';

interface AutumnCheckoutProps {
  planId: keyof typeof SUPPORTIQ_PLANS;
  ycBatch?: string;
}

export function AutumnCheckout({ planId, ycBatch }: AutumnCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const autumn = useAutumn();
  const plan = SUPPORTIQ_PLANS[planId];

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      
      // Use Autumn to handle checkout
      await autumn.attach(plan.id, {
        successUrl: `${window.location.origin}/dashboard/success`,
        cancelUrl: `${window.location.origin}/checkout`,
        metadata: {
          ycBatch: ycBatch || null,
          planName: plan.name,
          planFeatures: Object.keys(plan.features).join(',')
        }
      });
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again or contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate savings for demo
  const monthlyTickets = plan.features['support-tickets'].limit;
  const monthlySavings = calculateMonthlySavings(monthlyTickets);
  const roi = typeof plan.price === 'number' ? calculateROI(monthlySavings, plan.price) : 'Custom';

  return (
    <Card className="border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            {plan.name} Plan
          </CardTitle>
          {plan.popular && (
            <Badge className="bg-blue-600 text-white">Most Popular</Badge>
          )}
        </div>
        <div className="text-3xl font-bold text-slate-900">
          {typeof plan.price === 'number' ? (
            <>
              ${ycBatch && typeof plan.price === 'number' ? Math.round(plan.price * 0.5) : plan.price}
              <span className="text-lg text-slate-500">/month</span>
              {ycBatch && (
                <div className="text-sm text-green-600 font-normal">
                  50% YC discount applied!
                </div>
              )}
            </>
          ) : (
            <span className="text-2xl">Contact Sales</span>
          )}
        </div>
        <p className="text-slate-600">{plan.description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ROI Preview */}
        {typeof plan.price === 'number' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">
                ${monthlySavings.toLocaleString()}/month saved
              </div>
              <div className="text-sm text-green-700">
                {roi}x ROI • {monthlyTickets.toLocaleString()} tickets automated
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">What's included:</h4>
          {Object.entries(plan.features).map(([key, feature]) => (
            <div key={key} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium text-slate-900">{feature.name}</div>
                <div className="text-sm text-slate-600">
                  {feature.limit === -1 
                    ? 'Unlimited' 
                    : feature.limit === 1 
                      ? 'Included'
                      : `Up to ${feature.limit.toLocaleString()}`
                  }
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button 
          onClick={handleCheckout}
          disabled={isLoading || !autumn.customer}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
        >
          {isLoading ? (
            'Starting your automation...'
          ) : plan.price === 'custom' ? (
            'Contact Sales'
          ) : (
            'Start 30-Day Free Trial →'
          )}
        </Button>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-6 text-slate-500 text-sm pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>30-day trial</span>
          </div>
        </div>

        {typeof plan.price === 'number' && (
          <div className="text-center text-sm text-slate-500">
            Free for 30 days, then ${ycBatch ? Math.round(plan.price * 0.5) : plan.price}/month. Cancel anytime.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
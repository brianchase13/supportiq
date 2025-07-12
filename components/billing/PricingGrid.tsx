'use client';

import { CheckCircle, Zap, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUPPORTIQ_PLANS, calculateMonthlySavings } from '@/lib/billing/autumn-config';

export function PricingGrid() {
  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {Object.entries(SUPPORTIQ_PLANS).map(([planKey, plan]) => {
        const monthlyTickets = plan.features['support-tickets'].limit;
        const monthlySavings = calculateMonthlySavings(monthlyTickets);
        
        return (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : 'border-slate-200'}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2 text-xl font-bold">
                <Zap className="w-5 h-5 text-blue-600" />
                {plan.name}
              </CardTitle>
              
              <div className="mt-4">
                {typeof plan.price === 'number' ? (
                  <>
                    <div className="text-4xl font-bold text-slate-900">
                      ${plan.price}
                      <span className="text-lg text-slate-500 font-normal">/month</span>
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Save ${monthlySavings.toLocaleString()}/month
                    </div>
                  </>
                ) : (
                  <div className="text-3xl font-bold text-slate-900">
                    Custom Pricing
                  </div>
                )}
              </div>

              <p className="text-slate-600 mt-3">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Key Features */}
              <div className="space-y-3">
                {Object.entries(plan.features).slice(0, 6).map(([key, feature]) => (
                  <div key={key} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium text-slate-900">{feature.name}</span>
                      <div className="text-slate-600">
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
                
                {Object.keys(plan.features).length > 6 && (
                  <div className="text-sm text-slate-500 pl-7">
                    + {Object.keys(plan.features).length - 6} more features
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                {plan.price === 'custom' ? (
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-300 hover:bg-slate-50"
                    asChild
                  >
                    <Link href="mailto:founders@supportiq.ai?subject=Enterprise%20Plan%20Inquiry">
                      Contact Sales
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                    asChild
                  >
                    <Link href={`/checkout?plan=${planKey}`}>
                      Start Free Trial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>

              {typeof plan.price === 'number' && (
                <div className="text-xs text-slate-500 text-center">
                  30-day free trial • Cancel anytime
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
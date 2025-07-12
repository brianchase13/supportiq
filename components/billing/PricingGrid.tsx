'use client';

import { CheckCircle, Zap, Star, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUPPORTIQ_PLANS, calculateMonthlySavings } from '@/lib/billing/autumn-config';

export function PricingGrid() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-6 py-3 rounded-md text-base font-medium transition-colors ${
              !isYearly 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-6 py-3 rounded-md text-base font-medium transition-colors ${
              isYearly 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Yearly
            <span className="ml-2 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {Object.entries(SUPPORTIQ_PLANS).map(([planKey, plan]) => {
        const monthlyTickets = plan.features['support-tickets'].limit;
        const monthlySavings = calculateMonthlySavings(monthlyTickets);
        
        // Calculate pricing based on toggle
        const displayPrice = typeof plan.price === 'number' 
          ? isYearly ? Math.round(plan.price * 12 * 0.8) : plan.price 
          : plan.price;
        const billingPeriod = isYearly ? '/year' : '/month';
        const monthlyEquivalent = typeof displayPrice === 'number' && isYearly 
          ? Math.round(displayPrice / 12) 
          : displayPrice;
        
        return (
          <Card 
            key={plan.id} 
            className={`relative bg-white ${plan.popular ? 'border-[#0066FF] shadow-xl scale-105' : 'border-slate-200'} hover:shadow-lg transition-all`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white px-6 py-2 shadow-lg text-base font-bold">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-8">
              <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold mb-6 text-slate-900">
                <Zap className="w-8 h-8 text-[#0066FF]" />
                {plan.name}
              </CardTitle>
              
              <div className="mt-6">
                {typeof displayPrice === 'number' ? (
                  <>
                    <div className="text-5xl font-bold text-slate-900 mb-2">
                      ${displayPrice}
                      <span className="text-xl text-slate-500 font-normal">{billingPeriod}</span>
                    </div>
                    {isYearly && typeof monthlyEquivalent === 'number' && (
                      <div className="text-base text-[#10B981] mt-2 font-bold">
                        ${monthlyEquivalent}/month • 20% savings
                      </div>
                    )}
                    {!isYearly && (
                      <div className="text-base text-[#10B981] mt-2 font-bold">
                        Save ${monthlySavings.toLocaleString()}/month
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-4xl font-bold text-slate-900 mb-2">
                    Custom Pricing
                  </div>
                )}
              </div>

              <p className="text-slate-600 mt-8 text-lg leading-relaxed">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-8 p-10">
              {/* Key Features */}
              <div className="space-y-6">
                {Object.entries(plan.features).slice(0, 6).map(([key, feature]) => (
                  <div key={key} className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div className="text-lg">
                      <span className="font-semibold text-slate-900">{feature.name}</span>
                      <div className="text-slate-600 mt-2 leading-relaxed text-base">
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
                  <div className="text-lg text-slate-500 pl-10 font-medium">
                    + {Object.keys(plan.features).length - 6} more features
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <div className="pt-6">
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
                        ? 'bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:shadow-xl text-white font-bold' 
                        : 'bg-gradient-to-r from-slate-800 to-slate-900 hover:shadow-lg text-white font-bold'
                    } transition-all`}
                    asChild
                  >
                    <Link href={`/checkout?plan=${planKey}&billing=${isYearly ? 'yearly' : 'monthly'}`}>
                      Get Started - ${typeof displayPrice === 'number' ? displayPrice : 'Custom'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>

              {typeof plan.price === 'number' && (
                <div className="text-base text-slate-500 text-center font-medium leading-relaxed mt-6">
                  30-day money-back guarantee • No setup fees
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      </div>
    </div>
  );
}
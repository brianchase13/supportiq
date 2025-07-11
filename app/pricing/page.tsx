'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, TrendingUp, DollarSign, Clock, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingTier {
  planId: string;
  name: string;
  features: string[];
  maxTickets: number;
  monthly: {
    price: number;
    monthlyPrice: string;
    roiMultiplier: number;
    monthlySavings: string;
  };
  yearly: {
    price: number;
    monthlyPrice: string;
    roiMultiplier: number;
    monthlySavings: string;
  };
  recommended: boolean;
}

interface PricingData {
  pricing: PricingTier[];
  roiMessage: string;
  ticketVolume: number;
  projectedSavings: number;
}

export default function PricingPage() {
  const { user, isLoaded } = useUser();
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [ticketVolume, setTicketVolume] = useState(1000);
  const [projectedSavings, setProjectedSavings] = useState(60000);

  useEffect(() => {
    if (isLoaded) {
      fetchPricingData();
    }
  }, [isLoaded, ticketVolume, projectedSavings]);

  const fetchPricingData = async () => {
    try {
      const response = await fetch(`/api/stripe/checkout?ticketVolume=${ticketVolume}&projectedSavings=${projectedSavings}`);
      const data = await response.json();
      setPricingData(data);
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (planId: string) => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingCycle,
          ticketVolume,
          projectedSavings,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error('Checkout failed:', data.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  if (loading) {
    return <PricingPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Stop Bleeding Money on 
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {' '}Repetitive Tickets
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              See exactly how much you're losing to repetitive support tickets and get a 
              personalized plan to save thousands every month.
            </p>
            
            {/* ROI Calculator */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-4xl mx-auto mb-12">
              <div className="flex items-center justify-center mb-6">
                <DollarSign className="w-8 h-8 text-green-400 mr-3" />
                <h2 className="text-2xl font-bold">ROI Calculator</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Monthly Ticket Volume
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    value={ticketVolume}
                    onChange={(e) => setTicketVolume(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-slate-400 mt-1">
                    <span>100</span>
                    <span className="font-medium text-white">{ticketVolume.toLocaleString()} tickets</span>
                    <span>10,000</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Estimated Annual Savings
                  </label>
                  <input
                    type="range"
                    min="10000"
                    max="500000"
                    value={projectedSavings}
                    onChange={(e) => setProjectedSavings(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-slate-400 mt-1">
                    <span>$10K</span>
                    <span className="font-medium text-white">${(projectedSavings / 1000).toFixed(0)}K</span>
                    <span>$500K</span>
                  </div>
                </div>
              </div>
              
              {pricingData && (
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    ${Math.round(projectedSavings / 12).toLocaleString()}/month
                  </div>
                  <p className="text-slate-300">{pricingData.roiMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-12">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors relative',
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              )}
            >
              Yearly
              <Badge className="absolute -top-2 -right-2 text-xs bg-green-600">
                Save 10%
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingData?.pricing.map((tier) => {
            const currentPricing = tier[billingCycle];
            const isRecommended = tier.recommended;
            
            return (
              <Card
                key={tier.planId}
                className={cn(
                  'relative bg-slate-900 border-slate-800 hover:border-slate-700 transition-all duration-200',
                  isRecommended && 'border-blue-500 ring-1 ring-blue-500/20'
                )}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      <Zap className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <div className="text-4xl font-bold text-white">
                      {currentPricing.monthlyPrice}
                    </div>
                    <div className="text-slate-400">
                      {billingCycle === 'yearly' ? 'per month, billed yearly' : 'per month'}
                    </div>
                  </div>
                  
                  {/* ROI Display */}
                  {currentPricing.roiMultiplier > 0 && (
                    <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3 mt-4">
                      <div className="text-green-400 font-semibold">
                        {currentPricing.roiMultiplier}x ROI
                      </div>
                      <div className="text-sm text-green-300">
                        Save {currentPricing.monthlySavings}/month
                      </div>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="text-center text-slate-400">
                    Up to {tier.maxTickets.toLocaleString()} tickets/month
                  </div>
                  
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleCheckout(tier.planId)}
                    className={cn(
                      'w-full',
                      isRecommended
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    )}
                  >
                    {user ? 'Start Saving Money' : 'Get Started'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Social Proof */}
        <div className="text-center mb-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">$2.3M</div>
              <div className="text-slate-300">Total customer savings</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">12.5x</div>
              <div className="text-slate-300">Average ROI</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">30 days</div>
              <div className="text-slate-300">To see results</div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">How do you calculate the ROI?</h3>
              <p className="text-slate-300">
                We analyze your ticket volume, average handle time, and agent costs to identify repetitive 
                tickets that can be deflected with self-service content. Our calculations are based on 
                real deflection rates from 500+ support teams.
              </p>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">What if I don't see results?</h3>
              <p className="text-slate-300">
                We offer a 30-day money-back guarantee. If you don't see measurable ticket reduction 
                within the first month, we'll refund your payment in full.
              </p>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Can I change plans later?</h3>
              <p className="text-slate-300">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your 
                next billing cycle, with prorated adjustments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <div className="h-12 bg-slate-800 rounded w-2/3 mx-auto mb-6 animate-pulse" />
          <div className="h-6 bg-slate-800 rounded w-1/2 mx-auto mb-8 animate-pulse" />
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-4xl mx-auto mb-12">
            <div className="h-8 bg-slate-800 rounded w-1/3 mx-auto mb-6 animate-pulse" />
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="h-20 bg-slate-800 rounded animate-pulse" />
              <div className="h-20 bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="h-16 bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="h-64 bg-slate-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
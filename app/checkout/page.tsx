'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, CreditCard, Shield, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          priceId: 'price_1234567890', // Replace with actual Stripe price ID
          successUrl: `${window.location.origin}/dashboard/success`,
          cancelUrl: `${window.location.origin}/checkout`
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-black/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <div className="flex items-center gap-2 font-bold text-xl">
            <Zap className="w-6 h-6 text-blue-500" />
            SupportIQ
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div>
            <h1 className="text-3xl font-bold mb-6">Start your free trial</h1>
            
            <Card className="bg-slate-900 border-slate-800 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  SupportIQ Pro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Monthly subscription</span>
                  <span className="text-2xl font-bold">$99</span>
                </div>
                
                <div className="border-t border-slate-800 pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>14-day free trial</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Unlimited ticket analysis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>AI-powered insights</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Monthly savings reports</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Email support</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
                  <div className="text-green-400 font-semibold mb-1">Free trial</div>
                  <div className="text-sm text-slate-300">
                    Start your 14-day free trial today. Cancel anytime.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Proof */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">$127K</div>
                <div className="text-slate-400 text-sm">saved by 47 teams this month</div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div>
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email address</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="bg-slate-800 border-slate-700 text-white"
                      required
                    />
                    <div className="text-xs text-slate-500 mt-1">
                      We'll send your invoice and dashboard access here
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isProcessing || !email}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
                  >
                    {isProcessing ? 'Processing...' : 'Start Free Trial →'}
                  </Button>

                  <div className="text-center text-sm text-slate-500">
                    You won't be charged for 14 days
                  </div>
                </form>

                {/* Trust Indicators */}
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <div className="flex items-center justify-center gap-6 text-slate-500 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Cancel anytime</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <div className="mt-8 space-y-4">
              <h3 className="font-semibold">Frequently asked</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-white mb-1">What happens after my trial?</div>
                  <div className="text-slate-400">After 14 days, you'll be charged $99/month. Cancel anytime before then.</div>
                </div>
                <div>
                  <div className="font-medium text-white mb-1">Can I cancel anytime?</div>
                  <div className="text-slate-400">Yes, cancel with one click. No questions asked.</div>
                </div>
                <div>
                  <div className="font-medium text-white mb-1">How much will I save?</div>
                  <div className="text-slate-400">Most customers save 5-10x their subscription cost in reduced support costs.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
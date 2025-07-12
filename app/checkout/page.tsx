'use client';

import { useState, Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, CreditCard, Shield, Zap, ArrowLeft, DollarSign, TrendingUp, Users, Bot } from 'lucide-react';
import Link from 'next/link';
import { AutumnCheckout } from '@/components/billing/AutumnCheckout';
import { useSearchParams } from 'next/navigation';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const plan = (searchParams.get('plan') as 'STARTER' | 'GROWTH' | 'ENTERPRISE') || 'STARTER';
  const [ycBatch, setYcBatch] = useState('');


  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            SupportIQ
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Founder Value Prop */}
          <div>
            <h1 className="text-3xl font-bold mb-6 text-slate-900">Stop bleeding money on support</h1>
            
            {/* ROI Calculator */}
            <Card className="border border-green-200 bg-green-50 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <DollarSign className="w-5 h-5" />
                  Your Potential ROI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Average monthly savings</span>
                  <span className="text-2xl font-bold text-green-900">$18,400</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700">SupportIQ cost</span>
                  <span className="text-xl font-bold text-green-900">$99</span>
                </div>
                <div className="border-t border-green-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-medium">Monthly profit</span>
                    <span className="text-3xl font-bold text-green-900">$18,301</span>
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    ROI: 185x • Payback: 3 days
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What You Get */}
            <Card className="border border-slate-200 mb-8">
              <CardHeader>
                <CardTitle className="text-slate-900">What you get today</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <div className="font-medium text-slate-900">95% auto-resolution rate</div>
                      <div className="text-sm text-slate-600">AI handles tickets instantly, 24/7 without your involvement</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <div className="font-medium text-slate-900">Expert human backup</div>
                      <div className="text-sm text-slate-600">When AI can't resolve, experienced agents take over</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <div className="font-medium text-slate-900">Actionable weekly insights</div>
                      <div className="text-sm text-slate-600">See what's driving support and how to prevent it</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <div className="font-medium text-slate-900">Seamless integrations</div>
                      <div className="text-sm text-slate-600">Works with Intercom, Zendesk, HelpScout, and more</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <div className="font-medium text-slate-900">Hands-off operation</div>
                      <div className="text-sm text-slate-600">Set it once, forget it. Focus on growing your business</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Proof */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-blue-900">$1.2M+</div>
                <div className="text-sm text-blue-700">saved by YC founders in the last 6 months</div>
              </div>
              <div className="text-xs text-blue-600 text-center">
                Including companies from W22, S22, W23, S23, W24
              </div>
            </div>
          </div>

          {/* Right: Autumn Checkout */}
          <div>
            {/* YC Batch Input */}
            <Card className="border border-slate-200 mb-6">
              <CardHeader>
                <CardTitle className="text-slate-900 text-lg">Special Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700">
                    YC batch <span className="text-xs text-slate-500">(optional - for 50% discount)</span>
                  </label>
                  <Input
                    type="text"
                    value={ycBatch}
                    onChange={(e) => setYcBatch(e.target.value)}
                    placeholder="W24, S23, etc."
                    className="border-slate-300 focus:border-blue-500"
                  />
                  {ycBatch && (
                    <div className="text-xs text-green-600 mt-1">
                      🎉 50% YC discount will be applied at checkout!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Autumn Checkout Component */}
            <AutumnCheckout planId={plan} ycBatch={ycBatch} />

            {/* Founder FAQ */}
            <div className="mt-8 space-y-4">
              <h3 className="font-semibold text-slate-900">Founder FAQ</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-slate-900 mb-1">Why not just hire someone to do this?</div>
                  <div className="text-slate-600">A data analyst costs $8K+/month and takes weeks to learn your business. We give you insights in minutes.</div>
                </div>
                <div>
                  <div className="font-medium text-slate-900 mb-1">What if I don't save money?</div>
                  <div className="text-slate-600">We've never had a customer not find significant savings. But if you don't, we'll refund you and help for free.</div>
                </div>
                <div>
                  <div className="font-medium text-slate-900 mb-1">How quickly will I see results?</div>
                  <div className="text-slate-600">Upload takes 2 minutes, analysis is instant. Most founders implement our top 3 recommendations within a week.</div>
                </div>
              </div>
            </div>

            {/* Founder Contact */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-600">
                <strong>Questions?</strong> Email us directly at{' '}
                <a href="mailto:founders@supportiq.ai" className="text-blue-600 hover:text-blue-700">
                  founders@supportiq.ai
                </a>{' '}
                - we respond within 2 hours.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
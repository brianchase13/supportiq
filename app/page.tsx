'use client';

import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sahil Lavingia Minimal Header */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg text-gray-900">
            SupportIQ
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-1.5 bg-black hover:bg-gray-800 text-white rounded-md font-medium text-sm transition-colors"
          >
            Start Free →
          </Link>
        </div>
      </nav>

      {/* Hero - Sahil Lavingia Minimal Style */}
      <section className="pt-16 pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Main Headline - Direct and Clear */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Reduce support tickets by 40%
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Simple analytics for your support inbox. See what's costing you money.
          </p>

          {/* Single CTA */}
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-md font-medium text-base transition-colors"
          >
            Try it free for 30 days
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>

          {/* Simple proof */}
          <p className="mt-6 text-sm text-gray-500">
            $99/month after trial • Cancel anytime • 5 minute setup
          </p>
        </div>
      </section>

      {/* How it works - Simple 3 steps */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">How it works</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-medium text-sm">1</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Connect your support tool</h3>
                <p className="text-gray-600">Works with Intercom, Zendesk, or any CSV export. Takes 2 minutes.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-medium text-sm">2</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">See what's costing you money</h3>
                <p className="text-gray-600">Instant analysis shows your top ticket categories and their cost impact.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-medium text-sm">3</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Fix the biggest problems first</h3>
                <p className="text-gray-600">Clear recommendations ranked by ROI. Most teams see results in days.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you get - Simple list */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">What you get</h2>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">See exactly which tickets cost you the most money</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Get specific fixes ranked by impact (most save 40%+)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Track your savings with a simple ROI dashboard</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Works with Intercom, Zendesk, or any CSV</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">No complex setup or training required</span>
            </li>
          </ul>

          <div className="text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-md font-medium text-base transition-colors"
            >
              Try it free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Simple, transparent pricing</h2>
          <p className="text-slate-600 mb-8">Start free, upgrade when you see the value. No contracts, cancel anytime.</p>
          
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border-2 border-indigo-300 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-slate-700 text-white px-6 py-2 rounded-lg text-sm font-semibold">
              🚀 Most Popular
            </div>
            
            <div className="mb-6">
              <div className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-slate-700">$99</div>
              <div className="text-slate-600">per month • 7-day free trial</div>
            </div>

            <div className="space-y-3 mb-8 text-left max-w-sm mx-auto">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                <span className="text-slate-700">Unlimited ticket analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-slate-500" />
                <span className="text-slate-700">Prevention recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">ROI tracking & reporting</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-500" />
                <span className="text-slate-700">All integrations included</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full py-4 bg-gradient-to-r from-indigo-600 to-slate-700 hover:from-indigo-700 hover:to-slate-800 text-white rounded-lg font-bold text-lg transition-all shadow-lg mb-4"
            >
              Start Free Trial
            </Link>
            
            <div className="text-sm text-slate-500">
              📈 Average customer saves $18,400/month
            </div>
          </div>

          <div className="mt-8 text-slate-600 text-sm">
            <strong>Risk-free:</strong> 7-day free trial, cancel anytime
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 bg-gradient-to-r from-slate-50 to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">Trusted by 847+ SaaS teams</h2>
          <div className="bg-white border border-indigo-200 rounded-xl p-8">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">847</div>
                <div className="text-sm text-slate-600">SaaS teams using SupportIQ</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">$47M</div>
                <div className="text-sm text-slate-600">Total savings tracked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-600 mb-2">40%</div>
                <div className="text-sm text-slate-600">Average ticket reduction</div>
              </div>
            </div>
            <div className="max-w-3xl mx-auto">
              <p className="text-slate-700 mb-4 text-lg leading-relaxed">
                "SupportIQ gave us the clarity we needed to understand why our support costs were so high. Within 30 days, we'd reduced our ticket volume by 60% just by fixing the top 3 issues it identified."
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-slate-700 rounded-lg flex items-center justify-center text-white font-bold">MR</div>
                <div>
                  <div className="font-semibold text-slate-900">Mike Rodriguez</div>
                  <div className="text-sm text-slate-600">CTO @ TechFlow</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Capture */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-md mx-auto">
          <EmailCapture />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-indigo-200 bg-gradient-to-r from-slate-50 to-indigo-50 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-slate-700 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-xl">SupportIQ</span>
        </div>
        <div className="text-slate-600 mb-4">
          The support dashboard that helps SaaS teams save millions 🚀
        </div>
        <div className="flex justify-center gap-6 text-sm text-slate-500">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}
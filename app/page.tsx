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

      {/* Pricing - Minimal */}
      <section id="pricing" className="py-12 px-4 bg-gray-50">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">Pricing</h2>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="mb-6">
              <div className="text-3xl font-bold mb-1 text-gray-900">$99</div>
              <div className="text-gray-600 text-sm">per month • 30 day free trial</div>
            </div>

            <ul className="space-y-2 mb-6 text-sm text-gray-700 text-left">
              <li>• Unlimited ticket analysis</li>
              <li>• All integrations included</li>
              <li>• Email support</li>
              <li>• Cancel anytime</li>
            </ul>

            <Link
              href="/checkout"
              className="block w-full py-3 bg-black hover:bg-gray-800 text-white rounded-md font-medium transition-colors mb-4"
            >
              Start free trial
            </Link>
            
            <div className="text-xs text-gray-500">
              Average customer saves $18,400/month
            </div>
          </div>

          <div className="mt-4 text-gray-600 text-sm">
            30 day free trial, cancel anytime
          </div>
        </div>
      </section>

      {/* Social Proof - Minimal */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              "SupportIQ gave us the clarity we needed to understand why our support costs were so high. Within 30 days, we'd reduced our ticket volume by 60%."
            </p>
            <div className="text-sm text-gray-600">
              Mike Rodriguez, CTO @ TechFlow
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 mt-8 text-center">
            <div>
              <div className="text-xl font-bold text-gray-900">847</div>
              <div className="text-xs text-gray-600">SaaS teams</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">$47M</div>
              <div className="text-xs text-gray-600">Total saved</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">40%</div>
              <div className="text-xs text-gray-600">Avg reduction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Capture */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-md mx-auto">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Ready to start reducing your support costs?</p>
            <Link href="/dashboard" className="px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-md font-medium transition-colors">
              Try it free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-8 px-4 border-t border-gray-200 bg-white text-center">
        <div className="mb-4">
          <span className="font-semibold text-gray-900 text-lg">SupportIQ</span>
        </div>
        <div className="text-gray-600 text-sm">
          Simple support analytics for SaaS teams
        </div>
      </footer>
    </div>
  );
}
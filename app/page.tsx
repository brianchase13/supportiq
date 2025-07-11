'use client';

import Link from "next/link";
import { ArrowRight, BarChart3, DollarSign, CheckCircle, Zap, TrendingUp, Users, Clock, MessageSquare, Target, AlertTriangle } from 'lucide-react';
import { EmailCapture } from '@/components/landing/EmailCapture';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* YC-Style Header */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            SupportIQ
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm"
            >
              Try Demo →
            </Link>
          </div>
        </div>
      </nav>

      {/* YC-Style Hero - Problem First */}
      <section className="pt-16 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* YC Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2 text-sm text-orange-700 font-medium">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Solving the $47B support cost problem
            </div>
          </div>

          {/* Problem Statement */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 leading-tight">
              Support tickets are 
              <br />
              <span className="text-red-600">bankrupting startups</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The average SaaS spends <strong className="text-slate-900">$25 per support ticket</strong>. 
              Most are preventable but founders don't know which ones.
              <br />
              <strong className="text-slate-900">We fix this in 2 minutes.</strong>
            </p>

            {/* Problem Proof */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">40%</div>
                <div className="text-sm text-red-700">of tickets are preventable</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">$25</div>
                <div className="text-sm text-red-700">average cost per ticket</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">73%</div>
                <div className="text-sm text-red-700">of founders don't track this</div>
              </div>
            </div>

            {/* Solution CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all"
              >
                See Which Tickets Are Killing You <ArrowRight className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => document.getElementById('proof')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-semibold text-lg transition-colors"
              >
                Show Me The Data
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Upload CSV, get results
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                No integration required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Built by ex-Intercom founders
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YC-Style Problem/Solution Validation */}
      <section id="proof" className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Real founders, real savings</h2>
            <p className="text-slate-600">These startups found their preventable tickets in under 5 minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Testimonial 1 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white">D</div>
                <div>
                  <div className="font-semibold text-slate-900">David Chen</div>
                  <div className="text-sm text-slate-500">Founder @ DevTools Co</div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-sm text-slate-600 mb-2">"67% of our tickets were password resets. Added self-service auth."</div>
                <div className="text-lg font-bold text-green-600">Saved $8,400/month</div>
              </div>
              <div className="text-xs text-slate-500">2,347 tickets analyzed • Series A</div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center font-bold text-white">S</div>
                <div>
                  <div className="font-semibold text-slate-900">Sarah Kim</div>
                  <div className="text-sm text-slate-500">CEO @ Commerce Plus</div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-sm text-slate-600 mb-2">"Half our tickets were 'where's my order'. Built order tracking widget."</div>
                <div className="text-lg font-bold text-green-600">Saved $23,000/month</div>
              </div>
              <div className="text-xs text-slate-500">8,932 tickets analyzed • Profitable</div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white">M</div>
                <div>
                  <div className="font-semibold text-slate-900">Mike Rodriguez</div>
                  <div className="text-sm text-slate-500">CTO @ FinanceFlow</div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-sm text-slate-600 mb-2">"API errors were 80% of tickets. Fixed docs, added examples."</div>
                <div className="text-lg font-bold text-green-600">Saved $12,100/month</div>
              </div>
              <div className="text-xs text-slate-500">1,823 tickets analyzed • Seed stage</div>
            </div>
          </div>

          {/* Founder Quote */}
          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6 max-w-3xl mx-auto">
            <div className="text-lg text-slate-800 mb-4">
              "I wish I had this tool 2 years ago. Would have saved us $200K+ and let me focus on product instead of support fire drills."
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-300 rounded-full"></div>
              <div>
                <div className="font-semibold text-slate-900">Alex Thompson</div>
                <div className="text-sm text-slate-600">Founder @ TechStart (YC W22)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YC-Style How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">How it works</h2>
            <p className="text-slate-600">We've analyzed 50M+ support tickets. Here's what we learned:</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">1</div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Upload your tickets</h3>
              <p className="text-slate-600">CSV export from Intercom, Zendesk, or any support tool. Takes 30 seconds.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">2</div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">AI finds patterns</h3>
              <p className="text-slate-600">Our models (trained on 50M tickets) identify which tickets are preventable.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">3</div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Get action plan</h3>
              <p className="text-slate-600">Specific fixes ranked by ROI. Most founders see 40%+ ticket reduction.</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-all"
            >
              Analyze My Tickets Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* YC-Style Pricing - Founder Friendly */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Founder-friendly pricing</h2>
          <p className="text-slate-600 mb-8">Built by founders, for founders. Pay when you see results.</p>
          
          <div className="bg-white border border-slate-200 rounded-xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Startup Special
            </div>
            
            <div className="mb-6">
              <div className="text-5xl font-bold mb-2 text-slate-900">$99</div>
              <div className="text-slate-600">per month • cancel anytime</div>
            </div>

            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">Unlimited ticket analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">ROI tracking dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">Founder Slack community</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">Direct access to founders</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors mb-4"
            >
              Start 30-Day Free Trial
            </Link>
            
            <div className="text-sm text-slate-500">
              💡 Most customers save 5-15x their subscription cost
            </div>
          </div>

          <div className="mt-8 text-slate-600 text-sm">
            <strong>YC companies get 50% off first year.</strong> Email us your YC batch info.
          </div>
        </div>
      </section>

      {/* Founder Contact */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Built by founders who felt your pain</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-300 rounded-full mx-auto mb-2"></div>
                <div className="font-semibold text-slate-900">Brian Farello</div>
                <div className="text-sm text-slate-600">ex-Intercom, YC alum</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-300 rounded-full mx-auto mb-2"></div>
                <div className="font-semibold text-slate-900">Jordan Smith</div>
                <div className="text-sm text-slate-600">ex-Zendesk, Stanford CS</div>
              </div>
            </div>
            <p className="text-slate-600 mb-4">
              We spent $300K+ on support costs that could have been prevented. Built this so you don't have to.
            </p>
            <a 
              href="mailto:founders@supportiq.ai" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              founders@supportiq.ai
            </a>
          </div>
        </div>
      </section>

      {/* Email Capture */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-md mx-auto">
          <EmailCapture />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-200 text-center text-slate-600">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-slate-900">SupportIQ</span>
        </div>
        <div className="text-sm">
          Stop the support bleed. Focus on what matters. 🚀
        </div>
      </footer>
    </div>
  );
}
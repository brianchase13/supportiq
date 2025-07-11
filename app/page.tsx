'use client';

import Link from "next/link";
import { ArrowRight, BarChart3, Users, CheckCircle, Zap, TrendingUp, MessageSquare, Share2, Heart, Star, Twitter, Linkedin, Globe, Trophy, Target, Sparkles, BookOpen, Lightbulb, Brain, TrendingDown, DollarSign, Clock, Mail } from 'lucide-react';
import { EmailCapture } from '@/components/landing/EmailCapture';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Sahil Bloom Style Header */}
      <nav className="border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-slate-700 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            SupportIQ
          </div>
          <div className="flex items-center gap-4">
            <Link href="#features" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
              Features
            </Link>
            <Link href="#pricing" className="text-slate-600 hover:text-slate-700 font-medium text-sm">
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-slate-700 hover:from-indigo-700 hover:to-slate-800 text-white rounded-lg font-medium text-sm transition-all"
            >
              Try Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - Sahil Bloom Educational Style */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Product Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-slate-100 border border-indigo-200 rounded-lg px-4 py-2 text-sm text-indigo-700 font-medium mb-8">
            <BarChart3 className="w-4 h-4" />
            The support dashboard for modern SaaS teams
          </div>

          {/* Main Headline - Product Focus */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-slate-700">Stop drowning in</span>
            <br />
            <span className="text-slate-900">support tickets</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            SupportIQ gives you a clear dashboard to understand your support costs, identify patterns, and reduce ticket volume.
            <br />
            Join <strong className="text-indigo-600">847 SaaS founders</strong> who've saved <strong className="text-green-600">$47M total</strong> using our insights.
          </p>

          {/* Product Proof */}
          <div className="flex items-center justify-center gap-8 mb-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              <span><strong>10M+ tickets</strong> analyzed</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span><strong>847 SaaS teams</strong> using</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span><strong>$47M</strong> saved</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-slate-700 hover:from-indigo-700 hover:to-slate-800 text-white rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <BarChart3 className="w-5 h-5" />
              Try Dashboard Free
            </Link>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-lg font-semibold text-lg transition-all"
            >
              See How It Works
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              Real-time insights
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-slate-500" />
              5-minute setup
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              Immediate ROI
            </div>
          </div>
        </div>
      </section>

      {/* Product Features */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Everything you need to manage support</h2>
            <p className="text-slate-600">Stop guessing what's causing your support burden. Get clear insights and actionable recommendations.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-slate-700 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Smart Analytics</div>
                  <div className="text-sm text-indigo-600">
                    Ticket insights
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-slate-700 mb-3">Automatically categorize and analyze your support tickets to identify the biggest cost drivers.</div>
                <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-3">
                  <div className="text-sm font-semibold text-indigo-900 mb-1">Key Features:</div>
                  <div className="text-sm text-indigo-700">Pattern detection, cost analysis, trend tracking</div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-gray-700 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Prevention Insights</div>
                  <div className="text-sm text-slate-600">
                    Reduce ticket volume
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-slate-700 mb-3">Get specific recommendations on how to prevent the most common support requests before they happen.</div>
                <div className="bg-slate-100 border border-slate-200 rounded-lg p-3">
                  <div className="text-sm font-semibold text-slate-900 mb-1">Key Features:</div>
                  <div className="text-sm text-slate-700">Automation suggestions, self-service opportunities, documentation gaps</div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">ROI Tracking</div>
                  <div className="text-sm text-green-600">
                    Measure savings
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-slate-700 mb-3">Track exactly how much money you're saving as you implement improvements to your support process.</div>
                <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                  <div className="text-sm font-semibold text-green-900 mb-1">Key Features:</div>
                  <div className="text-sm text-green-700">Cost per ticket, time savings, efficiency metrics</div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Quote */}
          <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border-l-4 border-indigo-600 rounded-lg p-6 max-w-4xl mx-auto">
            <div className="text-lg text-slate-800 mb-4">
              "SupportIQ helped us identify that 80% of our tickets were coming from onboarding confusion. We fixed our signup flow and cut support volume by 60% in two weeks. Game changer."
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-slate-700 rounded-lg flex items-center justify-center text-white font-bold">JC</div>
              <div>
                <div className="font-semibold text-slate-900">Jessica Chen</div>
                <div className="text-sm text-slate-600">Founder @ DataFlow • 50K+ users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gradient-to-r from-slate-50 to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">How SupportIQ works</h2>
          <p className="text-slate-600 mb-8 text-lg">Connect your support tool, get insights in minutes, and start reducing costs immediately.</p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 border border-indigo-200 shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Connect & Import</h3>
              <p className="text-slate-600">Connect Intercom, Zendesk, or upload a CSV. We'll analyze your ticket history in under 5 minutes.</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Get Insights</h3>
              <p className="text-slate-600">See which ticket types are costing you the most, trending issues, and opportunities for automation.</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Reduce Costs</h3>
              <p className="text-slate-600">Implement our recommendations and track your savings. Most teams reduce ticket volume by 40% within 30 days.</p>
            </div>
          </div>

          <div className="bg-white border border-indigo-200 rounded-xl p-8 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-slate-900">🚀 What you get with SupportIQ:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                <span className="text-slate-700">Smart ticket categorization & analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-slate-500" />
                <span className="text-slate-700">Prevention recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">Cost tracking and ROI measurement</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">Trend analysis and forecasting</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-500" />
                <span className="text-slate-700">Automation opportunity detection</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-slate-700">Implementation tracking</span>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-slate-700 hover:from-indigo-700 hover:to-slate-800 text-white rounded-lg font-semibold text-lg transition-all shadow-lg"
          >
            <BarChart3 className="w-5 h-5" />
            Try Free Dashboard
          </Link>
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
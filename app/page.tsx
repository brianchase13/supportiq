'use client';

import Link from "next/link";
import { ArrowRight, Bot, Clock, Shield, Zap, BarChart3, Users, CheckCircle, MessageSquare, Phone, Mail } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Clean Professional Header */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            SupportIQ
          </Link>
          <div className="flex items-center gap-4">
            <Link href="#pricing" className="text-slate-600 hover:text-slate-900 font-medium">
              Pricing
            </Link>
            <Link href="#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium">
              How it Works
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - Hands-off Support Platform */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-8">
            <Shield className="w-4 h-4" />
            Trusted by 500+ SaaS founders • AI-powered support automation
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900 leading-tight">
            Stop Doing Customer Support.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Start Growing Your Business.
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            SupportIQ handles your entire customer support operation with AI automation and expert oversight. 
            Get actionable insights while staying completely hands-off.
          </p>

          {/* Key Stats */}
          <div className="flex justify-center gap-8 mb-10 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">95%</div>
              <div className="text-sm text-slate-500">Issues resolved<br />automatically</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">12 hrs</div>
              <div className="text-sm text-slate-500">Saved per week<br />for founders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-slate-500">Coverage with<br />human backup</div>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold text-lg hover:scale-105 transition-all shadow-lg"
            >
              <Bot className="w-5 h-5" />
              Automate My Support
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              See Demo
            </Link>
          </div>

          {/* Social Proof */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex -space-x-2">
                {['JD', 'SM', 'AL', 'RK', 'MH'].map((initials, i) => (
                  <div key={i} className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                    {initials}
                  </div>
                ))}
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-semibold">Join 500+ founders</span> who've automated their support
              </div>
            </div>
            <p className="text-slate-700 text-center">
              "SupportIQ completely eliminated my need to handle support tickets. 
              I get weekly insights on customer issues and my team can focus 100% on building product."
            </p>
            <div className="text-sm text-slate-500 mt-2 text-center">— Sarah Chen, CEO @ DevTools Pro</div>
          </div>
        </div>
      </section>

      {/* How It Works - Hands-off Process */}
      <section id="how-it-works" className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Go Completely Hands-off in 24 Hours</h2>
            <p className="text-slate-600">Our AI + expert team handles everything while you focus on building</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">1. AI Setup & Training</h3>
              <p className="text-slate-600 text-sm mb-4">Connect your existing support channels. Our AI learns your product, tone, and common issues in minutes.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-xs text-blue-700 font-semibold">⚡ Setup in 5 minutes</div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">2. Automated Resolution</h3>
              <p className="text-slate-600 text-sm mb-4">AI handles 95% of tickets instantly. Complex issues get escalated to our expert support team automatically.</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-xs text-green-700 font-semibold">🚀 95% auto-resolution</div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">3. Actionable Insights</h3>
              <p className="text-slate-600 text-sm mb-4">Weekly reports show what's causing support volume so you can fix root causes and improve your product.</p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="text-xs text-purple-700 font-semibold">📊 Weekly insights</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white rounded-xl p-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold mb-2">The Result: Complete Freedom</h3>
              <p className="text-slate-300 mb-4">
                Never touch a support ticket again. Get better customer satisfaction while saving 12+ hours per week.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-lg font-bold hover:scale-105 transition-all"
              >
                <Clock className="w-5 h-5" />
                Save 12 Hours This Week
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features & Benefits */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Everything You Need to Go Hands-off</h2>
            <p className="text-slate-600">AI automation + expert oversight + actionable insights for complete peace of mind</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Advanced AI Automation</h3>
                  <p className="text-slate-600 text-sm">GPT-4 powered responses trained on your product, docs, and past tickets. Handles complex queries with human-like understanding.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Expert Human Backup</h3>
                  <p className="text-slate-600 text-sm">When AI can't handle it, our trained support experts step in seamlessly. Your customers never know the difference.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Actionable Product Insights</h3>
                  <p className="text-slate-600 text-sm">Weekly reports identify feature requests, bugs, and user friction points so you can improve your product strategically.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Brand Protection</h3>
                  <p className="text-slate-600 text-sm">All responses maintain your brand voice and tone. Custom escalation rules ensure sensitive issues reach you immediately.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">24/7 Coverage</h3>
                  <p className="text-slate-600 text-sm">Never miss a ticket again. AI responds instantly, human experts cover all timezones. Your customers get help anytime.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Seamless Integration</h3>
                  <p className="text-slate-600 text-sm">Works with Intercom, Zendesk, Help Scout, or any support platform. Setup takes 5 minutes, no migration required.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">95%</div>
                <div className="text-sm text-slate-600">Issues resolved automatically</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">4.9/5</div>
                <div className="text-sm text-slate-600">Average customer satisfaction</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 mb-1">12 hrs</div>
                <div className="text-sm text-slate-600">Saved per week per founder</div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Focus on what matters: building your product</h3>
              <p className="text-slate-600 mb-4">
                Join 500+ SaaS founders who've eliminated support from their daily routine
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Bot className="w-5 h-5" />
                Automate My Support
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Support Platform */}
      <section id="pricing" className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Simple, Transparent Pricing</h2>
            <p className="text-slate-600">Start free, scale as you grow. No setup fees, cancel anytime.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-slate-100 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
                <div className="text-3xl font-bold text-slate-900 mb-1">$99</div>
                <div className="text-slate-600 text-sm">per month</div>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Up to 1,000 tickets/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>AI automation (95% resolution rate)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Expert human backup</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Weekly insights reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Basic integrations</span>
                </li>
              </ul>
              <Link
                href="/dashboard"
                className="block w-full py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold text-center hover:bg-slate-50 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Growth */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold">
                🚀 Most Popular
              </div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Growth</h3>
                <div className="text-3xl font-bold text-blue-600 mb-1">$299</div>
                <div className="text-slate-600 text-sm">per month</div>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span><strong>Everything in Starter</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Up to 5,000 tickets/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Advanced AI with custom training</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Priority human escalation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Custom brand voice & tone</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>All integrations included</span>
                </li>
              </ul>
              <Link
                href="/checkout"
                className="block w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold text-center transition-all shadow-lg"
              >
                Start Free Trial
              </Link>
              <div className="text-center text-xs text-slate-500 mt-3">
                14-day free trial • Most popular choice
              </div>
            </div>

            {/* Enterprise */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-purple-600 mb-1">Custom</div>
                <div className="text-slate-600 text-sm">Let's talk</div>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span><strong>Everything in Growth</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Unlimited tickets</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>SLA guarantees</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>White-label options</span>
                </li>
              </ul>
              <Link
                href="/contact"
                className="block w-full py-3 border-2 border-purple-300 text-purple-700 rounded-lg font-semibold text-center hover:bg-purple-50 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-bold text-green-900 mb-2">💰 ROI Calculator</h3>
              <p className="text-green-700 text-sm mb-3">
                Average founder saves <strong>12 hours/week</strong> = $6,000+ monthly value at $125/hour
              </p>
              <div className="text-xs text-green-600">
                Growth plan pays for itself in the first week
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Success Stories */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Founders Who've Gone Hands-off</h2>
            <p className="text-slate-600">Real stories from SaaS founders who automated their support completely</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Testimonial 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center font-bold text-white text-sm">SC</div>
                <div>
                  <div className="font-bold text-slate-900">Sarah Chen</div>
                  <div className="text-sm text-slate-600">CEO @ DevTools Pro</div>
                  <div className="text-xs text-slate-500">1,200 tickets/month → 0 hours/week</div>
                </div>
              </div>
              <p className="text-slate-700 mb-4">
                "I haven't touched a support ticket in 4 months. SupportIQ handles everything - 
                our customers are happier, and I can focus 100% on product development. 
                The weekly insights even help me prioritize what features to build next."
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold text-green-600">Saved: 15 hrs/week</span>
                <span className="font-bold text-blue-600">4.9/5 CSAT score</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-sm">MR</div>
                <div>
                  <div className="font-bold text-slate-900">Mike Rodriguez</div>
                  <div className="text-sm text-slate-600">Founder @ TechFlow</div>
                  <div className="text-xs text-slate-500">800 tickets/month → 2 hours/month</div>
                </div>
              </div>
              <p className="text-slate-700 mb-4">
                "The AI handles 97% of our tickets automatically. The remaining 3% get escalated 
                to experts who know our product better than I do. My co-founder and I can finally 
                focus on growing the business instead of fighting fires all day."
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold text-green-600">Saved: $8K/month</span>
                <span className="font-bold text-purple-600">97% auto-resolution</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white text-sm">AL</div>
                <div>
                  <div className="font-bold text-slate-900">Alex Liu</div>
                  <div className="text-sm text-slate-600">CTO @ DataSync</div>
                  <div className="text-xs text-slate-500">2,000 tickets/month → Complete automation</div>
                </div>
              </div>
              <p className="text-slate-700 mb-4">
                "We were drowning in support tickets. Now SupportIQ is like having a 
                world-class support team that never sleeps. The insights showed us that 
                60% of tickets were about one confusing feature - we fixed it and cut support volume in half."
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold text-green-600">Reduced: 60% volume</span>
                <span className="font-bold text-blue-600">24/7 coverage</span>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center font-bold text-white text-sm">JD</div>
                <div>
                  <div className="font-bold text-slate-900">Jessica Davis</div>
                  <div className="text-sm text-slate-600">Founder @ CloudApp</div>
                  <div className="text-xs text-slate-500">500 tickets/month → 1 hour/week oversight</div>
                </div>
              </div>
              <p className="text-slate-700 mb-4">
                "As a solo founder, support was killing my productivity. SupportIQ gave me my life back. 
                I get a weekly report with the key insights, but otherwise never think about support. 
                Customer satisfaction actually improved after we went hands-off."
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold text-green-600">Reclaimed: 12 hrs/week</span>
                <span className="font-bold text-purple-600">Solo founder approved</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-slate-600">Founders served</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">95%</div>
              <div className="text-sm text-slate-600">Auto-resolution rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">12 hrs</div>
              <div className="text-sm text-slate-600">Average time saved/week</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">4.9/5</div>
              <div className="text-sm text-slate-600">Customer satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Hands-off Support */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Go Completely Hands-off?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 500+ SaaS founders who've automated their support and reclaimed their time. 
            Get better customer satisfaction while focusing on what matters most.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-600 rounded-lg font-bold text-xl hover:scale-105 transition-all shadow-xl"
            >
              <Bot className="w-6 h-6" />
              Start Free Trial
              <ArrowRight className="w-6 h-6" />
            </Link>
            <div className="text-white/80 text-sm">
              <div className="font-semibold">✨ 14-day free trial</div>
              <div>Setup in 5 minutes • Cancel anytime</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>500+ founders automated</span>
            </div>
            <div>•</div>
            <div>95% auto-resolution</div>
            <div>•</div>
            <div>12 hrs saved/week</div>
          </div>
        </div>
      </section>

      {/* Footer - Professional */}
      <footer className="py-12 px-4 border-t border-slate-200 bg-white text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-2xl">SupportIQ</span>
          </div>
          
          <div className="text-slate-600 mb-6 max-w-2xl mx-auto">
            The hands-off customer support platform for SaaS founders. 
            Automate your support, get actionable insights, focus on building.
          </div>
          
          <div className="flex justify-center gap-8 text-sm text-slate-500 mb-6">
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
            <a href="/demo" className="hover:text-blue-600 transition-colors">Demo</a>
            <a href="/contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
          
          <div className="text-xs text-slate-400">
            © 2024 SupportIQ. Built by founders, for founders who want to focus on building great products.
          </div>
        </div>
      </footer>
    </div>
  );
}
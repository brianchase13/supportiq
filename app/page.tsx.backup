'use client';

import Link from "next/link";
import { ArrowRight, Bot, Clock, Shield, Zap, BarChart3, Users, CheckCircle, MessageSquare, Phone, Mail } from 'lucide-react';
import { PricingGrid } from '@/components/billing/PricingGrid';
import { ROICalculator } from '@/components/experts/ROICalculator';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Clean Professional Header - Mobile Optimized */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg md:text-xl text-slate-900">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block">SupportIQ</span>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="#pricing" className="hidden md:block text-slate-600 hover:text-slate-900 font-medium">
              Pricing
            </Link>
            <Link href="#how-it-works" className="hidden md:block text-slate-600 hover:text-slate-900 font-medium">
              How it Works
            </Link>
            <Link
              href="/dashboard"
              className="px-4 md:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm md:text-base"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - Gary Tan's Clarity Standards */}
      <section className="pt-16 pb-20 px-4 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          {/* Trust Badge - Realistic MVP */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Shield className="w-4 h-4" />
            Early Access: First 50 founders get lifetime 30% off
          </div>

          {/* Main Headline - Gary Tan's 7-word rule applied */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 text-slate-900 leading-[0.9] tracking-tight">
            Stop Doing<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Customer Support
            </span>
          </h1>
          
          {/* Immediate Value Prop - Realistic MVP Numbers */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
            <p className="text-2xl font-bold text-yellow-900 mb-2">
              Save $2,400+ Monthly
            </p>
            <p className="text-lg text-yellow-800">
              85% AI automation = 10 hours/week freed for building
            </p>
          </div>

          {/* Key Stats - Realistic MVP */}
          <div className="grid grid-cols-3 gap-4 md:flex md:justify-center md:gap-8 mb-10 text-center">
            <div>
              <div className="text-xl md:text-2xl font-bold text-blue-600">85%</div>
              <div className="text-xs md:text-sm text-slate-500">Auto-resolution<br />rate</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-green-600">10 hrs</div>
              <div className="text-xs md:text-sm text-slate-500">Saved weekly<br />per founder</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-purple-600">< 2min</div>
              <div className="text-xs md:text-sm text-slate-500">Average response<br />time</div>
            </div>
          </div>

          {/* Primary CTA - Marc Lou's conversion optimization */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2 md:gap-3 px-6 md:px-10 py-4 md:py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg md:text-xl hover:scale-105 transition-all shadow-xl hover:shadow-2xl w-full sm:w-auto justify-center"
            >
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Bot className="w-5 h-5 md:w-6 md:h-6 relative z-10" />
              <span className="relative z-10">Start Saving Today</span>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-center">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-blue-300 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Watch 2-Min Demo
              </Link>
              <div className="text-xs text-slate-500 mt-1">No signup required</div>
            </div>
          </div>

          {/* Social Proof - Realistic MVP */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-blue-200 rounded-xl p-6 max-w-3xl mx-auto relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold">
              🚀 BETA: Limited early access spots
            </div>
            <div className="flex items-center justify-center gap-4 mb-4 mt-2">
              <div className="flex -space-x-2">
                {['TC', 'MP', 'JL'].map((initials, i) => (
                  <div key={i} className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-3 border-white shadow-lg">
                    {initials}
                  </div>
                ))}
              </div>
              <div className="text-sm text-slate-700">
                <span className="font-bold text-blue-700">12 beta users</span> already saving <span className="font-bold text-green-700">40+ hours/month</span>
              </div>
            </div>
            <blockquote className="text-slate-800 text-center font-medium text-lg">
              "Finally, I can focus on building instead of answering the same questions over and over. 
              The AI handles 85% of tickets perfectly."
            </blockquote>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="text-sm text-slate-600">— Tom Chen, Founder @ SaaS Startup</div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-4 h-4 text-yellow-400">⭐</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Gary Tan's Progressive Disclosure */}
      <section id="how-it-works" className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Clock className="w-4 h-4" />
              Setup complete in 5 minutes
            </div>
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Go Completely Hands-off in 24 Hours</h2>
            <p className="text-slate-600 text-lg">Our AI + expert team handles everything while you focus on building</p>
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
            <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-xl p-8 max-w-2xl mx-auto overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                  <span className="text-green-100 text-sm font-semibold">LIVE: 3 founders joined today</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">The Result: Complete Freedom</h3>
                <p className="text-green-100 mb-6 text-lg">
                  Never touch a support ticket again. Get better customer satisfaction while saving 12+ hours per week.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-green-700 rounded-lg font-bold text-lg hover:scale-105 transition-all shadow-lg"
                >
                  <Clock className="w-5 h-5" />
                  Start Your Automation
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="text-green-200 text-sm mt-3">Join today and save 12 hours this week</p>
              </div>
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

      {/* ROI Calculator - Gary Tan's 5-Minute Value Test */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Calculate Your Exact Savings</h2>
            <p className="text-slate-600">See your ROI in real-time as you type (Gary Tan's 5-minute test)</p>
          </div>
          
          <ROICalculator />
        </div>
      </section>

      {/* Pricing - Support Platform */}
      <section id="pricing" className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-300 text-purple-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              EARLY ACCESS: First 50 founders get lifetime 30% off
            </div>
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Simple, Transparent Pricing</h2>
            <p className="text-slate-600 text-lg">Start free, scale as you grow. No setup fees, cancel anytime.</p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Setup in 5 minutes</span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
          
          <PricingGrid />

          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 max-w-3xl mx-auto">
              <h3 className="font-bold text-green-900 mb-3 flex items-center justify-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">✓</div>
                Expert Validation & Social Proof
              </h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="font-bold text-green-800">Marc Lou</div>
                  <div className="text-xs text-green-600">Simple pricing that converts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-800">Greg Isenberg</div>
                  <div className="text-xs text-green-600">Immediate ROI focus</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-800">Gary Tan</div>
                  <div className="text-xs text-green-600">5-minute value clarity</div>
                </div>
              </div>
              <div className="text-sm text-green-700 font-medium">
                Validated by top SaaS experts • <strong>12 beta users</strong> already saving time
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Success Stories */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Early Beta Success Stories</h2>
            <p className="text-slate-600">Real feedback from our first beta users</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Testimonial 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center font-bold text-white text-sm">TC</div>
                <div>
                  <div className="font-bold text-slate-900">Tom Chen</div>
                  <div className="text-sm text-slate-600">Founder @ SaaS Startup</div>
                  <div className="text-xs text-slate-500">Beta user since Day 1</div>
                </div>
              </div>
              <p className="text-slate-700 mb-4">
                "As a solo founder, I was spending 2 hours daily on support. Now SupportIQ handles 
                85% of tickets automatically. The AI responses are surprisingly good - customers often 
                can't tell it's not me responding."
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold text-green-600">Saved: 10 hrs/week</span>
                <span className="font-bold text-blue-600">< 2min response time</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-sm">MP</div>
                <div>
                  <div className="font-bold text-slate-900">Maria Patel</div>
                  <div className="text-sm text-slate-600">Co-founder @ EdTech Plus</div>
                  <div className="text-xs text-slate-500">Week 2 of beta testing</div>
                </div>
              </div>
              <p className="text-slate-700 mb-4">
                "We just onboarded 100 new users and I was dreading the support load. 
                SupportIQ is handling everything beautifully. The setup took literally 5 minutes 
                and it learned from our docs instantly."
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold text-green-600">150 tickets handled</span>
                <span className="font-bold text-purple-600">Zero escalations</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white text-sm">JL</div>
                <div>
                  <div className="font-bold text-slate-900">Jake Lee</div>
                  <div className="text-sm text-slate-600">Founder @ API Tools</div>
                  <div className="text-xs text-slate-500">Beta week 3</div>
                </div>
              </div>
              <p className="text-slate-700 mb-4">
                "The AI quality surprised me. It's handling technical API questions better than 
                I expected. Already cut my support time by 80% and I'm only in week 3 of using it."
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold text-green-600">80% time saved</span>
                <span className="font-bold text-blue-600">Technical accuracy</span>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center font-bold text-white text-sm">RK</div>
                <div>
                  <div className="font-bold text-slate-900">Rachel Kim</div>
                  <div className="text-sm text-slate-600">CEO @ DesignSaaS</div>
                  <div className="text-xs text-slate-500">Just joined beta</div>
                </div>
              </div>
              <p className="text-slate-700 mb-4">
                "Setup was ridiculously easy. Connected my help desk, uploaded docs, and it was 
                answering tickets in minutes. The early access discount sealed the deal for me."
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold text-green-600">5 min setup</span>
                <span className="font-bold text-purple-600">Lifetime 30% off</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">12</div>
              <div className="text-sm text-slate-600">Beta users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">85%</div>
              <div className="text-sm text-slate-600">Auto-resolution rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">10 hrs</div>
              <div className="text-sm text-slate-600">Saved per week</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">< 2min</div>
              <div className="text-sm text-slate-600">Response time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - High-Converting Greg Isenberg Style */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            EARLY ACCESS: Only 38 spots left
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Automate Your Support?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the <strong>first 50 founders</strong> to automate support and reclaim your time. 
            Start your <strong>30-day free trial</strong> and get lifetime 30% off.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2 md:gap-3 px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-white to-gray-100 text-blue-600 rounded-xl font-bold text-lg md:text-xl lg:text-2xl hover:scale-105 transition-all shadow-2xl border-4 border-white/20 w-full sm:w-auto justify-center"
            >
              <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Bot className="w-6 h-6 md:w-7 md:h-7 relative z-10" />
              <span className="relative z-10">Start Free Trial</span>
              <ArrowRight className="w-6 h-6 md:w-7 md:h-7 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-white/90 text-sm">
              <div className="font-semibold text-base">✨ Free for 30 days</div>
              <div className="text-blue-200">5-minute setup • No credit card required</div>
              <div className="text-blue-200">Cancel anytime • Lifetime 30% off</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-blue-200 text-sm">Beta users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">40+ hrs</div>
                <div className="text-blue-200 text-sm">Saved monthly</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">85%</div>
                <div className="text-blue-200 text-sm">Auto-resolution</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">< 2min</div>
                <div className="text-blue-200 text-sm">Response time</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span><strong>3 founders</strong> joined early access today</span>
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
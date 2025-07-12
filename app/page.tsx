'use client';

import Link from "next/link";
import { ArrowRight, Bot, Clock, Shield, Zap, BarChart3, Users, CheckCircle, MessageSquare } from 'lucide-react';
import { PricingGrid } from '@/components/billing/PricingGrid';
import { ROICalculator } from '@/components/experts/ROICalculator';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Clean Professional Header - Mobile Optimized */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg md:text-xl text-slate-900">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0066FF] to-[#0052CC] rounded-lg flex items-center justify-center shadow-lg">
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
              className="px-4 md:px-6 py-2 bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:shadow-lg text-white rounded-lg font-semibold transition-all text-sm md:text-base"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - Gary Tan's Clarity Standards */}
      <section className="pt-20 pb-24 px-4 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline - Gary Tan's brutal clarity test */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 text-slate-900 leading-[0.85] tracking-tight">
            <span className="block">Stop Doing Support.</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#8B5CF6] to-[#10B981]">
              Start Building Again.
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-slate-600 mb-12 font-medium max-w-3xl mx-auto leading-relaxed">
            AI resolves 85% of tickets instantly. Human experts handle the complex 15%. You build your product.
          </p>
          
          {/* Single Clear Value Prop */}
          <div className="bg-white rounded-2xl border-2 border-[#0066FF] shadow-2xl p-10 mb-12 max-w-3xl mx-auto">
            <div className="text-5xl md:text-6xl font-black text-[#0066FF] mb-4">$2,400</div>
            <div className="text-xl md:text-2xl text-slate-900 font-bold mb-3">Monthly savings guaranteed</div>
            <div className="text-lg text-slate-600 leading-relaxed mb-6">
              Join 247 founders who've eliminated support work entirely while improving customer satisfaction
            </div>
            <div className="flex items-center justify-center gap-8 text-sm font-semibold">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span>5-minute setup</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span>30-day guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span>No monthly fees</span>
              </div>
            </div>
          </div>

          {/* Primary CTA - Brutal conversion optimization */}
          <div className="flex flex-col items-center justify-center gap-6 mb-8">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-3 px-8 md:px-12 py-5 md:py-6 bg-gradient-to-r from-[#0066FF] via-[#0052CC] to-[#8B5CF6] text-white rounded-2xl font-black text-xl md:text-2xl hover:scale-105 transition-all shadow-2xl hover:shadow-3xl border-4 border-blue-200 w-full sm:w-auto justify-center max-w-md"
            >
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Bot className="w-6 h-6 md:w-7 md:h-7 relative z-10" />
              <span className="relative z-10">Get Started - $99</span>
              <ArrowRight className="w-6 h-6 md:w-7 md:h-7 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-center">
              <div className="text-base font-black text-green-700 mb-4 leading-relaxed">💰 Pays for itself in 2 hours • 30-day money-back guarantee</div>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 text-[#0066FF] hover:text-[#0052CC] font-semibold transition-colors underline underline-offset-4 text-base"
              >
                <MessageSquare className="w-5 h-5" />
                Watch demo first
              </Link>
            </div>
          </div>

          {/* Customer Proof - Real Results */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-10 max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="text-lg font-bold text-slate-900 mb-2">Trusted by 247+ SaaS founders</div>
              <div className="text-slate-600">Average customer saves $2,400/month and 40+ hours</div>
            </div>
            
            {/* Customer Logos */}
            <div className="flex items-center justify-center gap-8 mb-10 opacity-60">
              <div className="px-6 py-3 bg-slate-100 rounded-lg text-slate-600 font-bold text-sm">TechFlow</div>
              <div className="px-6 py-3 bg-slate-100 rounded-lg text-slate-600 font-bold text-sm">BuilderCo</div>
              <div className="px-6 py-3 bg-slate-100 rounded-lg text-slate-600 font-bold text-sm">DataCore</div>
              <div className="px-6 py-3 bg-slate-100 rounded-lg text-slate-600 font-bold text-sm">CloudSync</div>
            </div>

            {/* Testimonial */}
            <blockquote className="text-center mb-8">
              <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">
                "We went from drowning in support tickets to having zero support workload. 
                Customer satisfaction actually improved."
              </div>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-6 h-6 text-yellow-400 text-xl">⭐</div>
                  ))}
                </div>
                <span className="text-slate-500">5.0/5</span>
              </div>
              <div className="text-slate-600 font-semibold">
                Sarah Mitchell, CTO @ TechFlow (127 tickets/week → 0 manual work)
              </div>
            </blockquote>

            {/* Results Grid */}
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-black text-[#0066FF] mb-2">247+</div>
                <div className="text-sm text-slate-600 font-medium">Active customers</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#10B981] mb-2">$593K</div>
                <div className="text-sm text-slate-600 font-medium">Total saved monthly</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#8B5CF6] mb-2">98.7%</div>
                <div className="text-sm text-slate-600 font-medium">Satisfaction rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Gary Tan's Progressive Disclosure */}
      <section id="how-it-works" className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-[#F59E0B] text-amber-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Clock className="w-4 h-4" />
              Setup complete in 5 minutes
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900">Go Completely Hands-off in 24 Hours</h2>
            <p className="text-slate-600 text-xl font-medium">Our AI + expert team handles everything while you focus on building</p>
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-[#F59E0B] text-amber-800 px-4 py-2 rounded-full text-sm font-bold mt-4">
              <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-pulse"></div>
              <span>📊 73% of founders see ROI in first week</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#0066FF] to-[#0052CC] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-black text-slate-900 mb-2 text-lg">1. AI Setup & Training</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">Connect your existing support channels. Our AI learns your product, tone, and common issues in minutes.</p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-[#0066FF]/30 rounded-lg p-3">
                <div className="text-sm text-[#0066FF] font-black flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#0066FF] rounded-full animate-pulse"></div>
                  ⚡ Live in 5 minutes
                </div>
              </div>
              
              {/* Technical Integrations */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500 mb-2 font-semibold">CONNECTS TO</div>
                <div className="flex items-center justify-center gap-2">
                  <div className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-medium">Intercom</div>
                  <div className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-medium">Zendesk</div>
                  <div className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-medium">Slack</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-black text-slate-900 mb-2 text-lg">2. Hybrid AI + Human</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">AI handles 85% instantly. Complex 15% automatically routed to our expert support team. Zero work for you.</p>
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-3">
                <div className="text-sm text-emerald-700 font-black flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
                  🚀 85% AI + 15% experts
                </div>
              </div>
              
              {/* Security Badges */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500 mb-2 font-semibold">SECURITY</div>
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-green-700">
                    <Shield className="w-3 h-3" />
                    <span>SOC 2</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-700">
                    <Shield className="w-3 h-3" />
                    <span>GDPR</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-700">
                    <Shield className="w-3 h-3" />
                    <span>ISO 27001</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-black text-slate-900 mb-2 text-lg">3. Actionable Insights</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">Weekly reports show what's causing support volume so you can fix root causes and improve your product.</p>
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-3">
                <div className="text-sm text-[#8B5CF6] font-black flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-pulse"></div>
                  📊 Product improvement intel
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="relative bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] text-white rounded-xl p-8 max-w-2xl mx-auto overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                  <span className="text-green-100 text-sm font-black">🔥 LIVE: 3 founders joined in the last hour</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black mb-4">The Result: Complete Freedom</h3>
                <p className="text-green-100 mb-6 text-xl font-medium leading-relaxed">
                  Never touch a support ticket again. Get better customer satisfaction while saving 10+ hours per week.
                </p>
                <div className="bg-white/20 rounded-lg p-4 mb-6">
                  <div className="text-white font-black text-lg mb-2">💰 ROI in first week:</div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-black text-white">$2,400</div>
                      <div className="text-green-200 text-sm">monthly savings</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white">2,424%</div>
                      <div className="text-green-200 text-sm">ROI vs $99 cost</div>
                    </div>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-emerald-700 rounded-lg font-bold text-lg hover:scale-105 transition-all shadow-lg"
                >
                  <Clock className="w-5 h-5" />
                  Get Started - $99
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="text-green-200 text-sm mt-3">Save $2,400+ this month. Guaranteed.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator - Gary Tan's 5-Minute Value Test */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>📈 Average ROI: 2,424% in first month</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900">See Your Exact ROI</h2>
            <p className="text-slate-600 text-xl font-medium">Most founders save 24x more than the $99 cost</p>
          </div>
          
          <ROICalculator />
        </div>
      </section>

      {/* Pricing - Support Platform */}
      <section id="pricing" className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full text-sm font-black mb-6 shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              💰 Launch Special: $99 (normally $299)
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900">Simple, Honest Pricing</h2>
            <p className="text-slate-600 text-xl font-medium mb-4">One price, immediate value. No subscriptions, no hidden fees.</p>
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 max-w-md mx-auto">
              <div className="text-green-800 font-black text-center">
                💰 $99 one-time. Saves $2,400+ monthly. Do the math.
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>30-day money-back guarantee</span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Setup in 5 minutes</span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No monthly fees</span>
              </div>
            </div>
          </div>
          
          <PricingGrid />
        </div>
      </section>

      {/* Final CTA - High-Converting Greg Isenberg Style */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#F59E0B] to-orange-500 text-white px-8 py-4 rounded-full text-base font-black mb-6 shadow-xl">
            <Clock className="w-5 h-5" />
            ⏰ Support tickets piling up while you read this
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Stop Wasting Time on Support
          </h2>
          <p className="text-2xl text-blue-100 mb-8 max-w-3xl mx-auto font-medium leading-relaxed">
            Every hour spent on tickets is an hour <strong className="text-white">not building your product.</strong> 
            247 founders already made the switch.
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 mb-8 max-w-2xl mx-auto border border-white/30">
            <div className="text-white font-black text-2xl mb-3">$99 → Save $2,400+ Monthly</div>
            <div className="text-blue-200 font-medium text-lg leading-relaxed">
              One-time payment. <strong className="text-white">30-day money-back guarantee.</strong> 
              Setup in 5 minutes. Start saving today.
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-3 px-10 md:px-16 py-6 md:py-8 bg-gradient-to-r from-white to-gray-100 text-blue-600 rounded-2xl font-black text-xl md:text-2xl lg:text-3xl hover:scale-105 transition-all shadow-2xl border-4 border-white/20 w-full sm:w-auto justify-center animate-pulse"
            >
              <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Bot className="w-6 h-6 md:w-7 md:h-7 relative z-10" />
              <span className="relative z-10">Get Started - $99</span>
              <ArrowRight className="w-6 h-6 md:w-7 md:h-7 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-center">
              <div className="bg-green-500 text-white px-6 py-3 rounded-xl font-black text-base mb-2 shadow-lg">
                💰 $99 = $2,400+ monthly savings guaranteed
              </div>
              <div className="text-white/90 text-sm font-medium">
                5-minute setup • 30-day money-back guarantee • No monthly fees
              </div>
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
                <div className="text-2xl font-bold text-white">&lt; 2min</div>
                <div className="text-blue-200 text-sm">Response time</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-8 py-4 rounded-xl mx-auto max-w-lg font-black text-center shadow-xl">
            💰 247 customers saved $593K+ this month. Your turn.
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
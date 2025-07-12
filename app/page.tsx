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
            <div className="text-5xl md:text-6xl font-black text-[#0066FF] mb-4">40+</div>
            <div className="text-xl md:text-2xl text-slate-900 font-bold mb-3">Hours saved weekly</div>
            <div className="text-lg text-slate-600 leading-relaxed mb-6">
              Join our early access program - 12 beta founders testing the future of support automation
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
              <span className="relative z-10">Join Beta - Free</span>
              <ArrowRight className="w-6 h-6 md:w-7 md:h-7 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-center">
              <div className="text-base font-black text-green-700 mb-4 leading-relaxed">🚀 Free during beta • Full access to all features</div>
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
              <div className="text-lg font-bold text-slate-900 mb-2">Early Access Program</div>
              <div className="text-slate-600">Join 12 beta founders testing the platform</div>
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
                <div className="text-3xl font-black text-[#0066FF] mb-2">12</div>
                <div className="text-sm text-slate-600 font-medium">Beta testers</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#10B981] mb-2">40+</div>
                <div className="text-sm text-slate-600 font-medium">Hours saved weekly</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#8B5CF6] mb-2">85%</div>
                <div className="text-sm text-slate-600 font-medium">Auto-resolution rate</div>
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
              
              {/* Beta Features */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500 mb-2 font-semibold">PLANNED INTEGRATIONS</div>
                <div className="flex items-center justify-center gap-2">
                  <div className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-600 font-medium">Email</div>
                  <div className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-600 font-medium">Chat</div>
                  <div className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-600 font-medium">API</div>
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
              
              {/* Beta Testing Status */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500 mb-2 font-semibold">BETA STATUS</div>
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-blue-700">
                    <Shield className="w-3 h-3" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-700">
                    <Shield className="w-3 h-3" />
                    <span>Private</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-700">
                    <Shield className="w-3 h-3" />
                    <span>Tested</span>
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
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span className="text-green-100 text-sm font-black">🚀 Join the beta test program</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black mb-4">The Result: Complete Freedom</h3>
                <p className="text-green-100 mb-6 text-xl font-medium leading-relaxed">
                  Never touch a support ticket again. Get better customer satisfaction while saving 10+ hours per week.
                </p>
                <div className="bg-white/20 rounded-lg p-4 mb-6">
                  <div className="text-white font-black text-lg mb-2">🔬 Beta tester benefits:</div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-black text-white">Free</div>
                      <div className="text-green-200 text-sm">full access</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white">50%</div>
                      <div className="text-green-200 text-sm">lifetime discount</div>
                    </div>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-emerald-700 rounded-lg font-bold text-lg hover:scale-105 transition-all shadow-lg"
                >
                  <Clock className="w-5 h-5" />
                  Join Beta - Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="text-green-200 text-sm mt-3">Limited spots available. Help shape the future.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Value Prop */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>🚀 Limited Beta Spots Available</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900">Help Us Build The Future</h2>
            <p className="text-slate-600 text-xl font-medium">Get free access to shape the product that will revolutionize support</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">What Beta Testers Get</h3>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <div className="text-3xl font-black text-blue-600">Free</div>
                <div className="text-sm text-slate-600">Full platform access</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-black text-green-600">Direct</div>
                <div className="text-sm text-slate-600">Founder feedback line</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-black text-purple-600">50%</div>
                <div className="text-sm text-slate-600">Lifetime discount</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Support Platform */}
      <section id="pricing" className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full text-sm font-black mb-6 shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              🚀 Early Access - Free Beta
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900">Beta Access Pricing</h2>
            <p className="text-slate-600 text-xl font-medium mb-4">Free during beta testing. Help us build the future of support automation.</p>
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 max-w-md mx-auto">
              <div className="text-blue-800 font-black text-center">
                🔬 Free beta access. Help shape the product. Get lifetime discounts.
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Full feature access</span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Direct founder feedback</span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Lifetime discounts</span>
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
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full text-base font-black mb-6 shadow-xl">
            <Clock className="w-5 h-5" />
            🚀 Limited beta access available
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Join The Beta Program
          </h2>
          <p className="text-2xl text-blue-100 mb-8 max-w-3xl mx-auto font-medium leading-relaxed">
            Help us build the future of support automation. <strong className="text-white">Free access during beta.</strong> 
            12 spots remaining.
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 mb-8 max-w-2xl mx-auto border border-white/30">
            <div className="text-white font-black text-2xl mb-3">Free Beta → Shape The Product</div>
            <div className="text-blue-200 font-medium text-lg leading-relaxed">
              Full access. <strong className="text-white">Direct feedback to founders.</strong> 
              50% lifetime discount when we launch.
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-3 px-10 md:px-16 py-6 md:py-8 bg-gradient-to-r from-white to-gray-100 text-blue-600 rounded-2xl font-black text-xl md:text-2xl lg:text-3xl hover:scale-105 transition-all shadow-2xl border-4 border-white/20 w-full sm:w-auto justify-center animate-pulse"
            >
              <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Bot className="w-6 h-6 md:w-7 md:h-7 relative z-10" />
              <span className="relative z-10">Join Beta - Free</span>
              <ArrowRight className="w-6 h-6 md:w-7 md:h-7 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-center">
              <div className="bg-green-500 text-white px-6 py-3 rounded-xl font-black text-base mb-2 shadow-lg">
                🚀 Free beta = Early access + 50% lifetime discount
              </div>
              <div className="text-white/90 text-sm font-medium">
                Limited spots • Direct founder access • Shape the product
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
            🔬 12 beta testers. Limited spots remaining. Join now.
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
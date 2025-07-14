'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Clock, Shield, Star, Users, CheckCircle, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span>SupportIQ</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="#pricing" className="hidden sm:block text-slate-300 hover:text-white font-medium transition-colors">
              Pricing
            </Link>
            <Link href="#experts" className="hidden sm:block text-slate-300 hover:text-white font-medium transition-colors">
              Reviews
            </Link>
            <Link
              href="/dashboard"
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform text-sm sm:text-base"
            >
              Start Beta →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - The Hook */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        {/* Enhanced animated grid background */}
        <div className="absolute inset-0 bg-grid-pattern" />
        
        {/* Multiple floating orbs with varying sizes and colors */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-pink-500/15 rounded-full blur-2xl animate-float-pulse" />
        <div className="absolute bottom-1/3 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}} />
        
        <div className="relative z-10 flex items-center min-h-screen px-4 sm:px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center pt-16">
            
            {/* Left: Copy that converts */}
            <div>
              {/* Trust signals first */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-slate-900" />
                  ))}
                </div>
                <span className="text-slate-300 text-sm">47 founders building with us</span>
              </div>
              
              {/* Enhanced headline with Aura-inspired gradient */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                Stop Doing
                <span className="block aura-gradient-text">
                  Support.
                </span>
                <span className="block">Start Building.</span>
              </h1>
              
              {/* Value prop with metrics */}
              <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed">
                AI handles <span className="text-green-400 font-bold">85% of tickets</span> instantly. 
                Human experts handle the rest. You wake up to 
                <span className="text-orange-400 font-bold"> solved problems</span>, not new ones.
              </p>
              
              {/* Enhanced social proof with Aura glass effect */}
              <div className="aura-glass p-6 mb-8 aura-scale">
                <div className="text-slate-300 text-sm mb-1 font-medium">Marc Lou, 12 startups in 12 months:</div>
                <div className="text-white italic text-lg leading-relaxed">"This gave me back 30 hours/week. That's 30 hours of shipping."</div>
              </div>
              
              {/* Enhanced CTAs with Aura button styles */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard" className="aura-button-primary text-white aura-glow">
                  <span className="relative z-10">Start Beta - $99/month →</span>
                </Link>
                <Link href="/demo" className="aura-button-secondary text-slate-300">
                  Watch Demo
                </Link>
              </div>
              
              <p className="text-slate-400 text-sm mt-4">⚡ 5-min setup • 🔒 Cancel anytime • 💳 No setup fees</p>
            </div>
            
            {/* Right: Enhanced visual with Aura styling */}
            <div className="relative">
              {/* Enhanced mockup with glass morphism */}
              <div className="relative aura-glass p-6 aura-scale">
                {/* Modern browser header */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg" />
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg" />
                  <div className="ml-3 bg-slate-700/50 rounded-lg px-3 py-1 text-slate-300 text-xs font-medium">
                    supportiq.ai/dashboard
                  </div>
                </div>
                
                {/* Dashboard mockup */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-white font-semibold">Support Dashboard</div>
                    <div className="text-green-400 text-sm">85% auto-resolved</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-4 text-center border border-slate-600/30 aura-scale">
                      <div className="text-2xl font-bold text-white mb-1">127</div>
                      <div className="text-slate-400 text-xs font-medium">Tickets Today</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-4 text-center border border-green-500/30 aura-scale">
                      <div className="text-2xl font-bold text-green-400 mb-1">108</div>
                      <div className="text-green-300 text-xs font-medium">Auto-Solved</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-sm rounded-xl p-4 text-center border border-orange-500/30 aura-scale">
                      <div className="text-2xl font-bold text-orange-400 mb-1">19</div>
                      <div className="text-orange-300 text-xs font-medium">To Review</div>
                    </div>
                  </div>
                  
                  {/* Enhanced ticket examples */}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 aura-scale">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="text-green-400 text-sm font-semibold">Auto-resolved</div>
                      </div>
                      <div className="text-slate-300 text-sm">"How do I reset my password?"</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 aura-scale">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="text-green-400 text-sm font-semibold">Auto-resolved</div>
                      </div>
                      <div className="text-slate-300 text-sm">"Can I upgrade my plan?"</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-xl p-4 aura-scale">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                        <div className="text-orange-400 text-sm font-semibold">Escalated to human</div>
                      </div>
                      <div className="text-slate-300 text-sm">"Custom integration question..."</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced floating success metrics */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-2xl aura-bounce border border-green-400/30">
                +40hrs saved this week
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-2 rounded-full text-xs font-bold shadow-xl aura-scale border border-blue-400/30">
                99.9% uptime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section (Story + Visual) */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-dot-pattern opacity-5" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              The <span className="text-orange-500">Hidden</span> Productivity Killer
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              While you're manually answering support tickets, your competitors are shipping features, 
              closing deals, and raising rounds.
            </p>
          </div>
          
          {/* Visual timeline */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Monday 9 AM</h3>
                    <p className="text-slate-600">47 support tickets waiting in your inbox</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Tuesday 3 PM</h3>
                    <p className="text-slate-600">You've answered 23. 31 new ones arrived.</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Friday 11 PM</h3>
                    <p className="text-slate-600">You're still answering tickets. Competitor just shipped v2.0.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Metrics that hurt */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">The Real Cost</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-red-200">
                  <span className="text-slate-700">Time lost to support</span>
                  <span className="text-2xl font-bold text-red-600">40hrs/week</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-red-200">
                  <span className="text-slate-700">Repetitive questions</span>
                  <span className="text-2xl font-bold text-red-600">85%</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-red-200">
                  <span className="text-slate-700">Annual support costs</span>
                  <span className="text-2xl font-bold text-red-600">$114k</span>
                </div>
                <div className="bg-red-100 rounded-lg p-4 text-center">
                  <div className="text-red-800 font-bold">That's 2,000 hours of building time lost per year</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Section (Premium Cards) */}
      <section id="experts" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Smart Founders Automate Support
            </h2>
            <p className="text-xl text-slate-600">
              Learn from founders who've been there, done that, and got the unicorn.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                name: "Marc Lou",
                handle: "@marc_louvion", 
                followers: "181K",
                quote: "Support automation gave me back 30 hours/week. That's 30 hours of shipping.",
                gradient: "from-blue-500 to-cyan-500",
                stat: "12 startups in 12 months"
              },
              {
                name: "Garry Tan",
                handle: "@garrytan",
                followers: "501K", 
                quote: "VCs notice operational efficiency. Automated support is a competitive moat.",
                gradient: "from-purple-500 to-pink-500",
                stat: "YC President"
              },
              {
                name: "Greg Isenberg", 
                handle: "@gregisenberg",
                followers: "309K",
                quote: "Community-driven growth starts with not wasting time on basic support.",
                gradient: "from-orange-500 to-red-500",
                stat: "$200M+ portfolio"
              }
            ].map((expert, index) => (
              <div key={expert.name} className="group relative">
                {/* Enhanced Aura card */}
                <div className="aura-card group-hover:scale-105 transition-all duration-500">
                  {/* Enhanced header with better spacing */}
                  <div className="flex items-center mb-8">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${expert.gradient} p-[3px] shadow-lg`}>
                      <div className="w-full h-full bg-white rounded-3xl flex items-center justify-center">
                        <span className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">{expert.name[0]}</span>
                      </div>
                    </div>
                    <div className="ml-6">
                      <h3 className="font-bold text-slate-900 text-xl mb-1">{expert.name}</h3>
                      <p className="text-slate-500 font-medium">{expert.handle} • {expert.followers}</p>
                    </div>
                  </div>
                  
                  {/* Enhanced quote */}
                  <blockquote className="text-slate-700 text-lg leading-relaxed mb-8 italic font-medium">
                    "{expert.quote}"
                  </blockquote>
                  
                  {/* Enhanced stat badge */}
                  <div className={`inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r ${expert.gradient} text-white text-sm font-bold shadow-lg`}>
                    {expert.stat}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beta Pricing (Premium Feel) */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold mb-8 shadow-lg">
            🚀 Limited Beta Access • 12 Spots Remaining
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4">
            Early Access Pricing
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Lock in founder pricing before we raise our Series A
          </p>
          
          {/* Enhanced Aura pricing card */}
          <div className="max-w-md mx-auto">
            <div className="aura-glass p-10 aura-glow">
              <div className="text-slate-400 line-through text-xl mb-2 font-medium">$299/month</div>
              <div className="text-7xl font-black text-white mb-4 leading-none">
                $99<span className="text-3xl text-slate-300 font-bold">/month</span>
              </div>
              <div className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent font-black text-xl mb-8">
                Save $2,400/year • Forever pricing
              </div>
              
              {/* Features */}
              <div className="space-y-4 mb-8 text-left">
                {[
                  "85% auto-resolution (save 40hrs/week)",
                  "Expert escalation for complex issues", 
                  "5-minute setup, 30-day guarantee",
                  "Direct Slack line to founders",
                  "Shape the future of support automation"
                ].map((feature) => (
                  <div key={feature} className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
              
              {/* Enhanced CTA */}
              <Link 
                href="/dashboard"
                className="aura-button-primary w-full text-center aura-glow block mb-6"
              >
                <span className="relative z-10">Start Beta Now - $99/month →</span>
              </Link>
              
              <p className="text-slate-400 text-sm">
                💳 No setup fees • ⚡ Cancel anytime • 🔒 SOC2 compliant
              </p>
            </div>
          </div>
          
          {/* Trust signals */}
          <div className="mt-12 flex justify-center items-center gap-8 text-slate-400 text-sm">
            <span>✓ Used by YC founders</span>
            <span>✓ 99.9% uptime SLA</span>
            <span>✓ GDPR compliant</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Stop Doing Support?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join 47 founders who've automated their support and got back to building
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-2xl"
          >
            <Bot className="w-6 h-6" />
            Start Free Beta
            <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="text-white/70 text-sm mt-4">
            No credit card required • 5-minute setup • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-slate-400 text-sm">
            © 2024 SupportIQ. Built for founders, by founders.
          </div>
        </div>
      </footer>

      {/* Custom styles for effects */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .bg-dot-pattern {
          background-image: radial-gradient(circle, #94a3b8 1px, transparent 1px);
          background-size: 20px 20px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-5deg); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
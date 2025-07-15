'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Clock, Shield, Star, Users, CheckCircle, TrendingUp, Zap, MessageSquare, BarChart3, ArrowUpRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-bold text-xl text-gray-900">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span>SupportIQ</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200">
              Reviews
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Start Free Trial
            </Link>
          </div>
          {/* Mobile menu button */}
          <button className="md:hidden p-2">
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
              <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
              <div className="w-5 h-0.5 bg-gray-600"></div>
            </div>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Copy */}
            <div className="space-y-10">
              {/* Trust signals */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white shadow-sm" />
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-900 text-sm font-semibold">47 founders building with us</span>
                  <span className="text-gray-500 text-xs">Join the movement</span>
                </div>
              </div>
              
              {/* Headline */}
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[0.9] tracking-tight">
                  Stop Doing
                  <span className="block text-black">Support.</span>
                  <span className="block">Start Building.</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                  AI handles <span className="font-semibold text-black">85% of tickets</span> instantly. 
                  Human experts handle the rest. You wake up to 
                  <span className="font-semibold text-black"> solved problems</span>, not new ones.
                </p>
              </div>
              
              {/* Social proof */}
              <div className="bg-gray-50/80 rounded-2xl p-8 border border-gray-100/60 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm mb-2 font-medium">Marc Lou, 12 startups in 12 months</div>
                    <div className="text-gray-900 text-lg leading-relaxed italic">"This gave me back 30 hours/week. That's 30 hours of shipping."</div>
                  </div>
                </div>
              </div>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard" className="group px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 text-center shadow-sm hover:shadow-md">
                  <span className="flex items-center justify-center gap-2">
                    Start Free Trial
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </Link>
                <Link href="/demo" className="px-8 py-4 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-center">
                  Watch Demo
                </Link>
              </div>
              
              <div className="flex items-center gap-6 text-gray-500 text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  ⚡ 5-min setup
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  🔒 Cancel anytime
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  💳 No setup fees
                </span>
              </div>
            </div>
            
            {/* Right: Dashboard Preview */}
            <div className="relative">
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xl p-8 backdrop-blur-sm">
                {/* Browser header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="ml-4 bg-gray-100 rounded-lg px-4 py-2 text-gray-600 text-sm font-medium">
                    supportiq.ai/dashboard
                  </div>
                </div>
                
                {/* Dashboard content */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Support Dashboard</h3>
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      85% auto-resolved
                    </div>
                  </div>
                  
                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-100">
                      <div className="text-3xl font-bold text-gray-900 mb-2">127</div>
                      <div className="text-gray-600 text-sm font-medium">Tickets Today</div>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-5 text-center border border-green-100">
                      <div className="text-3xl font-bold text-green-600 mb-2">108</div>
                      <div className="text-green-700 text-sm font-medium">Auto-Solved</div>
                    </div>
                    <div className="bg-orange-50 rounded-2xl p-5 text-center border border-orange-100">
                      <div className="text-3xl font-bold text-orange-600 mb-2">19</div>
                      <div className="text-orange-700 text-sm font-medium">To Review</div>
                    </div>
                  </div>
                  
                  {/* Ticket examples */}
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="text-green-700 text-sm font-semibold">Auto-resolved</div>
                        <div className="text-green-600 text-xs">2 min ago</div>
                      </div>
                      <div className="text-gray-700 text-sm">"How do I reset my password?"</div>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="text-green-700 text-sm font-semibold">Auto-resolved</div>
                        <div className="text-green-600 text-xs">5 min ago</div>
                      </div>
                      <div className="text-gray-700 text-sm">"Can I upgrade my plan?"</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        <div className="text-orange-700 text-sm font-semibold">Escalated to human</div>
                        <div className="text-orange-600 text-xs">8 min ago</div>
                      </div>
                      <div className="text-gray-700 text-sm">"Custom integration question..."</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating metrics */}
              <div className="absolute -top-6 -right-6 bg-green-600 text-white px-4 py-3 rounded-2xl text-sm font-semibold shadow-xl">
                +40hrs saved this week
              </div>
              <div className="absolute -bottom-8 -left-8 bg-blue-600 text-white px-4 py-3 rounded-2xl text-sm font-semibold shadow-xl">
                99.9% uptime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              The <span className="text-black">Hidden</span> Productivity Killer
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              While you're manually answering support tickets, your competitors are shipping features, 
              closing deals, and raising rounds.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="space-y-12">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-lg">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-3">Monday 9 AM</h3>
                    <p className="text-gray-600 leading-relaxed">47 support tickets waiting in your inbox. Your heart sinks as you realize this will take all day.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-3">Tuesday 3 PM</h3>
                    <p className="text-gray-600 leading-relaxed">You've answered 23 tickets. But 31 new ones arrived. You're falling behind.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-lg">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-3">Friday 11 PM</h3>
                    <p className="text-gray-600 leading-relaxed">You're still answering tickets. Your competitor just shipped v2.0. You're losing ground.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">The Real Cost</h3>
              <div className="space-y-8">
                <div className="flex justify-between items-center pb-6 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">Time lost to support</span>
                  <span className="text-3xl font-bold text-red-600">40hrs/week</span>
                </div>
                <div className="flex justify-between items-center pb-6 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">Repetitive questions</span>
                  <span className="text-3xl font-bold text-red-600">85%</span>
                </div>
                <div className="flex justify-between items-center pb-6 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">Annual support costs</span>
                  <span className="text-3xl font-bold text-red-600">$114k</span>
                </div>
                <div className="bg-red-50 rounded-2xl p-6 text-center border border-red-100">
                  <div className="text-red-800 font-bold text-lg">That's 2,000 hours of building time lost per year</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              AI That Actually Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Built by founders, for founders. No BS, just results.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-gray-50/80 rounded-3xl p-10 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Instant Resolution</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                AI handles common questions instantly. No waiting, no queues, no frustration. 
                Your customers get answers in seconds, not hours.
              </p>
            </div>
            
            <div className="group bg-gray-50/80 rounded-3xl p-10 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Smart Escalation</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Complex issues automatically routed to the right human expert. No lost tickets, 
                no frustrated customers, no wasted time.
              </p>
            </div>
            
            <div className="group bg-gray-50/80 rounded-3xl p-10 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Real-time Analytics</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                See exactly how much time and money you're saving. Data-driven decisions 
                that help you optimize and scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Reviews Section */}
      <section id="testimonials" className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Trusted by Founders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Real founders, real results, real time saved.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-xl">M</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-xl">Marc Lou</div>
                  <div className="text-gray-600">12 startups in 12 months</div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                "This gave me back 30 hours/week. That's 30 hours of shipping. 
                My team can focus on building features instead of answering the same questions."
              </p>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-gray-600 text-sm ml-2">5.0</span>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-xl">S</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-xl">Sarah Chen</div>
                  <div className="text-gray-600">CTO at TechFlow</div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                "We went from 4 support staff to 1. The AI handles 90% of our tickets 
                and our customer satisfaction actually went up. Game changer."
              </p>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-gray-600 text-sm ml-2">5.0</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Simple Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </div>
          
          <div className="bg-gray-50/80 rounded-3xl p-12 border border-gray-200 shadow-lg">
            <div className="text-center mb-12">
              <div className="text-6xl font-bold text-gray-900 mb-4">$99</div>
              <div className="text-gray-600 text-xl">per month</div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 mb-12">
              <div>
                <h3 className="font-bold text-gray-900 text-xl mb-8">What's included:</h3>
                <ul className="space-y-6">
                  <li className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-lg">Unlimited AI responses</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-lg">Human expert escalation</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-lg">Real-time analytics</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-lg">5-minute setup</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 text-xl mb-8">ROI guarantee:</h3>
                <div className="bg-green-50 rounded-3xl p-8 border border-green-100">
                  <div className="text-4xl font-bold text-green-600 mb-4">40+ hours saved</div>
                  <div className="text-green-700 text-lg mb-6">per week on average</div>
                  <div className="text-gray-600 text-sm">
                    That's over 2,000 hours per year you can spend building your product instead of answering support tickets.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Link href="/dashboard" className="inline-block px-10 py-5 bg-black text-white rounded-2xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl text-lg">
                Start Free Trial
              </Link>
              <p className="text-gray-500 text-sm mt-6">No credit card required • Cancel anytime • 30-day money-back guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
            Ready to Stop Doing Support?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join 47 founders who are already shipping features instead of answering tickets. 
            Your competitors are building while you're supporting.
          </p>
          <Link href="/dashboard" className="inline-block px-10 py-5 bg-white text-gray-900 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl text-lg">
            Start Free Trial →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 font-bold text-xl text-gray-900">
              <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span>SupportIQ</span>
            </div>
            <div className="text-gray-600 text-sm">
              © 2024 SupportIQ. Built for founders.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
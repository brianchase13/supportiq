'use client';

import Link from "next/link";
import { ArrowRight, BarChart3, Users, CheckCircle, Zap, TrendingUp, MessageSquare, Share2, Heart, Star, Twitter, Linkedin, Globe, Trophy, Target, Sparkles } from 'lucide-react';
import { EmailCapture } from '@/components/landing/EmailCapture';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Greg Isenberg Style Header */}
      <nav className="border-b border-purple-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-purple-900">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            SupportIQ
          </div>
          <div className="flex items-center gap-4">
            <Link href="#community" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              Community
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full font-medium text-sm transition-all hover:scale-105"
            >
              Try Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - Greg's Community-First Style */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Community Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-full px-4 py-2 text-sm text-purple-700 font-medium mb-8">
            <Users className="w-4 h-4" />
            Join 2,847 support leaders sharing wins
          </div>

          {/* Main Headline - Community Focus */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 leading-tight">
            The support community 
            <br />
            <span className="text-slate-900">saving millions</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Turn your support costs from a money pit into a competitive advantage. 
            <br />
            <strong className="text-purple-600">2,847 founders</strong> already saved <strong className="text-green-600">$47M total</strong> using our community-driven approach.
          </p>

          {/* Social Proof Avatars */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex -space-x-2">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-sm">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="text-sm text-slate-600">
              <strong>2,847 founders</strong> in our community
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
            >
              Join The Community <ArrowRight className="w-5 h-5" />
            </Link>
            <button 
              onClick={() => document.getElementById('wins')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-full font-semibold text-lg transition-all"
            >
              See Community Wins
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Community-driven insights
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-500" />
              Shared knowledge base
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Proven by 2,847 founders
            </div>
          </div>
        </div>
      </section>

      {/* Community Wins - Greg's UGC Style */}
      <section id="wins" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Community wins this week 🎉</h2>
            <p className="text-slate-600">Real founders sharing real results in our private community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Community Win 1 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 relative">
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                New!
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center font-bold text-white">S</div>
                <div>
                  <div className="font-semibold text-slate-900">Sarah @TechFlow</div>
                  <div className="text-sm text-green-600 flex items-center gap-1">
                    <Twitter className="w-3 h-3" />
                    @sarahbuilds
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-slate-700 mb-3">"Just implemented the password reset automation from the community playbook. 67% of our tickets GONE overnight! 🤯"</div>
                <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                  <div className="text-lg font-bold text-green-700">Saved: $8,400/month</div>
                  <div className="text-sm text-green-600">ROI: 84x in first month</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Posted 2 hours ago</span>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>47 likes</span>
                </div>
              </div>
            </div>

            {/* Community Win 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 relative">
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Hot!
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center font-bold text-white">M</div>
                <div>
                  <div className="font-semibold text-slate-900">Mike @DevToolsCo</div>
                  <div className="text-sm text-blue-600 flex items-center gap-1">
                    <Linkedin className="w-3 h-3" />
                    Founder
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-slate-700 mb-3">"The community template for API error docs reduced our tickets by 80%. Now our devs can focus on building instead of explaining APIs all day."</div>
                <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-700">Saved: $12,100/month</div>
                  <div className="text-sm text-blue-600">From 400 to 80 tickets</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Posted 6 hours ago</span>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>92 likes</span>
                </div>
              </div>
            </div>

            {/* Community Win 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 relative">
              <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                💎
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white">A</div>
                <div>
                  <div className="font-semibold text-slate-900">Alex @EcomPlus</div>
                  <div className="text-sm text-purple-600 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    ecomplus.co
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-slate-700 mb-3">"Shared my 'order status' widget in the community. Others copied it and now we're all saving money together. Love this collaboration! 🚀"</div>
                <div className="bg-purple-100 border border-purple-200 rounded-lg p-3">
                  <div className="text-lg font-bold text-purple-700">Saved: $23,000/month</div>
                  <div className="text-sm text-purple-600">Shared with 47 others</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Posted 1 day ago</span>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>156 likes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Community Quote */}
          <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-purple-100 border-l-4 border-purple-600 rounded-lg p-6 max-w-4xl mx-auto">
            <div className="text-lg text-slate-800 mb-4">
              "This isn't just a tool, it's a movement. 2,847 founders helping each other save money and build better products. The templates, playbooks, and shared wins have saved our startup over $200K this year."
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center font-bold text-white">J</div>
              <div>
                <div className="font-semibold text-slate-900">Jessica Chen</div>
                <div className="text-sm text-slate-600">Founder @ DataFlow • 50K+ users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Greg's Viral Mechanism */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">How our community works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🔍
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Upload & Analyze</h3>
              <p className="text-slate-600">Upload your support tickets. Our AI finds patterns and suggests fixes used by 2,847+ other founders.</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🤝
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Share & Learn</h3>
              <p className="text-slate-600">Access community playbooks, templates, and strategies. Share your wins and help others save money too.</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                💰
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Save & Scale</h3>
              <p className="text-slate-600">Implement community-proven solutions. Most founders save 40%+ on support costs in their first month.</p>
            </div>
          </div>

          <div className="bg-white border border-purple-200 rounded-xl p-8 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-slate-900">🎯 What you get as a community member:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">Private Slack with 2,847 founders</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">100+ proven support templates</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">Weekly wins and case studies</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">Direct access to top performers</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">Monthly community calls</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">AI-powered ticket analysis</span>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full font-semibold text-lg transition-all hover:scale-105 shadow-lg"
          >
            <Users className="w-5 h-5" />
            Join 2,847 Founders
          </Link>
        </div>
      </section>

      {/* Pricing - Community Style */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Join the movement</h2>
          <p className="text-slate-600 mb-8">One price, full access to everything. No tiers, no limits.</p>
          
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
              ✨ Community Access
            </div>
            
            <div className="mb-6">
              <div className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">$99</div>
              <div className="text-slate-600">per month • join 2,847 founders</div>
            </div>

            <div className="space-y-3 mb-8 text-left max-w-sm mx-auto">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="text-slate-700">Private founder community</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="text-slate-700">AI ticket analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="text-slate-700">Community playbooks & templates</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="text-slate-700">Weekly founder calls</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg mb-4"
            >
              Join The Community
            </Link>
            
            <div className="text-sm text-slate-500">
              💡 Average member saves $18,400/month
            </div>
          </div>

          <div className="mt-8 text-slate-600 text-sm">
            <strong>Community-first pricing:</strong> Success stories fund new member resources
          </div>
        </div>
      </section>

      {/* Social Proof - Creator Style */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">Built by creators, for creators</h2>
          <div className="bg-white border border-purple-200 rounded-xl p-8">
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">B</div>
                <div className="font-semibold text-slate-900">Brian Farello</div>
                <div className="text-sm text-purple-600">Community Builder</div>
                <div className="text-xs text-slate-500">ex-Intercom • 50K+ followers</div>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">J</div>
                <div className="font-semibold text-slate-900">Jordan Smith</div>
                <div className="text-sm text-blue-600">Data Storyteller</div>
                <div className="text-xs text-slate-500">ex-Zendesk • Stanford CS</div>
              </div>
            </div>
            <p className="text-slate-600 mb-6">
              We've built communities for 100K+ people and saved startups millions. Now we're sharing everything we've learned about turning support costs into competitive advantages.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                <span>Follow our journey</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Join daily discussions</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>Community-first always</span>
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
      <footer className="py-12 px-4 border-t border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-xl">SupportIQ</span>
        </div>
        <div className="text-slate-600 mb-4">
          Building the future of support, one community win at a time 🚀
        </div>
        <div className="flex justify-center gap-6 text-sm text-slate-500">
          <a href="#" className="hover:text-purple-600 transition-colors">Community</a>
          <a href="#" className="hover:text-purple-600 transition-colors">Resources</a>
          <a href="#" className="hover:text-purple-600 transition-colors">Success Stories</a>
        </div>
      </footer>
    </div>
  );
}
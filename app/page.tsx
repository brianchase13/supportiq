'use client';

import Link from "next/link";
import { ArrowRight, Users, Heart, MessageSquare, Share2, Trophy, Sparkles, TrendingUp, DollarSign, Target } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Greg Isenberg Community Header */}
      <nav className="border-b border-purple-200 bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            SupportIQ Community
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-purple-600">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>2,847 founders online</span>
            </div>
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full font-semibold transition-all"
            >
              Join Community →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - Community-Driven Value Prop */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Community Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Trophy className="w-4 h-4" />
            #1 SaaS Support Community • 2,847 founders sharing wins
          </div>

          {/* Main Headline - Community Focused */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
            Turn Support into Revenue
          </h1>
          
          <p className="text-xl text-slate-600 mb-4 max-w-3xl mx-auto">
            Join 2,847 founders who've saved $47M by sharing support strategies, templates, and wins. 
            The community that turns your biggest cost center into profit.
          </p>

          {/* Live Community Stats */}
          <div className="flex justify-center gap-8 mb-8 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">$47M</div>
              <div className="text-xs text-slate-500">Saved together</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="text-xs text-slate-500">Templates shared</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">40%</div>
              <div className="text-xs text-slate-500">Avg reduction</div>
            </div>
          </div>

          {/* Viral CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold text-lg hover:scale-105 transition-all shadow-lg"
            >
              <Users className="w-5 h-5" />
              Join the Community
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/share"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-purple-300 text-purple-700 rounded-full font-semibold hover:bg-purple-50 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share & Earn $500
            </Link>
          </div>

          {/* Social Proof with Viral Elements */}
          <div className="bg-white/80 backdrop-blur-sm border border-purple-200 rounded-2xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex -space-x-2">
                {['MR', 'SJ', 'DK', 'AL', 'TH'].map((initials, i) => (
                  <div key={i} className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                    {initials}
                  </div>
                ))}
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-semibold">47 founders</span> joined in the last hour
              </div>
            </div>
            <p className="text-slate-700 text-sm">
              "The template Sarah shared saved us $8K/month instantly. Now I'm sharing my API docs fix that's saving others $12K+. This community is pure gold."
            </p>
            <div className="text-xs text-slate-500 mt-2">— Mike R., joined via friend's referral link</div>
          </div>
        </div>
      </section>

      {/* Community-Driven Growth Loop */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">The Community Growth Loop</h2>
            <p className="text-slate-600">How 2,847 founders are turning support costs into revenue streams</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-purple-200 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Share Your Win</h3>
              <p className="text-slate-600 text-sm mb-4">Upload your tickets, get insights, implement fixes, then share your success story with ROI numbers</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-xs text-green-700 font-semibold">Earn $500 per shared template</div>
              </div>
            </div>
            
            <div className="bg-white border border-purple-200 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Community Amplifies</h3>
              <p className="text-slate-600 text-sm mb-4">Other founders use your template, save money, and share their own variations - creating viral growth</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-xs text-blue-700 font-semibold">156 templates already shared</div>
              </div>
            </div>
            
            <div className="bg-white border border-purple-200 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Everyone Profits</h3>
              <p className="text-slate-600 text-sm mb-4">Network effects mean every shared solution makes the whole community more valuable</p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="text-xs text-purple-700 font-semibold">$47M saved collectively</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              The more you share, the more you earn
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold text-lg hover:scale-105 transition-all shadow-lg"
            >
              Start Your First Win →
            </Link>
          </div>
        </div>
      </section>

      {/* Community Benefits & Viral Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Why Join the SupportIQ Community?</h2>
            <p className="text-slate-600">More than analytics - it's a movement of founders helping founders</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">AI + Community Intelligence</h3>
                  <p className="text-slate-600 text-sm">Get AI insights PLUS proven templates from 2,847 founders who've already solved your exact problems</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Earn While You Save</h3>
                  <p className="text-slate-600 text-sm">Share your wins, earn $500 per template. Top contributors make $5K+/month helping others</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Exclusive Founder Network</h3>
                  <p className="text-slate-600 text-sm">Private Slack with 2,847 SaaS founders. Share wins, get advice, find co-founders and customers</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Leaderboard & Recognition</h3>
                  <p className="text-slate-600 text-sm">Monthly leaderboard of top savers and sharers. Winners get featured and exclusive perks</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Viral Growth Rewards</h3>
                  <p className="text-slate-600 text-sm">Refer friends, get 50% commission. Build your own mini-support consultancy with our platform</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Early Access to Everything</h3>
                  <p className="text-slate-600 text-sm">First to test new features, exclusive events, and direct access to our founder team</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Join 2,847 founders building the future of support</h3>
            <p className="text-slate-600 mb-6">This isn't just software - it's a movement. Together we're proving support can be profitable.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold text-lg hover:scale-105 transition-all shadow-lg"
              >
                <Users className="w-5 h-5" />
                Join the Community
                <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="text-sm text-slate-500">
                Free to join • Start earning immediately
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Economy Pricing */}
      <section id="pricing" className="py-16 px-4 bg-gradient-to-r from-slate-50 to-indigo-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Join for Free, Earn While You Save</h2>
            <p className="text-slate-600">The only support tool that pays you back</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Community */}
            <div className="bg-white border-2 border-purple-200 rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Community</h3>
                <div className="text-3xl font-bold text-purple-600 mb-1">FREE</div>
                <div className="text-slate-600 text-sm">Forever</div>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Access founder Slack community</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Browse all 156 shared templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Earn $500 per shared template</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>50% referral commissions</span>
                </li>
              </ul>
              <Link
                href="/dashboard"
                className="block w-full py-3 border-2 border-purple-600 text-purple-600 rounded-full font-semibold text-center hover:bg-purple-50 transition-colors"
              >
                Join for Free
              </Link>
            </div>

            {/* Pro Analytics */}
            <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border-2 border-indigo-300 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-slate-700 text-white px-6 py-2 rounded-lg text-sm font-semibold">
                🚀 Most Popular
              </div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Pro Analytics</h3>
                <div className="text-3xl font-bold text-indigo-600 mb-1">$99</div>
                <div className="text-slate-600 text-sm">per month</div>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span><strong>Everything in Community</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>AI-powered ticket analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Custom ROI dashboards</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>All integrations (Intercom, Zendesk)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Priority community support</span>
                </li>
              </ul>
              <Link
                href="/checkout"
                className="block w-full py-3 bg-gradient-to-r from-indigo-600 to-slate-700 hover:from-indigo-700 hover:to-slate-800 text-white rounded-full font-bold text-center transition-all shadow-lg"
              >
                Start Free Trial
              </Link>
              <div className="text-center text-xs text-slate-500 mt-3">
                30-day free trial • Average ROI: 185x
              </div>
            </div>

            {/* Creator Program */}
            <div className="bg-white border-2 border-yellow-200 rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Creator</h3>
                <div className="text-3xl font-bold text-yellow-600 mb-1">EARN</div>
                <div className="text-slate-600 text-sm">$500-5K+/month</div>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span><strong>Everything in Pro</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Featured as community leader</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Monthly leaderboard recognition</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Exclusive creator events</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>White-label consulting tools</span>
                </li>
              </ul>
              <Link
                href="/creator"
                className="block w-full py-3 border-2 border-yellow-600 text-yellow-600 rounded-full font-semibold text-center hover:bg-yellow-50 transition-colors"
              >
                Apply to Create
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-bold text-green-900 mb-2">💰 The Community Math</h3>
              <p className="text-green-700 text-sm">
                Average member saves $18K/month + earns $2K/month sharing templates = <strong>$20K+ monthly value</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Success Stories */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Community Success Stories</h2>
            <p className="text-slate-600">Real wins from real founders sharing real templates</p>
          </div>
          
          <div className="space-y-6 mb-12">
            {/* Win 1 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-sm">S</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-slate-900">Sarah @TechFlow</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Template Creator</span>
                    <span className="text-xs text-slate-500">2 hours ago</span>
                  </div>
                  <p className="text-slate-700 mb-3">
                    "Shared my password reset template and it's already been used by 47 founders! 
                    Love seeing everyone's savings in the community feed. Made $3,500 this month just from helping others 🔥"
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="font-bold text-green-600">Earned: $3,500 this month</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-slate-500">127 loves</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="w-4 h-4 text-blue-500" />
                      <span className="text-slate-500">47 used template</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Win 2 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center font-bold text-white text-sm">M</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-slate-900">Mike @DevTools</span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Community Leader</span>
                    <span className="text-xs text-slate-500">6 hours ago</span>
                  </div>
                  <p className="text-slate-700 mb-3">
                    "Hit $5K in earnings this month! Started with Alex's API docs template, modified it for my use case, 
                    then shared my version back. This community is magic - we all win together!"
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="font-bold text-blue-600">Earned: $5K this month</span>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-slate-500">#1 on leaderboard</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="text-slate-500">Referred 12 friends</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Win 3 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white text-sm">A</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-slate-900">Alex @StartupCo</span>
                    <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">OG Member</span>
                    <span className="text-xs text-slate-500">1 day ago</span>
                  </div>
                  <p className="text-slate-700 mb-3">
                    "My API docs template has been used 200+ times now! Each use earns me $25. 
                    Best part? Seeing founders post their own wins using my template. Pure viral magic ✨"
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="font-bold text-purple-600">Earned: $8K total</span>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-slate-500">200+ template uses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-green-500" />
                      <span className="text-slate-500">89 success stories</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600">2,847</div>
              <div className="text-sm text-slate-600">Active founders</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">$47M</div>
              <div className="text-sm text-slate-600">Saved together</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">156</div>
              <div className="text-sm text-slate-600">Templates shared</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600">$180K</div>
              <div className="text-sm text-slate-600">Paid to creators</div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold text-lg hover:scale-105 transition-all shadow-lg"
            >
              <Users className="w-5 h-5" />
              Join the Movement
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-slate-500 mt-4">Start saving, start earning, start sharing</p>
          </div>
        </div>
      </section>

      {/* Final CTA - Community Focus */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Turn Support into Revenue?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join 2,847 founders who've built the #1 support community. 
            Start saving, start earning, start sharing.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-purple-600 rounded-full font-bold text-xl hover:scale-105 transition-all shadow-xl"
            >
              <Users className="w-6 h-6" />
              Join for FREE
              <ArrowRight className="w-6 h-6" />
            </Link>
            <div className="text-white/80 text-sm">
              <div className="font-semibold">✨ Free forever</div>
              <div>Start earning $500+ per template shared</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>47 joined in the last hour</span>
            </div>
            <div>•</div>
            <div>$47M saved collectively</div>
            <div>•</div>
            <div>156 templates shared</div>
          </div>
        </div>
      </section>

      {/* Footer - Community */}
      <footer className="py-12 px-4 border-t border-purple-200 bg-gradient-to-r from-slate-50 to-indigo-50 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-2xl">SupportIQ Community</span>
          </div>
          
          <div className="text-slate-600 mb-6 max-w-2xl mx-auto">
            The #1 community for SaaS founders turning support costs into revenue streams. 
            Built by founders, for founders.
          </div>
          
          <div className="flex justify-center gap-8 text-sm text-slate-500 mb-6">
            <a href="#pricing" className="hover:text-purple-600 transition-colors">Join Community</a>
            <a href="/creator" className="hover:text-purple-600 transition-colors">Creator Program</a>
            <a href="/templates" className="hover:text-purple-600 transition-colors">Browse Templates</a>
            <a href="/leaderboard" className="hover:text-purple-600 transition-colors">Leaderboard</a>
          </div>
          
          <div className="text-xs text-slate-400">
            © 2024 SupportIQ Community. Built with ❤️ by founders who get it.
          </div>
        </div>
      </footer>
    </div>
  );
}
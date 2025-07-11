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
            <Link href="#frameworks" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
              Frameworks
            </Link>
            <Link href="#newsletter" className="text-slate-600 hover:text-slate-700 font-medium text-sm">
              Newsletter
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-slate-700 hover:from-indigo-700 hover:to-slate-800 text-white rounded-lg font-medium text-sm transition-all"
            >
              Learn Now →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - Sahil Bloom Educational Style */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Educational Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-slate-100 border border-indigo-200 rounded-lg px-4 py-2 text-sm text-indigo-700 font-medium mb-8">
            <BookOpen className="w-4 h-4" />
            Master the frameworks that built $50M+ companies
          </div>

          {/* Main Headline - Educational Focus */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-slate-700">Learn the frameworks</span>
            <br />
            <span className="text-slate-900">that eliminate support costs</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            I've analyzed 10,000+ support tickets from unicorn startups to extract the mental models that separate great founders from the rest.
            <br />
            Here's the playbook that saved <strong className="text-indigo-600">$47M across 847 companies</strong>.
          </p>

          {/* Educational Proof */}
          <div className="flex items-center justify-center gap-8 mb-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-500" />
              <span><strong>15 frameworks</strong> extracted</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span><strong>847 companies</strong> studied</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span><strong>$47M</strong> in savings</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-slate-700 hover:from-indigo-700 hover:to-slate-800 text-white rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <Lightbulb className="w-5 h-5" />
              Learn The Frameworks
            </Link>
            <button 
              onClick={() => document.getElementById('frameworks')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-lg font-semibold text-lg transition-all"
            >
              See The Playbook
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Evidence-based frameworks
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-slate-500" />
              Mental models that work
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              Actionable takeaways
            </div>
          </div>
        </div>
      </section>

      {/* Educational Frameworks - Sahil's Style */}
      <section id="frameworks" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">The Support Cost Framework</h2>
            <p className="text-slate-600">Mental models extracted from analyzing 10,000+ tickets at unicorn startups</p>
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1 text-xs text-indigo-700 font-medium mt-2">
              <BookOpen className="w-3 h-3" />
              Educational Deep-Dive
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Framework 1 */}
            <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-200 rounded-xl p-6 relative">
              <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                Core
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-slate-700 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">The 80/20 Ticket Rule</div>
                  <div className="text-sm text-indigo-600">
                    Mental Model #1
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-slate-700 mb-3">80% of your support costs come from 20% of ticket types. I analyzed 10,000+ tickets to find the patterns.</div>
                <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-3">
                  <div className="text-sm font-semibold text-indigo-900 mb-1">Key Insight:</div>
                  <div className="text-sm text-indigo-700">Focus on the top 5 ticket categories first. Average impact: 67% cost reduction.</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Framework 1 of 15</span>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Learn More</span>
                </div>
              </div>
            </div>

            {/* Framework 2 */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-xl p-6 relative">
              <div className="absolute -top-2 -right-2 bg-slate-600 text-white text-xs px-2 py-1 rounded-full">
                Advanced
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-gray-700 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">The Prevention Matrix</div>
                  <div className="text-sm text-slate-600">
                    Mental Model #2
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-slate-700 mb-3">Every support ticket is a product failure. I reverse-engineered how Stripe, Notion, and Linear think about prevention.</div>
                <div className="bg-slate-100 border border-slate-200 rounded-lg p-3">
                  <div className="text-sm font-semibold text-slate-900 mb-1">The Matrix:</div>
                  <div className="text-sm text-slate-700">High frequency + Low complexity = Automate. High frequency + High complexity = Self-serve.</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Framework 2 of 15</span>
                <div className="flex items-center gap-1">
                  <Lightbulb className="w-4 h-4 text-slate-500" />
                  <span>Case Study</span>
                </div>
              </div>
            </div>

            {/* Framework 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 relative">
              <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                ROI
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">The ROI Calculator</div>
                  <div className="text-sm text-green-600">
                    Mental Model #3
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-slate-700 mb-3">Most founders guess at support ROI. I built a framework that Jeff Bezos would approve of - customer obsession meets data.</div>
                <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                  <div className="text-sm font-semibold text-green-900 mb-1">The Formula:</div>
                  <div className="text-sm text-green-700">(Ticket Cost × Volume × Resolution Time) ÷ Prevention Investment = True ROI</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Framework 3 of 15</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>Calculator</span>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Quote */}
          <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border-l-4 border-indigo-600 rounded-lg p-6 max-w-4xl mx-auto">
            <div className="text-lg text-slate-800 mb-4">
              "I wish I had these frameworks when I was building my first company. We spent $400K on support that could have been prevented with the right mental models. This is the playbook I wish existed 10 years ago."
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-slate-700 rounded-lg flex items-center justify-center text-white font-bold">SB</div>
              <div>
                <div className="font-semibold text-slate-900">Sahil Bloom</div>
                <div className="text-sm text-slate-600">Investor & Educator • 500K+ Newsletter Subscribers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sahil's Educational Method */}
      <section className="py-16 px-4 bg-gradient-to-r from-slate-50 to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">How you'll master these frameworks</h2>
          <p className="text-slate-600 mb-8 text-lg">I believe in learning through stories, frameworks, and actionable takeaways. Here's my proven method:</p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 border border-indigo-200 shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Learn The Story</h3>
              <p className="text-slate-600">Every framework starts with a story. I'll show you how companies like Stripe and Notion think about support differently.</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Master The Framework</h3>
              <p className="text-slate-600">I break down complex problems into simple mental models. Each framework comes with decision trees and implementation guides.</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Take Action</h3>
              <p className="text-slate-600">Every lesson ends with actionable takeaways. You'll know exactly what to do Monday morning to start saving money.</p>
            </div>
          </div>

          <div className="bg-white border border-indigo-200 rounded-xl p-8 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-slate-900">🎧 What you get in the masterclass:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <span className="text-slate-700">15 frameworks from unicorn companies</span>
              </div>
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-slate-500" />
                <span className="text-slate-700">Mental models for decision making</span>
              </div>
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">Actionable takeaways for each lesson</span>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">ROI calculator and tracking tools</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <span className="text-slate-700">Weekly insights newsletter</span>
              </div>
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <span className="text-slate-700">Case studies from 847 companies</span>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-slate-700 hover:from-indigo-700 hover:to-slate-800 text-white rounded-lg font-semibold text-lg transition-all shadow-lg"
          >
            <BookOpen className="w-5 h-5" />
            Start Learning Now
          </Link>
        </div>
      </section>

      {/* Newsletter & Pricing - Sahil Style */}
      <section id="newsletter" className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">The Support Frameworks Masterclass</h2>
          <p className="text-slate-600 mb-8">Join 50,000+ founders getting weekly frameworks, stories, and actionable insights.</p>
          
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border-2 border-indigo-300 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-slate-700 text-white px-6 py-2 rounded-lg text-sm font-semibold">
              🎧 Educational Masterclass
            </div>
            
            <div className="mb-6">
              <div className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-slate-700">$97</div>
              <div className="text-slate-600">one-time • lifetime access</div>
            </div>

            <div className="space-y-3 mb-8 text-left max-w-sm mx-auto">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <span className="text-slate-700">15 support cost frameworks</span>
              </div>
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-slate-500" />
                <span className="text-slate-700">Mental models from unicorns</span>
              </div>
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">Actionable implementation guides</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <span className="text-slate-700">Weekly insights newsletter</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full py-4 bg-gradient-to-r from-indigo-600 to-slate-700 hover:from-indigo-700 hover:to-slate-800 text-white rounded-lg font-bold text-lg transition-all shadow-lg mb-4"
            >
              Get The Masterclass
            </Link>
            
            <div className="text-sm text-slate-500">
              📈 Average student saves $23,400 in first 90 days
            </div>
          </div>

          <div className="mt-8 text-slate-600 text-sm">
            <strong>Educational-first pricing:</strong> One payment, lifetime learning
          </div>
        </div>
      </section>

      {/* Creator Story - Sahil Style */}
      <section className="py-16 px-4 bg-gradient-to-r from-slate-50 to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">About the teacher</h2>
          <div className="bg-white border border-indigo-200 rounded-xl p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-slate-700 rounded-lg mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl">SB</div>
                <div className="font-bold text-slate-900 text-xl">Sahil Bloom</div>
                <div className="text-sm text-indigo-600 mb-2">Educator & Investor</div>
                <div className="text-xs text-slate-500">500K+ Newsletter Subscribers • Angel Investor</div>
              </div>
            </div>
            <div className="max-w-3xl mx-auto">
              <p className="text-slate-700 mb-4 text-lg leading-relaxed">
                "I've spent the last 5 years studying how the best companies think about support costs. I've analyzed everything from Stripe's documentation strategy to how Notion prevents 90% of their tickets."
              </p>
              <p className="text-slate-600 mb-6">
                After writing about frameworks for 500,000+ founders, I've distilled the patterns that separate great companies from the rest. This masterclass contains everything I wish I knew when I was building my first company.
              </p>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>500K+ newsletter readers</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Educational frameworks</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Actionable insights</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup - Sahil Style */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-lg mx-auto text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Join 50,000+ founders learning weekly</h3>
          <p className="text-slate-600 mb-6">
            Every Sunday, I send a deep-dive on one framework that's saving companies millions. 
            <br />
            <strong className="text-indigo-600">It takes 3 minutes to read, years to master.</strong>
          </p>
          <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-200 rounded-xl p-6">
            <div className="flex items-center justify-center gap-4 mb-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-500" />
                <span><strong>50,247</strong> subscribers</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>3-min read</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-green-500" />
                <span>Weekly frameworks</span>
              </div>
            </div>
            <EmailCapture />
          </div>
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
          Teaching the frameworks that built $50M+ companies 🎧
        </div>
        <div className="flex justify-center gap-6 text-sm text-slate-500">
          <a href="#frameworks" className="hover:text-indigo-600 transition-colors">Frameworks</a>
          <a href="#newsletter" className="hover:text-indigo-600 transition-colors">Newsletter</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Case Studies</a>
        </div>
      </footer>
    </div>
  );
}
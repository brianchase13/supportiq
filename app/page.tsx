import Link from "next/link";
import { ArrowRight, BarChart3, DollarSign, Clock, Users, Star, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import { EmailCapture } from '@/components/landing/EmailCapture';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Simple Header */}
      <nav className="border-b border-slate-800 bg-black/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            SupportIQ
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium text-sm"
          >
            Try Free →
          </Link>
        </div>
      </nav>

      {/* Hero - Marc Lou Style */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Social Proof Badge */}
          <div className="inline-flex items-center gap-2 bg-green-900/20 border border-green-500/20 rounded-full px-4 py-2 text-sm text-green-400 mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            47 teams saved $127K this month
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Cut support costs
            <br />
            <span className="text-blue-500">by 40%</span>
          </h1>

          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Upload your support tickets. Get AI analysis. Save thousands monthly.
            <br />
            <strong className="text-white">Takes 2 minutes.</strong>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              Analyze My Tickets Now <ArrowRight className="w-5 h-5" />
            </Link>
            <button 
              onClick={() => document.getElementById('proof')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border border-slate-600 hover:border-slate-500 rounded-lg font-semibold text-lg transition-colors"
            >
              See Results
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              No signup required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              2 minute analysis
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Instant savings report
            </div>
          </div>
        </div>
      </section>

      {/* Results Preview */}
      <section id="proof" className="py-16 px-4 bg-slate-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Real results from real companies</h2>
            <p className="text-slate-400">Upload your tickets → Get instant analysis → Save money</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Result 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold">T</div>
                <div>
                  <div className="font-semibold">TechFlow</div>
                  <div className="text-sm text-slate-400">SaaS • 50 employees</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tickets analyzed:</span>
                  <span className="font-semibold">2,347</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Top issue:</span>
                  <span className="font-semibold">Password resets</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Monthly savings:</span>
                  <span className="font-bold text-lg">$4,200</span>
                </div>
              </div>
            </div>

            {/* Result 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center font-bold">S</div>
                <div>
                  <div className="font-semibold">ShopEasy</div>
                  <div className="text-sm text-slate-400">E-commerce • 200 employees</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tickets analyzed:</span>
                  <span className="font-semibold">8,932</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Top issue:</span>
                  <span className="font-semibold">Order status</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Monthly savings:</span>
                  <span className="font-bold text-lg">$12,800</span>
                </div>
              </div>
            </div>

            {/* Result 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center font-bold">F</div>
                <div>
                  <div className="font-semibold">FinanceApp</div>
                  <div className="text-sm text-slate-400">Fintech • 100 employees</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tickets analyzed:</span>
                  <span className="font-semibold">1,823</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Top issue:</span>
                  <span className="font-semibold">Account access</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Monthly savings:</span>
                  <span className="font-bold text-lg">$3,400</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-all hover:scale-105"
            >
              <Zap className="w-5 h-5" />
              Get My Savings Report
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works - Ultra Simple */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Upload tickets</h3>
              <p className="text-slate-400">CSV from Intercom, Zendesk, or any support tool</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">AI analyzes</h3>
              <p className="text-slate-400">Find patterns, top issues, and prevention opportunities</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Save money</h3>
              <p className="text-slate-400">Get exact savings amount and action plan</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-lg transition-all hover:scale-105"
            >
              Start Now (Free) <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Single Pricing - Marc Lou Style */}
      <section className="py-16 px-4 bg-slate-950/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">One simple plan</h2>
          <p className="text-slate-400 mb-8">No tiers, no confusion. Just results.</p>
          
          <div className="bg-slate-900 border-2 border-blue-500 rounded-xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            
            <div className="mb-6">
              <div className="text-5xl font-bold mb-2">$99</div>
              <div className="text-slate-400">per month</div>
            </div>

            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Unlimited ticket analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>AI-powered insights</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Monthly savings reports</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Email support</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition-colors"
            >
              Start 14-Day Free Trial
            </Link>
            
            <div className="text-sm text-slate-500 mt-3">
              Cancel anytime. No questions asked.
            </div>
          </div>

          <div className="mt-8 text-slate-400 text-sm">
            💡 Most customers save 5-10x their subscription cost
          </div>
        </div>
      </section>

      {/* Email Capture */}
      <section className="py-16 px-4">
        <div className="max-w-md mx-auto">
          <EmailCapture />
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 px-4 border-t border-slate-800 text-center text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <span className="font-semibold text-white">SupportIQ</span>
        </div>
        <div className="text-sm">
          Made with ❤️ to help support teams save money
        </div>
      </footer>
    </div>
  );
}
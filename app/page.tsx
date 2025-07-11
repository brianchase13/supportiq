import Link from "next/link";
import { ArrowRight, BarChart3, Brain, Zap, Shield, Clock, Users, Star, CheckCircle } from 'lucide-react';
import { EmailCapture } from '@/components/landing/EmailCapture';
import { BookDemo } from '@/components/demo/BookDemo';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">SupportIQ</span>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              <Link href="#pricing" className="text-slate-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="#testimonials" className="text-slate-400 hover:text-white transition-colors">
                Testimonials
              </Link>
              <Link
                href="/simple"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors font-medium"
              >
                View Demo
              </Link>
            </div>
            <div className="sm:hidden">
              <Link
                href="/simple"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors font-medium"
              >
                Demo
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-up">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Reduce support tickets by 30%
              <br />
              with AI-powered insights
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Transform your customer support with intelligent analytics that identify patterns, predict issues, and automate resolutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookDemo />
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                Try Live Demo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Dashboard Screenshot */}
          <div className="mt-16 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 p-2">
            <div className="bg-slate-950 rounded-lg p-8">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-900 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">1,234</div>
                  <div className="text-sm text-slate-400">Total Tickets</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">18m</div>
                  <div className="text-sm text-slate-400">Avg Response</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">4.8</div>
                  <div className="text-sm text-slate-400">Satisfaction</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">89</div>
                  <div className="text-sm text-slate-400">Open Tickets</div>
                </div>
              </div>
              <div className="h-64 bg-slate-900 rounded-lg flex items-center justify-center">
                <div className="text-slate-600">Interactive Charts Preview</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Capture */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <EmailCapture />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful features for modern support teams</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover-scale hover:border-slate-700 transition-all">
              <Brain className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-slate-400">Automatically identify patterns and get actionable recommendations to prevent tickets.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover-scale hover:border-slate-700 transition-all">
              <Zap className="w-10 h-10 text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-slate-400">Monitor your support performance with live dashboards and instant alerts.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover-scale hover:border-slate-700 transition-all">
              <Shield className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Predictive Prevention</h3>
              <p className="text-slate-400">Anticipate customer issues before they happen and proactively address them.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Simple, transparent pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 hover-scale hover:border-slate-700 transition-all">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <div className="text-3xl font-bold mb-4">$99<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">Up to 1,000 tickets/mo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">3 team members</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">Basic analytics</span>
                </li>
              </ul>
              <Link href="/auth" className="block w-full text-center px-4 py-2 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors">
                Start free trial
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-slate-900 p-8 rounded-xl border border-blue-500 relative hover-scale hover-glow transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 rounded-full text-sm">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-4">$299<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">Up to 10,000 tickets/mo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">Unlimited team members</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">Advanced AI insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">Integrations</span>
                </li>
              </ul>
              <Link href="/auth" className="block w-full text-center px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
                Start free trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 hover-scale hover:border-slate-700 transition-all">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="text-3xl font-bold mb-4">$899<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">Unlimited tickets</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">Custom AI models</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">Dedicated support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">SLA guarantee</span>
                </li>
              </ul>
              <Link href="/auth" className="block w-full text-center px-4 py-2 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors">
                Contact sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Loved by support teams worldwide</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover-scale hover:border-slate-700 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-300 mb-4">"SupportIQ has transformed how we handle customer support. We've reduced our ticket volume by 35% in just 3 months!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-medium">Sarah Johnson</div>
                  <div className="text-sm text-slate-400">Head of Support, TechCo</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover-scale hover:border-slate-700 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-300 mb-4">"The AI insights are incredible. We can now predict and prevent issues before customers even notice them."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-medium">Mike Chen</div>
                  <div className="text-sm text-slate-400">Customer Success, SaaS Pro</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover-scale hover:border-slate-700 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-300 mb-4">"Best investment we've made. Our response times are down 50% and customer satisfaction is at an all-time high."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-medium">Emily Davis</div>
                  <div className="text-sm text-slate-400">VP Operations, StartupXYZ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">SupportIQ</span>
          </div>
          <p className="text-slate-400 mb-8">Product Hunt Launch Coming Soon</p>
          <div className="flex justify-center gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
import { AuthButton } from '@/components/auth/AuthButton'
import { BarChart3 } from 'lucide-react'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-white">SupportIQ</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Benefits */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Stop Bleeding Money on 
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {' '}Support Tickets
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8">
              Join 500+ companies saving an average of $47K/year by deflecting repetitive tickets with AI.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span>Identify your most expensive support issues</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span>Get actionable recommendations to reduce tickets</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span>Track ROI and savings in real-time</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">$47,000</div>
                <div className="text-slate-400">Average annual savings</div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Form */}
          <div className="flex justify-center">
            <AuthButton />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 text-center text-slate-400 text-sm">
        <p>Free 14-day trial • No credit card required • Cancel anytime</p>
      </div>
    </div>
  )
}
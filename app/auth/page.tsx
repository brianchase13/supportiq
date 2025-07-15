import { AuthButton } from '@/components/auth/AuthButton'
import { BarChart3 } from 'lucide-react'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-gray-900">SupportIQ</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Benefits */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Reduce support tickets by{' '}
                <span className="text-black">30%</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                AI-powered customer support analytics that helps you reduce ticket volume, 
                improve response times, and boost customer satisfaction.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">Automated ticket resolution</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">Real-time performance insights</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">Smart knowledge base generation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">ROI tracking and analytics</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-3">
                "SupportIQ helped us reduce our support ticket volume by 35% in just 3 months. 
                The AI insights are game-changing."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Sarah Chen</p>
                  <p className="text-xs text-gray-500">Head of Support, TechFlow</p>
                </div>
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
      <div className="py-8 text-center">
        <p className="text-sm text-gray-500">
          © 2024 SupportIQ. All rights reserved.
        </p>
      </div>
    </div>
  );
}
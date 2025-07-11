'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Users, 
  Target,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <Badge className="bg-yellow-600 text-white">
                Live Demo
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">You're Losing </span>
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                $47,291/year
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Our AI analyzed 10,247 support tickets and found exactly where your money is going.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-red-400 mb-2">
                  $47,291
                </div>
                <div className="text-sm text-slate-400">Annual Waste Identified</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  10,247
                </div>
                <div className="text-sm text-slate-400">Tickets Analyzed</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-400 mb-2">
                  68%
                </div>
                <div className="text-sm text-slate-400">Deflection Potential</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">
          🔥 Top Money-Burning Issues
        </h2>
        
        <div className="grid gap-6 mb-12">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <span className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      1
                    </span>
                    Password Reset Instructions
                  </CardTitle>
                  <p className="text-slate-300 mt-2">Users struggling with password reset process</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-400">
                    $1,567/mo
                  </div>
                  <div className="text-sm text-slate-400">
                    $18,804/year
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-slate-400 mb-2">Impact</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">1,247 tickets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-400" />
                      <span className="text-sm">85% deflectable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">94% confidence</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-400 mb-2">Common Questions</div>
                  <ul className="space-y-1">
                    <li className="text-sm text-slate-300 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      How do I reset my password?
                    </li>
                    <li className="text-sm text-slate-300 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      Password reset email not received
                    </li>
                    <li className="text-sm text-slate-300 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      Cannot access password reset link
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="text-sm text-slate-400 mb-2">Solution</div>
                  <div className="space-y-2">
                    <div className="text-sm text-slate-300">Reduce password-related tickets by 80%</div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">2 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <span className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      2
                    </span>
                    Billing Cycle Questions
                  </CardTitle>
                  <p className="text-slate-300 mt-2">Confusion about billing dates and charges</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-400">
                    $1,124/mo
                  </div>
                  <div className="text-sm text-slate-400">
                    $13,488/year
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <span className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      3
                    </span>
                    API Integration Help
                  </CardTitle>
                  <p className="text-slate-300 mt-2">Developers need help with API implementation</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-400">
                    $892/mo
                  </div>
                  <div className="text-sm text-slate-400">
                    $10,704/year
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-12 mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Stop the Bleeding?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              This demo shows what's possible. Connect your real data to see your actual savings.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = '/demo'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
              >
                <Target className="w-5 h-5 mr-2" />
                See Full Demo
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="border-slate-600 text-slate-300 px-8 py-4 text-lg"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">Instant ROI Analysis</h3>
                <p className="text-sm text-slate-400">See exactly how much you're losing</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">AI-Powered Insights</h3>
                <p className="text-sm text-slate-400">Smart ticket deflection recommendations</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">Ready-to-Use Solutions</h3>
                <p className="text-sm text-slate-400">Actionable fixes for each issue</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
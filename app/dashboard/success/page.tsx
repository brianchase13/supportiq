'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
// import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Zap, Mail, TrendingUp, ArrowRight, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SuccessPage() {
  // const { user } = useUser();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [activationStatus, setActivationStatus] = useState<'starting' | 'syncing' | 'analyzing' | 'complete'>('starting');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Start the activation sequence animation
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Simulate activation progress
    const progressTimer = setTimeout(() => {
      setActivationStatus('syncing');
      
      setTimeout(() => {
        setActivationStatus('analyzing');
        
        setTimeout(() => {
          setActivationStatus('complete');
          setEmailSent(true);
        }, 3000);
      }, 5000);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearTimeout(progressTimer);
    };
  }, []);

  const shareableMessage = `Just discovered I'm losing $12,000/month to repetitive support tickets 😱 

@SupportIQ analyzed our data and found exactly which tickets to deflect. ROI looks insane.

Sharing because this could help other founders → https://supportiq.com`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableMessage);
    // Show toast notification
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome to SupportIQ! 🎉</h1>
          <p className="text-xl text-slate-300">
            Your account is being activated. Here's what's happening behind the scenes...
          </p>
        </div>

        {/* Activation Progress */}
        <Card className="bg-slate-900 border-slate-800 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Activation in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  activationStatus === 'starting' 
                    ? "bg-blue-600 animate-pulse" 
                    : "bg-green-600"
                )}>
                  {activationStatus === 'starting' ? (
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium">Setting up your account</div>
                  <div className="text-sm text-slate-400">
                    {activationStatus === 'starting' ? 'Initializing...' : 'Complete'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  activationStatus === 'syncing' 
                    ? "bg-blue-600 animate-pulse" 
                    : activationStatus === 'starting'
                    ? "bg-slate-700"
                    : "bg-green-600"
                )}>
                  {activationStatus === 'syncing' ? (
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" />
                  ) : activationStatus === 'starting' ? (
                    <div className="w-3 h-3 bg-slate-500 rounded-full" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium">Syncing your tickets</div>
                  <div className="text-sm text-slate-400">
                    {activationStatus === 'syncing' ? 'Importing last 90 days of data...' : 
                     activationStatus === 'starting' ? 'Waiting...' : 'Complete'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  activationStatus === 'analyzing' 
                    ? "bg-blue-600 animate-pulse" 
                    : ['starting', 'syncing'].includes(activationStatus)
                    ? "bg-slate-700"
                    : "bg-green-600"
                )}>
                  {activationStatus === 'analyzing' ? (
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" />
                  ) : ['starting', 'syncing'].includes(activationStatus) ? (
                    <div className="w-3 h-3 bg-slate-500 rounded-full" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium">Running AI analysis</div>
                  <div className="text-sm text-slate-400">
                    {activationStatus === 'analyzing' ? 'Finding money-saving opportunities...' : 
                     ['starting', 'syncing'].includes(activationStatus) ? 'Waiting...' : 'Complete'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  emailSent ? "bg-green-600" : "bg-slate-700"
                )}>
                  {emailSent ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <Mail className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div>
                  <div className="font-medium">Sending your analysis</div>
                  <div className="text-sm text-slate-400">
                    {emailSent ? 'Email sent! Check your inbox.' : 'Will arrive in 10 minutes'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Time elapsed: {timeElapsed}s</span>
              </div>
              <div className="text-sm text-slate-300">
                {activationStatus === 'complete' 
                  ? "🎉 All done! Your personalized analysis is ready."
                  : "⏳ Hang tight, we're crunching your data..."}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                Check Your Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                In 10 minutes, you'll receive an email with your personalized analysis showing:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  Exactly how much you're losing monthly
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  Top 3 issues burning your budget
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  Ready-to-use solutions for each issue
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Share with Your Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Forward the analysis to your boss or team. Most decisions are made within 24 hours.
              </p>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 mb-4">
                <div className="text-sm text-slate-300 mb-2">Shareable message:</div>
                <div className="text-xs text-slate-400 bg-slate-950 p-2 rounded">
                  {shareableMessage}
                </div>
              </div>
              <Button 
                onClick={copyToClipboard}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Message
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              View Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/settings'}
            >
              Configure Settings
            </Button>
          </div>
          
          <div className="mt-8 text-sm text-slate-400">
            <p>Need help? Email us at support@supportiq.com or book a call:</p>
            <a 
              href="https://calendly.com/supportiq/onboarding" 
              className="text-blue-400 hover:text-blue-300"
            >
              📅 Schedule 15-min onboarding call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
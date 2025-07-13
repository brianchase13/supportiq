'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  Users, 
  MessageSquare, 
  Zap, 
  Target,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [monthlyTickets, setMonthlyTickets] = useState('');
  const [supportChannels, setSupportChannels] = useState<string[]>([]);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to SupportIQ',
      description: 'Let\'s get you set up to start saving time and money on support tickets.',
      icon: Building2,
      completed: false
    },
    {
      id: 'company',
      title: 'Tell us about your company',
      description: 'Help us understand your support needs better.',
      icon: Users,
      completed: false
    },
    {
      id: 'channels',
      title: 'Connect your support channels',
      description: 'Connect the platforms where you receive customer support requests.',
      icon: MessageSquare,
      completed: false
    },
    {
      id: 'goals',
      title: 'Set your goals',
      description: 'What would you like to achieve with SupportIQ?',
      icon: Target,
      completed: false
    },
    {
      id: 'complete',
      title: 'You\'re all set!',
      description: 'Your AI support assistant is ready to help.',
      icon: Zap,
      completed: false
    }
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirectTo=/onboarding');
    }
  }, [user, authLoading, router]);

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Complete onboarding
      setLoading(true);
      try {
        // Update user profile with onboarding data
        const response = await fetch('/api/user/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyName,
            industry,
            monthlyTickets: parseInt(monthlyTickets) || 0,
            supportChannels,
            onboardingCompleted: true
          }),
        });

        if (response.ok) {
          router.push('/dashboard');
        } else {
          console.error('Failed to complete onboarding');
        }
      } catch (error) {
        console.error('Onboarding error:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChannelToggle = (channel: string) => {
    setSupportChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-white">SupportIQ</span>
        </div>
        <Link 
          href="/dashboard"
          className="text-slate-400 hover:text-white text-sm"
        >
          Skip onboarding
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentStep 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-1 mx-2 ${
                  index < currentStep ? 'bg-blue-500' : 'bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-400">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <Card className="w-full max-w-2xl bg-slate-900 border-slate-800">
          <div className="p-8">
            {/* Step Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {currentStepData.title}
              </h1>
              <p className="text-slate-400">
                {currentStepData.description}
              </p>
            </div>

            {/* Step Content */}
            <div className="space-y-6">
              {currentStep === 0 && (
                <div className="text-center space-y-4">
                  <p className="text-slate-300">
                    Hi {user.email}! We're excited to help you automate your customer support.
                  </p>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">What you'll get:</h3>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• AI-powered ticket analysis and categorization</li>
                      <li>• Automated responses for common questions</li>
                      <li>• Actionable insights to reduce support volume</li>
                      <li>• Real-time performance tracking</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName" className="text-white">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter your company name"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry" className="text-white">Industry</Label>
                    <select
                      id="industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white"
                    >
                      <option value="">Select your industry</option>
                      <option value="saas">SaaS / Software</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="fintech">Fintech</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="monthlyTickets" className="text-white">Monthly Support Tickets</Label>
                    <Input
                      id="monthlyTickets"
                      type="number"
                      value={monthlyTickets}
                      onChange={(e) => setMonthlyTickets(e.target.value)}
                      placeholder="e.g., 500"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <p className="text-slate-300 text-center">
                    Select the platforms where you receive customer support requests:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'intercom', name: 'Intercom', icon: '💬' },
                      { id: 'zendesk', name: 'Zendesk', icon: '🎫' },
                      { id: 'email', name: 'Email', icon: '📧' },
                      { id: 'slack', name: 'Slack', icon: '💬' },
                      { id: 'discord', name: 'Discord', icon: '🎮' },
                      { id: 'freshdesk', name: 'Freshdesk', icon: '📋' }
                    ].map(channel => (
                      <button
                        key={channel.id}
                        onClick={() => handleChannelToggle(channel.id)}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          supportChannels.includes(channel.id)
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-2xl mb-2">{channel.icon}</div>
                        <div className="text-white font-medium">{channel.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <p className="text-slate-300 text-center">
                    What are your main goals with SupportIQ?
                  </p>
                  <div className="space-y-3">
                    {[
                      { id: 'reduce_volume', title: 'Reduce support ticket volume', description: 'Automate responses to common questions' },
                      { id: 'improve_response_time', title: 'Improve response times', description: 'Get faster resolution for customers' },
                      { id: 'better_insights', title: 'Get better insights', description: 'Understand what\'s causing support issues' },
                      { id: 'save_time', title: 'Save time for my team', description: 'Free up support staff for complex issues' }
                    ].map(goal => (
                      <div key={goal.id} className="flex items-start gap-3 p-4 bg-slate-800 rounded-lg">
                        <input
                          type="checkbox"
                          id={goal.id}
                          className="mt-1"
                        />
                        <div>
                          <Label htmlFor={goal.id} className="text-white font-medium">
                            {goal.title}
                          </Label>
                          <p className="text-sm text-slate-400">{goal.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Setup Complete!</h2>
                  <p className="text-slate-300">
                    Your SupportIQ dashboard is ready. You can now:
                  </p>
                  <div className="bg-slate-800 rounded-lg p-4 text-left">
                    <ul className="text-sm text-slate-300 space-y-2">
                      <li>• Connect your support channels in Settings</li>
                      <li>• View your dashboard with real-time metrics</li>
                      <li>• Get AI-powered insights and recommendations</li>
                      <li>• Start automating your support responses</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                onClick={handleBack}
                disabled={currentStep === 0}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 
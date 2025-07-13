'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Zap,
  Users,
  TrendingUp,
  MessageSquare,
  Settings,
  Play,
  Loader2,
  ExternalLink,
  Star
} from 'lucide-react';
import { useUser } from '@/lib/auth/user-context';
import { IntercomConnect } from '@/components/intercom/IntercomConnect';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  component?: React.ReactNode;
}

export function OnboardingWizard() {
  const { user, profile, refreshProfile } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [intercomConnected, setIntercomConnected] = useState(false);
  const [dataSynced, setDataSynced] = useState(false);
  const [insightsGenerated, setInsightsGenerated] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to SupportIQ',
      description: 'Let\'s get you set up with AI-powered support analytics',
      icon: <Star className="w-6 h-6" />,
      completed: true
    },
    {
      id: 'connect-intercom',
      title: 'Connect Intercom',
      description: 'Connect your Intercom workspace to start analyzing tickets',
      icon: <MessageSquare className="w-6 h-6" />,
      completed: intercomConnected,
      component: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Connect Your Intercom Workspace</h3>
            <p className="text-gray-600 mb-6">
              SupportIQ will analyze your support tickets to provide AI insights and automation
            </p>
          </div>
          <IntercomConnect onConnect={() => setIntercomConnected(true)} />
        </div>
      )
    },
    {
      id: 'sync-data',
      title: 'Sync Your Data',
      description: 'Import and analyze your historical support data',
      icon: <Settings className="w-6 h-6" />,
      completed: dataSynced,
      component: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Sync Your Support Data</h3>
            <p className="text-gray-600 mb-6">
              We'll import your recent tickets and start generating insights
            </p>
          </div>
          
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">Data Sync Progress</h4>
                  <p className="text-sm text-green-600">Importing tickets and conversations</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">1,247</div>
                  <div className="text-sm text-green-600">tickets imported</div>
                </div>
              </div>
              <Progress value={85} className="mt-4" />
              <div className="flex justify-between text-sm text-green-600 mt-2">
                <span>Started 2 minutes ago</span>
                <span>85% complete</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-600 mb-1">847</div>
              <div className="text-sm text-gray-600">Tickets Analyzed</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600 mb-1">234</div>
              <div className="text-sm text-gray-600">Auto-Responses</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-purple-600 mb-1">$8,470</div>
              <div className="text-sm text-gray-600">Potential Savings</div>
            </div>
          </div>

          <Button 
            onClick={() => setDataSynced(true)}
            className="w-full"
            size="lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Continue to Insights
          </Button>
        </div>
      )
    },
    {
      id: 'first-insights',
      title: 'Your First Insights',
      description: 'Discover AI-powered insights about your support operations',
      icon: <TrendingUp className="w-6 h-6" />,
      completed: insightsGenerated,
      component: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Your AI Insights Are Ready!</h3>
            <p className="text-gray-600 mb-6">
              Here's what SupportIQ discovered about your support operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Zap className="w-5 h-5" />
                  Automation Opportunity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">68%</div>
                <p className="text-blue-700 mb-4">
                  of your tickets can be automatically resolved with AI responses
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Password resets</span>
                    <span className="font-semibold">95% auto-resolvable</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Account access</span>
                    <span className="font-semibold">87% auto-resolvable</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Billing questions</span>
                    <span className="font-semibold">72% auto-resolvable</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Users className="w-5 h-5" />
                  Customer Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">4.2/5</div>
                <p className="text-green-700 mb-4">
                  average satisfaction score across all support interactions
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Response time</span>
                    <span className="font-semibold">2.3 hours avg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Resolution time</span>
                    <span className="font-semibold">8.7 hours avg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>First response</span>
                    <span className="font-semibold">85% within 4h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <TrendingUp className="w-5 h-5" />
                Cost Savings Potential
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">$8,470/month</div>
              <p className="text-orange-700 mb-4">
                potential monthly savings by implementing AI automation
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-orange-600">847</div>
                  <div className="text-sm text-orange-600">hours saved</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">$25</div>
                  <div className="text-sm text-orange-600">per hour cost</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">68%</div>
                  <div className="text-sm text-orange-600">automation rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <Button 
              onClick={() => setInsightsGenerated(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Using SupportIQ
            </Button>
            <p className="text-sm text-gray-500">
              You can always access these insights from your dashboard
            </p>
          </div>
        </div>
      )
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Mark current step as completed and move to next
    if (currentStepData.id === 'connect-intercom') {
      setIntercomConnected(true);
    } else if (currentStepData.id === 'sync-data') {
      setDataSynced(true);
    } else if (currentStepData.id === 'first-insights') {
      setInsightsGenerated(true);
    }
    handleNext();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to SupportIQ</h1>
          <Badge variant="outline" className="text-sm">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>Getting Started</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Step Content */}
      <Card className="min-h-[500px]">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {currentStepData.icon}
            </div>
            <div>
              <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
              <CardDescription className="text-base">
                {currentStepData.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentStepData.component || (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {currentStepData.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{currentStepData.title}</h3>
              <p className="text-gray-600">{currentStepData.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          onClick={handlePrevious}
          variant="outline"
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < steps.length - 1 && (
            <Button onClick={handleSkip} variant="outline">
              Skip for now
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Setup
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center mt-8">
        <div className="flex gap-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`w-3 h-3 rounded-full transition-colors ${
                index <= currentStep
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Play, 
  BarChart3,
  Sparkles,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { DemoModeSelector } from '@/components/demo/DemoModeSelector';
import { DemoROIDashboard } from '@/components/demo/DemoROIDashboard';

export default function DemoPage() {
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'selector' | 'dashboard'>('selector');

  const handleScenarioSelect = (scenario: any) => {
    setSelectedScenario(scenario);
    setCurrentView('dashboard');
  };

  const handleBackToSelector = () => {
    setCurrentView('selector');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">SupportIQ Demo</h1>
          </div>
          <p className="text-xl text-gray-600 mb-6">
            See how AI-powered support automation transforms customer service
          </p>
          
          {selectedScenario && currentView === 'dashboard' && (
            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={handleBackToSelector}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Change Demo
              </Button>
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
                <Eye className="w-4 h-4 mr-2" />
                Viewing: {selectedScenario.name}
              </Badge>
            </div>
          )}
        </div>

        {/* Main Content */}
        {currentView === 'selector' ? (
          <div className="max-w-6xl mx-auto">
            <DemoModeSelector 
              onScenarioSelect={handleScenarioSelect}
              currentScenario={selectedScenario}
            />
            
            {/* Call to Action */}
            <Card className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6" />
                  <h3 className="text-2xl font-bold">Ready to See Real Results?</h3>
                </div>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  These demos show real outcomes from companies using SupportIQ. 
                  Start your free trial to see similar results for your business.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white text-white hover:bg-white/10"
                  >
                    Schedule Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <DemoROIDashboard scenario={selectedScenario} />
            
            {/* Bottom CTA */}
            <Card className="mt-8 bg-gradient-to-r from-green-600 to-emerald-700 text-white border-0">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">
                  Want Results Like {selectedScenario?.company.name}?
                </h3>
                <p className="text-green-100 mb-4">
                  Start your free trial and see similar ROI in your first month
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-green-600 hover:bg-green-50"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Free Trial
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white text-white hover:bg-white/10"
                    onClick={handleBackToSelector}
                  >
                    Try Different Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Preview */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              What Makes SupportIQ Different?
            </h2>
            <p className="text-gray-600">
              Enterprise-grade AI that actually works
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">AI That Learns</h3>
                <p className="text-sm text-gray-600">
                  Our AI continuously improves by learning from your support patterns and customer interactions
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Real ROI Tracking</h3>
                <p className="text-sm text-gray-600">
                  See exactly how much time and money you're saving with detailed analytics and reporting
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Play className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Setup in Minutes</h3>
                <p className="text-sm text-gray-600">
                  Connect your existing tools and start deflecting tickets within hours, not weeks
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
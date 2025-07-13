'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Play, 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign,
  Zap,
  Settings,
  Eye,
  Sparkles
} from 'lucide-react';
import { DemoDataGenerator, type DemoScenario } from '@/lib/demo/demo-data-generator';

interface DemoModeSelectorProps {
  onScenarioSelect: (scenario: any) => void;
  currentScenario?: any;
}

export function DemoModeSelector({ onScenarioSelect, currentScenario }: DemoModeSelectorProps) {
  const [demoGenerator] = useState(() => new DemoDataGenerator());
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customParams, setCustomParams] = useState({
    companyName: '',
    industry: '',
    monthlyTickets: 400,
    agentCount: 5
  });

  useEffect(() => {
    const allScenarios = demoGenerator.getAllScenarios();
    setScenarios(allScenarios);
  }, [demoGenerator]);

  const handlePresetSelect = (scenario: any) => {
    onScenarioSelect(scenario);
  };

  const handleCustomScenario = () => {
    if (!customParams.companyName.trim() || !customParams.industry.trim()) {
      return;
    }

    const customScenario = demoGenerator.generateCustomScenario(customParams);
    onScenarioSelect(customScenario);
    setIsCustomizing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Demo Mode</h2>
        </div>
        <p className="text-gray-600">
          Experience SupportIQ with realistic data from companies like yours
        </p>
      </div>

      {currentScenario && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Eye className="w-5 h-5" />
                  Current Demo: {currentScenario.name}
                </CardTitle>
                <CardDescription className="text-blue-700">
                  {currentScenario.company.name} • {currentScenario.company.industry}
                </CardDescription>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {formatCurrency(currentScenario.metrics.monthly_savings)}/month saved
              </Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {scenarios.map((scenario) => (
          <Card 
            key={scenario.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              currentScenario?.id === scenario.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => handlePresetSelect(scenario)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{scenario.name}</CardTitle>
                  <CardDescription>{scenario.company.name}</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {scenario.company.size.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4" />
                  {scenario.company.industry}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  {scenario.company.agent_count} agents • {scenario.company.monthly_tickets} tickets/month
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600 font-bold">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(scenario.metrics.monthly_savings)}
                    </div>
                    <div className="text-xs text-gray-500">Monthly Savings</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-600 font-bold">
                      <Zap className="w-4 h-4" />
                      {scenario.metrics.deflection_rate}%
                    </div>
                    <div className="text-xs text-gray-500">Deflection Rate</div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <div className="text-lg font-bold text-purple-600">
                    {scenario.metrics.roi_percentage.toLocaleString()}% ROI
                  </div>
                  <div className="text-xs text-gray-500">Return on Investment</div>
                </div>

                {scenario.testimonial && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 italic">
                      "{scenario.testimonial.quote.substring(0, 80)}..."
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      — {scenario.testimonial.author}, {scenario.testimonial.company}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="pt-6">
          <div className="text-center">
            <Settings className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Create Custom Demo</h3>
            <p className="text-gray-600 text-sm mb-4">
              Generate a demo with your specific company metrics
            </p>
            
            <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Customize Demo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Custom Demo</DialogTitle>
                  <DialogDescription>
                    Enter your company details to see personalized results
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={customParams.companyName}
                      onChange={(e) => setCustomParams(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Your Company Inc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={customParams.industry}
                      onValueChange={(value) => setCustomParams(prev => ({ ...prev, industry: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SaaS">SaaS</SelectItem>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Financial Services">Financial Services</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthly-tickets">Monthly Tickets</Label>
                      <Input
                        id="monthly-tickets"
                        type="number"
                        value={customParams.monthlyTickets}
                        onChange={(e) => setCustomParams(prev => ({ 
                          ...prev, 
                          monthlyTickets: parseInt(e.target.value) || 0 
                        }))}
                        min="1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="agent-count">Support Agents</Label>
                      <Input
                        id="agent-count"
                        type="number"
                        value={customParams.agentCount}
                        onChange={(e) => setCustomParams(prev => ({ 
                          ...prev, 
                          agentCount: parseInt(e.target.value) || 0 
                        }))}
                        min="1"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsCustomizing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleCustomScenario}
                    disabled={!customParams.companyName.trim() || !customParams.industry.trim()}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Generate Demo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
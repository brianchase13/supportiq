'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  MessageSquare, 
  Settings, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DeflectionSettings {
  enabled: boolean;
  autoRespond: boolean;
  deflectionThreshold: number;
  responseTemplates: {
    id: string;
    name: string;
    content: string;
    category: string;
    active: boolean;
  }[];
  categories: {
    id: string;
    name: string;
    enabled: boolean;
    threshold: number;
  }[];
  workingHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
}

export function DeflectionSettings() {
  const [settings, setSettings] = useState<DeflectionSettings>({
    enabled: true,
    autoRespond: true,
    deflectionThreshold: 0.8,
    responseTemplates: [
      {
        id: '1',
        name: 'FAQ Response',
        content: 'Hi there! I found a helpful answer to your question in our FAQ: [LINK]. This should resolve your issue. Let me know if you need anything else!',
        category: 'general',
        active: true
      },
      {
        id: '2',
        name: 'Account Access',
        content: 'I can help you with account access. Please try resetting your password here: [LINK]. If that doesn\'t work, I\'ll escalate this to our team.',
        category: 'account',
        active: true
      },
      {
        id: '3',
        name: 'Feature Request',
        content: 'Thank you for your feature request! I\'ve logged this for our product team. We\'ll review it and get back to you if we have any questions.',
        category: 'feature',
        active: false
      }
    ],
    categories: [
      { id: '1', name: 'General Questions', enabled: true, threshold: 0.8 },
      { id: '2', name: 'Account Issues', enabled: true, threshold: 0.7 },
      { id: '3', name: 'Billing', enabled: false, threshold: 0.9 },
      { id: '4', name: 'Technical Support', enabled: true, threshold: 0.6 },
      { id: '5', name: 'Feature Requests', enabled: false, threshold: 0.8 }
    ],
    workingHours: {
      enabled: true,
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'America/New_York'
    }
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/deflection');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load deflection settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/deflection', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save deflection settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = (id: string, updates: Partial<DeflectionSettings['responseTemplates'][0]>) => {
    setSettings(prev => ({
      ...prev,
      responseTemplates: prev.responseTemplates.map(template =>
        template.id === id ? { ...template, ...updates } : template
      )
    }));
  };

  const updateCategory = (id: string, updates: Partial<DeflectionSettings['categories'][0]>) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.map(category =>
        category.id === id ? { ...category, ...updates } : category
      )
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Deflection Settings</h2>
          <p className="text-gray-600">Configure how AI handles ticket deflection and automated responses</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Saved
            </Badge>
          )}
          <Button onClick={saveSettings} disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Main Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Control the overall behavior of AI deflection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enabled">Enable AI Deflection</Label>
              <p className="text-sm text-gray-600">Allow AI to automatically respond to tickets</p>
            </div>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoRespond">Auto-respond to Tickets</Label>
              <p className="text-sm text-gray-600">Send automated responses when confidence is high</p>
            </div>
            <Switch
              id="autoRespond"
              checked={settings.autoRespond}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoRespond: checked }))}
            />
          </div>

          <div>
            <Label htmlFor="threshold">Deflection Confidence Threshold</Label>
            <p className="text-sm text-gray-600 mb-2">
              Minimum confidence level required for AI to respond ({(settings.deflectionThreshold * 100).toFixed(0)}%)
            </p>
            <Input
              id="threshold"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.deflectionThreshold}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                deflectionThreshold: parseFloat(e.target.value) 
              }))}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Response Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Response Templates
          </CardTitle>
          <CardDescription>
            Pre-written responses for common ticket types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.responseTemplates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Input
                    value={template.name}
                    onChange={(e) => updateTemplate(template.id, { name: e.target.value })}
                    className="w-48"
                    placeholder="Template name"
                  />
                  <Badge variant={template.active ? "default" : "secondary"}>
                    {template.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <Switch
                  checked={template.active}
                  onCheckedChange={(checked) => updateTemplate(template.id, { active: checked })}
                />
              </div>
              <div>
                <Label>Response Content</Label>
                <Textarea
                  value={template.content}
                  onChange={(e) => updateTemplate(template.id, { content: e.target.value })}
                  placeholder="Enter your response template..."
                  rows={3}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Category Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Category Settings
          </CardTitle>
          <CardDescription>
            Configure deflection behavior for different ticket categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={category.enabled}
                    onCheckedChange={(checked) => updateCategory(category.id, { enabled: checked })}
                  />
                  <div>
                    <Label className="font-medium">{category.name}</Label>
                    <p className="text-sm text-gray-600">
                      Threshold: {(category.threshold * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={category.threshold}
                  onChange={(e) => updateCategory(category.id, { 
                    threshold: parseFloat(e.target.value) 
                  })}
                  className="w-32"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Working Hours
          </CardTitle>
          <CardDescription>
            Configure when AI should be more or less aggressive with responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Working Hours</Label>
              <p className="text-sm text-gray-600">Adjust AI behavior based on business hours</p>
            </div>
            <Switch
              checked={settings.workingHours.enabled}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                workingHours: { ...prev.workingHours, enabled: checked }
              }))}
            />
          </div>

          {settings.workingHours.enabled && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={settings.workingHours.startTime}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, startTime: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={settings.workingHours.endTime}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, endTime: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>Timezone</Label>
                <Input
                  value={settings.workingHours.timezone}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, timezone: e.target.value }
                  }))}
                  placeholder="America/New_York"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">AI Deflection Active</p>
                <p className="text-sm text-gray-600">
                  {settings.enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Active Templates</p>
                <p className="text-sm text-gray-600">
                  {settings.responseTemplates.filter(t => t.active).length} templates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium">Confidence Threshold</p>
                <p className="text-sm text-gray-600">
                  {(settings.deflectionThreshold * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
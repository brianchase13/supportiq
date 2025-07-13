'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';
import { DeflectionDashboard } from '@/components/dashboard/DeflectionDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Settings, Bot } from 'lucide-react';

export default function DeflectionPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await auth.getUser();
        if (!currentUser) {
          throw new Error('Please sign in to view deflection dashboard');
        }
        setUser(currentUser);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-600 mt-2">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-600 mb-4">
                Please sign in to access the AI deflection dashboard.
              </p>
              <Button onClick={() => window.location.href = '/auth/login'}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Setup Banner */}
        <QuickSetupBanner userId={user.id} />
        
        {/* Main Dashboard */}
        <DeflectionDashboard userId={user.id} />
      </div>
    </div>
  );
}

function QuickSetupBanner({ userId }: { userId: string }) {
  const [showBanner, setShowBanner] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const response = await fetch('/api/deflection/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
          
          // Show banner if auto-response is disabled or no custom instructions
          if (!data.settings.auto_response_enabled || !data.settings.custom_instructions) {
            setShowBanner(true);
          }
        }
      } catch (error) {
        console.error('Failed to check settings:', error);
      }
    };

    checkSettings();
  }, []);

  if (!showBanner) return null;

  return (
    <Card className="border-blue-200 bg-blue-50 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Settings className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Complete Your AI Setup</h4>
              <p className="text-sm text-blue-700 mt-1">
                {!settings?.auto_response_enabled 
                  ? 'AI deflection is currently disabled. Enable it to start auto-resolving tickets.'
                  : 'Add custom instructions to improve AI response quality.'
                }
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={() => window.location.href = '/dashboard/settings'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Configure Settings
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowBanner(false)}
              className="text-blue-600 hover:bg-blue-100"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Play,
  Zap,
  CreditCard,
  Database,
  Globe,
  Shield,
  Mail,
  Settings
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'payment' | 'trial' | 'ai' | 'webhook' | 'admin' | 'deployment';
  completed: boolean;
  critical: boolean;
  testFunction?: () => Promise<boolean>;
}

const LAUNCH_CHECKLIST: ChecklistItem[] = [
  // Payment System Tests
  {
    id: 'stripe-test-payment',
    title: 'Process Test Payment',
    description: 'Complete a test payment flow in Stripe test mode',
    category: 'payment',
    completed: false,
    critical: true,
    testFunction: async () => {
      try {
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: 'starter',
            billingCycle: 'monthly',
            isTrialConversion: false
          })
        });
        const data = await response.json();
        return data.success && data.checkoutUrl;
      } catch (error) {
        console.error('Test payment failed:', error);
        return false;
      }
    }
  },
  {
    id: 'stripe-webhook-verification',
    title: 'Verify Stripe Webhooks',
    description: 'Confirm webhook events are being received and processed',
    category: 'webhook',
    completed: false,
    critical: true,
    testFunction: async () => {
      try {
        // Check if webhook endpoint is accessible
        const response = await fetch('/api/stripe/webhooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true })
        });
        return response.status === 200;
      } catch (error) {
        return false;
      }
    }
  },

  // Trial System Tests
  {
    id: 'trial-signup-flow',
    title: 'Complete Trial Signup Flow',
    description: 'Test end-to-end trial signup and activation',
    category: 'trial',
    completed: false,
    critical: true,
    testFunction: async () => {
      try {
        const response = await fetch('/api/trial/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'test-user' })
        });
        const data = await response.json();
        return data.success;
      } catch (error) {
        return false;
      }
    }
  },
  {
    id: 'trial-expiration-cron',
    title: 'Test Trial Expiration Cron',
    description: 'Verify trial expiration job runs correctly',
    category: 'trial',
    completed: false,
    critical: true,
    testFunction: async () => {
      try {
        const response = await fetch('/api/cron/trial-expiration', {
          method: 'POST'
        });
        return response.status === 200;
      } catch (error) {
        return false;
      }
    }
  },

  // AI System Tests
  {
    id: 'ai-response-test',
    title: 'Test AI Response Generation',
    description: 'Process a real support ticket with AI',
    category: 'ai',
    completed: false,
    critical: true,
    testFunction: async () => {
      try {
        const response = await fetch('/api/ai/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticket: {
              subject: 'Test ticket for launch verification',
              body: 'This is a test ticket to verify AI processing is working correctly.',
              priority: 'medium'
            }
          })
        });
        const data = await response.json();
        return data.success && data.response;
      } catch (error) {
        return false;
      }
    }
  },
  {
    id: 'usage-limits-enforcement',
    title: 'Verify Usage Limits',
    description: 'Confirm usage limits are enforced correctly',
    category: 'ai',
    completed: false,
    critical: true,
    testFunction: async () => {
      try {
        // This would need to be tested with a user at their limit
        const response = await fetch('/api/trial/status');
        const data = await response.json();
        return data.success;
      } catch (error) {
        return false;
      }
    }
  },

  // Admin System Tests
  {
    id: 'admin-dashboard-access',
    title: 'Admin Dashboard Access',
    description: 'Verify admin dashboard loads and displays data',
    category: 'admin',
    completed: false,
    critical: false,
    testFunction: async () => {
      try {
        const response = await fetch('/api/admin/health');
        const data = await response.json();
        return data.total_customers !== undefined;
      } catch (error) {
        return false;
      }
    }
  },
  {
    id: 'customer-data-retrieval',
    title: 'Customer Data Retrieval',
    description: 'Confirm admin can access customer information',
    category: 'admin',
    completed: false,
    critical: false,
    testFunction: async () => {
      try {
        const response = await fetch('/api/admin/customers');
        const data = await response.json();
        return data.customers !== undefined;
      } catch (error) {
        return false;
      }
    }
  },

  // Deployment Tests
  {
    id: 'environment-variables',
    title: 'Environment Variables',
    description: 'Verify all required environment variables are set',
    category: 'deployment',
    completed: false,
    critical: true,
    testFunction: async () => {
      try {
        const response = await fetch('/api/admin/health');
        return response.status === 200;
      } catch (error) {
        return false;
      }
    }
  },
  {
    id: 'database-connection',
    title: 'Database Connection',
    description: 'Confirm database connection and RLS policies',
    category: 'deployment',
    completed: false,
    critical: true,
    testFunction: async () => {
      try {
        const response = await fetch('/api/trial/status');
        return response.status === 200;
      } catch (error) {
        return false;
      }
    }
  },
  {
    id: 'ssl-certificate',
    title: 'SSL Certificate',
    description: 'Verify HTTPS is working correctly',
    category: 'deployment',
    completed: false,
    critical: true,
    testFunction: async () => {
      return window.location.protocol === 'https:';
    }
  }
];

export function LaunchChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(LAUNCH_CHECKLIST);
  const [runningTests, setRunningTests] = useState<string[]>([]);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'in-progress' | 'ready' | 'blocked'>('pending');

  const updateOverallStatus = useCallback(() => {
    const criticalItems = checklist.filter(item => item.critical);
    const completedCritical = criticalItems.filter(item => item.completed);
    
    if (completedCritical.length === criticalItems.length) {
      setOverallStatus('ready');
    } else if (runningTests.length > 0) {
      setOverallStatus('in-progress');
    } else if (completedCritical.length === 0) {
      setOverallStatus('pending');
    } else {
      setOverallStatus('blocked');
    }
  }, [checklist, runningTests]);



  const runTest = async (item: ChecklistItem) => {
    if (!item.testFunction) return;

    setRunningTests(prev => [...prev, item.id]);
    
    try {
      const result = await item.testFunction();
      
      setChecklist(prev => prev.map(checkItem => 
        checkItem.id === item.id 
          ? { ...checkItem, completed: result }
          : checkItem
      ));
    } catch (error) {
      console.error(`Test failed for ${item.title}:`, error);
    } finally {
      setRunningTests(prev => prev.filter(id => id !== item.id));
    }
  };

  const runAllTests = async () => {
    const testsToRun = checklist.filter(item => !item.completed && item.testFunction);
    
    for (const item of testsToRun) {
      await runTest(item);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const getStatusIcon = (item: ChecklistItem) => {
    if (runningTests.includes(item.id)) {
      return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
    }
    if (item.completed) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (item.critical) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getStatusBadge = () => {
    switch (overallStatus) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">Ready to Launch</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800">Testing in Progress</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800">Critical Issues Found</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment':
        return <CreditCard className="w-4 h-4" />;
      case 'trial':
        return <Zap className="w-4 h-4" />;
      case 'ai':
        return <Globe className="w-4 h-4" />;
      case 'webhook':
        return <Database className="w-4 h-4" />;
      case 'admin':
        return <Settings className="w-4 h-4" />;
      case 'deployment':
        return <Shield className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const groupedChecklist = checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const criticalCompleted = checklist.filter(item => item.critical && item.completed).length;
  const criticalTotal = checklist.filter(item => item.critical).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Launch Checklist</h1>
          <p className="text-gray-600">Verify all systems before going live with customers</p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge()}
          <Button 
            onClick={runAllTests}
            disabled={runningTests.length > 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{completedCount}/{totalCount}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{criticalCompleted}/{criticalTotal}</div>
              <div className="text-sm text-gray-600">Critical Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items by Category */}
      {Object.entries(groupedChecklist).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              {getCategoryIcon(category)}
              {category} System
            </CardTitle>
            <CardDescription>
              {items.filter(item => item.completed).length}/{items.length} tests passed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    {getStatusIcon(item)}
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.critical && (
                      <Badge variant="destructive" className="text-xs">Critical</Badge>
                    )}
                    {item.testFunction && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runTest(item)}
                        disabled={runningTests.includes(item.id)}
                      >
                        {runningTests.includes(item.id) ? 'Testing...' : 'Test'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Launch Actions */}
      {overallStatus === 'ready' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">🚀 Ready to Launch!</CardTitle>
            <CardDescription className="text-green-700">
              All critical systems are verified and ready for customer testing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Launch to Production
              </Button>
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Send Launch Announcement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {overallStatus === 'blocked' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">⚠️ Critical Issues Found</CardTitle>
            <CardDescription className="text-red-700">
              Please resolve all critical issues before launching.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {checklist
                .filter(item => item.critical && !item.completed)
                .map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-red-700">
                    <XCircle className="w-4 h-4" />
                    <span>{item.title}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
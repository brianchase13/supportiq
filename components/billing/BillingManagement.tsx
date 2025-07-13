'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Zap,
  ArrowRight,
  Download,
  Settings
} from 'lucide-react';

interface Subscription {
  id: string;
  plan: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
}

interface Usage {
  tickets: {
    used: number;
    limit: number;
    percentage: number;
  };
  teamMembers: {
    used: number;
    limit: number;
    percentage: number;
  };
  apiCalls: {
    used: number;
    limit: number;
    percentage: number;
  };
  storage: {
    used: number;
    limit: number;
    percentage: number;
  };
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  pdfUrl?: string;
}

export function BillingManagement() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSubscription: Subscription = {
        id: 'sub_123456789',
        plan: 'pro',
        status: 'active',
        currentPeriodStart: '2024-12-01T00:00:00Z',
        currentPeriodEnd: '2025-01-01T00:00:00Z',
        amount: 299,
        currency: 'usd',
        interval: 'month'
      };

      const mockUsage: Usage = {
        tickets: {
          used: 8476,
          limit: 10000,
          percentage: 84.76
        },
        teamMembers: {
          used: 4,
          limit: 10,
          percentage: 40
        },
        apiCalls: {
          used: 125000,
          limit: 500000,
          percentage: 25
        },
        storage: {
          used: 2.4,
          limit: 10,
          percentage: 24
        }
      };

      const mockInvoices: Invoice[] = [
        {
          id: 'inv_123456789',
          amount: 299,
          currency: 'usd',
          status: 'paid',
          date: '2024-12-01T00:00:00Z',
          pdfUrl: '/invoices/inv_123456789.pdf'
        },
        {
          id: 'inv_123456788',
          amount: 299,
          currency: 'usd',
          status: 'paid',
          date: '2024-11-01T00:00:00Z',
          pdfUrl: '/invoices/inv_123456788.pdf'
        },
        {
          id: 'inv_123456787',
          amount: 299,
          currency: 'usd',
          status: 'paid',
          date: '2024-10-01T00:00:00Z',
          pdfUrl: '/invoices/inv_123456787.pdf'
        }
      ];

      setSubscription(mockSubscription);
      setUsage(mockUsage);
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanDetails = (plan: Subscription['plan']) => {
    switch (plan) {
      case 'starter':
        return {
          name: 'Starter',
          price: 99,
          tickets: 1000,
          teamMembers: 3,
          features: ['Basic AI automation', 'Email support', 'Standard analytics']
        };
      case 'pro':
        return {
          name: 'Pro',
          price: 299,
          tickets: 10000,
          teamMembers: 10,
          features: ['Advanced AI automation', 'Priority support', 'Advanced analytics', 'Custom integrations']
        };
      case 'enterprise':
        return {
          name: 'Enterprise',
          price: 899,
          tickets: 50000,
          teamMembers: -1, // unlimited
          features: ['Custom AI models', 'Dedicated support', 'Custom analytics', 'White-label options']
        };
    }
  };

  const getStatusColor = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'past_due':
        return 'bg-red-100 text-red-800';
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const handleUpgrade = (plan: Subscription['plan']) => {
    // Implement upgrade logic
    console.log(`Upgrading to ${plan} plan`);
  };

  const handleManageBilling = () => {
    // Redirect to Stripe billing portal
    window.open('/api/billing/portal', '_blank');
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // Implement invoice download
    console.log(`Downloading invoice ${invoiceId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading billing information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-600 mb-4">Get started with a plan to unlock all features</p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <ArrowRight className="w-4 h-4 mr-2" />
            Choose a Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  const planDetails = getPlanDetails(subscription.plan);

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CreditCard className="w-6 h-6 text-blue-600" />
                Current Plan
              </CardTitle>
              <CardDescription>
                {planDetails?.name} Plan • {formatCurrency(subscription.amount, subscription.currency)}/{subscription.interval}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(subscription.status)}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Badge>
              <Button variant="outline" onClick={handleManageBilling}>
                <Settings className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Usage Overview */}
      {usage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tickets</div>
                  <div className="text-lg font-bold text-gray-900">
                    {usage.tickets.used.toLocaleString()} / {usage.tickets.limit.toLocaleString()}
                  </div>
                </div>
              </div>
              <Progress value={usage.tickets.percentage} className="h-2" />
              <div className="text-xs text-gray-500 mt-1">
                {usage.tickets.percentage}% used
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Team Members</div>
                  <div className="text-lg font-bold text-gray-900">
                    {usage.teamMembers.used} / {usage.teamMembers.limit === -1 ? '∞' : usage.teamMembers.limit}
                  </div>
                </div>
              </div>
              <Progress value={usage.teamMembers.percentage} className="h-2" />
              <div className="text-xs text-gray-500 mt-1">
                {usage.teamMembers.percentage}% used
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">API Calls</div>
                  <div className="text-lg font-bold text-gray-900">
                    {usage.apiCalls.used.toLocaleString()} / {usage.apiCalls.limit.toLocaleString()}
                  </div>
                </div>
              </div>
              <Progress value={usage.apiCalls.percentage} className="h-2" />
              <div className="text-xs text-gray-500 mt-1">
                {usage.apiCalls.percentage}% used
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Storage</div>
                  <div className="text-lg font-bold text-gray-900">
                    {usage.storage.used}GB / {usage.storage.limit}GB
                  </div>
                </div>
              </div>
              <Progress value={usage.storage.percentage} className="h-2" />
              <div className="text-xs text-gray-500 mt-1">
                {usage.storage.percentage}% used
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plan Comparison */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Available Plans
          </CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['starter', 'pro', 'enterprise'] as const).map((plan) => {
              const details = getPlanDetails(plan);
              const isCurrentPlan = subscription.plan === plan;
              
              return (
                <Card key={plan} className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}>
                  {isCurrentPlan && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white">Current Plan</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-center">{details?.name}</CardTitle>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {formatCurrency(details?.price || 0, 'usd')}
                      </div>
                      <div className="text-sm text-gray-600">per month</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{details?.tickets.toLocaleString()} tickets/month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">
                          {details?.teamMembers === -1 ? 'Unlimited' : details?.teamMembers} team members
                        </span>
                      </div>
                      {details?.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className={`w-full ${isCurrentPlan ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                      disabled={isCurrentPlan}
                      onClick={() => handleUpgrade(plan)}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(invoice.date).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge className={invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  {invoice.pdfUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Alerts */}
      {usage && (usage.tickets.percentage > 80 || usage.teamMembers.percentage > 80) && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Usage Alert</h3>
                <p className="text-yellow-700 mb-4">
                  You're approaching your plan limits. Consider upgrading to avoid service interruptions.
                </p>
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
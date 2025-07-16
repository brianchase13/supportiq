'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  DollarSign,
  Activity,
  Shield,
  Database
} from 'lucide-react';
import { ModernNavigation } from '@/components/layout/ModernNavigation';
import { useRequireAuth } from '@/lib/auth/user-context';

interface Customer {
  id: string;
  email: string;
  name: string;
  subscription_status: string;
  subscription_plan: string;
  trial_end_date: string;
  created_at: string;
  last_login: string;
  ai_responses_used: number;
  ai_responses_limit: number;
  total_spent: number;
}

interface SystemHealth {
  total_customers: number;
  active_subscriptions: number;
  revenue_mtd: number;
  system_status: 'healthy' | 'warning' | 'critical';
  churn_rate: number;
}

export default function AdminDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { loading: authLoading } = useRequireAuth();

  const fetchAdminData = useCallback(async () => {
    try {
      const [customersResponse, healthResponse] = await Promise.all([
        fetch('/api/admin/customers'),
        fetch('/api/admin/health')
      ]);

      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        setCustomers(customersData.customers);
      }

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setSystemHealth(healthData);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const filterCustomers = useCallback(() => {
    let filtered = customers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.subscription_status === statusFilter);
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, statusFilter]);



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Canceled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSystemHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleExtendTrial = async (customerId: string, days: number) => {
    try {
      const response = await fetch('/api/admin/extend-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, days })
      });

      if (response.ok) {
        fetchAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to extend trial:', error);
    }
  };

  const handleManualAction = async (customerId: string, action: string) => {
    try {
      const response = await fetch('/api/admin/manual-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, action })
      });

      if (response.ok) {
        fetchAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to perform manual action:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <ModernNavigation>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </ModernNavigation>
    );
  }

  return (
    <ModernNavigation>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage customers, subscriptions, and system health</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        {systemHealth && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.total_customers.toLocaleString()}</div>
                <p className="text-xs text-gray-500">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.active_subscriptions.toLocaleString()}</div>
                <p className="text-xs text-gray-500">
                  {((systemHealth.active_subscriptions / systemHealth.total_customers) * 100).toFixed(1)}% conversion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue MTD</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${systemHealth.revenue_mtd.toLocaleString()}</div>
                <p className="text-xs text-gray-500">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                {getSystemHealthIcon(systemHealth.system_status)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{systemHealth.system_status}</div>
                <p className="text-xs text-gray-500">
                  Churn rate: {systemHealth.churn_rate}%
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="customers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-4">
            {/* Customer Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>
                  View and manage all customers and their subscription status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trialing">Trial</SelectItem>
                      <SelectItem value="past_due">Past Due</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Customers Table */}
                <div className="border rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Plan</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Usage</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Revenue</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredCustomers.map((customer) => (
                          <tr key={customer.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-sm text-gray-500">{customer.email}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadge(customer.subscription_status)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="capitalize">{customer.subscription_plan}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                {customer.ai_responses_used}/{customer.ai_responses_limit} AI responses
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-black h-2 rounded-full" 
                                  style={{ width: `${Math.min((customer.ai_responses_used / customer.ai_responses_limit) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium">${customer.total_spent}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(customer.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>
                  Monitor and manage customer subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Subscription management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  View detailed analytics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Monitor system performance and health metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">System health monitoring coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernNavigation>
  );
} 
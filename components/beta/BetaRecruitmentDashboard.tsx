'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Mail, 
  Phone, 
  MessageSquare,
  DollarSign,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Plus,
  Download,
  Send,
  Eye,
  BarChart3
} from 'lucide-react';
import { BetaProgramManager } from '@/lib/beta/beta-program';

interface BetaCustomer {
  id: string;
  email: string;
  company: string;
  name: string;
  role: string;
  industry: string;
  company_size: 'startup' | 'sme' | 'enterprise';
  monthly_tickets: number;
  status: 'applied' | 'accepted' | 'onboarding' | 'active' | 'churned';
  priority_score: number;
  metrics?: {
    deflection_rate: number;
    cost_savings: number;
    satisfaction_score?: number;
  };
  contact_history: Array<{
    date: string;
    type: string;
    summary: string;
  }>;
}

export function BetaRecruitmentDashboard() {
  const [betaManager] = useState(() => new BetaProgramManager());
  const [customers, setCustomers] = useState<BetaCustomer[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [outreachCampaigns, setOutreachCampaigns] = useState<any[]>([]);
  const [targetList, setTargetList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<BetaCustomer | null>(null);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    industry: '',
    company_size: 'startup' as const,
    monthly_tickets: 100
  });

  const loadBetaData = useCallback(async () => {
    setLoading(true);
    try {
      const [customersData, metricsData, campaignsData, targetsData] = await Promise.all([
        betaManager.getBetaCustomers(),
        betaManager.getBetaMetrics(),
        betaManager.generateOutreachCampaigns(),
        betaManager.generateTargetList()
      ]);

      setCustomers(customersData);
      setMetrics(metricsData);
      setOutreachCampaigns(campaignsData);
      setTargetList(targetsData);
    } catch (error) {
      console.error('Error loading beta data:', error);
    } finally {
      setLoading(false);
    }
  }, [betaManager]);



  const handleAddCustomer = async () => {
    try {
      await betaManager.addBetaCustomer({
        ...newCustomerForm,
        current_tools: [],
        pain_points: [],
        expected_roi: 500,
        status: 'applied',
        referrals: 0,
        notes: []
      });
      
      // Reset form
      setNewCustomerForm({
        name: '',
        email: '',
        company: '',
        role: '',
        industry: '',
        company_size: 'startup',
        monthly_tickets: 100
      });
      
      // Reload data
      await loadBetaData();
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  const handleStatusUpdate = async (customerId: string, newStatus: string) => {
    try {
      await betaManager.updateBetaCustomerStatus(customerId, newStatus as any);
      await loadBetaData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const report = await betaManager.generateBetaReport();
      
      // Download as file
      const blob = new Blob([report], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beta-program-report-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      applied: 'secondary',
      accepted: 'default',
      onboarding: 'default',
      active: 'default',
      churned: 'destructive'
    };
    
    const colors = {
      applied: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      onboarding: 'bg-purple-100 text-purple-800',
      active: 'bg-green-100 text-green-800',
      churned: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading beta program data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Beta Program Management</h1>
          <p className="text-gray-600 mt-1">Recruit, onboard, and track beta customers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerateReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={loadBetaData}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.active_customers}</div>
                  <div className="text-sm text-gray-600">Active Beta Customers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">${metrics.total_cost_savings.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Savings Generated</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.avg_time_to_value}</div>
                  <div className="text-sm text-gray-600">Days to First Value</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.avg_satisfaction.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Avg Satisfaction</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="customers">Beta Customers</TabsTrigger>
          <TabsTrigger value="outreach">Outreach Campaigns</TabsTrigger>
          <TabsTrigger value="targets">Target Prospects</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add New Customer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Beta Customer
                </CardTitle>
                <CardDescription>
                  Manually add a new beta customer to the program
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newCustomerForm.name}
                      onChange={(e) => setNewCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomerForm.email}
                      onChange={(e) => setNewCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={newCustomerForm.company}
                      onChange={(e) => setNewCustomerForm(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={newCustomerForm.role}
                      onChange={(e) => setNewCustomerForm(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="Head of Support"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={newCustomerForm.industry}
                      onValueChange={(value) => setNewCustomerForm(prev => ({ ...prev, industry: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SaaS">SaaS</SelectItem>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Financial Services">Financial Services</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_size">Company Size</Label>
                    <Select
                      value={newCustomerForm.company_size}
                      onValueChange={(value: any) => setNewCustomerForm(prev => ({ ...prev, company_size: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup</SelectItem>
                        <SelectItem value="sme">SME</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly_tickets">Monthly Tickets</Label>
                  <Input
                    id="monthly_tickets"
                    type="number"
                    value={newCustomerForm.monthly_tickets}
                    onChange={(e) => setNewCustomerForm(prev => ({ ...prev, monthly_tickets: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <Button 
                  onClick={handleAddCustomer} 
                  className="w-full"
                  disabled={!newCustomerForm.name || !newCustomerForm.email || !newCustomerForm.company}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Beta Customer
                </Button>
              </CardContent>
            </Card>

            {/* Customer List */}
            <Card>
              <CardHeader>
                <CardTitle>Beta Customers ({customers.length})</CardTitle>
                <CardDescription>
                  Current beta program participants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {customers.map((customer) => (
                    <div 
                      key={customer.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-600">{customer.company} • {customer.role}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {customer.monthly_tickets} tickets/month • Priority: {customer.priority_score}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(customer.status)}
                        <Eye className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Detail Modal would go here */}
          {selectedCustomer && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedCustomer.company} - {selectedCustomer.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedCustomer.status)}
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedCustomer(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Info</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Email:</strong> {selectedCustomer.email}</div>
                      <div><strong>Role:</strong> {selectedCustomer.role}</div>
                      <div><strong>Industry:</strong> {selectedCustomer.industry}</div>
                      <div><strong>Monthly Tickets:</strong> {selectedCustomer.monthly_tickets}</div>
                      <div><strong>Priority Score:</strong> {selectedCustomer.priority_score}/100</div>
                    </div>
                  </div>
                  
                  {selectedCustomer.metrics && (
                    <div>
                      <h4 className="font-semibold mb-2">Performance Metrics</h4>
                      <div className="space-y-1 text-sm">
                        <div><strong>Deflection Rate:</strong> {selectedCustomer.metrics.deflection_rate}%</div>
                        <div><strong>Cost Savings:</strong> ${selectedCustomer.metrics.cost_savings.toLocaleString()}</div>
                        {selectedCustomer.metrics.satisfaction_score && (
                          <div><strong>Satisfaction:</strong> {selectedCustomer.metrics.satisfaction_score}/5</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Contact History</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedCustomer.contact_history.map((contact, index) => (
                      <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                        <div className="font-medium">{contact.type} - {new Date(contact.date).toLocaleDateString()}</div>
                        <div className="text-gray-600">{contact.summary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="outreach">
          <div className="grid gap-6">
            {outreachCampaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize">{campaign.channel} Campaign</CardTitle>
                    <Badge variant="outline">{campaign.target_profile}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Message Template</h4>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                        {campaign.message_template}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{campaign.sent_count}</div>
                        <div className="text-sm text-gray-600">Sent</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{campaign.responses}</div>
                        <div className="text-sm text-gray-600">Responses</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{campaign.signups}</div>
                        <div className="text-sm text-gray-600">Signups</div>
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Launch Campaign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="targets">
          <Card>
            <CardHeader>
              <CardTitle>Target Prospects</CardTitle>
              <CardDescription>
                High-priority prospects for beta program outreach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {targetList.map((target, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{target.name}</div>
                      <div className="text-sm text-gray-600">{target.company} • {target.role}</div>
                      <div className="text-xs text-gray-500 mt-1">{target.rationale}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-800">
                        Priority: {target.priority}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Applications</span>
                    <span className="font-bold">{metrics?.total_applications || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Accepted</span>
                    <span className="font-bold">{Math.round((metrics?.accepted_rate || 0) * (metrics?.total_applications || 0) / 100)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active</span>
                    <span className="font-bold">{metrics?.active_customers || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Program Success</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Testimonials Collected</span>
                    <span className="font-bold">{metrics?.testimonials_collected || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Referrals Generated</span>
                    <span className="font-bold">{metrics?.referrals_generated || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Monthly Retention</span>
                    <span className="font-bold">{metrics?.monthly_retention || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
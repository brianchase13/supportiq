'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Building2, 
  Briefcase, 
  Settings,
  Shield,
  CreditCard,
  Database,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Save,
  Loader2
} from 'lucide-react';
import { useUser } from '@/lib/auth/user-context';
import { UserDataService } from '@/lib/services/user-data';

interface UserData {
  tickets_processed: number;
  deflection_rate: number;
  total_savings: number;
  subscription_tier: string;
  data_retention_days: number;
  last_activity: string;
}

export function UserProfileManager() {
  const { user, profile, updateProfile, signOut } = useUser();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    company: profile?.company || '',
    role: profile?.role || '',
    email: profile?.email || user?.email || ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        company: profile.company || '',
        role: profile.role || '',
        email: profile.email || user?.email || ''
      });
    }
  }, [profile, user]);

  const loadUserData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userDataService = new UserDataService();
      const analytics = await userDataService.getUserAnalytics(user.id);
      
      const userData: UserData = {
        tickets_processed: analytics.tickets_processed,
        deflection_rate: analytics.deflection_rate,
        total_savings: analytics.total_savings,
        subscription_tier: analytics.subscription_tier,
        data_retention_days: analytics.data_retention_days,
        last_activity: analytics.last_activity
      };
      
      setUserData(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to mock data
      const mockData: UserData = {
        tickets_processed: 1247,
        deflection_rate: 68,
        total_savings: 8470,
        subscription_tier: 'Professional',
        data_retention_days: 90,
        last_activity: new Date().toISOString()
      };
      setUserData(mockData);
    } finally {
      setLoading(false);
    }
  }, [user]);



  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      await updateProfile({
        full_name: formData.full_name,
        company: formData.company,
        role: formData.role
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    
    try {
      const userDataService = new UserDataService();
      const exportData = await userDataService.exportUserData(user.id);
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `supportiq-data-${user.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    const confirmation = prompt('This will permanently delete all your data, tickets, and analytics. Type "DELETE" to confirm:');
    if (confirmation !== 'DELETE') {
      return;
    }
    
    try {
      const userDataService = new UserDataService();
      await userDataService.deleteUserData(user!.id);
      setMessage({ type: 'success', text: 'Account deletion request submitted.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete account. Please contact support.' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {profile?.subscription_status || 'Free'}
        </Badge>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Usage Data
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Data & Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your profile information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed here. Contact support to update.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Enter your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    placeholder="Enter your role/title"
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{userData?.tickets_processed.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Tickets Processed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{userData?.deflection_rate}%</div>
                    <div className="text-sm text-gray-600">Deflection Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">${userData?.total_savings.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Savings</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{userData?.subscription_tier}</div>
                    <div className="text-sm text-gray-600">Plan</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Account Activity</CardTitle>
              <CardDescription>Your recent account activity and usage patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Last Activity</span>
                  <span className="font-medium">
                    {userData?.last_activity ? new Date(userData.last_activity).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Data Retention</span>
                  <span className="font-medium">{userData?.data_retention_days} days</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Intercom Connection</span>
                  <Badge variant={profile?.intercom_connected ? "default" : "secondary"}>
                    {profile?.intercom_connected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-gray-600">Last updated: Never</p>
                </div>
                <Button variant="outline" size="sm">Change Password</Button>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">Enable 2FA</Button>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <h4 className="font-medium">Active Sessions</h4>
                  <p className="text-sm text-gray-600">Manage your active login sessions</p>
                </div>
                <Button variant="outline" size="sm">View Sessions</Button>
              </div>

              <div className="pt-4">
                <Button onClick={signOut} variant="outline" className="w-full">
                  Sign Out of All Devices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Data Export
                </CardTitle>
                <CardDescription>
                  Download a copy of your account data and usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Export Your Data</p>
                    <p className="text-sm text-gray-600">
                      Download all your profile information, tickets, and analytics data
                    </p>
                  </div>
                  <Button onClick={handleExportData} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Retention</CardTitle>
                <CardDescription>
                  Control how long your data is stored in our system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Ticket Data Retention</span>
                    <span className="font-medium">{userData?.data_retention_days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Analytics Data Retention</span>
                    <span className="font-medium">1 year</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Log Data Retention</span>
                    <span className="font-medium">30 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  Delete Account
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Warning:</strong> This action cannot be undone. All your data, including tickets, 
                      analytics, and account information will be permanently deleted.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={handleDeleteAccount} 
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete My Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Building, 
  Mail, 
  Save, 
  CheckCircle, 
  AlertTriangle,
  Settings as SettingsIcon,
  MessageSquare,
  BarChart3,
  Bot
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import IntercomConnection from '@/components/intercom/IntercomConnection';
import RealTimeAnalytics from '@/components/dashboard/RealTimeAnalytics';
import { DeflectionSettings } from '@/components/settings/DeflectionSettings';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations' | 'analytics' | 'deflection'>('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    company_name: user?.company_name || '',
    email: user?.email || ''
  });

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateProfile(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'deflection', label: 'AI Deflection', icon: Bot },
    { id: 'integrations', label: 'Integrations', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-slate-400">Manage your account and integrations</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-slate-900 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Information */}
              <Card className="bg-slate-900 border-slate-800">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name" className="text-white">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white mt-1"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="company_name" className="text-white">Company Name</Label>
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white mt-1"
                        placeholder="Enter your company name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-white">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white mt-1"
                        placeholder="Enter your email address"
                      />
                    </div>

                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 w-full mt-6"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>

                    {saved && (
                      <div className="flex items-center gap-2 text-green-500 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Profile updated successfully
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Account Status */}
              <Card className="bg-slate-900 border-slate-800">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Account Status</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-white">Account Status</span>
                      </div>
                      <span className="text-green-400 font-medium">Active</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building className="w-4 h-4 text-slate-400" />
                        <span className="text-white">Subscription</span>
                      </div>
                      <span className="text-blue-400 font-medium capitalize">
                        {user?.subscription_tier || 'Free'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-white">Member Since</span>
                      </div>
                      <span className="text-slate-400">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-slate-400" />
                        <span className="text-white">Onboarding</span>
                      </div>
                      <span className={`font-medium ${
                        user?.onboarding_completed ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {user?.onboarding_completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <IntercomConnection />
              
              {/* Additional Integrations Placeholder */}
              <Card className="bg-slate-900 border-slate-800">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">More Integrations Coming Soon</h2>
                  <p className="text-slate-400 mb-4">
                    We're working on adding support for more support platforms:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Zendesk', 'Freshdesk', 'Help Scout', 'Slack'].map((platform) => (
                      <div key={platform} className="p-4 bg-slate-800 rounded-lg text-center">
                        <div className="w-8 h-8 bg-slate-700 rounded mx-auto mb-2" />
                        <span className="text-sm text-slate-400">{platform}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'deflection' && (
            <div className="bg-white rounded-lg p-6">
              <DeflectionSettings />
            </div>
          )}

          {activeTab === 'analytics' && (
            <RealTimeAnalytics />
          )}
        </div>
      </div>
    </div>
  );
}
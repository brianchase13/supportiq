'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon,
  User,
  Shield,
  Zap,
  Bell,
  CreditCard,
  Users,
  Database,
  Key,
  Globe,
  Palette,
  Download,
  Upload
} from 'lucide-react';
import { ModernNavigation } from '@/components/layout/ModernNavigation';
import { useRequireAuth } from '@/lib/auth/user-context';
import { UserProfile } from '@/components/settings/UserProfile';
import { TeamManagement } from '@/components/settings/TeamManagement';
import { DeflectionSettings } from '@/components/settings/DeflectionSettings';

type TabType = 'profile' | 'team' | 'deflection' | 'notifications' | 'billing' | 'integrations' | 'security' | 'appearance' | 'data';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'deflection', label: 'AI Deflection', icon: Zap },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'integrations', label: 'Integrations', icon: Database },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'data', label: 'Data', icon: Download },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <ModernNavigation>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </ModernNavigation>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <UserProfile />;
      case 'team':
        return <TeamManagement />;
      case 'deflection':
        return <DeflectionSettings />;
      case 'notifications':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Notification settings coming soon...</p>
            </CardContent>
          </Card>
        );
      case 'billing':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing & Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Billing management coming soon...</p>
            </CardContent>
          </Card>
        );
      case 'integrations':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Integration settings coming soon...</p>
            </CardContent>
          </Card>
        );
      case 'security':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Security settings coming soon...</p>
            </CardContent>
          </Card>
        );
      case 'appearance':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Appearance settings coming soon...</p>
            </CardContent>
          </Card>
        );
      case 'data':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Data management features coming soon...</p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <ModernNavigation>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-black" />
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">Manage your account and integrations</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black hover:bg-white/50'
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
          {renderTabContent()}
        </div>
      </div>
    </ModernNavigation>
  );
}
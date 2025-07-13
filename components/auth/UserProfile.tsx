'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Building2, 
  Mail, 
  Calendar,
  Save,
  Edit,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

interface UserProfile {
  id: string;
  email: string;
  company_name?: string;
  industry?: string;
  monthly_tickets?: number;
  support_channels?: string[];
  created_at: string;
  updated_at: string;
}

export default function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    monthly_tickets: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setFormData({
          company_name: data.profile.company_name || '',
          industry: data.profile.industry || '',
          monthly_tickets: data.profile.monthly_tickets?.toString() || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: formData.company_name,
          industry: formData.industry,
          monthly_tickets: parseInt(formData.monthly_tickets) || 0
        }),
      });

      if (response.ok) {
        await fetchProfile();
        setEditing(false);
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      company_name: profile?.company_name || '',
      industry: profile?.industry || '',
      monthly_tickets: profile?.monthly_tickets?.toString() || ''
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <div className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Profile</h2>
              <p className="text-sm text-slate-400">Manage your account information</p>
            </div>
          </div>
          {!editing && (
            <Button
              onClick={() => setEditing(true)}
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Email (read-only) */}
          <div className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg">
            <Mail className="w-5 h-5 text-slate-400" />
            <div className="flex-1">
              <Label className="text-sm text-slate-400">Email</Label>
              <p className="text-white">{user?.email}</p>
            </div>
          </div>

          {/* Company Name */}
          <div>
            <Label htmlFor="company_name" className="text-white flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company Name
            </Label>
            {editing ? (
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Enter your company name"
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            ) : (
              <p className="mt-2 text-slate-300">
                {profile?.company_name || 'Not specified'}
              </p>
            )}
          </div>

          {/* Industry */}
          <div>
            <Label htmlFor="industry" className="text-white">Industry</Label>
            {editing ? (
              <select
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                className="mt-2 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white"
              >
                <option value="">Select your industry</option>
                <option value="saas">SaaS / Software</option>
                <option value="ecommerce">E-commerce</option>
                <option value="fintech">Fintech</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="mt-2 text-slate-300">
                {profile?.industry ? profile.industry.charAt(0).toUpperCase() + profile.industry.slice(1) : 'Not specified'}
              </p>
            )}
          </div>

          {/* Monthly Tickets */}
          <div>
            <Label htmlFor="monthly_tickets" className="text-white">Monthly Support Tickets</Label>
            {editing ? (
              <Input
                id="monthly_tickets"
                type="number"
                value={formData.monthly_tickets}
                onChange={(e) => setFormData(prev => ({ ...prev, monthly_tickets: e.target.value }))}
                placeholder="e.g., 500"
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            ) : (
              <p className="mt-2 text-slate-300">
                {profile?.monthly_tickets ? `${profile.monthly_tickets.toLocaleString()} tickets/month` : 'Not specified'}
              </p>
            )}
          </div>

          {/* Support Channels */}
          {profile?.support_channels && profile.support_channels.length > 0 && (
            <div>
              <Label className="text-white">Connected Support Channels</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.support_channels.map(channel => (
                  <span
                    key={channel}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                  >
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Account Created */}
          <div className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <Label className="text-sm text-slate-400">Account Created</Label>
              <p className="text-white">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Edit Actions */}
          {editing && (
            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 